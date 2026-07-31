import { prisma } from "@/lib/prisma";
import { Mail, CheckCircle2, Circle } from "lucide-react";
import MessageActions from "./MessageActions";

export const metadata = { title: "Mesajlar" };
export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

export default async function AdminMesajlarPage() {
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">İletişim Mesajları</h1>
        <p className="mt-1 text-sm text-gray-500">Müşterilerden gelen iletişim formu mesajları.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Gönderen</th>
                <th className="px-6 py-4 font-semibold">İletişim</th>
                <th className="px-6 py-4 font-semibold w-1/3">Konu & Mesaj</th>
                <th className="px-6 py-4 font-semibold">Tarih</th>
                <th className="px-6 py-4 font-semibold text-center">Durum</th>
                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {messages.map((msg) => (
                <tr key={msg.id} className={`transition-colors hover:bg-gray-50 ${!msg.isRead ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4 font-medium text-gray-900">{msg.name}</td>
                  <td className="px-6 py-4 text-xs">
                    <a href={`mailto:${msg.email}`} className="text-brand-600 hover:underline">{msg.email}</a>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-800 mb-1">{msg.subject || "Konu Yok"}</p>
                    <p className="text-gray-500 line-clamp-2">{msg.message}</p>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500">{formatDate(msg.createdAt)}</td>
                  <td className="px-6 py-4 text-center">
                    {msg.isRead ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-[10px] font-semibold text-gray-600">
                        <CheckCircle2 size={12} />
                        Okundu
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-1 text-[10px] font-semibold text-blue-700">
                        <Circle size={12} className="fill-current" />
                        Yeni
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 pr-6">
                    <MessageActions msg={msg} />
                  </td>
                </tr>
              ))}

              {messages.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                      <Mail size={24} className="text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">Henüz mesaj yok.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
