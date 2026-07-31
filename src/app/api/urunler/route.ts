import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { notifySubscribersAboutDiscount } from "@/lib/discountNotifications";
import { apiRateLimit } from "@/lib/rateLimit";
import { unauthorized, tooManyRequests, handleError } from "@/lib/apiErrors";

type VariantInput = {
  weight?: unknown;
  price?: unknown;
  stock?: unknown;
};

function normalizeVariants(variants: unknown) {
  if (!Array.isArray(variants)) return [];

  return variants
    .map((variant: VariantInput) => ({
      weight: String(variant.weight || "").trim(),
      price: Number(variant.price || 0),
      stock: Number(variant.stock || 0),
    }))
    .filter((variant) => variant.weight && variant.price >= 0 && variant.stock >= 0);
}

export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = apiRateLimit(ip);
    if (!rl.success) return tooManyRequests();

    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q");
    const kategori = searchParams.get("kategori");
    const page = Math.max(1, parseInt(searchParams.get("sayfa") || "1"));
    const perPage = Math.min(50, parseInt(searchParams.get("limit") || "12"));

    const where: Record<string, unknown> = { isActive: true };

    if (kategori) where.category = { slug: kategori };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { shortDesc: { contains: q, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { orderBy: { price: "asc" } },
        },
        skip: (page - 1) * perPage,
        take: perPage,
        orderBy: { createdAt: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    return NextResponse.json({
      products,
      total,
      page,
      perPage,
      totalPages: Math.ceil(total / perPage),
    });
  } catch (error) {
    return handleError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    // Admin auth check
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const body = await req.json();
    const variants = normalizeVariants(body.variants);
    const totalStock =
      variants.length > 0
        ? variants.reduce((sum, variant) => sum + variant.stock, 0)
        : Number(body.totalStock ?? 0);

    const product = await prisma.product.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        shortDesc: body.shortDesc,
        origin: body.origin,
        production: body.production,
        freshness: body.freshness,
        images: body.images || [],
        basePrice: body.basePrice,
        discountPrice: body.discountPrice,
        isNatural: body.isNatural ?? true,
        isFeatured: body.isFeatured ?? false,
        isBestSeller: body.isBestSeller ?? false,
        isNew: body.isNew ?? false,
        isActive: body.isActive ?? true,
        totalStock,
        metaTitle: body.metaTitle,
        metaDescription: body.metaDescription,
        category: { connect: { id: body.categoryId } },
        variants:
          variants.length > 0
            ? {
                createMany: {
                  data: variants,
                },
              }
            : undefined,
      },
      include: { variants: true },
    });

    notifySubscribersAboutDiscount({
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      discountPrice: product.discountPrice,
      isActive: product.isActive,
    }).catch(console.error);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
