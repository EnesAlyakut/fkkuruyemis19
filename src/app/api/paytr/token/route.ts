import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { getCatalogProductById } from "@/data/productCatalog";
import { badRequest, handleError, tooManyRequests } from "@/lib/apiErrors";
import { validateDeliverableEmail } from "@/lib/emailValidation";
import { validateCouponForCart } from "@/lib/coupons";
import { validateOrderContactFields } from "@/lib/orderValidation";
import { getPayTRIframeToken } from "@/lib/paytr";
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

  const existingBySlug = await prisma.product.findUnique({
    where: { slug: catalogProduct.slug },
    select: { id: true, isActive: true, totalStock: true, name: true },
  });
  if (existingBySlug) return existingBySlug;

  const category = await prisma.category.upsert({
    where: { slug: catalogProduct.category.slug },
    update: { name: catalogProduct.category.name },
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
        update: { weight: variant.weight, price: variant.price, stock: variant.stock, sku: variant.sku },
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

/** POST /api/paytr/token — PayTR iframe token almak için */
export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "127.0.0.1";
    const rl = apiRateLimit(ip);
    if (!rl.success) return tooManyRequests();

    const body = await req.json();

    // Sadece iletişim / teslimat / sepet alanlarını validate et (kart bilgisi YOK — PayTR iframe toplar)
    const { customerName, customerEmail, customerPhone, city, district, address, postalCode, notes, items, subtotal, shippingCost, discount, total, couponCode } = body;

    const contactValidation = validateOrderContactFields({ customerName, customerEmail, customerPhone, city, district, address, postalCode });
    if (!contactValidation.ok) return badRequest(contactValidation.message);

    const emailValidation = await validateDeliverableEmail(customerEmail);
    if (!emailValidation.valid) return badRequest(emailValidation.message);

    if (!Array.isArray(items) || items.length === 0) return badRequest("Sepet boş.");

    // Tutar doğrulama
    const itemTotal = (items as any[]).reduce((s: number, i: any) => s + Number(i.total), 0);
    if (Math.abs(itemTotal - subtotal) > 0.01) return badRequest("Sepet ara toplamı doğrulanamadı.");

    if (couponCode) {
      const cv = await validateCouponForCart(couponCode, subtotal);
      if (!cv.ok) return badRequest(cv.message);
      if (Math.abs(cv.coupon.discountAmount - discount) > 0.01) return badRequest("Kupon indirimi doğrulanamadı.");
    } else if (discount > 0) {
      return badRequest("Kupon olmadan indirim uygulanamaz.");
    }

    const expectedTotal = Math.round((itemTotal + shippingCost - discount) * 100) / 100;
    if (Math.abs(expectedTotal - total) > 0.01) return badRequest("Sipariş toplamı doğrulanamadı.");

    // Ürünleri DB'de kontrol et
    for (const item of items as any[]) {
      const product = await ensureCatalogProductInDatabase(item.productId);
      if (!product || !product.isActive) return badRequest(`"${item.productName}" ürünü artık mevcut değil.`);
    }

    // PENDING sipariş oluştur (ödeme onaylandığında CONFIRMED yapılacak)
    const orderNumber = generateOrderNumber();

    await prisma.order.create({
      data: {
        orderNumber,
        status: "PENDING",
        paymentStatus: "WAITING",
        paymentMethod: "CREDIT_CARD",
        customerName: contactValidation.normalized.customerName,
        customerEmail: emailValidation.normalizedEmail,
        customerPhone: contactValidation.normalized.customerPhone,
        address: contactValidation.normalized.address,
        city: contactValidation.normalized.city,
        district: contactValidation.normalized.district,
        postalCode: contactValidation.normalized.postalCode || "",
        notes: notes || null,
        subtotal,
        shippingCost,
        discount,
        total,
        couponCode: couponCode || null,
        items: {
          create: (items as any[]).map((item) => ({
            productId: item.productId,
            productName: item.productName,
            variant: item.variant || null,
            price: item.price,
            quantity: item.quantity,
            total: item.total,
          })),
        },
      },
    });

    // PayTR iframe token al
    const basketItems = (items as any[]).map((item) => ({
      name: item.productName + (item.variant ? ` (${item.variant})` : ""),
      price: Math.round(item.price * 100), // kuruş
      quantity: item.quantity,
    }));

    const tokenResult = await getPayTRIframeToken({
      orderId: orderNumber,
      email: emailValidation.normalizedEmail,
      phone: contactValidation.normalized.customerPhone,
      fullName: contactValidation.normalized.customerName,
      address: `${contactValidation.normalized.address}, ${contactValidation.normalized.district}, ${contactValidation.normalized.city}`,
      ip,
      totalAmount: Math.round(total * 100), // kuruş
      basketItems,
    });

    if (!tokenResult.ok) {
      // Sipariş'i temizle
      await prisma.order.delete({ where: { orderNumber } }).catch(() => {});
      return badRequest(tokenResult.message || "Ödeme sistemi başlatılamadı.");
    }

    return NextResponse.json({ iframeToken: tokenResult.iframeToken, orderNumber });
  } catch (error) {
    if (error instanceof ZodError) return badRequest(error.errors[0]?.message || "Geçersiz veri.");
    return handleError(error);
  }
}
