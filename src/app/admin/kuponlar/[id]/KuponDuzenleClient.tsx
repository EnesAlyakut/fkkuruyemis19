"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft, Calendar, CheckCircle, Save, Tag,
  Trash2, AlertTriangle, Loader2, BarChart2,
} from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

type CouponType = "PERCENTAGE" | "FIXED";

interface Coupon {
  id: string;
  code: string;
  type: CouponType;
  value: number;
  minOrder: number | null;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string;
  isActive: boolean;
  createdAt: Date;
}

export default function KuponDuzenleClient({ coupon }: { coupon: Coupon }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    code: coupon.code,
    type: coupon.type,
    value: String(coupon.value),
    minOrder: coupon.minOrder != null ? String(coupon.minOrder) : "",
    maxUses: coupon.maxUses != null ? String(coupon.maxUses) : "",
    expiresAt: coupon.expiresAt,
    isActive: coupon.isActive,
  });

  const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
  const isLimitReached = coupon.maxUses != null && coupon.usedCount >= coupon.maxUses;
  const isEffectivelyActive = coupon.isActive && !isExpired && !isLimitReached;

  const usagePercent =
    coupon.maxUses && coupon.maxUses > 0
      ? Math.min(100, Math.round((coupon.usedCount / coupon.maxUses) * 100))
      : null;

  const handleSave = async (event: React.FormEvent) => {
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
      const res = await fetch(`/api/kupon/${coupon.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || "Kupon güncellenemedi.");
        return;
      }
      toast.success("Kupon güncellendi.");
      router.push("/admin/kuponlar");
      router.refresh();
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/kupon/${coupon.id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || "Kupon silinemedi.");
        return;
      }
      toast.success("Kupon silindi.");
      router.push("/admin/kuponlar");
      router.refresh();
    } catch {
      toast.error("Bağlantı hatası.");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <div className="max-w-3xl p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="mb-8 flex items-center gap-4">
        <Link
          href="/admin/kuponlar"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gray-200 bg-white shadow-sm transition-colors hover:bg-gray-50"
          aria-label="Geri dön"
        >
          <ArrowLeft size={18} className="text-gray-600" />
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="font-display text-xl font-bold text-gray-900 sm:text-2xl truncate">
              {coupon.code}
            </h1>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                isEffectivelyActive
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-600"
              }`}
            >
              {isEffectivelyActive ? (
                <CheckCircle size={11} />
              ) : (
                <AlertTriangle size={11} />
              )}
              {isExpired
                ? "Süresi Doldu"
                : isLimitReached
                ? "Limit Doldu"
                : coupon.isActive
                ? "Aktif"
                : "Pasif"}
            </span>
          </div>
          <p className="mt-0.5 text-sm text-gray-500">Kuponu düzenle veya sil</p>
        </div>
      </div>

      {/* Usage stats */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50">
            <BarChart2 size={15} className="text-brand-600" />
          </div>
          <p className="text-xs text-gray-500">Kullanım</p>
          <p className="text-lg font-black text-gray-900">
            {coupon.usedCount}
            {coupon.maxUses && (
              <span className="text-sm font-medium text-gray-400"> / {coupon.maxUses}</span>
            )}
          </p>
          {usagePercent !== null && (
            <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-brand-500 transition-all"
                style={{ width: `${usagePercent}%` }}
              />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50">
            <Tag size={15} className="text-amber-600" />
          </div>
          <p className="text-xs text-gray-500">İndirim</p>
          <p className="text-lg font-black text-gray-900">
            {coupon.type === "PERCENTAGE" ? `%${coupon.value}` : `${coupon.value} ₺`}
          </p>
        </div>

        <div className="col-span-2 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:col-span-1">
          <div className="mb-1 flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50">
            <Calendar size={15} className="text-blue-600" />
          </div>
          <p className="text-xs text-gray-500">Oluşturulma</p>
          <p className="text-sm font-bold text-gray-900">
            {new Date(coupon.createdAt).toLocaleDateString("tr-TR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5 flex items-center gap-2">
            <Tag size={16} className="text-brand-500" />
            <h2 className="font-semibold text-gray-900">Kupon Bilgileri</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Kod */}
            <div className="sm:col-span-2">
              <label className="input-label">Kupon Kodu *</label>
              <input
                required
                value={form.code}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    code: e.target.value.toUpperCase().replace(/\s+/g, ""),
                  }))
                }
                placeholder="HOSGELDIN10"
                className="input-field font-mono text-lg font-bold tracking-wide"
              />
            </div>

            {/* Tür */}
            <div>
              <label className="input-label">İndirim Türü</label>
              <div className="grid grid-cols-2 rounded-xl border border-gray-200 bg-gray-50 p-1">
                {(
                  [
                    { label: "Yüzde (%)", value: "PERCENTAGE" as CouponType },
                    { label: "Sabit (₺)", value: "FIXED" as CouponType },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, type: opt.value }))}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
                      form.type === opt.value
                        ? "bg-white text-brand-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Değer */}
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
                onChange={(e) => setForm((f) => ({ ...f, value: e.target.value }))}
                className="input-field"
              />
            </div>

            {/* Min sipariş */}
            <div>
              <label className="input-label">Minimum Sipariş Tutarı (₺)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrder}
                onChange={(e) => setForm((f) => ({ ...f, minOrder: e.target.value }))}
                placeholder="Boş bırakın = limitsiz"
                className="input-field"
              />
            </div>

            {/* Kullanım limiti */}
            <div>
              <label className="input-label">Kullanım Limiti</label>
              <input
                type="number"
                min="1"
                step="1"
                value={form.maxUses}
                onChange={(e) => setForm((f) => ({ ...f, maxUses: e.target.value }))}
                placeholder="Boş bırakın = limitsiz"
                className="input-field"
              />
            </div>

            {/* Son tarih */}
            <div>
              <label className="input-label">Son Kullanma Tarihi</label>
              <div className="relative">
                <Calendar
                  size={15}
                  className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Aktif toggle */}
            <div className="sm:col-span-2">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
                <span>
                  <span className="block text-sm font-semibold text-gray-800">Aktif kupon</span>
                  <span className="text-xs text-gray-500">
                    Kapalıysa müşteriler bu kuponu kullanamaz.
                  </span>
                </span>
                <div
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={`relative h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
                    form.isActive ? "bg-brand-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                      form.isActive ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Önizleme */}
        <div className="rounded-2xl border border-brand-100 bg-brand-50 p-4 text-sm text-brand-900">
          <div className="mb-1 flex items-center gap-2 font-semibold">
            <CheckCircle size={15} />
            Önizleme
          </div>
          <p>
            <span className="font-mono font-bold">{form.code || "KOD"}</span> kodu,{" "}
            {form.minOrder ? `${form.minOrder} ₺` : "herhangi bir tutarda"} ve üzeri siparişlerde{" "}
            {form.type === "PERCENTAGE"
              ? `%${form.value || 0} indirim`
              : `${form.value || 0} ₺ indirim`}{" "}
            verir.
          </p>
        </div>

        {/* Butonlar */}
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-600 transition-colors hover:bg-red-100"
          >
            <Trash2 size={15} />
            Kuponu Sil
          </button>

          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <Link href="/admin/kuponlar" className="btn-secondary justify-center">
              İptal
            </Link>
            <button type="submit" disabled={loading} className="btn-primary justify-center">
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Save size={15} />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* Silme onay modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <AlertTriangle size={22} />
            </div>
            <h3 className="mb-1 text-lg font-bold text-gray-900">Kuponu Sil</h3>
            <p className="mb-6 text-sm text-gray-500">
              <span className="font-mono font-bold text-gray-800">{coupon.code}</span> kuponu
              kalıcı olarak silinecek. Bu işlem geri alınamaz.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {deleting ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Trash2 size={14} />
                )}
                {deleting ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
