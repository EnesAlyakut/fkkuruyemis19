import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Sparkles, Package } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  _count?: { products: number };
}

export default function CategoriesSection({ categories }: { categories: Category[] }) {
  const displayCategories = categories.slice(0, 8);

  return (
    <section className="relative py-20 sm:py-28 overflow-hidden" style={{ background: "linear-gradient(180deg,#fffdf9 0%,#fdf8f0 100%)" }}>
      <style>{`
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        .shimmer-text {
          background: linear-gradient(90deg,#92400e,#d97706,#f59e0b,#d97706,#92400e);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        .float-badge { animation: float 3s ease-in-out infinite; }

        .cat-card { transition: transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), box-shadow 0.4s ease; }
        .cat-card:hover { transform: translateY(-8px) scale(1.02); }
        .cat-card:hover .cat-img { transform: scale(1.08); }
        .cat-img { transition: transform 1s cubic-bezier(0.25,0.46,0.45,0.94); }
        .cat-card:hover .cat-arrow { background: #d97706; border-color: #d97706; transform: scale(1.1); }
        .cat-arrow { transition: all 0.3s ease; }
        .cat-overlay { transition: opacity 0.4s ease; }
        .cat-card:hover .cat-overlay { opacity: 1; }
        .cat-desc { opacity:0; transform:translateY(8px); transition: opacity 0.35s ease, transform 0.35s ease; }
        .cat-card:hover .cat-desc { opacity:1; transform:translateY(0); }
      `}</style>

      {/* Background decorations */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-10 h-96 w-96 rounded-full bg-amber-100/50 blur-[120px]" />
        <div className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-orange-100/40 blur-[100px]" />
      </div>

      {/* Header */}
      <div className="container-main relative z-10 mb-14 flex flex-col items-center text-center px-4">
        <div className="float-badge mb-6 flex items-center gap-2 rounded-full border border-amber-200 bg-white px-5 py-2 shadow-sm">
          <Sparkles size={14} className="text-amber-500" fill="#f59e0b" />
          <span className="text-xs font-bold tracking-widest text-amber-700 uppercase">Özenle Seçilmiş</span>
        </div>

        <h2 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight">
          Kategorileri{" "}
          <span className="shimmer-text">Keşfedin</span>
        </h2>
        <p className="max-w-lg text-sm sm:text-base text-gray-500 leading-relaxed">
          Taptaze lezzetler ve Çorum'un özgün tatları — sizin için özenle hazırlanmış koleksiyonlar.
        </p>

        <div className="mt-6 flex items-center gap-3">
          <div className="h-px w-10 bg-gradient-to-r from-transparent to-amber-300" />
          <div className="h-2 w-2 rounded-full bg-amber-400" />
          <div className="h-px w-10 bg-gradient-to-l from-transparent to-amber-300" />
        </div>
      </div>

      {/* Category Grid */}
      <div className="container-main relative z-10 px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayCategories.map((cat, i) => {
            // First card is large (spans 2 cols on lg)
            const isLarge = i === 0;
            return (
              <Link
                key={cat.id}
                href={`/kategori/${cat.slug}`}
                className={`cat-card group relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl ${
                  isLarge ? "col-span-2 sm:col-span-2 lg:col-span-2 row-span-2" : ""
                }`}
                style={{
                  height: isLarge ? "clamp(280px,40vw,420px)" : "clamp(160px,22vw,220px)",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.09)",
                }}
              >
                {/* Image */}
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="cat-img object-cover"
                    sizes="(max-width:640px) 50vw,(max-width:1024px) 33vw,25vw"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ background: "linear-gradient(135deg,#fef6e4,#fde8b0)" }}>
                    <Package size={isLarge ? 56 : 36} className="text-amber-300" />
                  </div>
                )}

                {/* Gradient overlay - always visible at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Hover extra overlay */}
                <div className="cat-overlay absolute inset-0 bg-black/15 opacity-0" />

                {/* Gold border on hover */}
                <div className="absolute inset-0 rounded-2xl sm:rounded-3xl border-2 border-transparent group-hover:border-amber-400/50 transition-all duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                  {cat.description && (
                    <p className="cat-desc mb-2 text-xs text-white/75 leading-relaxed line-clamp-2 hidden sm:block">
                      {cat.description}
                    </p>
                  )}
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h3 className={`font-bold text-white leading-tight drop-shadow-sm ${isLarge ? "text-xl sm:text-2xl" : "text-sm sm:text-base"}`}>
                        {cat.name}
                      </h3>
                      {cat._count && (
                        <span className="mt-1 flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-amber-300">
                          <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-400" />
                          {cat._count.products} ürün
                        </span>
                      )}
                    </div>
                    <div className="cat-arrow flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white shadow backdrop-blur-sm">
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 mt-12 flex justify-center">
        <Link
          href="/urunler"
          className="group flex items-center gap-2.5 rounded-full border border-amber-300 bg-white px-7 py-3 text-sm font-semibold text-amber-800 shadow-sm transition-all duration-300 hover:bg-amber-50 hover:shadow-md hover:border-amber-400"
        >
          Tüm Ürünleri İncele
          <ArrowRight size={15} className="transition-transform duration-300 group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}
