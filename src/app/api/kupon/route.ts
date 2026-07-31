import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { requireAdmin } from "@/lib/auth";
import { badRequest, handleError, unauthorized } from "@/lib/apiErrors";
import { prisma } from "@/lib/prisma";

const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Kupon kodu en az 2 karakter olmalıdır.")
    .max(50, "Kupon kodu 50 karakteri geçemez.")
    .regex(/^[A-Z0-9_-]+$/i, "Kupon kodunda sadece harf, rakam, tire ve alt çizgi kullanılabilir."),
  type: z.enum(["PERCENTAGE", "FIXED"]),
  value: z.number().positive("İndirim değeri 0'dan büyük olmalıdır."),
  minOrder: z.number().nonnegative().optional().nullable(),
  maxUses: z.number().int().positive().optional().nullable(),
  expiresAt: z.string().optional().nullable(),
  isActive: z.boolean().default(true),
});

export async function POST(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const body = await req.json();
    const data = createCouponSchema.parse(body);
    const code = data.code.trim().toUpperCase();

    if (data.type === "PERCENTAGE" && data.value > 100) {
      return badRequest("Yüzde kupon değeri 100'den büyük olamaz.");
    }

    const expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return badRequest("Son tarih geçerli değil.");
    }

    const coupon = await prisma.coupon.create({
      data: {
        code,
        type: data.type,
        value: data.value,
        minOrder: data.minOrder || null,
        maxUses: data.maxUses || null,
        expiresAt,
        isActive: data.isActive,
      },
    });

    return NextResponse.json({ success: true, coupon }, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.errors[0]?.message || "Kupon bilgileri geçerli değil.");
    }

    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      (error as { code?: string }).code === "P2002"
    ) {
      return badRequest("Bu kupon kodu zaten var.");
    }

    return handleError(error);
  }
}
