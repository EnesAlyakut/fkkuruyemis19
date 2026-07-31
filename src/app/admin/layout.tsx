import type { Metadata } from "next";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: {
    default: "Yönetim Paneli | FK KURUYEMİŞ",
    template: "%s | Yönetim Paneli",
  },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { panelColor } = await getSiteSettings();

  return (
    <AdminLayoutClient panelColor={panelColor}>
      {children}
    </AdminLayoutClient>
  );
}
