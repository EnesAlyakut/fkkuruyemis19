import { sendDiscountAnnouncementEmail } from "@/lib/email";
import { prisma } from "@/lib/prisma";

interface DiscountProductInput {
  name: string;
  slug: string;
  basePrice: number;
  discountPrice: number | null;
  isActive: boolean;
}

export function hasActiveDiscount(product: DiscountProductInput) {
  return (
    product.isActive &&
    typeof product.discountPrice === "number" &&
    product.discountPrice > 0 &&
    product.basePrice > 0 &&
    product.discountPrice < product.basePrice
  );
}

export function shouldSendDiscountNotification(
  previous: DiscountProductInput | null,
  current: DiscountProductInput
) {
  if (!hasActiveDiscount(current)) return false;
  if (!previous || !hasActiveDiscount(previous)) return true;
  return previous.discountPrice !== current.discountPrice || previous.basePrice !== current.basePrice;
}

export async function notifySubscribersAboutDiscount(product: DiscountProductInput) {
  if (!hasActiveDiscount(product) || product.discountPrice === null) return;

  const subscribers = await prisma.newsletter.findMany({
    where: { isActive: true },
    select: { email: true },
  });

  const recipients = subscribers.map((subscriber) => subscriber.email);
  if (recipients.length === 0) return;

  await sendDiscountAnnouncementEmail({
    recipients,
    product: {
      name: product.name,
      slug: product.slug,
      basePrice: product.basePrice,
      discountPrice: product.discountPrice,
    },
  });
}
