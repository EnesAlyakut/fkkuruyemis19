"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ImageIcon,
  Loader2,
  Package,
  Plus,
  Save,
  Star,
  Tag,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Variant {
  weight: string;
  price: number;
  stock: number;
}

interface ProductResponse {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDesc?: string | null;
  origin?: string | null;
  production?: string | null;
  images: string[];
  basePrice: number;
  discountPrice?: number | null;
  categoryId: string;
  isNatural: boolean;
  isFeatured: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  isActive: boolean;
  totalStock: number;
  metaTitle?: string | null;
  metaDescription?: string | null;
  variants: Variant[];
}

export default function UrunDuzenlePage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    shortDesc: "",
    origin: "",
    production: "",
    basePrice: "",
    discountPrice: "",
    categoryId: "",
    isNatural: true,
    isFeatured: false,
    isBestSeller: false,
    isNew: false,
    isActive: true,
    totalStock: "",
    metaTitle: "",
    metaDescription: "",
  });

  const [hasVariants, setHasVariants] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [categoryRes, productRes] = await Promise.all([
          fetch("/api/kategoriler?withCount=false"),
          fetch(`/api/urunler/${params.id}`),
        ]);

        if (!categoryRes.ok || !productRes.ok) {
          throw new Error("Urun bilgileri yuklenemedi.");
        }

        const [categoryData, product] = (await Promise.all([
          categoryRes.json(),
          productRes.json(),
        ])) as [Category[], ProductResponse];

        setCategories(categoryData);
        setImages(Array.isArray(product.images) ? product.images : []);
        setVariants(product.variants || []);
        
        // Varyant olup olmadığını kontrol et
        const existingVariants = product.variants || [];
        setHasVariants(existingVariants.length > 0);

        setForm({
          name: product.name || "",
          slug: product.slug || "",
          description: product.description || "",
          shortDesc: product.shortDesc || "",
          origin: product.origin || "",
          production: product.production || "",
          basePrice: String(product.basePrice ?? ""),
          discountPrice: product.discountPrice ? String(product.discountPrice) : "",
          categoryId: product.categoryId || "",
          isNatural: product.isNatural ?? true,
          isFeatured: product.isFeatured ?? false,
          isBestSeller: product.isBestSeller ?? false,
          isNew: product.isNew ?? false,
          isActive: product.isActive ?? true,
          totalStock: String(product.totalStock ?? 0),
          metaTitle: product.metaTitle || "",
          metaDescription: product.metaDescription || "",
        });
      } catch (error) {
        alert(error instanceof Error ? error.message : "Urun bilgileri yuklenemedi.");
        router.push("/admin/urunler");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [params.id, router]);

  const addImage = () => {
    if (!imageUrl.trim()) return;
    setImages((current) => [...current, imageUrl.trim()]);
    setImageUrl("");
  };

  const removeImage = (index: number) => {
    setImages((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const addVariant = () => {
    setVariants((current) => [...current, { weight: "", price: 0, stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants((current) => current.filter((_, currentIndex) => currentIndex !== index));
  };

  const updateVariant = (index: number, key: keyof Variant, value: string | number) => {
    setVariants((current) =>
      current.map((variant, currentIndex) =>
        currentIndex === index ? { ...variant, [key]: value } : variant
      )
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadingImage(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        const response = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Gorsel yuklenemedi.");
        setImages((current) => [...current, data.url]);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Gorsel yuklenemedi.");
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const totalStock = !hasVariants
    ? parseInt(form.totalStock, 10) || 0
    : variants.reduce((sum, variant) => sum + Number(variant.stock), 0);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.categoryId) return alert("Lutfen bir kategori secin.");
    if (images.length === 0) return alert("En az bir urun gorseli ekleyin.");

    setSaving(true);
    try {
      const response = await fetch(`/api/urunler/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice),
          discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null,
          images,
          totalStock,
          variants: !hasVariants ? [] : variants,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || "Urun guncellenemedi.");
      }

      toast.success("Değişiklikler başarıyla kaydedildi!");
      router.push("/admin/urunler");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Bir hata olustu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 lg:p-8 pt-20 lg:pt-8 max-w-5xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded-xl" />
          <div className="h-64 bg-gray-100 rounded-2xl" />
          <div className="h-48 bg-gray-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 pt-20 lg:pt-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin/urunler"
          className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Urunu Duzenle</h1>
          <p className="text-gray-500 text-sm mt-0.5">{form.name}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Package size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Temel Bilgiler</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Urun Adi *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                URL Slug *
              </label>
              <input
                type="text"
                required
                value={form.slug}
                onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kategori *
              </label>
              <select
                required
                value={form.categoryId}
                onChange={(event) => setForm((current) => ({ ...current, categoryId: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              >
                <option value="">Kategori Secin</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Taban Fiyat *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={form.basePrice}
                onChange={(event) => setForm((current) => ({ ...current, basePrice: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Indirimli Fiyat
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.discountPrice}
                onChange={(event) => setForm((current) => ({ ...current, discountPrice: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>



            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Kisa Aciklama
              </label>
              <input
                type="text"
                value={form.shortDesc}
                onChange={(event) => setForm((current) => ({ ...current, shortDesc: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Detayli Aciklama *
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <ImageIcon size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Urun Gorselleri</h2>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            multiple
            className="hidden"
            onChange={(event) => handleFileUpload(event.target.files)}
          />
          <div className="flex gap-2 mb-4">
            <input
              type="url"
              value={imageUrl}
              onChange={(event) => setImageUrl(event.target.value)}
              onKeyDown={(event) => event.key === "Enter" && (event.preventDefault(), addImage())}
              placeholder="Gorsel URL'si"
              className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => (imageUrl.trim() ? addImage() : fileInputRef.current?.click())}
              disabled={uploadingImage}
              className="px-4 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-medium hover:bg-brand-600 disabled:opacity-60 transition-colors flex items-center gap-1.5"
            >
              {uploadingImage ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
              {uploadingImage ? "Yukleniyor..." : "Ekle"}
            </button>
          </div>
          {images.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {images.map((image, index) => (
                <div key={`${image}-${index}`} className="relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image}
                    alt={`Gorsel ${index + 1}`}
                    className="w-full h-24 object-cover rounded-xl border border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6 border-2 border-dashed border-gray-200 rounded-xl">
              Henuz gorsel eklenmedi
            </p>
          )}
        </div>

        {/* Satış Tipi ve Stok / Varyantlar */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Tag size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Satış Tipi & Stok</h2>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${!hasVariants ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="salesType"
                checked={!hasVariants}
                onChange={() => {
                  setHasVariants(false);
                  setVariants([]);
                }}
                className="w-4 h-4 text-brand-500 focus:ring-brand-500"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900">Tekli / Adet Satışı</p>
                <p className="text-xs text-gray-500 mt-0.5">Varyant yok, tek bir fiyat ve stok kullanılır. (Örn: Helva, Kutu)</p>
              </div>
            </label>

            <label className={`flex-1 flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${hasVariants ? 'border-brand-500 bg-brand-50' : 'border-gray-200 hover:bg-gray-50'}`}>
              <input
                type="radio"
                name="salesType"
                checked={hasVariants}
                onChange={() => {
                  setHasVariants(true);
                  if (variants.length === 0) {
                    setVariants([
                      { weight: "250g", price: 0, stock: 0 },
                      { weight: "500g", price: 0, stock: 0 },
                      { weight: "1kg", price: 0, stock: 0 }
                    ]);
                  }
                }}
                className="w-4 h-4 text-brand-500 focus:ring-brand-500"
              />
              <div>
                <p className="font-semibold text-sm text-gray-900">Gramajlı / Seçenekli Satış</p>
                <p className="text-xs text-gray-500 mt-0.5">Farklı gramajlar için farklı fiyat ve stok girilir. (Örn: Çiğ Leblebi)</p>
              </div>
            </label>
          </div>

          {!hasVariants && (
            <div className="pt-2 border-t border-gray-100">
              <label className="block text-sm font-medium text-gray-700 mb-1.5 mt-4">
                Toplam Stok Adedi *
              </label>
              <input
                type="number"
                required
                min="0"
                value={form.totalStock}
                onChange={(event) => setForm((current) => ({ ...current, totalStock: event.target.value }))}
                placeholder="Örn: 150"
                className="w-full sm:max-w-xs border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
              />
            </div>
          )}

          {hasVariants && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-700">Varyant Seçenekleri</h3>
                <button
                  type="button"
                  onClick={addVariant}
                  className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 bg-brand-50 px-2 py-1.5 rounded-lg transition-colors"
                >
                  <Plus size={15} /> Yeni Ekle
                </button>
              </div>
              
              <div className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 mb-2 px-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Gramaj / Seçenek</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Fiyat (₺)</p>
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400">Stok Adedi</p>
                <p className="w-8"></p>
              </div>
              
              <div className="space-y-3">
                {variants.map((variant, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_1fr_auto] gap-3 items-center">
                    <input
                      type="text"
                      value={variant.weight}
                      onChange={(event) => updateVariant(index, "weight", event.target.value)}
                      placeholder="Örn: 250g"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={variant.price || ""}
                      onChange={(event) => updateVariant(index, "price", parseFloat(event.target.value) || 0)}
                      placeholder="0.00"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <input
                      type="number"
                      min="0"
                      value={variant.stock || ""}
                      onChange={(event) => updateVariant(index, "stock", parseInt(event.target.value, 10) || 0)}
                      placeholder="0"
                      className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400"
                    />
                    <div className="w-8 flex justify-end">
                      {variants.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="w-8 h-8 flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors shrink-0"
                          title="Sil"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-4 bg-gray-50 p-3 rounded-xl inline-block border border-gray-100">
                Toplam stok: <span className="font-semibold text-brand-600">{totalStock} adet</span>
              </p>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Star size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Ozellikler & Durum</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {[
              { key: "isActive", label: "Aktif" },
              { key: "isNatural", label: "Dogal" },
              { key: "isFeatured", label: "One Cikan" },
              { key: "isBestSeller", label: "Cok Satan" },
              { key: "isNew", label: "Yeni" },
            ].map(({ key, label }) => (
              <label
                key={key}
                className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                  form[key as keyof typeof form]
                    ? "border-brand-300 bg-brand-50"
                    : "border-gray-200 hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={form[key as keyof typeof form] as boolean}
                  onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.checked }))}
                  className="rounded text-brand-500"
                />
                <span className="text-sm font-medium text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">SEO</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={form.metaTitle}
              onChange={(event) => setForm((current) => ({ ...current, metaTitle: event.target.value }))}
              placeholder="Meta baslik"
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent"
            />
            <textarea
              rows={2}
              value={form.metaDescription}
              onChange={(event) => setForm((current) => ({ ...current, metaDescription: event.target.value }))}
              placeholder="Meta aciklama"
              maxLength={160}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-transparent resize-none"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/urunler"
            className="px-6 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Iptal
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 bg-brand-500 text-white rounded-xl text-sm font-semibold hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {saving ? "Kaydediliyor..." : "Degisiklikleri Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
