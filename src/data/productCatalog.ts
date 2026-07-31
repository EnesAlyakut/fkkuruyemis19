import { storeCategories, storeProducts } from "./storeCatalog";

export interface CatalogCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  _count?: { products: number };
  createdAt: string;
  updatedAt: string;
}

export interface CatalogVariant {
  id: string;
  productId: string;
  weight: string;
  price: number;
  stock: number;
  sku: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc: string;
  origin: string;
  production: string;
  freshness: string;
  images: string[];
  basePrice: number;
  discountPrice: number | null;
  isNatural: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  totalStock: number;
  categoryId: string;
  category: CatalogCategory;
  variants: CatalogVariant[];
  reviews: Array<{
    id: string;
    authorName: string;
    rating: number;
    comment: string;
    createdAt: string;
  }>;
  metaTitle: string;
  metaDescription: string;
  createdAt: string;
  updatedAt: string;
}

const now = "2026-07-05T00:00:00.000Z";

const categoryList: CatalogCategory[] = [
  ...storeCategories,
  {
    id: "cat-luksleb",
    name: "LüksLeb Kurabiyeleri",
    slug: "luksleb-kurabiyeleri",
    description: "Sade ve çikolatalı özel leblebi kurabiyesi seçenekleri.",
    image: "/images/products/luksleb-sade-kurabiye.png",
    order: 1,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-hatirasi",
    name: "Çorum Hatırası Kutular",
    slug: "corum-hatirasi-kutular",
    description: "Çorum temalı premium leblebi ve hediyelik kutular.",
    image: "/images/products/corum-hatirasi-karisik-kutu-siyah.png",
    order: 2,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-karisik",
    name: "Karışık Hediyelikler",
    slug: "karisik-hediyelikler",
    description: "Renkli draje ve karışık leblebi çeşitleriyle dolu özel kutular.",
    image: "/images/products/corum-hatirasi-ahsap-draje-kutu.png",
    order: 3,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-ambalaj",
    name: "Boş Ambalajlar",
    slug: "bos-ambalajlar",
    description: "Çorum Hatırası baskılı boş kutu ve çanta modelleri.",
    image: "/images/products/corum-hatirasi-bos-6li-yatay.png",
    order: 4,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
  {
    id: "cat-hatira",
    name: "Hatıra Ürünleri",
    slug: "hatira-urunleri",
    description: "Çorum Saat Kulesi gibi şehir hatırası dekoratif ürünler.",
    image: "/images/products/saat-kulesi-hediyelik.png",
    order: 5,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  },
];

const categoriesById = Object.fromEntries(categoryList.map((category) => [category.id, category]));

function makeVariants(productId: string, slug: string, variants: Array<[string, number, number]>): CatalogVariant[] {
  return variants.map(([weight, price, stock], index) => ({
    id: `${productId}-v${index + 1}`,
    productId,
    weight,
    price,
    stock,
    sku: `${slug}-${weight.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`,
  }));
}

function makeReviews(productSlug: string) {
  return [
    {
      id: `${productSlug}-yorum-1`,
      authorName: "Ayşe K.",
      rating: 5,
      comment: "Kutunun duruşu çok şık, hediye olarak da çok beğenildi.",
      createdAt: "2026-06-18T00:00:00.000Z",
    },
    {
      id: `${productSlug}-yorum-2`,
      authorName: "Mehmet T.",
      rating: 5,
      comment: "Paketleme özenliydi, görseldeki gibi premium duruyor.",
      createdAt: "2026-06-27T00:00:00.000Z",
    },
  ];
}

const rawProducts = [
  ...storeProducts,
  {
    id: "prod-luksleb-sade",
    name: "LüksLeb Sade Leblebi Kurabiyesi 200g",
    slug: "luksleb-sade-leblebi-kurabiyesi-200g",
    description:
      "LüksLeb markalı sade leblebi kurabiyesi, şeffaf oval kutusunda sunulan özel bir Çorum lezzetidir. Kahve, çay ve hediyelik sunumlar için zarif bir seçimdir.",
    shortDesc: "Şeffaf oval kutuda sade leblebi kurabiyesi.",
    origin: "Çorum",
    production: "Sade leblebi kurabiyesi, oval kutu ambalaj",
    freshness: "Günlük üretimden paketlenir",
    images: ["/images/products/luksleb-sade-kurabiye.png"],
    basePrice: 189.9,
    discountPrice: 169.9,
    isNatural: true,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    categoryId: "cat-luksleb",
    totalStock: 90,
    variants: [
      ["200g", 169.9, 40],
      ["2 x 200g", 319.9, 25],
      ["6 x 200g", 899.9, 10],
    ],
  },
  {
    id: "prod-luksleb-cikolatali",
    name: "LüksLeb Çikolatalı Leblebi Kirabiyesi 200g",
    slug: "luksleb-cikolatali-leblebi-kirabiyesi-200g",
    description:
      "Çikolata kaplamalı LüksLeb leblebi kirabiyesi, yoğun kakao aroması ve çıtır leblebi dokusunu premium bir ambalajda birleştirir.",
    shortDesc: "Çikolata kaplamalı özel LüksLeb lezzeti.",
    origin: "Çorum",
    production: "Çikolata kaplamalı leblebi kirabiyesi",
    freshness: "Serin depoda taze paketleme",
    images: ["/images/products/luksleb-cikolatali-kirabiye.png"],
    basePrice: 219.9,
    discountPrice: 199.9,
    isNatural: false,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    categoryId: "cat-luksleb",
    totalStock: 75,
    variants: [
      ["200g", 199.9, 35],
      ["2 x 200g", 379.9, 20],
      ["6 x 200g", 1049.9, 8],
    ],
  },
  {
    id: "prod-karisik-siyah",
    name: "Çorum Hatırası 6 Bölmeli Karışık Leblebi Kutusu",
    slug: "corum-hatirasi-6-bolmeli-karisik-leblebi-kutusu",
    description:
      "Siyah ve gold detaylı Çorum Hatırası kutusu; sade, kavrulmuş, renkli ve çikolatalı leblebi çeşitlerini tek sunumda buluşturur.",
    shortDesc: "Altı bölmeli siyah-gold karışık leblebi kutusu.",
    origin: "Çorum",
    production: "El dolumu premium hediyelik kutu",
    freshness: "Sipariş öncesi taze dolum",
    images: ["/images/products/corum-hatirasi-karisik-kutu-siyah.png"],
    basePrice: 549.9,
    discountPrice: 499.9,
    isNatural: true,
    isFeatured: true,
    isBestSeller: true,
    isNew: false,
    categoryId: "cat-hatirasi",
    totalStock: 48,
    variants: [
      ["500g", 499.9, 20],
      ["750g", 649.9, 18],
      ["1kg", 799.9, 10],
    ],
  },
  {
    id: "prod-gold-draje",
    name: "Çorum Hatırası Gold Draje Kutusu",
    slug: "corum-hatirasi-gold-draje-kutusu",
    description:
      "Gold folyo görünümlü, pencereli Çorum Hatırası kutusu; renkli draje ve leblebi çeşitleriyle gösterişli bir hediye alternatifidir.",
    shortDesc: "Gold pencereli renkli draje ve leblebi kutusu.",
    origin: "Çorum",
    production: "Gold pencereli hediye kutusu",
    freshness: "Taze draje ve leblebi dolumu",
    images: ["/images/products/corum-hatirasi-gold-draje-kutu.png"],
    basePrice: 629.9,
    discountPrice: 579.9,
    isNatural: false,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    categoryId: "cat-karisik",
    totalStock: 36,
    variants: [
      ["500g", 579.9, 14],
      ["750g", 729.9, 12],
      ["1kg", 899.9, 10],
    ],
  },
  {
    id: "prod-ahsap-draje",
    name: "Çorum Hatırası Ahşap Draje Kutusu",
    slug: "corum-hatirasi-ahsap-draje-kutusu",
    description:
      "Ahşap görünümlü, dokuz bölmeli Çorum Hatırası kutusu; renkli draje, beyaz leblebi ve kavrulmuş leblebi çeşitleriyle dolu premium bir sunumdur.",
    shortDesc: "Ahşap görünümlü dokuz bölmeli karışık kutu.",
    origin: "Çorum",
    production: "Dokuz bölmeli ahşap desenli kutu",
    freshness: "Siparişe yakın taze dolum",
    images: ["/images/products/corum-hatirasi-ahsap-draje-kutu.png"],
    basePrice: 699.9,
    discountPrice: 649.9,
    isNatural: false,
    isFeatured: true,
    isBestSeller: true,
    isNew: true,
    categoryId: "cat-karisik",
    totalStock: 32,
    variants: [
      ["750g", 649.9, 14],
      ["1kg", 819.9, 10],
      ["1.5kg", 1099.9, 8],
    ],
  },
  {
    id: "prod-ahsap-9lu",
    name: "Çorum Hatırası Ahşap 9 Bölmeli Karışık Kutu",
    slug: "corum-hatirasi-ahsap-9-bolmeli-karisik-kutu",
    description:
      "Ahşap çerçeveli, nostaljik Çorum Hatırası kutusu; dokuz gözlü düzeniyle farklı leblebi ve draje çeşitlerini düzenli şekilde sunar.",
    shortDesc: "Nostaljik ahşap çerçeveli 9 bölmeli kutu.",
    origin: "Çorum",
    production: "Ahşap görünümlü çok bölmeli hediye kutusu",
    freshness: "Taze dolum garantisi",
    images: ["/images/products/corum-hatirasi-ahsap-9lu-kutu.png"],
    basePrice: 729.9,
    discountPrice: null,
    isNatural: true,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    categoryId: "cat-karisik",
    totalStock: 24,
    variants: [
      ["750g", 729.9, 10],
      ["1kg", 899.9, 8],
      ["1.5kg", 1199.9, 6],
    ],
  },
  {
    id: "prod-4lu-leblebi",
    name: "Çorum Hatırası 4 Bölmeli Leblebi Kutusu",
    slug: "corum-hatirasi-4-bolmeli-leblebi-kutusu",
    description:
      "Dört bölmeli siyah Çorum Hatırası kutusu; klasik ve kavrulmuş leblebi çeşitleriyle sade ama güçlü bir hediyelik sunum sağlar.",
    shortDesc: "Dört bölmeli siyah-gold leblebi kutusu.",
    origin: "Çorum",
    production: "Dört bölmeli pencereli kutu",
    freshness: "Taze kavrumla hazırlanır",
    images: ["/images/products/corum-hatirasi-4lu-leblebi-kutu.png"],
    basePrice: 449.9,
    discountPrice: 419.9,
    isNatural: true,
    isFeatured: true,
    isBestSeller: false,
    isNew: false,
    categoryId: "cat-hatirasi",
    totalStock: 42,
    variants: [
      ["400g", 419.9, 18],
      ["600g", 549.9, 14],
      ["800g", 699.9, 10],
    ],
  },
  {
    id: "prod-silindir",
    name: "Çorum Hatırası Silindir Leblebi Kutusu",
    slug: "corum-hatirasi-silindir-leblebi-kutusu",
    description:
      "Siyah silindir ambalajı ve gold Çorum illüstrasyonu ile raflarda güçlü duran premium hediyelik leblebi kutusu.",
    shortDesc: "Gold baskılı siyah silindir hediyelik kutu.",
    origin: "Çorum",
    production: "Silindir kutu, özel gold baskı",
    freshness: "Taze kavrum leblebi dolumu",
    images: ["/images/products/corum-hatirasi-silindir-kutu.png"],
    basePrice: 389.9,
    discountPrice: null,
    isNatural: true,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    categoryId: "cat-hatirasi",
    totalStock: 55,
    variants: [
      ["350g", 389.9, 20],
      ["500g", 499.9, 20],
      ["750g", 679.9, 15],
    ],
  },
  {
    id: "prod-bos-4lu",
    name: "Çorum Hatırası 4 Bölmeli Boş Hediye Kutusu",
    slug: "corum-hatirasi-4-bolmeli-bos-hediye-kutusu",
    description:
      "Siyah desenli, gold pencereli dört bölmeli boş hediye kutusu. Kendi leblebi ve draje karışımınızı hazırlamak isteyen işletmeler için uygundur.",
    shortDesc: "Dört bölmeli boş siyah-gold hediye kutusu.",
    origin: "Çorum",
    production: "Boş ambalaj, pencereli kutu",
    freshness: "Dolumsuz ambalaj ürünü",
    images: ["/images/products/corum-hatirasi-bos-4lu-kutu.png"],
    basePrice: 129.9,
    discountPrice: null,
    isNatural: false,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    categoryId: "cat-ambalaj",
    totalStock: 120,
    variants: [
      ["1 adet", 129.9, 40],
      ["10 adet", 999.9, 50],
      ["25 adet", 2199.9, 30],
    ],
  },
  {
    id: "prod-bos-6li",
    name: "Çorum Hatırası 6 Bölmeli Boş Hediye Kutusu",
    slug: "corum-hatirasi-6-bolmeli-bos-hediye-kutusu",
    description:
      "Altı bölmeli boş Çorum Hatırası kutusu; mağaza dolumu, özel karışım ve kurumsal hediyelik hazırlıkları için idealdir.",
    shortDesc: "Altı bölmeli boş premium ambalaj.",
    origin: "Çorum",
    production: "Boş ambalaj, altı gözlü iç seperatör",
    freshness: "Dolumsuz ambalaj ürünü",
    images: ["/images/products/corum-hatirasi-bos-6li-kutu.png"],
    basePrice: 149.9,
    discountPrice: null,
    isNatural: false,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    categoryId: "cat-ambalaj",
    totalStock: 95,
    variants: [
      ["1 adet", 149.9, 35],
      ["10 adet", 1199.9, 35],
      ["25 adet", 2599.9, 25],
    ],
  },
  {
    id: "prod-bos-yatay",
    name: "Çorum Hatırası Yatay 6 Bölmeli Boş Kutu",
    slug: "corum-hatirasi-yatay-6-bolmeli-bos-kutu",
    description:
      "Yatay formda geniş pencereli boş Çorum Hatırası kutusu; vitrin sunumu ve toplu hediyelik hazırlıkları için kullanışlıdır.",
    shortDesc: "Yatay formda geniş pencereli boş kutu.",
    origin: "Çorum",
    production: "Yatay pencereli boş ambalaj",
    freshness: "Dolumsuz ambalaj ürünü",
    images: ["/images/products/corum-hatirasi-bos-6li-yatay.png"],
    basePrice: 159.9,
    discountPrice: 139.9,
    isNatural: false,
    isFeatured: false,
    isBestSeller: true,
    isNew: false,
    categoryId: "cat-ambalaj",
    totalStock: 88,
    variants: [
      ["1 adet", 139.9, 30],
      ["10 adet", 1099.9, 35],
      ["25 adet", 2499.9, 23],
    ],
  },
  {
    id: "prod-premium-siyah",
    name: "Çorum Hatırası Premium Siyah Kapaklı Kutu",
    slug: "corum-hatirasi-premium-siyah-kapakli-kutu",
    description:
      "Kapak üstü gold baskılı premium siyah Çorum Hatırası kutusu; kurumsal hediye ve özel gün sunumlarında güçlü bir izlenim bırakır.",
    shortDesc: "Gold baskılı premium siyah kapaklı kutu.",
    origin: "Çorum",
    production: "Kapaklı premium hediye kutusu",
    freshness: "Dolumsuz veya özel dolum için uygun",
    images: ["/images/products/corum-hatirasi-premium-siyah-kutu.png"],
    basePrice: 219.9,
    discountPrice: null,
    isNatural: false,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    categoryId: "cat-ambalaj",
    totalStock: 64,
    variants: [
      ["1 adet", 219.9, 22],
      ["10 adet", 1799.9, 24],
      ["25 adet", 3999.9, 18],
    ],
  },
  {
    id: "prod-gold-canta",
    name: "Çorum Hatırası Gold Hediye Çantası",
    slug: "corum-hatirasi-gold-hediye-cantasi",
    description:
      "Gold yüzeyli, siyah baskılı Çorum Hatırası hediye çantası; kutularınızı tamamlayan dikkat çekici bir taşıma ambalajıdır.",
    shortDesc: "Gold yüzeyli özel hediye çantası.",
    origin: "Çorum",
    production: "Kalın karton, ip saplı hediye çantası",
    freshness: "Ambalaj tamamlayıcı ürün",
    images: ["/images/products/corum-hatirasi-gold-canta.png"],
    basePrice: 79.9,
    discountPrice: null,
    isNatural: false,
    isFeatured: false,
    isBestSeller: false,
    isNew: true,
    categoryId: "cat-ambalaj",
    totalStock: 180,
    variants: [
      ["1 adet", 79.9, 60],
      ["25 adet", 1499.9, 70],
      ["50 adet", 2699.9, 50],
    ],
  },
  {
    id: "prod-saat-kulesi",
    name: "Çorum Saat Kulesi Hediyelik Biblo",
    slug: "corum-saat-kulesi-hediyelik-biblo",
    description:
      "Çorum Saat Kulesi'nden ilham alan dekoratif hediyelik biblo. Mağaza rafı, hediyelik köşesi veya şehir hatırası koleksiyonu için dikkat çekici bir üründür.",
    shortDesc: "Çorum Saat Kulesi temalı dekoratif hatıra.",
    origin: "Çorum",
    production: "Dekoratif şehir hatırası",
    freshness: "Ambalajlı hediyelik ürün",
    images: ["/images/products/saat-kulesi-hediyelik.png"],
    basePrice: 349.9,
    discountPrice: 299.9,
    isNatural: false,
    isFeatured: true,
    isBestSeller: false,
    isNew: true,
    categoryId: "cat-hatira",
    totalStock: 30,
    variants: [
      ["1 adet", 299.9, 18],
      ["2 adet", 559.9, 8],
      ["5 adet", 1299.9, 4],
    ],
  },
];

export const catalogProducts: CatalogProduct[] = rawProducts.map((product) => {
  const category = categoriesById[product.categoryId];
  const variants = makeVariants(product.id, product.slug, product.variants as Array<[string, number, number]>);

  return {
    ...product,
    category,
    variants,
    reviews: makeReviews(product.slug),
    metaTitle: `${product.name} | FK KURUYEMİŞ`,
    metaDescription: product.shortDesc,
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };
});

export function getCatalogCategories(): CatalogCategory[] {
  return categoryList
    .map((category) => ({
      ...category,
      _count: {
        products: catalogProducts.filter((product) => product.categoryId === category.id).length,
      },
    }))
    .sort((a, b) => a.order - b.order);
}

export function getCatalogProductBySlug(slug: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.slug === slug && product.isActive);
}

