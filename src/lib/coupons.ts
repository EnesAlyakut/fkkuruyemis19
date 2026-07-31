import { prisma } from "@/lib/prisma";

export type CouponValidationResult =
  | {
      ok: true;
      coupon: {
        code: string;
        type: "PERCENTAGE" | "FIXED";
        value: number;
        discountAmount: number;
      };
    }
  | { ok: false; message: string };

export async function validateCouponForCart(
  rawCode: string,
  cartTotal: number
): Promise<CouponValidationResult> {
  const code = rawCode.toUpperCase().trim();
  if (!code) return { ok: false, message: "Kupon kodu giriniz." };

  const coupon = await prisma.coupon.findUnique({ where: { code } });

  if (!coupon || !coupon.isActive) {
    return { ok: false, message: "Geçersiz kupon kodu." };
  }

  if (coupon.expiresAt && coupon.expiresAt < new Date()) {
    return { ok: false, message: "Kuponun süresi dolmuş." };
  }

  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) {
    return { ok: false, message: "Kupon kullanım limiti dolmuş." };
  }

  if (coupon.minOrder && cartTotal < coupon.minOrder) {
    return {
      ok: false,
      message: `Bu kupon için minimum sipariş tutarı ${coupon.minOrder.toFixed(2)} ₺'dir.`,
    };
  }

  const rawDiscount =
    coupon.type === "PERCENTAGE"
      ? (cartTotal * coupon.value) / 100
      : Math.min(coupon.value, cartTotal);

  const discountAmount = Math.round(rawDiscount * 100) / 100;

  return {
    ok: true,
    coupon: {
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      discountAmount,
    },
  };
}
