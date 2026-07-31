import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import {
  Edit,
  Eye,
  Package,
  Plus,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import DeleteProductButton from "@/components/admin/DeleteProductButton";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams?: {
    q?: string;
    kategori?: string;
    durum?: string;
  };
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" &&
          (item.startsWith("/") || /^https?:\/\//.test(item))
      )
    : [];
}

function formatPrice(value: number | { toString: () => string } | null | undefined) {
  if (value == null) return "0.00";
  return Number(value.toString()).toFixed(2);
}

export default async function AdminUrunlerPage({ searchParams }: PageProps) {
  const query = searchParams?.q?.trim() || "";
  const categorySlug = searchParams?.kategori || "";
  const status = searchParams?.durum || "";

  const where = {
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { slug: { contains: query } },
            { shortDesc: { contains: query } },
            { description: { contains: query } },
          ],
        }
      : {}),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(status === "aktif" ? { isActive: true } : {}),
    ...(status === "pasif" ? { isActive: false } : {}),
  };

  const [products, categories, totalProducts, activeProducts, lowStockProducts] =
    await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true, variants: { orderBy: { price: "asc" } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        orderBy: [{ order: "asc" }, { name: "asc" }],
        select: { id: true, name: true, slug: true },
      }),
      prisma.product.count(),
      prisma.product.count({ where: { isActive: true } }),
      prisma.product.count({ where: { totalStock: { lt: 10 } } }),
    ]);

  const normalizedProducts = products.map((product) => ({
    ...product,
    images: toStringArray(product.images),
  }));

  const hasFilters = Boolean(query || categorySlug || status);

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Ürün Yönetimi
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ürünleri arayın, filtreleyin ve hızlıca düzenleyin.
          </p>
        </div>
        <Link href="/admin/urunler/yeni" className="btn-primary w-full sm:w-auto">
          <Plus size={16} />
          Yeni Ürün Ekle
        </Link>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: "Toplam Ürün", value: totalProducts },
          { label: "Aktif Ürün", value: activeProducts },
          { label: "Düşük Stok", value: lowStockProducts },
          { label: "Listelenen", value: normalizedProducts.length },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
              {item.label}
            </p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="mb-5 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <form className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(260px,1fr)_220px_180px_auto_auto] lg:items-center">
          <label className="relative block">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Ürün adı, slug veya açıklama ara..."
              className="input-field pl-10"
            />
          </label>

          <select
            name="kategori"
            defaultValue={categorySlug}
            className="input-field"
            aria-label="Kategori"
          >
            <option value="">Tüm kategoriler</option>
            {categories.map((category) => (
              <option key={category.id} value={category.slug}>
                {category.name}
              </option>
            ))}
          </select>

          <select
            name="durum"
            defaultValue={status}
            className="input-field"
            aria-label="Durum"
          >
            <option value="">Tüm durumlar</option>
            <option value="aktif">Aktif</option>
            <option value="pasif">Pasif</option>
          </select>

          <button type="submit" className="btn-primary justify-center">
            <SlidersHorizontal size={16} />
            Uygula
          </button>

          {hasFilters && (
            <Link href="/admin/urunler" className="btn-secondary justify-center">
              <X size={16} />
              Temizle
            </Link>
          )}
        </form>
      </div>

      <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
        <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
          <p className="text-sm font-semibold text-gray-700">
            {normalizedProducts.length} ürün listeleniyor
          </p>
        </div>

        <div className="divide-y divide-gray-100">
          {normalizedProducts.map((product) => {
            const displayPrice = product.discountPrice || product.basePrice;
            const cheapestVariant = product.variants[0];

            return (
              <div key={product.id}>
                {/* ── MASAÜSTÜ GÖRÜNÜM ── */}
                <div className="hidden xl:grid grid-cols-[minmax(320px,1.4fr)_180px_150px_110px_190px_132px] items-center gap-4 p-4 transition-colors hover:bg-gray-50">
                  <div className="flex min-w-0 items-center gap-3">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={58}
                        height={58}
                        className="h-14 w-14 shrink-0 rounded-xl object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Package size={22} />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="line-clamp-2 text-sm font-bold text-gray-900">{product.name}</p>
                      <p className="mt-1 truncate text-xs text-gray-400">/urunler/{product.slug}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-gray-700">{product.category.name}</p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">{formatPrice(displayPrice)} ₺</p>
                    {product.discountPrice && (
                      <p className="text-xs text-gray-400 line-through">{formatPrice(product.basePrice)} ₺</p>
                    )}
                    {cheapestVariant && (
                      <p className="mt-0.5 text-xs text-gray-400">En düşük: {formatPrice(cheapestVariant.price)} ₺</p>
                    )}
                  </div>

                  <div>
                    <span className={`text-sm font-bold ${product.totalStock === 0 ? "text-red-500" : product.totalStock < 10 ? "text-amber-500" : "text-green-600"}`}>
                      {product.totalStock}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <span className={`rounded-full px-2 py-1 text-xs font-semibold ${product.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {product.isActive ? "Aktif" : "Pasif"}
                    </span>
                    {product.isBestSeller && (
                      <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700">Çok Satan</span>
                    )}
                    {product.isFeatured && (
                      <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">Öne Çıkan</span>
                    )}
                    {product.isNew && (
                      <span className="rounded-full bg-purple-50 px-2 py-1 text-xs font-semibold text-purple-700">Yeni</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 justify-end">
                    <Link href={`/admin/urunler/${product.id}`} className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-500 transition-colors hover:bg-blue-50" title="Düzenle">
                      <Edit size={15} />
                    </Link>
                    <Link href={`/urunler/${product.slug}`} target="_blank" className="flex h-9 w-9 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100" title="Sitede Gör">
                      <Eye size={15} />
                    </Link>
                    <DeleteProductButton productId={product.id} productName={product.name} />
                  </div>
                </div>

                {/* ── MOBİL GÖRÜNÜM (CARD) ── */}
                <div className="block xl:hidden p-4">
                  <div className="flex items-start gap-3 mb-3">
                    {product.images[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 shrink-0 rounded-xl object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                        <Package size={24} />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${product.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                          {product.isActive ? "Aktif" : "Pasif"}
                        </span>
                        <span className={`text-xs font-bold ${product.totalStock === 0 ? "text-red-500" : product.totalStock < 10 ? "text-amber-500" : "text-green-600"}`}>
                          Stok: {product.totalStock}
                        </span>
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm font-bold text-gray-900 leading-tight">{product.name}</p>
                      <p className="mt-0.5 truncate text-xs text-brand-600 font-medium">{product.category.name}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                    <div>
                      <p className="text-sm font-bold text-gray-900">{formatPrice(displayPrice)} ₺</p>
                      {product.discountPrice && (
                        <p className="text-xs text-gray-400 line-through">{formatPrice(product.basePrice)} ₺</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Link href={`/admin/urunler/${product.id}`} className="flex h-8 px-3 items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 text-xs font-bold transition-colors hover:bg-blue-100">
                        <Edit size={13} /> Düzenle
                      </Link>
                      <Link href={`/urunler/${product.slug}`} target="_blank" className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-gray-500 transition-colors hover:bg-gray-200">
                        <Eye size={13} />
                      </Link>
                      <div className="scale-90 origin-right">
                        <DeleteProductButton productId={product.id} productName={product.name} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {normalizedProducts.length === 0 && (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50 text-gray-300">
                <Search size={28} />
              </div>
              <p className="font-semibold text-gray-700">Ürün bulunamadı</p>
              <p className="mt-1 text-sm text-gray-400">
                Arama veya filtreleri değiştirerek tekrar deneyin.
              </p>
              {hasFilters && (
                <Link href="/admin/urunler" className="btn-secondary mt-5">
                  Filtreleri Temizle
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
