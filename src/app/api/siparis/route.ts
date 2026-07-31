import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCatalogProductById } from "@/data/productCatalog";
import { badRequest, handleError, tooManyRequests, unauthorized } from "@/lib/apiErrors";
import { requireAdmin } from "@/lib/auth";
import { validateDeliverableEmail } from "@/lib/emailValidation";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/email";
import { chargeCreditCard } from "@/lib/iyzico";
import { validateCouponForCart } from "@/lib/coupons";
import { validateOrderContactFields } from "@/lib/orderValidation";
import { normalizeAndValidateCard } from "@/lib/paymentValidation";
import { prisma } from "@/lib/prisma";
import { apiRateLimit } from "@/lib/rateLimit";
import { siparisSchema } from "@/lib/validations";

function generateOrderNumber(): string {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 100000).toString().padStart(5, "0");
  return `FK${y}${m}${d}${rand}`;
}

async function ensureCatalogProductInDatabase(productId: string) {
  const existingProduct = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, isActive: true, totalStock: true, name: true },
  });

  if (existingProduct) return existingProduct;

  const catalogProduct = getCatalogProductById(productId);
  if (!catalogProduct) return null;

  const existingProductBySlug = await prisma.product.findUnique({
    where: { slug: catalogProduct.slug },
    select: { id: true, isActive: true, totalStock: true, name: true },
  });

  if (existingProductBySlug) return existingProductBySlug;

  const category = await prisma.category.upsert({
    where: { slug: catalogProduct.category.slug },
    update: {
      name: catalogProduct.category.name,
      description: catalogProduct.category.description,
      image: catalogProduct.category.image,
      order: catalogProduct.category.order,
      isActive: true,
    },
    create: {
      id: catalogProduct.category.id,
      name: catalogProduct.category.name,
      slug: catalogProduct.category.slug,
      description: catalogProduct.category.description,
      image: catalogProduct.category.image,
      order: catalogProduct.category.order,
      isActive: true,
    },
  });

  const product = await prisma.product.create({
    data: {
      id: catalogProduct.id,
      name: catalogProduct.name,
      slug: catalogProduct.slug,
      description: catalogProduct.description,
      shortDesc: catalogProduct.shortDesc,
      origin: catalogProduct.origin,
      production: catalogProduct.production,
      freshness: catalogProduct.freshness,
      images: catalogProduct.images,
      basePrice: catalogProduct.basePrice,
      discountPrice: catalogProduct.discountPrice,
      isNatural: catalogProduct.isNatural,
      isFeatured: catalogProduct.isFeatured,
      isBestSeller: catalogProduct.isBestSeller,
      isNew: catalogProduct.isNew,
      isActive: catalogProduct.isActive,
      totalStock: catalogProduct.totalStock,
      categoryId: category.id,
      metaTitle: catalogProduct.metaTitle,
      metaDescription: catalogProduct.metaDescription,
    },
    select: { id: true, isActive: true, totalStock: true, name: true },
  });

  await Promise.all(
    catalogProduct.variants.map((variant) =>
      prisma.productVariant.upsert({
        where: { id: variant.id },
        update: {
          weight: variant.weight,
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku,
        },
        create: {
          id: variant.id,
          productId: catalogProduct.id,
          weight: variant.weight,
          price: variant.price,
          stock: variant.stock,
          sku: variant.sku,
        },
      })
    )
  );

  return product;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const rl = apiRateLimit(ip);
    if (!rl.success) return tooManyRequests();

    const body = await req.json();
    const data = siparisSchema.parse(body);
    const contactValidation = validateOrderContactFields({
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      city: data.city,
      district: data.district,
      address: data.address,
      postalCode: data.postalCode,
    });

    if (!contactValidation.ok) {
      return badRequest(contactValidation.message);
    }

    const emailValidation = await validateDeliverableEmail(data.customerEmail);

    if (!emailValidation.valid) {
      return badRequest(emailValidation.message);
    }

    const cardValidation = normalizeAndValidateCard({
      cardHolder: data.cardHolder,
      cardNumber: data.cardNumber,
      cardExpiry: data.cardExpiry,
      cardCvv: data.cardCvv,
    });

    if (!cardValidation.ok) {
      return badRequest(cardValidation.message);
    }

    const itemTotal = data.items.reduce((sum, item) => sum + item.total, 0);

    if (Math.abs(itemTotal - data.subtotal) > 0.01) {
      return badRequest("Sepet ara toplamı doğrulanamadı.");
    }

    if (data.couponCode) {
      const couponValidation = await validateCouponForCart(data.couponCode, data.subtotal);
      if (!couponValidation.ok) return badRequest(couponValidation.message);

      if (Math.abs(couponValidation.coupon.discountAmount - data.discount) > 0.01) {
        return badRequest("Kupon indirimi doğrulanamadı.");
      }
    } else if (data.discount > 0) {
      return badRequest("Kupon olmadan indirim uygulanamaz.");
    }

    const expectedTotal = Math.round((itemTotal + data.shippingCost - data.discount) * 100) / 100;
    if (Math.abs(expectedTotal - data.total) > 0.01) {
      return badRequest("Sipariş toplamı doğrulanamadı.");
    }

    if (process.env.REQUIRE_IYZICO_BEFORE_ORDER === "true") {
      return badRequest("Canlı iyzico API bilgileri tanımlı değil. Ödeme alınmadan sipariş oluşturulamaz.");
    }

    if (data.couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: data.couponCode.toUpperCase() },
      });

      if (!coupon || !coupon.isActive) return badRequest("Geçersiz veya süresi dolmuş kupon.");
      if (coupon.expiresAt && coupon.expiresAt < new Date()) return badRequest("Kuponun süresi dolmuş.");
      if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return badRequest("Kupon kullanım limiti dolmuş.");
      if (coupon.minOrder && data.subtotal < coupon.minOrder) {
        return badRequest(`Bu kupon için minimum sipariş tutarı ${coupon.minOrder} ₺'dir.`);
      }
    }

    const productIdMap = new Map<string, string>();

    for (const item of data.items) {
      const product = await ensureCatalogProductInDatabase(item.productId);
      if (!product || !product.isActive) {
        return badRequest(`"${item.productName}" ürünü artık mevcut değil.`);
      }
      productIdMap.set(item.productId, product.id);
    }

    const orderNumber = generateOrderNumber();
    const payment = await chargeCreditCard({
      conversationId: orderNumber,
      card: cardValidation.card,
      customerName: contactValidation.normalized.customerName,
      customerEmail: emailValidation.normalizedEmail,
      customerPhone: contactValidation.normalized.customerPhone,
      address: contactValidation.normalized.address,
      city: contactValidation.normalized.city,
      district: contactValidation.normalized.district,
      postalCode: contactValidation.normalized.postalCode,
      ip,
      subtotal: data.subtotal,
      shippingCost: data.shippingCost,
      total: data.total,
      items: data.items,
    });

    if (!payment.ok) {
      return badRequest(payment.message);
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: "CONFIRMED",
        paymentStatus: "PAID",
        customerName: contactValidation.normalized.customerName,
        customerEmail: emailValidation.normalizedEmail,
        customerPhone: contactValidation.normalized.customerPhone,
        address: contactValidation.normalized.address,
        city: contactValidation.normalized.city,
        district: contactValidation.normalized.district,
        postalCode: contactValidation.normalized.postalCode || "",
        notes: data.notes,
        paymentMethod: data.paymentMethod,
        subtotal: data.subtotal,
        shippingCost: data.shippingCost,
        discount: data.discount,
        total: data.total,
        iyzipayToken: payment.paymentId,
        couponCode: data.couponCode,
        items: {
          create: data.items.map((item) => ({
            productId: productIdMap.get(item.productId) || item.productId,
            productName: item.productName,
            variant: item.variant,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      },
    });

    if (data.couponCode) {
      await prisma.coupon
        .update({
          where: { code: data.couponCode.toUpperCase() },
          data: { usedCount: { increment: 1 } },
        })
        .catch(console.error);
    }

    // Admin bildirimi oluştur (in-app notification)
    const itemSummary = data.items
      .map((item) => `${item.productName}${item.variant ? ` (${item.variant})` : ""} x${item.quantity}`)
      .join(", ");

    prisma.adminNotification
      .create({
        data: {
          type: "NEW_ORDER",
          title: `🛒 Yeni Sipariş: ${contactValidation.normalized.customerName}`,
          body: `${itemSummary} — Toplam: ${data.total.toFixed(2)} ₺ · ${contactValidation.normalized.city}`,
          orderNumber,
          orderId: order.id,
        },
      })
      .catch(console.error);

    sendOrderConfirmationEmail({
      to: emailValidation.normalizedEmail,
      customerName: contactValidation.normalized.customerName,
      orderNumber,
      total: data.total,
      items: data.items,
    }).catch(console.error);

    // Admin'e sipariş bildirimi gönder
    sendAdminOrderNotificationEmail({
      orderNumber,
      customerName: contactValidation.normalized.customerName,
      customerEmail: emailValidation.normalizedEmail,
      customerPhone: contactValidation.normalized.customerPhone,
      total: data.total,
      paymentMethod: data.paymentMethod,
      city: contactValidation.normalized.city,
      district: contactValidation.normalized.district,
      address: contactValidation.normalized.address,
      items: data.items,
    }).catch(console.error);

    return NextResponse.json(
      {
        success: true,
        orderNumber: order.orderNumber,
        orderId: order.id,
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof ZodError) {
      const firstMsg = error.errors[0]?.message || "Geçersiz sipariş verisi.";
      return badRequest(firstMsg);
    }
    return handleError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("sayfa") || "1"));
    const perPage = Math.min(100, parseInt(searchParams.get("limit") || "20"));
    const status = searchParams.get("status");

    const where = status ? { status: status as any } : {};

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          items: {
            include: {
              product: { select: { id: true, name: true, slug: true, images: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.order.count({ where }),
    ]);

    return NextResponse.json({
      orders,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    return handleError(error);
  }
}
