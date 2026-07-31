import { prisma } from "@/lib/prisma";
import SettingsForm from "./SettingsForm";

export const metadata = { title: "Site Ayarları" };
export const dynamic = "force-dynamic";

export default async function AdminAyarlarPage() {
  let settingsMap: Record<string, string> = {};
  
  try {
    // TypeScript generated client types might be outdated if server not restarted,
    // using queryRaw or any bypass if needed, but standard findMany is best.
    const settings = await (prisma as any).siteSetting.findMany();
    for (const setting of settings) {
      settingsMap[setting.key] = setting.value;
    }
  } catch (err) {
    console.error("Site ayarları çekilemedi:", err);
    // Tablo henüz yoksa veya Prisma client güncel değilse boş obje kullan
  }

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8 max-w-4xl">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">Site Ayarları</h1>
        <p className="mt-1 text-sm text-gray-500">Genel site yapılandırması, iletişim ve kargo bilgileri.</p>
      </div>
      
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <SettingsForm initialSettings={settingsMap} />
      </div>
    </div>
  );
}
