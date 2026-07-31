"use client";

import { usePathname } from "next/navigation";
import AdminSidebar from "./AdminSidebar";
import React from "react";

export default function AdminLayoutClient({
  children,
  panelColor,
}: {
  children: React.ReactNode;
  panelColor?: string;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/giris";

  // Giriş sayfasında sidebar ve padding'i tamamen kaldır
  if (isLoginPage) {
    return <main className="min-h-screen w-full bg-gray-100">{children}</main>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar panelColor={panelColor} />
      <main className="min-h-screen flex-1 overflow-x-hidden lg:ml-64">
        {children}
      </main>
    </div>
  );
}
