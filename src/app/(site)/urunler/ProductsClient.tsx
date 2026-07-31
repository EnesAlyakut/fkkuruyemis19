"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { ProductCard } from "@/components/ui/ProductCard";
import { Search, SearchX, SlidersHorizontal, ChevronDown, ChevronUp, Sparkles, TrendingUp, Tag, Leaf, LayoutGrid } from "lucide-react";
import { useState } from "react";

const filterOptions = [
  { label: "Tümü", value: "", icon: LayoutGrid },
  { label: "Çok Satanlar", value: "cok-satan", icon: TrendingUp },
  { label: "Yeni Ürünler", value: "yeni", icon: Sparkles },
  { label: "İndirimli", value: "indirimli", icon: Tag },
  { label: "Doğal Lezzetler", value: "dogal", icon: Leaf },
];

export default function ProductsClient({
  products,
  categories,
  totalCount,
  totalPages,
  currentPage,
  activeCategory,
  searchParams,
}: any) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState(searchParams.ara || "");
  const [catExpanded, setCatExpanded] = useState(false);

  const VISIBLE_CATS = 5;
  const visibleCategories = catExpanded ? categories : categories.slice(0, VISIBLE_CATS);

  const buildUrl = (params: Record<string, string | undefined>) => {
    const merged = { ...searchParams, ...params };
    const q = new URLSearchParams();
    Object.entries(merged).forEach(([key, value]) => {
      if (value) q.set(key, String(value));
    });
    const query = q.toString();
    return query ? `/urunler?${query}` : "/urunler";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(buildUrl({ ara: searchTerm.trim() || undefined, sayfa: "1" }));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ── Header ── */}
      <div style={{ background: "linear-gradient(135deg,#ffffff 0%,#fdfcf9 60%,#ffffff 100%)", borderBottom: "1px solid #ede9e0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
        <div className="container-main py-5 sm:py-7">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="min-w-0">
              <h1 className="font-display text-2xl font-bold md:text-3xl" style={{ color: "#5c3a00" }}>
                {activeCategory ? activeCategory.name : "Tüm Ürünler"}
              </h1>
              <p className="mt-0.5 text-sm font-medium" style={{ color: "#a86a0a" }}>{totalCount} ürün bulundu</p>
            </div>
            <form onSubmit={handleSearch} className="flex w-full max-w-sm gap-2 sm:w-auto">
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ürün ara..."
                className="input-field min-w-0 flex-1 text-sm sm:w-56 sm:text-base"
                style={{ background: "white", borderColor: "#e8c97a" }}
              />
              <button type="submit" className="btn-primary shrink-0 px-4" aria-label="Ara">
                <Search size={16} />
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="container-main py-6 sm:py-8">
        <div className="flex gap-6 lg:gap-8">

          {/* ── Sidebar ── */}
          <aside className="hidden w-52 shrink-0 lg:block">
            <div className="sticky top-24 space-y-3">

              {/* Filtre başlığı */}
              <div className="flex items-center gap-2 px-1 mb-1">
                <SlidersHorizontal size={15} className="text-brand-500" />
                <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Filtrele</span>
              </div>

              {/* Hızlı Filtreler */}
              <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Sırala
                </p>
                <div className="space-y-0.5">
                  {filterOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = (searchParams.filtre || "") === opt.value;
                    return (
                      <Link
                        key={opt.value}
                        href={buildUrl({ filtre: opt.value || undefined, sayfa: "1" })}
                        className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-brand-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                        }`}
                      >
                        <Icon size={14} className={isActive ? "text-white" : "text-brand-500"} />
                        {opt.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Kategoriler */}
              <div className="rounded-2xl border border-gray-100 bg-white p-3 shadow-sm">
                <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  Kategori
                </p>
                <div className="space-y-0.5">
                  <Link
                    href="/urunler"
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                      !searchParams.kategori
                        ? "bg-brand-600 text-white shadow-sm"
                        : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                    }`}
                  >
                    <span>Tüm Kategoriler</span>
                    {!searchParams.kategori && (
                      <span className="rounded-full bg-white/20 px-1.5 py-0.5 text-[10px] font-bold">
                        {totalCount}
                      </span>
                    )}
                  </Link>
                  {visibleCategories.map((cat: any) => {
                    const isActive = searchParams.kategori === cat.slug;
                    return (
                      <Link
                        key={cat.id}
                        href={buildUrl({ kategori: cat.slug, sayfa: "1" })}
                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                          isActive
                            ? "bg-brand-600 text-white shadow-sm"
                            : "text-gray-600 hover:bg-brand-50 hover:text-brand-700"
                        }`}
                      >
                        <span className="truncate pr-1">{cat.name}</span>
                        <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold shrink-0 ${
                          isActive ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"
                        }`}>
                          {cat._count.products}
                        </span>
                      </Link>
                    );
                  })}
                </div>

                {/* Daha fazla / daha az */}
                {categories.length > VISIBLE_CATS && (
                  <button
                    onClick={() => setCatExpanded(!catExpanded)}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-xl px-3 py-2 text-xs font-bold text-brand-600 hover:bg-brand-50 transition-colors"
                  >
                    {catExpanded ? (
                      <><ChevronUp size={13} /> Daha az</>
                    ) : (
                      <><ChevronDown size={13} /> +{categories.length - VISIBLE_CATS} kategori daha</>
                    )}
                  </button>
                )}
              </div>

            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="min-w-0 flex-1">

            {/* Mobile: yatay chips */}
            <div className="scrollbar-hide -mx-3 mb-3 overflow-x-auto px-3 pb-2 lg:hidden">
              <div className="flex gap-2">
                <Link
                  href={buildUrl({ kategori: undefined, sayfa: "1" })}
                  className={`snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                    !searchParams.kategori ? "bg-brand-600 text-white" : "border border-gray-200 bg-white text-gray-600"
                  }`}
                >
                  Tümü
                </Link>
                {categories.map((cat: any) => (
                  <Link
                    key={cat.id}
                    href={buildUrl({ kategori: cat.slug, sayfa: "1" })}
                    className={`snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      searchParams.kategori === cat.slug ? "bg-brand-600 text-white" : "border border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {cat.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="scrollbar-hide -mx-3 mb-4 overflow-x-auto px-3 pb-2 lg:hidden">
              <div className="flex gap-2">
                {filterOptions.map((opt) => (
                  <Link
                    key={opt.value}
                    href={buildUrl({ filtre: opt.value || undefined, sayfa: "1" })}
                    className={`snap-start whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                      (searchParams.filtre || "") === opt.value ? "bg-brand-600 text-white" : "border border-gray-200 bg-white text-gray-600"
                    }`}
                  >
                    {opt.label}
                  </Link>
                ))}
              </div>
            </div>

            {products.length === 0 ? (
              <div className="py-20 text-center">
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
                  <SearchX size={32} />
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-700">Ürün bulunamadı</h3>
                <p className="mb-6 text-gray-500">Farklı bir arama veya filtre deneyin</p>
                <Link href="/urunler" className="btn-primary">Tüm Ürünleri Gör</Link>
              </div>
            ) : (
              <>
                <div className="product-grid">
                  {products.map((product: any) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>

                {totalPages > 1 && (
                  <div className="scrollbar-hide mt-10 flex items-center justify-start gap-2 overflow-x-auto pb-2 sm:mt-12 sm:justify-center">
                    {currentPage > 1 && (
                      <Link href={buildUrl({ sayfa: String(currentPage - 1) })} className="btn-secondary px-4 py-2 text-sm">
                        Önceki
                      </Link>
                    )}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <Link
                        key={page}
                        href={buildUrl({ sayfa: String(page) })}
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                          page === currentPage
                            ? "bg-brand-600 text-white"
                            : "border border-gray-200 bg-white text-gray-700 hover:border-brand-400"
                        }`}
                      >
                        {page}
                      </Link>
                    ))}
                    {currentPage < totalPages && (
                      <Link href={buildUrl({ sayfa: String(currentPage + 1) })} className="btn-secondary px-4 py-2 text-sm">
                        Sonraki
                      </Link>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
