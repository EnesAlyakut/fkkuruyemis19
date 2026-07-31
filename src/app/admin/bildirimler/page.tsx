import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Bell, ShoppingBag, ChevronRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Bildirimler" };

function timeAgo(date: Date) {
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Az önce";
  if (m < 60) return `${m} dakika önce`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} saat önce`;
  return `${Math.floor(h / 24)} gün önce`;
}

export default async function AdminBildirimlerPage() {
  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 font-display sm:text-2xl">
            Bildirimler
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            {unreadCount > 0 ? (
              <span className="font-semibold text-red-500">{unreadCount} okunmamış</span>
            ) : (
              "Tüm bildirimler okundu"
            )}{" "}
            · {notifications.length} toplam
          </p>
        </div>
      </div>

      {/* Notification list */}
      <div className="space-y-2">
        {notifications.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-gray-100 bg-white py-20 shadow-sm">
            <Bell size={40} className="text-gray-200" />
            <p className="text-gray-400">Henüz bildirim yok</p>
            <p className="text-sm text-gray-400">
              Bir sipariş geldiğinde burada görünecek
            </p>
          </div>
        )}

        {notifications.map((notif) => (
          <div
            key={notif.id}
            className={`overflow-hidden rounded-2xl border shadow-sm transition-all ${
              !notif.isRead
                ? "border-amber-200 bg-amber-50/60"
                : "border-gray-100 bg-white"
            }`}
          >
            <div className="flex items-start gap-4 p-4">
              {/* Icon */}
              <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                !notif.isRead ? "bg-amber-100 text-amber-600" : "bg-gray-100 text-gray-400"
              }`}>
                <ShoppingBag size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className={`text-sm leading-snug ${!notif.isRead ? "font-bold text-gray-900" : "font-semibold text-gray-700"}`}>
                      {notif.title}
                    </p>
                    <p className="mt-0.5 text-sm text-gray-500 leading-relaxed">
                      {notif.body}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-400" />
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>{timeAgo(notif.createdAt)}</span>
                    <span>·</span>
                    <span>{new Date(notif.createdAt).toLocaleString("tr-TR")}</span>
                    {notif.orderNumber && (
                      <>
                        <span>·</span>
                        <span className="font-mono font-semibold text-brand-600">#{notif.orderNumber}</span>
                      </>
                    )}
                  </div>

                  {notif.orderId && (
                    <Link
                      href={`/admin/siparisler/${notif.orderId}`}
                      className="flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-1.5 text-xs font-semibold text-brand-600 transition-colors hover:bg-brand-100"
                    >
                      <Package size={12} />
                      Siparişi Gör
                      <ChevronRight size={11} />
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
