import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Eye, Clock, CheckCircle, Package, Truck, XCircle, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const statusConfig: Record<string, { label: string; color: string; bgColor: string; icon: any }> = {
  PENDING: { label: "Bekliyor", color: "text-amber-700", bgColor: "bg-amber-50", icon: Clock },
  CONFIRMED: { label: "Onaylandı", color: "text-blue-700", bgColor: "bg-blue-50", icon: CheckCircle },
  PROCESSING: { label: "Hazırlanıyor", color: "text-purple-700", bgColor: "bg-purple-50", icon: Package },
  SHIPPED: { label: "Kargoda", color: "text-indigo-700", bgColor: "bg-indigo-50", icon: Truck },
  DELIVERED: { label: "Teslim Edildi", color: "text-green-700", bgColor: "bg-green-50", icon: CheckCircle },
  CANCELLED: { label: "İptal", color: "text-red-700", bgColor: "bg-red-50", icon: XCircle },
};

const paymentLabels: Record<string, string> = {
  CREDIT_CARD: "Kredi Kartı",
  BANK_TRANSFER: "Havale/EFT",
  CASH_ON_DELIVERY: "Kapıda Ödeme",
};

export default async function AdminSiparislerPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 font-display sm:text-2xl">
          Sipariş Yönetimi
        </h1>
        <p className="text-gray-500 mt-1 text-sm">{orders.length} sipariş</p>
      </div>

      {/* Status Summary */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-6">
        {Object.entries(statusConfig).map(([key, cfg]) => {
          const count = orders.filter((o) => o.status === key).length;
          const Icon = cfg.icon;
          return (
            <div key={key} className={`${cfg.bgColor} rounded-xl p-3 text-center`}>
              <Icon size={15} className={`${cfg.color} mx-auto mb-1`} />
              <p className={`text-base font-bold sm:text-lg ${cfg.color}`}>{count}</p>
              <p className={`text-[10px] sm:text-xs ${cfg.color} opacity-80 leading-tight`}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden lg:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Sipariş No", "Müşteri", "İletişim", "Tutar", "Ödeme", "Durum", "Tarih", "İşlem"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((order) => {
                const status = statusConfig[order.status] || statusConfig.PENDING;
                const StatusIcon = status.icon;
                return (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="font-mono text-sm text-brand-600 hover:underline font-bold"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900 text-sm">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.city}, {order.district}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[150px]">{order.customerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-gray-900">{order.total.toFixed(2)} ₺</p>
                      <p className="text-xs text-gray-400">{order.items.length} ürün</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {paymentLabels[order.paymentMethod] || order.paymentMethod}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${status.color} ${status.bgColor}`}
                      >
                        <StatusIcon size={11} />
                        {status.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("tr-TR")}
                      <br />
                      {new Date(order.createdAt).toLocaleTimeString("tr-TR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/siparisler/${order.id}`}
                        className="w-8 h-8 flex items-center justify-center text-brand-500 hover:bg-brand-50 rounded-lg transition-colors"
                      >
                        <Eye size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {orders.length === 0 && (
            <div className="text-center py-12 text-gray-400">Henüz sipariş yok.</div>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-3 lg:hidden">
        {orders.map((order) => {
          const status = statusConfig[order.status] || statusConfig.PENDING;
          const StatusIcon = status.icon;
          return (
            <Link
              key={order.id}
              href={`/admin/siparisler/${order.id}`}
              className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-4 transition-all hover:shadow-md hover:border-brand-100"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-brand-600">{order.orderNumber}</span>
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${status.color} ${status.bgColor}`}>
                      <StatusIcon size={10} />
                      {status.label}
                    </span>
                  </div>
                  <p className="mt-1.5 font-semibold text-gray-900">{order.customerName}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{order.city}, {order.district}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{order.customerPhone}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-lg font-bold text-gray-900">{order.total.toFixed(2)} ₺</p>
                  <p className="text-xs text-gray-400">{order.items.length} ürün</p>
                  <ChevronRight size={16} className="text-gray-300" />
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-xs text-gray-400">{paymentLabels[order.paymentMethod] || order.paymentMethod}</span>
                <span className="text-xs text-gray-400">
                  {new Date(order.createdAt).toLocaleDateString("tr-TR")}{" "}
                  {new Date(order.createdAt).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </Link>
          );
        })}
        {orders.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 py-16 text-center text-gray-400 shadow-sm">
            Henüz sipariş yok.
          </div>
        )}
      </div>
    </div>
  );
}
