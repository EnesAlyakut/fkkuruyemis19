import Link from "next/link";
import type { ElementType } from "react";
import type { OrderStatus } from "@prisma/client";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  Package,
  ShoppingBag,
  TrendingUp,
  Users,
  XCircle,
  ChevronRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

const statusLabels: Record<string, { label: string; color: string; bg: string; icon: ElementType }> = {
  PENDING: { label: "Bekliyor", color: "text-amber-700", bg: "bg-amber-50", icon: Clock },
  CONFIRMED: { label: "Onaylandı", color: "text-blue-700", bg: "bg-blue-50", icon: CheckCircle },
  PROCESSING: { label: "Hazırlanıyor", color: "text-purple-700", bg: "bg-purple-50", icon: AlertCircle },
  SHIPPED: { label: "Kargoda", color: "text-indigo-700", bg: "bg-indigo-50", icon: Package },
  DELIVERED: { label: "Teslim Edildi", color: "text-green-700", bg: "bg-green-50", icon: CheckCircle },
  CANCELLED: { label: "İptal", color: "text-red-700", bg: "bg-red-50", icon: XCircle },
  REFUNDED: { label: "İade Edildi", color: "text-gray-700", bg: "bg-gray-100", icon: XCircle },
};

const paymentLabels: Record<string, string> = {
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale/EFT",
  CASH_ON_DELIVERY: "Kapıda Ödeme",
};

function startOfToday() {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatMoney(value: number) {
  return `${value.toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} ₺`;
}

async function getDashboardData() {
  try {
    const { prisma } = await import("@/lib/prisma");
    const today = startOfToday();
    const excludedRevenueStatuses: OrderStatus[] = ["CANCELLED", "REFUNDED"];
    const paidRevenueWhere = {
      paymentStatus: "PAID" as const,
      status: { notIn: excludedRevenueStatuses },
    };

    const [
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue,
      todayRevenue,
      totalProducts,
      recentOrders,
      newsletterCount,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } } }),
      prisma.order.count({ where: { createdAt: { gte: today } } }),
      prisma.order.aggregate({ where: paidRevenueWhere, _sum: { total: true } }),
      prisma.order.aggregate({
        where: { ...paidRevenueWhere, createdAt: { gte: today } },
        _sum: { total: true },
      }),
      prisma.product.count({ where: { isActive: true } }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: { items: true },
      }),
      prisma.newsletter.count({ where: { isActive: true } }),
    ]);

    return {
      totalOrders,
      pendingOrders,
      todayOrders,
      totalRevenue: totalRevenue._sum?.total || 0,
      todayRevenue: todayRevenue._sum?.total || 0,
      totalProducts,
      recentOrders,
      newsletterCount,
      dbError: false,
    };
  } catch (error) {
    console.error("[Admin Dashboard]", error);
    return {
      totalOrders: 0,
      pendingOrders: 0,
      todayOrders: 0,
      totalRevenue: 0,
      todayRevenue: 0,
      totalProducts: 0,
      recentOrders: [],
      newsletterCount: 0,
      dbError: true,
    };
  }
}

