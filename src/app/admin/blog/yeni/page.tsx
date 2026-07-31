"use client";

import { ChangeEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  ArrowLeft,
  Save,
  FileText,
  ImageIcon,
  Tag,
  Eye,
  EyeOff,
  Upload,
  X,
} from "lucide-react";

export default function YeniBlogPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [tagInput, setTagInput] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    coverImage: "",
    isPublished: false,
    metaTitle: "",
    metaDescription: "",
    authorName: "FK KURUYEMİŞ",
    tags: [] as string[],
  });

  const slugify = (text: string) =>
    text
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

  const handleTitleChange = (val: string) => {
    setForm((current) => ({ ...current, title: val, slug: slugify(val) }));
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm((current) => ({ ...current, tags: [...current.tags, tag] }));
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setForm((current) => ({ ...current, tags: current.tags.filter((item) => item !== tag) }));
  };

  const handleCoverUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Lütfen bir görsel dosyası seçin.");
      event.target.value = "";
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setUploadingCover(true);
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || data.message || "Görsel yüklenemedi.");
        return;
      }

      setForm((current) => ({ ...current, coverImage: data.url }));
      toast.success("Kapak görseli eklendi.");
    } catch {
      toast.error("Görsel yüklenirken bağlantı hatası oluştu.");
    } finally {
      setUploadingCover(false);
      event.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.content.trim()) {
      toast.error("İçerik alanı boş bırakılamaz.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug,
          content: form.content,
          excerpt: form.excerpt || undefined,
          coverImage: form.coverImage || undefined,
          isPublished: form.isPublished,
          metaTitle: form.metaTitle || undefined,
          metaDescription: form.metaDescription || undefined,
          authorName: form.authorName || "FK KURUYEMİŞ",
          tags: form.tags,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Blog yazısı oluşturulamadı");
      }

      toast.success("Blog yazısı kaydedildi.");
      router.push("/admin/blog");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const wordCount = form.content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="max-w-4xl p-6 pt-20 lg:p-8 lg:pt-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/blog"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 transition-colors hover:bg-gray-50"
          aria-label="Geri dön"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Blog Yazısı</h1>
          <p className="mt-0.5 text-sm text-gray-500">İçerik oluşturun ve yayınlayın</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 ${
            form.isPublished ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {form.isPublished ? (
              <Eye size={18} className="text-green-600" />
            ) : (
              <EyeOff size={18} className="text-amber-600" />
            )}
            <div>
              <p className={`text-sm font-semibold ${form.isPublished ? "text-green-800" : "text-amber-800"}`}>
                {form.isPublished ? "Yayınlanacak" : "Taslak olarak kaydedilecek"}
              </p>
              <p className={`mt-0.5 text-xs ${form.isPublished ? "text-green-600" : "text-amber-600"}`}>
                {form.isPublished
                  ? "Kaydettiğinizde yazı sitede yayına girecek"
                  : "Daha sonra yayınlayabilirsiniz"}
              </p>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <span className="text-sm font-medium text-gray-700">
              {form.isPublished ? "Yayınla" : "Taslak"}
            </span>
            <div className="relative">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((current) => ({ ...current, isPublished: e.target.checked }))}
                className="sr-only"
              />
              <div className={`h-6 w-12 rounded-full transition-colors ${form.isPublished ? "bg-green-500" : "bg-gray-300"}`}>
                <div
                  className={`ml-0.5 mt-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    form.isPublished ? "translate-x-6" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </label>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <FileText size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Yazı Bilgileri</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Başlık *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Örn: Leblebinin Faydaları"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">URL Slug *</label>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-sm text-gray-400">/blog/</span>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm((current) => ({ ...current, slug: e.target.value }))}
                  placeholder="leblebinin-faydalari"
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 font-mono text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Özet</label>
              <textarea
                rows={2}
                value={form.excerpt}
                onChange={(e) => setForm((current) => ({ ...current, excerpt: e.target.value }))}
                placeholder="Blog listesinde gösterilecek kısa özet"
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Yazar</label>
              <input
                type="text"
                value={form.authorName}
                onChange={(e) => setForm((current) => ({ ...current, authorName: e.target.value }))}
                placeholder="FK KURUYEMİŞ"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-brand-500" />
              <h2 className="font-semibold text-gray-900">İçerik *</h2>
            </div>
            <span className="text-xs text-gray-400">{wordCount} kelime</span>
          </div>
          <textarea
            required
            rows={18}
            value={form.content}
            onChange={(e) => setForm((current) => ({ ...current, content: e.target.value }))}
            placeholder={`Blog yazınızın içeriğini buraya yazın...

Markdown formatı desteklenmektedir:
# Başlık 1
## Başlık 2
**Kalın yazı**
*İtalik yazı*
- Madde işareti
1. Numaralı liste`}
            className="w-full resize-none rounded-xl border border-gray-200 px-4 py-3 font-mono text-sm leading-relaxed focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
          />
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ImageIcon size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Kapak Görseli</h2>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleCoverUpload}
            className="hidden"
          />
          <div className="flex flex-col gap-3 sm:flex-row">
            <input
              type="url"
              value={form.coverImage}
              onChange={(e) => setForm((current) => ({ ...current, coverImage: e.target.value }))}
              placeholder="https://example.com/kapak-gorsel.jpg"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingCover}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Upload size={16} />
              {uploadingCover ? "Yükleniyor..." : "Ekle"}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-400">
            JPG, PNG, WebP veya GIF seçebilirsiniz. Görsel otomatik yüklenip URL alanına eklenir.
          </p>
          {form.coverImage && (
            <div className="mt-4 overflow-hidden rounded-xl border border-gray-200 bg-gray-50">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={form.coverImage}
                  alt="Kapak önizleme"
                  className="max-h-56 w-full object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
                <button
                  type="button"
                  onClick={() => setForm((current) => ({ ...current, coverImage: "" }))}
                  className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-sm transition-colors hover:bg-white"
                  aria-label="Kapak görselini kaldır"
                >
                  <X size={16} />
                </button>
              </div>
              <p className="px-3 py-2 text-xs text-gray-500">Kapak görseli önizleme</p>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <Tag size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Etiketler</h2>
          </div>
          <div className="mb-3 flex gap-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="Etiket yazın, Enter'a basın"
              className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
            />
            <button
              type="button"
              onClick={addTag}
              className="rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-200"
            >
              Ekle
            </button>
          </div>
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {form.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1.5 text-sm text-brand-700"
                >
                  #{tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-brand-400 transition-colors hover:text-brand-600"
                    aria-label={`${tag} etiketini kaldır`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <h2 className="mb-5 font-semibold text-gray-900">SEO</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Meta Başlık</label>
              <input
                type="text"
                value={form.metaTitle}
                onChange={(e) => setForm((current) => ({ ...current, metaTitle: e.target.value }))}
                placeholder="Boş bırakırsanız yazı başlığı kullanılır"
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Meta Açıklama</label>
              <textarea
                rows={2}
                value={form.metaDescription}
                onChange={(e) => setForm((current) => ({ ...current, metaDescription: e.target.value }))}
                placeholder="Arama sonuçlarında görünecek açıklama"
                maxLength={160}
                className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 text-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-brand-400"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{form.metaDescription.length}/160</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pb-8">
          <Link
            href="/admin/blog"
            className="rounded-xl border border-gray-200 px-6 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={loading || uploadingCover}
            className="flex items-center gap-2 rounded-xl bg-brand-500 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Kaydediliyor..." : form.isPublished ? "Yayınla" : "Taslak Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
