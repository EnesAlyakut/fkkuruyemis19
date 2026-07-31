import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import KuponDuzenleClient from "./KuponDuzenleClient";

interface PageProps {
  params: { id: string };
}

export const dynamic = "force-dynamic";
export const metadata = { title: "Kupon Düzenle" };

export default async function KuponDuzenlePage({ params }: PageProps) {
  const coupon = await prisma.coupon.findUnique({
    where: { id: params.id },
  });

  if (!coupon) notFound();

  return (
    <KuponDuzenleClient
      coupon={{
        id: coupon.id,
        code: coupon.code,
        type: coupon.type as "PERCENTAGE" | "FIXED",
        value: Number(coupon.value),
        minOrder: coupon.minOrder ? Number(coupon.minOrder) : null,
        maxUses: coupon.maxUses ?? null,
        usedCount: coupon.usedCount,
        expiresAt: coupon.expiresAt ? coupon.expiresAt.toISOString().split("T")[0] : "",
        isActive: coupon.isActive,
        createdAt: coupon.createdAt,
      }}
    />
  );
}
