import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Tag } from "lucide-react";

export default function DiscountedProducts({ products }: { products: any[] }) {
  if (!products.length) return null;
  return (
    <section className="bg-white py-10 sm:py-20">
      <div className="container-main">
        <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <Tag size={16} className="text-red-500" />
              <span className="text-red-600 font-semibold text-[11px] sm:text-sm uppercase tracking-widest">
                Kampanyalar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-3">İndirimli Ürünler</h2>
            <p className="text-sm sm:text-lg text-gray-500">
              Sınırlı süre özel fiyatlarla
            </p>
          </div>
          <Link href="/urunler?filtre=indirimli" className="hidden sm:inline-flex btn-secondary gap-2">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {products.map((p) => {
            const pct = Math.round(
              ((p.basePrice - p.discountPrice) / p.basePrice) * 100
            );
            return (
              <div key={p.id} className="w-[220px] sm:w-auto shrink-0 snap-start">
                <Link
                  href={`/urunler/${p.slug}`}
                  className="card group overflow-hidden block h-full"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-50 sm:aspect-video">
                    <Image
                      src={p.images[0] || "https://images.unsplash.com/photo-1574484284002-952d92456975?w=400"}
                      alt={p.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="badge-discount absolute left-2 top-2 sm:left-3 sm:top-3 sm:px-3 sm:py-1 sm:text-base">
                      -%{pct}
                    </div>
                  </div>
                  <div className="p-3 sm:p-4">
                    <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] text-[13px] font-bold leading-tight text-gray-900 sm:mb-2 sm:min-h-0 sm:text-base">{p.name}</h3>
                    <div className="flex flex-col items-start gap-0.5 sm:flex-row sm:items-center sm:gap-3 sm:flex-wrap">
                      <span className="price-current">
                        {p.discountPrice.toFixed(2)} ₺
                      </span>
                      <span className="text-xs text-gray-400 line-through sm:text-sm">
                        {p.basePrice.toFixed(2)} ₺
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
        <div className="mt-2 text-center sm:hidden">
          <Link href="/urunler?filtre=indirimli" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
            Tümünü Gör <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
