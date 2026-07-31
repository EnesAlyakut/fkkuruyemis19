import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Tag, Calendar, CheckCircle, XCircle } from "lucide-react";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kupon Yönetimi" };

export default async function AdminKuponlarPage() {
  const coupons = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl">Kupon Yönetimi</h1>
          <p className="mt-1 text-sm text-gray-500">{coupons.length} kupon</p>
        </div>
        <Link href="/admin/kuponlar/yeni" className="btn-primary">
          <Plus size={16} />
          Yeni Kupon
        </Link>
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm sm:block">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Kod", "Tür", "Değer", "Min. Sipariş", "Kullanım", "Durum", "Son Tarih", "İşlem"].map(
                  (heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                    >
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => {
                const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
                const isLimitReached = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                const isEffectivelyActive = coupon.isActive && !isExpired && !isLimitReached;

                return (
                  <tr key={coupon.id} className="transition-colors hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Tag size={14} className="text-brand-500" />
                        <span className="font-mono text-sm font-bold text-gray-900">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {coupon.type === "PERCENTAGE" ? "Yüzde" : "Sabit"}
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">
                      {coupon.type === "PERCENTAGE" ? `%${coupon.value}` : `${coupon.value.toFixed(2)} ₺`}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {coupon.minOrder ? `${coupon.minOrder.toFixed(2)} ₺` : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="font-medium text-gray-900">{coupon.usedCount}</span>
                      {coupon.maxUses && <span className="text-gray-400"> / {coupon.maxUses}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${
                          isEffectivelyActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                        }`}
                      >
                        {isEffectivelyActive ? <CheckCircle size={11} /> : <XCircle size={11} />}
                        {isExpired ? "Süresi Doldu" : isLimitReached ? "Limit Doldu" : coupon.isActive ? "Aktif" : "Pasif"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">
                      {coupon.expiresAt ? (
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(coupon.expiresAt).toLocaleDateString("tr-TR")}
                        </div>
                      ) : (
                        "Süresiz"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/kuponlar/${coupon.id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 transition-colors hover:bg-blue-50"
                        aria-label={`${coupon.code} kuponunu düzenle`}
                      >
                        <Edit size={14} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {coupons.length === 0 && (
            <div className="py-12 text-center text-gray-400">Henüz kupon yok.</div>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-3 sm:hidden">
        {coupons.map((coupon) => {
          const isExpired = coupon.expiresAt && coupon.expiresAt < new Date();
          const isLimitReached = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
          const isEffectivelyActive = coupon.isActive && !isExpired && !isLimitReached;

          return (
            <div key={coupon.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-brand-500 shrink-0" />
                  <span className="font-mono text-base font-bold text-gray-900">{coupon.code}</span>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-semibold ${
                    isEffectivelyActive ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                  }`}
                >
                  {isEffectivelyActive ? <CheckCircle size={10} /> : <XCircle size={10} />}
                  {isExpired ? "Süresi Doldu" : isLimitReached ? "Limit Doldu" : coupon.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-3">
                <div>
                  <span className="text-gray-400">İndirim: </span>
                  <span className="font-semibold text-gray-900">
                    {coupon.type === "PERCENTAGE" ? `%${coupon.value}` : `${coupon.value.toFixed(2)} ₺`}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Min. Sipariş: </span>
                  <span className="font-medium">{coupon.minOrder ? `${coupon.minOrder.toFixed(2)} ₺` : "-"}</span>
                </div>
                <div>
                  <span className="text-gray-400">Kullanım: </span>
                  <span className="font-medium">{coupon.usedCount}{coupon.maxUses ? ` / ${coupon.maxUses}` : ""}</span>
                </div>
                <div>
                  <span className="text-gray-400">Son Tarih: </span>
                  <span className="font-medium">
                    {coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString("tr-TR") : "Süresiz"}
                  </span>
                </div>
              </div>
              <Link
                href={`/admin/kuponlar/${coupon.id}`}
                className="flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700"
              >
                <Edit size={13} />
                Düzenle
              </Link>
            </div>
          );
        })}
        {coupons.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-12 text-center text-gray-400 shadow-sm">
            Henüz kupon yok.
          </div>
        )}
      </div>
    </div>
  );
}