export function getCatalogProductById(id: string): CatalogProduct | undefined {
  return catalogProducts.find((product) => product.id === id && product.isActive);
}

export function getRelatedCatalogProducts(product: CatalogProduct, take = 4): CatalogProduct[] {
  return catalogProducts
    .filter((item) => item.id !== product.id && item.categoryId === product.categoryId && item.isActive)
    .slice(0, take);
}

export function getHomeCatalogData() {
  return {
    featuredProducts: catalogProducts.filter((product) => product.isFeatured).slice(0, 8),
    bestSellers: catalogProducts.filter((product) => product.isBestSeller).slice(0, 8),
    discountedProducts: catalogProducts.filter((product) => product.discountPrice !== null).slice(0, 4),
    categories: getCatalogCategories(),
  };
}

export function filterCatalogProducts({
  kategori,
  filtre,
  ara,
  page = 1,
  perPage = 12,
}: {
  kategori?: string;
  filtre?: string;
  ara?: string;
  page?: number;
  perPage?: number;
}) {
  const normalizedSearch = ara?.trim().toLocaleLowerCase("tr-TR");

  let products = catalogProducts.filter((product) => product.isActive);

  if (kategori) {
    products = products.filter((product) => product.category.slug === kategori);
  }

  if (filtre === "cok-satan") products = products.filter((product) => product.isBestSeller);
  if (filtre === "yeni") products = products.filter((product) => product.isNew);
  if (filtre === "indirimli") products = products.filter((product) => product.discountPrice !== null);
  if (filtre === "dogal") products = products.filter((product) => product.isNatural);

  if (normalizedSearch) {
    products = products.filter((product) => {
      const haystack = `${product.name} ${product.description} ${product.category.name}`.toLocaleLowerCase("tr-TR");
      return haystack.includes(normalizedSearch);
    });
  }

  const totalCount = products.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const start = (page - 1) * perPage;

  return {
    products: products.slice(start, start + perPage),
    totalCount,
    totalPages,
    activeCategory: getCatalogCategories().find((category) => category.slug === kategori),
  };
}