export default async function AdminDashboard() {
  const {
    totalOrders,
    pendingOrders,
    todayOrders,
    totalRevenue,
    todayRevenue,
    totalProducts,
    recentOrders,
    newsletterCount,
    dbError,
  } = await getDashboardData();

  const stats = [
    {
      label: "Toplam Sipariş",
      value: totalOrders,
      icon: ShoppingBag,
      color: "bg-blue-500",
      detail: `Bugün ${todayOrders} sipariş`,
    },
    {
      label: "Bekleyen İşlem",
      value: pendingOrders,
      icon: Clock,
      color: "bg-amber-500",
      detail: "Bekleyen / onaylanan / hazırlanan",
    },
    {
      label: "Toplam Gelir",
      value: formatMoney(totalRevenue),
      icon: TrendingUp,
      color: "bg-green-500",
      detail: `Bugün ${formatMoney(todayRevenue)}`,
    },
    {
      label: "Aktif Ürün",
      value: totalProducts,
      icon: Package,
      color: "bg-purple-500",
      detail: "Satışta görünen ürünler",
    },
    {
      label: "E-Bülten Üyesi",
      value: newsletterCount,
      icon: Users,
      color: "bg-pink-500",
      detail: "Aktif aboneler",
    },
  ];

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Sipariş, gelir, ürün ve abone özetiniz burada.</p>
      </div>

      {dbError && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-amber-500" />
          <div>
            <p className="text-sm font-semibold text-amber-800">Veritabanı bağlantısı kurulamadı</p>
            <p className="mt-0.5 text-xs text-amber-700">
              Sipariş ve istatistikler okunamıyor. DATABASE_URL ve veritabanı bağlantısını kontrol edin.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-5">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          const hrefs = ["/admin/siparisler", "/admin/siparisler", "/admin/siparisler", "/admin/urunler", "/admin/ebulten"];
          return (
            <Link key={stat.label} href={hrefs[i]} className={`group rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5 ${i === 4 ? "col-span-2 sm:col-span-1" : ""}`}>
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className={`flex h-9 w-9 items-center justify-center rounded-xl sm:h-10 sm:w-10 ${stat.color}`}>
                  <Icon size={17} className="text-white" />
                </div>
                <ChevronRight size={14} className="text-gray-300 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gray-400" />
              </div>
              <p className="truncate text-xl font-bold text-gray-900 sm:text-2xl">{stat.value}</p>
              <p className="mt-1 text-xs font-medium text-gray-600 sm:text-sm">{stat.label}</p>
              <p className="mt-2 min-h-4 text-[11px] text-gray-400 sm:text-xs">{stat.detail}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4 sm:p-5">
          <div>
            <h2 className="font-bold text-gray-900">Son Siparişler</h2>
            <p className="mt-0.5 text-xs text-gray-400">Müşteri siparişi tamamladığında buraya düşer.</p>
          </div>
          <Link href="/admin/siparisler" className="flex items-center gap-1 text-sm font-medium text-brand-600 hover:underline">
            Tümünü Gör
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Desktop table */}
        <div className="hidden overflow-x-auto lg:block">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50">
              <tr>
                {["Sipariş No", "Müşteri", "Ürün Sayısı", "Tutar", "Ödeme", "Durum", "Tarih"].map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const status = statusLabels[order.status] || statusLabels.PENDING;
                const StatusIcon = status.icon;
                return (
                  <tr key={order.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="font-mono text-sm font-semibold text-brand-600 hover:underline"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900">{order.customerName}</p>
                      <p className="max-w-[190px] truncate text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{order.items.length} ürün</td>
                    <td className="px-4 py-3 font-semibold text-gray-900">{formatMoney(order.total)}</td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${status.color} ${status.bg}`}>
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {recentOrders.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              {dbError ? "Veritabanı bağlantısı kurulamadı." : "Henüz sipariş yok."}
            </div>
          )}
        </div>

        {/* Mobile card list */}
        <div className="divide-y divide-gray-100 lg:hidden">
          {recentOrders.map((order) => {
            const status = statusLabels[order.status] || statusLabels.PENDING;
            const StatusIcon = status.icon;
            return (
              <Link
                key={order.id}
                href={`/admin/siparisler/${order.id}`}
                className="block p-4 transition-colors hover:bg-gray-50"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-sm font-bold text-brand-600">{order.orderNumber}</p>
                    <p className="mt-0.5 text-sm font-medium text-gray-900">{order.customerName}</p>
                    <p className="truncate text-xs text-gray-400">{order.customerEmail}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    <p className="font-bold text-gray-900">{formatMoney(order.total)}</p>
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.color} ${status.bg}`}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs text-gray-400">{order.items.length} ürün · {paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                  <span className="text-xs text-gray-400">
                    {new Date(order.createdAt).toLocaleDateString("tr-TR")} {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              </Link>
            );
          })}
          {recentOrders.length === 0 && (
            <div className="py-12 text-center text-gray-400">
              {dbError ? "Veritabanı bağlantısı kurulamadı." : "Henüz sipariş yok."}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
