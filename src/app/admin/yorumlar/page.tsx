import { prisma } from "@/lib/prisma";
import { MessageSquare, Star, CheckCircle2, Clock } from "lucide-react";
import Image from "next/image";
import ReviewActions from "./ReviewActions";

export const metadata = { title: "Yorumlar" };
export const dynamic = "force-dynamic";

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric"
  }).format(date);
}

export default async function AdminYorumlarPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true, images: true } }
    }
  });

  const getProductImage = (images: any) => {
    if (Array.isArray(images) && images.length > 0) return images[0];
    return "/images/leblebi-urun.png";
  };

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-gray-900">Yorum Yönetimi</h1>
        <p className="mt-1 text-sm text-gray-500">Ürünlere yapılan müşteri yorumları ve değerlendirmeleri.</p>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-6 py-4 font-semibold">Ürün</th>
                <th className="px-6 py-4 font-semibold">Müşteri</th>
                <th className="px-6 py-4 font-semibold">Puan</th>
                <th className="px-6 py-4 font-semibold w-1/3">Yorum</th>
                <th className="px-6 py-4 font-semibold text-center">Durum</th>
                <th className="px-6 py-4 font-semibold text-center">Tarih</th>
                <th className="px-6 py-4 font-semibold text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {reviews.map((review) => (
                <tr key={review.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border border-gray-100 bg-gray-50">
                        <Image
                          src={getProductImage(review.product.images)}
                          alt={review.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="font-medium text-gray-900 line-clamp-2 text-xs">{review.product.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{review.authorName}</p>
                    {review.email && <p className="text-xs text-gray-500">{review.email}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < review.rating ? "fill-current" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    <p className="line-clamp-3 text-xs leading-relaxed">{review.comment}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {review.isApproved ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-[10px] font-semibold text-green-700">
                        <CheckCircle2 size={12} />
                        Onaylı
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-1 text-[10px] font-semibold text-amber-700">
                        <Clock size={12} />
                        Bekliyor
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center text-xs text-gray-500">
                    {formatDate(review.createdAt)}
                  </td>
                  <td className="px-6 py-4 pr-6">
                    <ReviewActions id={review.id} isApproved={review.isApproved} />
                  </td>
                </tr>
              ))}

              {reviews.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-50">
                      <MessageSquare size={24} className="text-gray-400" />
                    </div>
                    <p className="font-medium text-gray-900">Henüz yorum yapılmamış.</p>
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
