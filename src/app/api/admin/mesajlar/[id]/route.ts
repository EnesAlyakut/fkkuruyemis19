import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import nodemailer from "nodemailer";
import { getSiteSettings } from "@/lib/settings";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { replyMessage } = await req.json();
    if (!replyMessage) {
      return NextResponse.json({ error: "Yanıt mesajı zorunludur." }, { status: 400 });
    }

    const message = await prisma.contactMessage.findUnique({
      where: { id: params.id }
    });

    if (!message) {
      return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
    }

    const settings = await getSiteSettings();

    // Nodemailer Setup
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: Number(process.env.SMTP_PORT) || 587,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"${settings.siteName}" <${process.env.SMTP_USER || 'noreply@fkkuruyemis.com'}>`,
      to: message.email,
      subject: `RE: ${message.subject || 'İletişim Mesajınız'}`,
      text: replyMessage,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
          <h2 style="color: #c2410c;">${settings.siteName}</h2>
          <p>Merhaba ${message.name},</p>
          <p>Bizimle iletişime geçtiğiniz için teşekkür ederiz. Mesajınıza istinaden yanıtımız aşağıdadır:</p>
          <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #c2410c; margin: 20px 0;">
            ${replyMessage.replace(/\n/g, "<br>")}
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
          <p style="font-size: 12px; color: #888;">Bu e-posta otomatik olarak gönderilmiştir. Lütfen yanıtlamayınız.</p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      return NextResponse.json({ error: "E-posta gönderilemedi. Lütfen sunucudaki .env SMTP ayarlarını kontrol edin." }, { status: 500 });
    }

    await prisma.contactMessage.update({
      where: { id: params.id },
      data: { isReplied: true, isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { isRead } = await req.json();
    await prisma.contactMessage.update({
      where: { id: params.id },
      data: { isRead },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    await prisma.contactMessage.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası." }, { status: 500 });
  }
}
