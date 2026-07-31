import { NextRequest, NextResponse } from "next/server";
import { ZodError, z } from "zod";
import { badRequest, handleError, tooManyRequests } from "@/lib/apiErrors";
import { validateCouponForCart } from "@/lib/coupons";
import { apiRateLimit } from "@/lib/rateLimit";

const couponRequestSchema = z.object({
  code: z.string().min(1).max(50),
  cartTotal: z.number().nonnegative().optional(),
  orderTotal: z.number().nonnegative().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = apiRateLimit(ip);
    if (!rl.success) return tooManyRequests();

    const body = await req.json();
    const { code, cartTotal, orderTotal } = couponRequestSchema.parse(body);
    const total = cartTotal ?? orderTotal;

    if (typeof total !== "number") {
      return badRequest("Sepet tutarı doğrulanamadı.");
    }

    const validation = await validateCouponForCart(code, total);
    if (!validation.ok) return badRequest(validation.message);

    return NextResponse.json({
      success: true,
      coupon: validation.coupon,
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return badRequest(error.errors[0]?.message || "Geçersiz istek.");
    }
    return handleError(error);
  }
}
