import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Veritabanındaki tüm eski ayarları güncelle veya oluştur
    const updates = Object.entries(data).map(([key, value]) => {
      return (prisma as any).siteSetting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      });
    });

    await Promise.all(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Ayarlar kaydedilirken hata:", error);
    return NextResponse.json(
      { error: "Ayarlar kaydedilemedi. Veritabanı yapılandırmasını kontrol edin." },
      { status: 500 }
    );
  }
}
