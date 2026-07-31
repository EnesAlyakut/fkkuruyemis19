import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { unauthorized, handleError } from "@/lib/apiErrors";

/** GET /api/kategoriler - Public */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const withCount = searchParams.get("withCount") === "true";

    const categories = await prisma.category.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
      include: withCount
        ? { _count: { select: { products: { where: { isActive: true } } } } }
        : undefined,
    });

    return NextResponse.json(categories);
  } catch (error) {
    return handleError(error);
  }
}

/** POST /api/kategoriler - Admin only */
export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const body = await req.json();

    const category = await prisma.category.create({
      data: {
        name: body.name,
        slug: body.slug,
        description: body.description,
        image: body.image,
        order: body.order ?? 0,
        isActive: body.isActive ?? true,
        unitType: body.unitType ?? "GRAMAJ",
      },
    });

    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}
