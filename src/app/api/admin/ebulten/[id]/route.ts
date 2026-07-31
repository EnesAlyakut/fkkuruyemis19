import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { unauthorized, handleError } from "@/lib/apiErrors";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin(req);
    if (!admin) return unauthorized();

    await prisma.newsletter.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true, message: "Abone silindi." });
  } catch (error) {
    return handleError(error);
  }
}
