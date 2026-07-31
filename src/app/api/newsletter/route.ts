import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ZodError } from "zod";
import { handleError, tooManyRequests } from "@/lib/apiErrors";
import { sendWelcomeCouponEmail } from "@/lib/email";
import { validateNewsletterEmail } from "@/lib/emailValidation";
import { prisma } from "@/lib/prisma";
import { apiRateLimit } from "@/lib/rateLimit";
import { newsletterSchema } from "@/lib/validations";

function getWelcomeCouponCode(email: string) {
  const hash = createHash("sha1").update(email).digest("hex").slice(0, 6).toUpperCase();
  return `HEDIYE${hash}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = apiRateLimit(ip);
    if (!rl.success) return tooManyRequests();

    const body = await req.json();
    const { email } = newsletterSchema.parse(body);
    const emailValidation = await validateNewsletterEmail(email);

    if (!emailValidation.valid) {
      return NextResponse.json({ message: emailValidation.message }, { status: 400 });
    }

    await prisma.newsletter.upsert({
      where: { email: emailValidation.normalizedEmail },
      update: { isActive: true },
      create: { email: emailValidation.normalizedEmail },
    });

    const couponCode = getWelcomeCouponCode(emailValidation.normalizedEmail);

    await prisma.coupon.upsert({
      where: { code: couponCode },
      update: { isActive: true },
      create: {
        code: couponCode,
        type: "PERCENTAGE",
        value: 10,
        minOrder: 250,
        maxUses: 1,
        isActive: true,
      },
    });

    sendWelcomeCouponEmail({
      to: emailValidation.normalizedEmail,
      couponCode,
      discountText: "%10 hediye indirim - minimum 250 TL alışverişte geçerli",
    }).catch(console.error);

    return NextResponse.json({
      success: true,
      message: "Başarıyla abone oldunuz! Hediye kuponunuz e-posta adresinize gönderildi.",
    });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json({ message: error.errors[0]?.message }, { status: 400 });
    }
    return handleError(error);
  }
}
