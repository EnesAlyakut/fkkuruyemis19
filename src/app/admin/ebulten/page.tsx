import { prisma } from "@/lib/prisma";
import { Mail, Users } from "lucide-react";
import DeleteSubscriberButton from "./DeleteSubscriberButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "E-Bülten Yönetimi" };

export default async function AdminEbultenPage() {
  const [subscribers, total, activeTotal] = await Promise.all([
    prisma.newsletter.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
    prisma.newsletter.count(),
    prisma.newsletter.count({ where: { isActive: true } }),
  ]);

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900 font-display sm:text-2xl">E-Bülten Yönetimi</h1>
        <p className="text-gray-500 mt-1 text-sm">Abone listesi ve istatistikler</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <Users size={16} className="text-blue-600 sm:hidden" />
              <Users size={18} className="text-blue-600 hidden sm:block" />
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">Toplam</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={16} className="text-green-600 sm:hidden" />
              <Mail size={18} className="text-green-600 hidden sm:block" />
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">Aktif</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{activeTotal}</p>
        </div>
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 sm:gap-3 mb-2">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
              <Mail size={16} className="text-red-500 sm:hidden" />
              <Mail size={18} className="text-red-500 hidden sm:block" />
            </div>
            <p className="text-gray-500 text-xs sm:text-sm">Pasif</p>
          </div>
          <p className="text-2xl sm:text-3xl font-bold text-gray-900">{total - activeTotal}</p>
        </div>
      </div>

      {/* Info box: how discount notifications work */}
      <div className="mb-6 rounded-2xl border border-brand-100 bg-brand-50 p-4">
        <p className="text-sm font-semibold text-brand-800">📧 Otomatik İndirim Bildirimleri</p>
        <p className="mt-1 text-xs text-brand-700 leading-relaxed">
          Bir ürüne indirim fiyatı eklendiğinde veya güncellediğinde, tüm aktif abonelere otomatik
          e-posta gönderilir. Ayrıca yeni aboneye anında &quot;%10 hoş geldin kuponu&quot; e-postası iletilir.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden sm:block">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Abone Listesi</h2>
          <span className="text-sm text-gray-500">Son 100 kayıt</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["E-posta", "Durum", "Kayıt Tarihi"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {subscribers.map((sub) => (
                <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">{sub.email}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        sub.isActive
                          ? "bg-green-50 text-green-700"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {sub.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-400">
                    {new Date(sub.createdAt).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end">
                      <DeleteSubscriberButton id={sub.id} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {subscribers.length === 0 && (
            <div className="text-center py-12 text-gray-400">Henüz abone yok.</div>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="sm:hidden">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Abone Listesi</h2>
          <span className="text-xs text-gray-500">Son 100 kayıt</span>
        </div>
        <div className="space-y-2">
          {subscribers.map((sub) => (
            <div key={sub.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 flex items-center justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{sub.email}</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {new Date(sub.createdAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`px-2 py-1 rounded-full text-[11px] font-semibold ${
                    sub.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {sub.isActive ? "Aktif" : "Pasif"}
                </span>
                <DeleteSubscriberButton id={sub.id} />
              </div>
            </div>
          ))}
          {subscribers.length === 0 && (
            <div className="bg-white rounded-xl border border-gray-100 py-12 text-center text-gray-400 shadow-sm">
              Henüz abone yok.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
