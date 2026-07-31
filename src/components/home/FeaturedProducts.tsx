import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { ProductCard } from "@/components/ui/ProductCard";

// DB yokken gösterilecek örnek ürünler
const DEMO_PRODUCTS = [
  {
    id: "demo-1",
    name: "Çorum Sarı Leblebi",
    slug: "corum-sari-leblebi",
    images: ["/images/leblebi-urun.png"],
    basePrice: 85.00,
    discountPrice: null,
    isNatural: true,
    isBestSeller: true,
    isNew: false,
    category: { name: "Leblebi", slug: "leblebi" },
    variants: [
      { id: "v1", weight: "250g", price: 45.00, stock: 100 },
      { id: "v2", weight: "500g", price: 85.00, stock: 100 },
      { id: "v3", weight: "1kg", price: 160.00, stock: 50 },
    ],
    reviews: [
      { rating: 5 }, { rating: 5 }, { rating: 4 }, { rating: 5 },
    ],
  },
  {
    id: "demo-2",
    name: "Karışık Kuruyemiş",
    slug: "karisik-kuruyemis",
    images: ["/images/karisik-kuruyemis.png"],
    basePrice: 220.00,
    discountPrice: 185.00,
    isNatural: true,
    isBestSeller: false,
    isNew: true,
    category: { name: "Karışık Paket", slug: "karisik-paket" },
    variants: [
      { id: "v4", weight: "250g", price: 115.00, stock: 80 },
      { id: "v5", weight: "500g", price: 185.00, stock: 60 },
      { id: "v6", weight: "1kg", price: 350.00, stock: 30 },
    ],
    reviews: [
      { rating: 5 }, { rating: 4 }, { rating: 5 },
    ],
  },
];

export default function FeaturedProducts({ products }: { products: any[] }) {
  // DB'den gelen ürün yoksa örnek ürünleri göster
  const displayProducts = products.length > 0 ? products : DEMO_PRODUCTS;

  return (
    <section className="bg-white py-10 sm:py-20">
      <div className="container-main">
        <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <Sparkles size={16} className="text-brand-500" />
              <span className="text-brand-600 font-semibold text-[11px] sm:text-sm uppercase tracking-widest">
                Öne Çıkanlar
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-3">Özel Seçimler</h2>
            <p className="text-sm sm:text-lg text-gray-500">
              Editörlerimiz tarafından özenle seçilmiş ürünler
            </p>
          </div>
          <Link href="/urunler" className="hidden sm:inline-flex btn-secondary gap-2">
            Tümünü Gör <ArrowRight size={16} />
          </Link>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 sm:gap-6 sm:overflow-visible sm:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {displayProducts.map((p) => (
            <div key={p.id} className="w-[220px] sm:w-auto shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <div className="mt-2 text-center sm:hidden">
          <Link href="/urunler" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
            Tümünü Gör <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
