import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { unauthorized, notFound, handleError } from "@/lib/apiErrors";
import {
  notifySubscribersAboutDiscount,
  shouldSendDiscountNotification,
} from "@/lib/discountNotifications";

interface Params {
  params: { id: string };
}

type VariantInput = {
  weight?: unknown;
  price?: unknown;
  stock?: unknown;
};

function normalizeVariants(variants: unknown) {
  if (!Array.isArray(variants)) return undefined;

  return variants
    .map((variant: VariantInput) => ({
      weight: String(variant.weight || "").trim(),
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
    }))
    .filter((variant) => variant.weight && variant.price >= 0 && variant.stock >= 0);
}

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        variants: { orderBy: { price: "asc" } },
        reviews: { where: { isApproved: true }, orderBy: { createdAt: "desc" } },
      },
    });

    if (!product) return notFound("Ürün bulunamadı.");
    return NextResponse.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const body = await req.json();
    const variants = normalizeVariants(body.variants);
    const totalStock = variants && variants.length > 0
      ? variants.reduce((sum, variant) => sum + variant.stock, 0)
      : Number(body.totalStock ?? 0);

    const previousProduct = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        name: true,
        slug: true,
        basePrice: true,
        discountPrice: true,
        isActive: true,
      },
    });

    const productData = {
      name: body.name,
      slug: body.slug,
      description: body.description,
      shortDesc: body.shortDesc,
      origin: body.origin,
      production: body.production,
      freshness: body.freshness,
      images: body.images || [],
      basePrice: Number(body.basePrice),
      discountPrice:
        body.discountPrice === null || body.discountPrice === ""
          ? null
          : Number(body.discountPrice),
      isNatural: body.isNatural ?? true,
      isFeatured: body.isFeatured ?? false,
      isBestSeller: body.isBestSeller ?? false,
      isNew: body.isNew ?? false,
      isActive: body.isActive ?? true,
      totalStock,
      metaTitle: body.metaTitle,
      metaDescription: body.metaDescription,
      category: body.categoryId
        ? { connect: { id: body.categoryId } }
        : undefined,
    };

    const product = await prisma.$transaction(async (tx) => {
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: params.id } });
      }

      return tx.product.update({
        where: { id: params.id },
        data: {
          ...productData,
          variants:
            variants && variants.length > 0
              ? {
                  createMany: {
                    data: variants,
                  },
                }
              : undefined,
        },
        include: {
          category: true,
          variants: { orderBy: { price: "asc" } },
        },
      });
    });

    if (
      shouldSendDiscountNotification(previousProduct, {
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        isActive: product.isActive,
      })
    ) {
      notifySubscribersAboutDiscount({
        name: product.name,
        slug: product.slug,
        basePrice: product.basePrice,
        discountPrice: product.discountPrice,
        isActive: product.isActive,
      }).catch(console.error);
    }

    return NextResponse.json(product);
  } catch (error) {
    return handleError(error);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const product = await prisma.product.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        orderItems: { select: { id: true }, take: 1 },
      },
    });

    if (!product) return notFound("Ürün bulunamadı.");

    // Sipariş geçmişindeki ürünler kalıcı olarak silinemez; geçmiş kayıtları
    // bozmadan mağazadan kaldırılır. Siparişsiz ürünler tamamen temizlenir.
    if (product.orderItems.length > 0) {
      await prisma.product.update({
        where: { id: params.id },
        data: { isActive: false },
      });

      return NextResponse.json({
        success: true,
        archived: true,
        message: "Ürün sipariş geçmişini korumak için mağazadan kaldırıldı.",
      });
    }

    await prisma.$transaction([
      prisma.cartItem.deleteMany({ where: { productId: params.id } }),
      prisma.product.delete({ where: { id: params.id } }),
    ]);

    return NextResponse.json({ success: true, message: "Ürün kalıcı olarak silindi." });
  } catch (error) {
    return handleError(error);
  }
}
