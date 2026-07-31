import { prisma } from "@/lib/prisma";

export async function getSiteSettings() {
  try {
    const records = await (prisma as any).siteSetting.findMany();
    const settings: Record<string, string> = {};
    for (const record of records) {
      settings[record.key] = record.value;
    }
    return {
      siteName: settings.siteName || "FK KURUYEMİŞ",
      contactEmail: settings.contactEmail || "info@fkkuruyemis.com",
      contactPhone: settings.contactPhone || "+90 505 889 88 28",
      address: settings.address || "Çöplü Mahallesi Camikebir 3. Sokak Çorum",
      instagramUrl: settings.instagramUrl || "https://www.instagram.com/fkkuruyemiss/",
      facebookUrl: settings.facebookUrl || "https://www.facebook.com/p/FK-Kuruyemiş-Fatih-Karakuş-61585467575881/",
      freeShippingThreshold: parseFloat(settings.freeShippingThreshold || "1000"),
      shippingCost: parseFloat(settings.shippingCost || "65"),
      panelColor: settings.panelColor || "#111827", // gray-900
    };
  } catch (error) {
    return {
      siteName: "FK KURUYEMİŞ",
      contactEmail: "info@fkkuruyemis.com",
      contactPhone: "+90 505 889 88 28",
      address: "Çöplü Mahallesi Camikebir 3. Sokak Çorum",
      instagramUrl: "https://www.instagram.com/fkkuruyemiss/",
      facebookUrl: "https://www.facebook.com/p/FK-Kuruyemiş-Fatih-Karakuş-61585467575881/",
      freeShippingThreshold: 1000,
      shippingCost: 65,
      panelColor: "#111827",
    };
  }
}
