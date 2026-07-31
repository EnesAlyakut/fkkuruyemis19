type StoreCategory = {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

type StoreProductOptions = {
  images?: number[];
  unit?: string;
  natural?: boolean;
  featured?: boolean;
  bestSeller?: boolean;
  isNew?: boolean;
  description?: string;
};

const now = "2026-07-22T00:00:00.000Z";

const category = (
  id: string,
  name: string,
  slug: string,
  description: string,
  imageSlug: string,
  order: number
): StoreCategory => ({
  id: `cat-magaza-${id}`,
  name,
  slug,
  description,
  image: `/images/catalog-premium/${imageSlug}.webp`,
  order,
  isActive: true,
  createdAt: now,
  updatedAt: now,
});

export const storeCategories = [
  category("leblebi", "Leblebi Çeşitleri", "leblebi-cesitleri", "Çorum'un klasik, kaplamalı ve özel aromalı leblebileri.", "klasik-leblebi", 10),
  category("kuruyemis", "Kuruyemiş", "kuruyemis", "Taze fındık, badem, kaju, ceviz ve fıstık çeşitleri.", "luks-karisik", 11),
  category("karisim", "Karışıklar", "karisiklar", "Kuruyemiş, leblebi ve kuru meyve karışımları.", "corum-karisik", 12),
  category("meyve", "Kuru Meyve", "kuru-meyve", "Özenle seçilmiş kuru meyve ve hurma çeşitleri.", "jumbo-kayisi", 13),
  category("sekerleme", "Şekerleme & Kaymak", "sekerleme-kaymak", "Renkli, kaymaklı ve şeker kaplamalı özel lezzetler.", "cilek-kaymak", 14),
  category("cikolata", "Çikolata & Draje", "cikolata-draje", "Sütlü, beyaz ve karışık çikolata kaplı atıştırmalıklar.", "mix-cikolata", 15),
  category("cekirdek", "Çekirdek", "cekirdek", "Tuzlu ve tuzsuz ay çekirdeği ile kabak çekirdeği.", "tuzlu-ay-cekirdegi", 16),
  category("atistirmalik", "Atıştırmalık", "atistirmalik", "Baharatlı mısır, cips ve çıtır atıştırmalıklar.", "mispet", 17),
  category("yoresel", "Yöresel Ürünler", "yoresel-urunler", "Kahve, toz ürünler, kolonya ve yöresel tamamlayıcılar.", "taze-kahve", 18),
  category("krema", "Leblebi Kremaları", "leblebi-kremalari", "Sade ve kakaolu sürülebilir leblebi kremaları.", "sade-leblebi-kremasi", 19),
] as any[];

const premiumImage = (slug: string) => `/images/catalog-premium/${slug}.webp`;
const categoryId = (key: string) => `cat-magaza-${key}`;

function product(
  id: string,
  name: string,
  price: number,
  categoryKey: string,
  imageNo: number,
  options: StoreProductOptions = {}
) {
  const unit = options.unit || "1 kg";
  const shortDesc = options.description || `${name}, mağaza etiketindeki güncel fiyatıyla satışta.`;
  return {
    id: `prod-magaza-${id}`,
    name,
    slug: id,
    description:
      price > 0
        ? `${shortDesc} Ürün fotoğrafı gerçek mağaza çekiminden hazırlanmış; renk ve ürün dokusu korunmuştur.`
        : `${shortDesc} Fotoğrafta fiyat etiketi bulunmadığı için fiyat uydurulmamış, sipariş öncesi teyit seçeneği sunulmuştur.`,
    shortDesc,
    origin: categoryKey === "leblebi" || categoryKey === "karisim" ? "Çorum" : "Türkiye",
    production: "Mağazadan taze paketleme",
    freshness: "Siparişe yakın paketleme",
    images: [premiumImage(id)],
    basePrice: price,
    discountPrice: null,
    isNatural: options.natural ?? true,
    isFeatured: options.featured ?? false,
    isBestSeller: options.bestSeller ?? false,
    isNew: options.isNew ?? true,
    categoryId: categoryId(categoryKey),
    totalStock: price > 0 ? 50 : 0,
    variants: price > 0 ? [[unit, price, 50]] : [],
  };
}

export const storeProducts = [
  product("uzumlu-karisik", "Üzümlü Karışık", 220, "karisim", 1, { featured: true, bestSeller: true }),
  product("cips-fistik", "Cips Fıstık", 220, "atistirmalik", 2, { natural: false }),
  product("corum-atesi", "Çorum Ateşi", 240, "leblebi", 3, { featured: true }),
  product("corum-karisik", "Çorum Karışık", 220, "karisim", 4, { featured: true }),
  product("tandir-tuzlu-leblebi", "Tandır Tuzlu Leblebi", 240, "leblebi", 5),
  product("renkli-sekerli-leblebi", "Renkli Şekerli Leblebi", 175, "sekerleme", 6, { natural: false, featured: true }),
  product("tuzlu-ay-cekirdegi", "Tuzlu Ay Çekirdeği", 170, "cekirdek", 7),
  product("mesir-macunlu-leblebi", "Mesir Macunlu Leblebi", 200, "leblebi", 8, { natural: false }),
  product("sakiz-leblebi", "Sakız Leblebi", 300, "leblebi", 8, { natural: false }),
  product("luks-balli-leblebi", "Lüks Ballı Leblebi", 250, "leblebi", 9, { natural: false, bestSeller: true }),
  product("tuzsuz-ay-cekirdegi", "Tuzsuz Ay Çekirdeği", 170, "cekirdek", 10, { images: [10, 13] }),
  product("kirik-leblebi", "Kırık Leblebi", 100, "leblebi", 11),
  product("saqra-kolonya-cesitleri", "Saqra Kolonya Çeşitleri", 640, "yoresel", 12, { unit: "set", natural: false }),
  product("ceviz-ici", "Ceviz İçi", 680, "kuruyemis", 14, { featured: true }),
  product("hunnap-kurusu", "Hünnap Kurusu", 320, "meyve", 15),
  product("cevrek-leblebi", "Çevrek Leblebi", 200, "leblebi", 16),
  product("sade-leblebi-kremasi", "Sade Leblebi Kreması", 0, "krema", 17, { unit: "1 kavanoz", natural: false, description: "Kremlebi sade leblebi kreması." }),
  product("kakaolu-leblebi-kremasi", "Kakaolu Leblebi Kreması", 0, "krema", 18, { unit: "1 kavanoz", natural: false, description: "Çorum Lebim kakaolu leblebi kreması." }),
  product("super-leblebi", "Süper Leblebi", 300, "leblebi", 19, { bestSeller: true }),
  product("super-ekstra-leblebi", "Süper Ekstra Leblebi", 250, "leblebi", 20, { featured: true }),
  product("citir-karisik", "Çıtır Karışık", 420, "karisim", 21, { featured: true }),
  product("siirt-fistigi", "Siirt Fıstığı", 1300, "kuruyemis", 21),
  product("ozel-ekstra-leblebi", "Özel Ekstra Leblebi", 200, "leblebi", 22),
  product("kudus-hurma", "Kudüs Hurma", 470, "meyve", 23),
  product("cig-findik", "Çiğ Fındık", 1100, "kuruyemis", 24, { bestSeller: true }),
  product("kudus-l-hurma", "Kudüs L Hurma", 550, "meyve", 25, { featured: true }),
  product("blueberry-kurusu", "Blueberry Kurusu", 750, "meyve", 26),
  product("soslu-misir", "Soslu Mısır", 150, "atistirmalik", 27, { natural: false }),
  product("baharatli-leblebi", "Baharatlı Leblebi", 150, "leblebi", 28, { natural: false }),
  product("klasik-leblebi", "Klasik Leblebi", 150, "leblebi", 28),
  product("peynirli-leblebi", "Peynirli Leblebi", 150, "leblebi", 28, { natural: false }),
  product("acili-leblebi", "Acılı Leblebi", 150, "leblebi", 28, { natural: false }),
  product("nane-limon-leblebi", "Nane Limon Leblebi", 350, "leblebi", 28, { natural: false }),
  product("visne-leblebi", "Vişne Leblebi", 350, "leblebi", 28, { natural: false }),
  product("jumbo-kayisi", "Jumbo Kayısı", 750, "meyve", 29, { featured: true }),
  product("yaban-mersini", "Yaban Mersini", 450, "meyve", 30),
  product("mispet", "Mispet", 225, "atistirmalik", 31, { natural: false }),
  product("sultani-kahvesi", "Sultani Kahvesi", 90, "yoresel", 32, { unit: "1 paket", natural: false }),
  product("taze-kahve", "Taze Kahve", 60, "yoresel", 33, { unit: "1 paket" }),
  product("igde-tozu", "İğde Tozu", 25, "yoresel", 33, { unit: "1 paket" }),
  product("leblebi-tozu", "Leblebi Tozu", 50, "yoresel", 33, { unit: "1 paket" }),
  product("hashas", "Haşhaş", 125, "yoresel", 33, { unit: "1 paket" }),
  product("yer-kirazi-kurusu", "Yer Kirazı Kurusu", 325, "meyve", 34),
  product("tuzsuz-fistik", "Tuzsuz Fıstık", 280, "kuruyemis", 35),
  product("cig-kabak-cekirdegi", "Çiğ Kabak Çekirdeği", 440, "cekirdek", 36),
  product("tuzlu-kabak-cekirdegi", "Tuzlu Kabak Çekirdeği", 440, "cekirdek", 36),
  product("tuzlu-fistik", "Tuzlu Fıstık", 280, "kuruyemis", 37),
  product("tuzsuz-kabak-cekirdegi", "Tuzsuz Kabak Çekirdeği", 440, "cekirdek", 38),
  product("kavrulmus-badem", "Kavrulmuş Badem", 720, "kuruyemis", 39, { featured: true }),
  product("premium-cig-findik", "Premium Çiğ Fındık", 1500, "kuruyemis", 40),
  product("luks-karisik", "Lüks Karışık", 1100, "karisim", 41, { featured: true, bestSeller: true }),
  product("premium-karisik", "Premium Karışık", 725, "karisim", 42),
  product("luks-kaju", "Lüks Kaju", 900, "kuruyemis", 43, { featured: true }),
  product("yasam-cerezi", "Yaşam Çerezi", 380, "karisim", 44),
  product("osmanli-karisik", "Osmanlı Karışık", 360, "karisim", 45, { bestSeller: true }),
  product("kayisi-cekirdegi", "Kayısı Çekirdeği", 375, "kuruyemis", 45),
  product("tuzlu-fistik-premium", "Tuzlu Fıstık Premium", 310, "kuruyemis", 46),
  product("cilek-kaymak", "Çilek Kaymak", 300, "sekerleme", 47, { images: [47, 49], natural: false, featured: true }),
  product("bogurtlen-kaymak", "Böğürtlen Kaymak", 350, "sekerleme", 48, { natural: false }),
  product("narli-kaymakli", "Narlı Kaymaklı", 350, "sekerleme", 50, { natural: false }),
  product("renkli-meyveli-draje", "Renkli Meyveli Draje", 0, "cikolata", 51, { natural: false, description: "Renkli meyve aromalı draje karışımı." }),
  product("citir-leblebi-draje", "Çıtır Leblebi Draje", 0, "cikolata", 52, { natural: false, description: "Çıtır leblebi dolgulu draje." }),
  product("bildircin-leblebi", "Bıldırcın Leblebi", 350, "leblebi", 53, { images: [53, 62], natural: false }),
  product("benekli-cikolata-draje", "Benekli Çikolata Draje", 0, "cikolata", 54, { natural: false, description: "Benekli sütlü çikolata draje." }),
  product("benekli-badem-draje", "Benekli Badem Draje", 0, "cikolata", 55, { natural: false, description: "Badem dolgulu benekli draje." }),
  product("tuzlu-fistik-ozel", "Tuzlu Fıstık Özel", 310, "kuruyemis", 56),
  product("trilece-kaymak", "Trileçe Kaymak", 350, "sekerleme", 57, { natural: false }),
  product("kraker-cikolata", "Kraker Çikolata", 350, "cikolata", 58, { natural: false }),
  product("mix-cikolata", "Mix Çikolata", 350, "cikolata", 59, { natural: false, featured: true }),
  product("sutlu-cikolata", "Sütlü Çikolata", 350, "cikolata", 60, { natural: false }),
  product("fildisi-cikolata", "Fildişi Çikolata", 350, "cikolata", 61, { natural: false }),
  product("cikolatali-hurma-sekeri", "Çikolatalı Hurma Şekeri", 700, "cikolata", 63, { unit: "1 paket", natural: false }),
  product("kahve-mix", "Kahve Mix", 350, "cikolata", 64, { natural: false }),
  product("kaymakli-leblebi-karisik", "Kaymaklı Leblebi Karışık", 0, "sekerleme", 65, {
    natural: false,
    description: "Renkli kaymaklı leblebi çeşitlerinden hazırlanan karışım. Fotoğrafta fiyat etiketi görünmediği için güncel fiyat sipariş öncesinde teyit edilir.",
  }),
] as any[];
