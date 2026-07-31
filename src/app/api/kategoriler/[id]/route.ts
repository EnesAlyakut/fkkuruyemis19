import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { handleError, unauthorized } from "@/lib/apiErrors";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(2, "Kategori adı en az 2 karakter olmalıdır"),
  slug: z.string().min(2, "Slug en az 2 karakter olmalıdır"),
  description: z.string().optional(),
  image: z.string().optional().or(z.literal("")),
  order: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  unitType: z.enum(["GRAMAJ", "ADET"]).default("GRAMAJ"),
});

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const category = await prisma.category.findUnique({
      where: { id: params.id },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(category);
  } catch (error) {
    return handleError(error);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const body = await req.json();
    const data = categorySchema.parse(body);

    const existingCategory = await prisma.category.findFirst({
      where: { slug: data.slug, id: { not: params.id } },
    });
    
    if (existingCategory) {
      return NextResponse.json({ error: "Bu URL slug'ı zaten kullanılıyor." }, { status: 400 });
    }

    const category = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: data.name,
        slug: data.slug,
        description: data.description || null,
        image: data.image || null,
        order: data.order,
        isActive: data.isActive,
        unitType: data.unitType,
      },
    });

    return NextResponse.json(category);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0]?.message }, { status: 400 });
    }
    return handleError(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id: params.id },
      include: { _count: { select: { products: true } } },
    });

    if (!category) {
      return NextResponse.json({ error: "Kategori bulunamadı" }, { status: 404 });
    }

    if (category._count.products > 0) {
      return NextResponse.json(
        { error: "İçinde ürün bulunan kategoriyi silemezsiniz. Lütfen önce ürünleri taşıyın veya silin." },
        { status: 400 }
      );
    }

    await prisma.category.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Kategori silindi." });
  } catch (error) {
    return handleError(error);
  }
}
