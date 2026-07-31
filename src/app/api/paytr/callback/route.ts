import { NextRequest, NextResponse } from "next/server";
import { verifyPayTRCallback } from "@/lib/paytr";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmationEmail, sendAdminOrderNotificationEmail } from "@/lib/email";

/**
 * POST /api/paytr/callback
 * PayTR bu endpoint'e ödeme sonucunu bildirir.
 * Endpoint her zaman "OK" döndürmeli (PayTR gerekliliği).
 */
export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    const merchantOid = form.get("merchant_oid") as string;
    const status = form.get("status") as string;
    const totalAmount = form.get("total_amount") as string;
    const hash = form.get("hash") as string;

    // Hash doğrulama
    const isValid = verifyPayTRCallback({ merchantOid, status, totalAmount, hash });
    if (!isValid) {
      console.error("[PayTR Callback] Hash doğrulama başarısız:", merchantOid);
      return new NextResponse("INVALID_HASH", { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber: merchantOid },
      include: { items: true },
    });

    if (!order) {
      console.error("[PayTR Callback] Sipariş bulunamadı:", merchantOid);
      return new NextResponse("OK"); // yine de OK dön
    }

    if (status === "success") {
      // Ödeme başarılı → Siparişi onayla
      if (order.paymentStatus !== "PAID") {
        await prisma.order.update({
          where: { orderNumber: merchantOid },
          data: {
            status: "CONFIRMED",
            paymentStatus: "PAID",
            iyzipayToken: `paytr_${merchantOid}`, // PayTR referansı
          },
        });

        // Kupon kullanım sayacını artır
        if (order.couponCode) {
          prisma.coupon
            .update({
              where: { code: order.couponCode },
              data: { usedCount: { increment: 1 } },
            })
            .catch(console.error);
        }

        // Admin bildirimi
        const itemSummary = order.items
          .map((i) => `${i.productName}${i.variant ? ` (${i.variant})` : ""} x${i.quantity}`)
          .join(", ");

        prisma.adminNotification
          .create({
            data: {
              type: "NEW_ORDER",
              title: `🛒 Yeni Sipariş: ${order.customerName}`,
              body: `${itemSummary} — Toplam: ${order.total.toFixed(2)} ₺ · ${order.city}`,
              orderNumber: order.orderNumber,
              orderId: order.id,
            },
          })
          .catch(console.error);

        // Müşteri e-postası
        sendOrderConfirmationEmail({
          to: order.customerEmail,
          customerName: order.customerName,
          orderNumber: order.orderNumber,
          total: order.total,
          items: order.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            variant: i.variant ?? undefined,
            price: i.price,
            quantity: i.quantity,
            total: i.total,
          })),
        }).catch(console.error);

        // Admin e-postası
        sendAdminOrderNotificationEmail({
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerEmail: order.customerEmail,
          customerPhone: order.customerPhone,
          total: order.total,
          paymentMethod: order.paymentMethod,
          city: order.city,
          district: order.district,
          address: order.address,
          items: order.items.map((i) => ({
            productId: i.productId,
            productName: i.productName,
            variant: i.variant ?? undefined,
            price: i.price,
            quantity: i.quantity,
            total: i.total,
          })),
        }).catch(console.error);
      }
    } else {
      // Ödeme başarısız
      if (order.paymentStatus === "WAITING") {
        await prisma.order.update({
          where: { orderNumber: merchantOid },
          data: { status: "CANCELLED", paymentStatus: "FAILED" },
        }).catch(console.error);
      }
    }

    // PayTR her zaman "OK" bekler
    return new NextResponse("OK");
  } catch (err) {
    console.error("[PayTR Callback] Hata:", err);
    return new NextResponse("OK"); // yine de OK döndür
  }
}
