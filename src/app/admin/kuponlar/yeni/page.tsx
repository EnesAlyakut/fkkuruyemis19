"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, CheckCircle, Save, Tag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type CouponType = "PERCENTAGE" | "FIXED";

export default function YeniKuponPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    code: "",
    type: "PERCENTAGE" as CouponType,
    value: "10",
    minOrder: "2000",
    maxUses: "1000",
    expiresAt: "",
    isActive: true,
  });

  const submitCoupon = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      code: form.code.trim().toUpperCase(),
      type: form.type,
      value: Number(form.value),
      minOrder: form.minOrder ? Number(form.minOrder) : null,
      maxUses: form.maxUses ? Number(form.maxUses) : null,
      expiresAt: form.expiresAt || null,
      isActive: form.isActive,
    };

    if (!payload.code) {
      toast.error("Kupon kodu zorunludur.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/kupon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Kupon oluşturulamadı.");
        return;
      }

      toast.success("Kupon oluşturuldu.");
      router.push("/admin/kuponlar");
      router.refresh();
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl p-6 pt-20 lg:p-8 lg:pt-8">
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/kuponlar"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-gray-200 bg-white transition-colors hover:bg-gray-50"
          aria-label="Geri dön"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni Kupon</h1>
          <p className="mt-1 text-sm text-gray-500">Kodu yazın, indirimi belirleyin, kaydedin.</p>
        </div>
      </div>

      <form onSubmit={submitCoupon} className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Tag size={18} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Kupon Bilgileri</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="input-label">Kupon Kodu *</label>
              <input
                required
                value={form.code}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    code: event.target.value.toUpperCase().replace(/\s+/g, ""),
                  }))
                }
                placeholder="HOSGELDIN10"
                className="input-field font-mono text-lg font-bold tracking-wide"
              />
            </div>

            <div>
              <label className="input-label">İndirim Türü</label>
              <div className="grid grid-cols-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
                {[
                  { label: "Yüzde", value: "PERCENTAGE" as CouponType },
                  { label: "Sabit TL", value: "FIXED" as CouponType },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setForm((current) => ({ ...current, type: option.value }))}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      form.type === option.value
                        ? "bg-white text-brand-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="input-label">
                İndirim Değeri {form.type === "PERCENTAGE" ? "(%)" : "(₺)"}
              </label>
              <input
                required
                type="number"
                min="1"
                max={form.type === "PERCENTAGE" ? 100 : undefined}
                step="0.01"
                value={form.value}
                onChange={(event) => setForm((current) => ({ ...current, value: event.target.value }))}
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Minimum Sipariş Tutarı</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrder}
                onChange={(event) => setForm((current) => ({ ...current, minOrder: event.target.value }))}
                placeholder="2000"
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Kullanım Limiti</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.maxUses}
                onChange={(event) => setForm((current) => ({ ...current, maxUses: event.target.value }))}
                placeholder="1000"
                className="input-field"
              />
            </div>

            <div>
              <label className="input-label">Son Tarih</label>
              <div className="relative">
                <Calendar size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(event) => setForm((current) => ({ ...current, expiresAt: event.target.value }))}
                  className="input-field pl-11"
                />
              </div>
            </div>

            <label className="flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <span>
                <span className="block text-sm font-semibold text-gray-800">Aktif kupon</span>
                <span className="text-xs text-gray-500">Kapalı olursa müşteriler kullanamaz.</span>
              </span>
              <input
                type="checkbox"
                checked={form.isActive}
                onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
                className="h-5 w-5 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
              />
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <CheckCircle size={16} />
            Örnek
          </div>
          <p>
            <span className="font-mono font-bold">{form.code || "HOSGELDIN10"}</span>{" "}
            kodu, {form.minOrder || "0"} ₺ ve üzeri siparişlerde{" "}
            {form.type === "PERCENTAGE" ? `%${form.value || 0}` : `${form.value || 0} ₺`} indirim verir.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link
            href="/admin/kuponlar"
            className="btn-secondary justify-center"
          >
            İptal
          </Link>
          <button type="submit" disabled={loading} className="btn-primary justify-center">
            <Save size={16} />
            {loading ? "Kaydediliyor..." : "Kuponu Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
