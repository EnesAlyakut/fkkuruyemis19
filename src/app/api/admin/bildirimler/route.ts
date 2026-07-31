import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { unauthorized, handleError } from "@/lib/apiErrors";
import { prisma } from "@/lib/prisma";

// GET: Bildirimleri getir
export async function GET(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    const notifications = await prisma.adminNotification.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.adminNotification.count({
      where: { isRead: false },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    return handleError(error);
  }
}

// PATCH: Tümünü okundu işaretle
export async function PATCH(req: NextRequest) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    await prisma.adminNotification.updateMany({
      where: { isRead: false },
      data: { isRead: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error);
  }
}
