"use client";

import { useState } from "react";
import { Save, Loader2, Store, Phone, Truck, Share2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SettingsForm({ initialSettings }: { initialSettings: Record<string, string> }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    siteName: initialSettings.siteName || "FK KURUYEMİŞ",
    contactEmail: initialSettings.contactEmail || "info@fkkuruyemis.com",
    contactPhone: initialSettings.contactPhone || "+90 505 889 88 28",
    address: initialSettings.address || "Çöplü Mahallesi Camikebir 3. Sokak Çorum",
    instagramUrl: initialSettings.instagramUrl || "https://www.instagram.com/fkkuruyemiss/",
    facebookUrl: initialSettings.facebookUrl || "https://www.facebook.com/p/FK-Kuruyemiş-Fatih-Karakuş-61585467575881/",
    freeShippingThreshold: initialSettings.freeShippingThreshold || "1000",
    shippingCost: initialSettings.shippingCost || "65",
    panelColor: initialSettings.panelColor || "#111827"
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/ayarlar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        toast.success("Ayarlar başarıyla kaydedildi.");
        router.refresh();
      } else {
        toast.error("Ayarlar kaydedilirken hata oluştu.");
      }
    } catch (err) {
      toast.error("Bağlantı hatası.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Genel Bilgiler */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-brand-600">
          <Store size={20} />
          <h2 className="font-semibold text-gray-900">Genel Bilgiler</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Site Adı</label>
            <input
              type="text"
              value={form.siteName}
              onChange={(e) => setForm({ ...form, siteName: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* İletişim Bilgileri */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-brand-600">
          <Phone size={20} />
          <h2 className="font-semibold text-gray-900">İletişim Bilgileri</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">E-posta Adresi</label>
            <input
              type="email"
              value={form.contactEmail}
              onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Telefon Numarası</label>
            <input
              type="text"
              value={form.contactPhone}
              onChange={(e) => setForm({ ...form, contactPhone: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-700">Mağaza Adresi</label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="w-full resize-none rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>



      <hr className="border-gray-100" />

      {/* Sosyal Medya */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-brand-600">
          <Share2 size={20} />
          <h2 className="font-semibold text-gray-900">Sosyal Medya</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Instagram URL</label>
            <input
              type="url"
              value={form.instagramUrl}
              onChange={(e) => setForm({ ...form, instagramUrl: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Facebook URL</label>
            <input
              type="url"
              value={form.facebookUrl}
              onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* Kargo Ayarları */}
      <div>
        <div className="mb-4 flex items-center gap-2 text-brand-600">
          <Truck size={20} />
          <h2 className="font-semibold text-gray-900">Kargo & Teslimat</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Sabit Kargo Ücreti (₺)</label>
            <input
              type="number"
              value={form.shippingCost}
              onChange={(e) => setForm({ ...form, shippingCost: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Ücretsiz Kargo Limiti (₺)</label>
            <input
              type="number"
              value={form.freeShippingThreshold}
              onChange={(e) => setForm({ ...form, freeShippingThreshold: e.target.value })}
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          {saving ? "Kaydediliyor..." : "Ayarları Kaydet"}
        </button>
      </div>
    </form>
  );
}
