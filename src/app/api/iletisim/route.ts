import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiRateLimit } from "@/lib/rateLimit";
import { tooManyRequests } from "@/lib/apiErrors";
import { validateDeliverableEmail } from "@/lib/emailValidation";
import { z } from "zod";

const iletisimSchema = z.object({
  name: z.string().min(2, "Ad soyad en az 2 karakter olmalıdır.").max(100),
  email: z.string().email("Geçerli bir e-posta giriniz."),
  phone: z.string().max(20).optional(),
  subject: z.string().max(100).optional(),
  message: z.string().min(10, "Mesaj en az 10 karakter olmalıdır.").max(2000),
});

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0] ?? "unknown";
    const rl = apiRateLimit(ip);
    if (!rl.success) return tooManyRequests();

    const body = await req.json();
    const data = iletisimSchema.parse(body);

    const emailValidation = await validateDeliverableEmail(data.email);
    if (!emailValidation.valid) {
      return NextResponse.json({ message: emailValidation.message }, { status: 400 });
    }

    const finalMessage = data.phone
      ? `Telefon: ${data.phone}\n\n${data.message}`
      : data.message;

    // Veritabanına mesajı kaydet
    await prisma.contactMessage.create({
      data: {
        name: data.name,
        email: data.email,
        subject: data.subject || null,
        message: finalMessage,
      },
    });

    // Bildirim paneline düşmesi için admin bildirimi oluştur
    await prisma.adminNotification.create({
      data: {
        type: "NEW_MESSAGE",
        title: "Yeni İletişim Mesajı",
        body: `${data.name} adlı kullanıcıdan yeni bir mesaj geldi: ${data.subject || 'Konusuz'}`,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Mesajınız alındı! En kısa sürede size döneceğiz.",
    });
  } catch (error: any) {
    if (error?.errors) {
      return NextResponse.json(
        { message: error.errors[0]?.message || "Geçersiz veri." },
        { status: 400 }
      );
    }
    console.error("Iletisim Error:", error);
    return NextResponse.json(
      { message: "Sunucu hatası oluştu. Lütfen tekrar deneyin.", error: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
