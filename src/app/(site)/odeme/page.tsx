"use client";

import { useState, useEffect, useRef } from "react";
import { useCartStore } from "@/store/cartStore";
import { useRouter } from "next/navigation";
import { Lock, ChevronRight, ShieldCheck, CreditCard, X } from "lucide-react";
import toast from "react-hot-toast";
import { calculateShippingCost, calculateTotalWeight } from "@/lib/shipping";
import { validateOrderContactFields } from "@/lib/orderValidation";

export const dynamic = "force-dynamic";

const CHECKOUT_COUPON_KEY = "fk-checkout-coupon";

export default function OdemePage() {
  const { items, getTotal, clearCart, hasHydrated } = useCartStore();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [iframeToken, setIframeToken] = useState<string | null>(null);
  const [pendingOrderNumber, setPendingOrderNumber] = useState<string | null>(null);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number } | null>(null);
  const iframeContainerRef = useRef<HTMLDivElement>(null);

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    city: "",
    district: "",
    postalCode: "",
    notes: "",
  });

  const subtotal = getTotal();
  const totalWeight = items.length > 0 ? calculateTotalWeight(items) : 0;
  const shipping = items.length > 0 ? calculateShippingCost(totalWeight) : 0;
  const discount = appliedCoupon?.discountAmount || 0;
  const total = subtotal - discount + shipping;

  // PayTR iframe mesajlarını dinle (ödeme sonucu)
  useEffect(() => {
    function handleMessage(e: MessageEvent) {
      // PayTR postMessage: { status: "success" | "fail" | ... }
      if (!e.data) return;
      const data = typeof e.data === "string" ? (() => { try { return JSON.parse(e.data); } catch { return null; } })() : e.data;
      if (!data) return;

      if (data.status === "success" || data.paytr_status === "success") {
        // Ödeme başarılı → yönlendir
        clearCart();
        localStorage.removeItem(CHECKOUT_COUPON_KEY);
        toast.success("Ödemeniz alındı! Teşekkür ederiz.");
        router.push(`/siparis-basarili?no=${pendingOrderNumber}`);
      } else if (data.status === "fail" || data.paytr_status === "fail") {
        toast.error("Ödeme başarısız. Lütfen tekrar deneyin.");
        setIframeToken(null);
        setSubmitting(false);
      }
    }

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [pendingOrderNumber, clearCart, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const contactValidation = validateOrderContactFields({
      customerName: form.customerName,
      customerEmail: form.customerEmail,
      customerPhone: form.customerPhone,
      city: form.city,
      district: form.district,
      address: form.address,
      postalCode: form.postalCode,
    });

    if (!contactValidation.ok) {
      toast.error(contactValidation.message);
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/paytr/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
          city: form.city,
          district: form.district,
          address: form.address,
          postalCode: form.postalCode,
          notes: form.notes,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            productName: item.productName,
            variant: item.variant,
            price: item.price,
            quantity: item.quantity,
            total: item.price * item.quantity,
          })),
          subtotal,
          shippingCost: shipping,
          discount,
          total,
          couponCode: appliedCoupon?.code || undefined,
        }),
      });

      const data = await res.json();

      if (res.ok && data.iframeToken) {
        setIframeToken(data.iframeToken);
        setPendingOrderNumber(data.orderNumber);
        setTimeout(() => {
          iframeContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        toast.error(data.message || "Ödeme başlatılamadı.");
        setSubmitting(false);
      }
    } catch {
      toast.error("Bağlantı hatası. Lütfen tekrar deneyin.");
      setSubmitting(false);
    }
  };

  const closeIframe = () => {
    setIframeToken(null);
    setSubmitting(false);
    toast("Ödeme iptal edildi.", { icon: "ℹ️" });
  };

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    if (!mounted || !hasHydrated || items.length === 0) return;
    const rawCoupon = localStorage.getItem(CHECKOUT_COUPON_KEY);
    if (!rawCoupon) { setAppliedCoupon(null); return; }

    let cancelled = false;
    async function validateStoredCoupon() {
      try {
        const parsed = JSON.parse(rawCoupon || "{}");
        const code = String(parsed.code || "").trim().toUpperCase();
        if (!code) { localStorage.removeItem(CHECKOUT_COUPON_KEY); setAppliedCoupon(null); return; }

        const response = await fetch("/api/kupon/dogrula", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code, cartTotal: subtotal }),
        });
        const data = await response.json();

        if (!cancelled && response.ok && data.success && data.coupon) {
          setAppliedCoupon({ code: data.coupon.code, discountAmount: Number(data.coupon.discountAmount || 0) });
          return;
        }
        localStorage.removeItem(CHECKOUT_COUPON_KEY);
        if (!cancelled) setAppliedCoupon(null);
      } catch {
        localStorage.removeItem(CHECKOUT_COUPON_KEY);
        if (!cancelled) setAppliedCoupon(null);
      }
    }
    validateStoredCoupon();
    return () => { cancelled = true; };
  }, [mounted, hasHydrated, items.length, subtotal]);

  useEffect(() => {
    if (mounted && hasHydrated && items.length === 0) router.push("/sepet");
  }, [items.length, router, mounted, hasHydrated]);

  if (!mounted || !hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-400">Sepetiniz boş, yönlendiriliyorsunuz...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8">
      <div className="container-main">
        {/* Breadcrumb */}
        <div className="scrollbar-hide mb-6 flex items-center gap-2 overflow-x-auto pb-1 text-sm text-gray-500 sm:mb-8">
          <span>Sepet</span>
          <ChevronRight size={14} />
          <span className="font-semibold text-brand-600">Ödeme</span>
        </div>

        {/* PayTR iFrame Modal */}
        {iframeToken && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div ref={iframeContainerRef} className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2">
                  <ShieldCheck size={20} className="text-green-600" />
                  <span className="font-semibold text-gray-800 text-sm">Güvenli Ödeme — PayTR</span>
                </div>
                <button
                  onClick={closeIframe}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
                  title="Kapat"
                >
                  <X size={16} className="text-gray-600" />
                </button>
              </div>

              {/* Total reminder */}
              <div className="px-5 py-3 bg-brand-50 border-b border-brand-100 text-sm text-center text-brand-700 font-medium">
                Ödenecek Tutar: <span className="font-bold text-brand-800">{total.toFixed(2)} ₺</span>
              </div>

              {/* PayTR iframe */}
              <iframe
                src={`https://www.paytr.com/odeme/guvenli/${iframeToken}`}
                frameBorder="0"
                scrolling="yes"
                style={{ width: "100%", height: "560px" }}
                allow="payment"
                title="PayTR Güvenli Ödeme"
              />

              <div className="px-5 py-3 flex items-center justify-center gap-2 text-xs text-gray-400 border-t border-gray-100">
                <Lock size={12} />
                256-bit SSL ile şifrelenmiş güvenli bağlantı
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            {/* Sol Sütun */}
            <div className="space-y-6 lg:col-span-2">
              {/* Kişisel Bilgiler */}
              <div className="card p-4 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">Kişisel Bilgiler</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="input-label">Ad Soyad *</label>
                    <input required type="text" className="input-field" value={form.customerName}
                      onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Adınız Soyadınız" />
                  </div>
                  <div>
                    <label className="input-label">Telefon *</label>
                    <input required type="tel" className="input-field" value={form.customerPhone}
                      onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="05XX XXX XX XX" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label">E-posta *</label>
                    <input required type="email" className="input-field" value={form.customerEmail}
                      onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="email@example.com" />
                  </div>
                </div>
              </div>

              {/* Teslimat Adresi */}
              <div className="card p-4 sm:p-6">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">Teslimat Adresi</h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label className="input-label">Şehir *</label>
                    <input required type="text" className="input-field" value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="İstanbul" />
                  </div>
                  <div>
                    <label className="input-label">İlçe *</label>
                    <input required type="text" className="input-field" value={form.district}
                      onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="Kadıköy" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="input-label">Açık Adres *</label>
                    <textarea required className="input-field h-24 resize-none" value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Mahalle, sokak, bina no, daire no..." />
                  </div>
                  <div>
                    <label className="input-label">Posta Kodu</label>
                    <input type="text" className="input-field" value={form.postalCode}
                      onChange={(e) => setForm({ ...form, postalCode: e.target.value })} placeholder="34000" />
                  </div>
                </div>
                <div className="mt-4">
                  <label className="input-label">Sipariş Notu</label>
                  <textarea className="input-field h-20 resize-none" value={form.notes}
                    onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Özel talepleriniz..." />
                </div>
              </div>

              {/* Ödeme yöntemi bilgi kartı */}
              <div className="card p-4 sm:p-6">
                <h2 className="mb-4 font-display text-lg font-bold text-gray-900">Ödeme Yöntemi</h2>
                <div className="flex items-center gap-3 rounded-2xl border-2 border-brand-500 bg-brand-50 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white">
                    <CreditCard size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Kredi / Banka Kartı</p>
                    <p className="text-sm text-gray-500">Visa, Mastercard, TROY — PayTR güvenli altyapısı</p>
                  </div>
                  <div className="ml-auto flex items-center gap-1">
                    <ShieldCheck size={18} className="text-green-600" />
                    <span className="text-xs text-green-700 font-medium hidden sm:block">SSL</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5">
                  <Lock size={11} />
                  Kart bilgileriniz yalnızca PayTR altyapısında işlenir, tarafımızca saklanmaz.
                </p>
              </div>
            </div>

            {/* Sağ Sütun - Sipariş Özeti */}
            <div>
              <div className="card p-4 sm:p-6 lg:sticky lg:top-24">
                <h2 className="mb-5 font-display text-lg font-bold text-gray-900">Sipariş Özeti</h2>
                <div className="mb-6 space-y-3">
                  {items.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="mr-2 flex-1 truncate text-gray-600">
                        {item.productName}
                        {item.variant && <span className="text-gray-400"> ({item.variant})</span>}
                        <span className="text-gray-400"> x{item.quantity}</span>
                      </span>
                      <span className="shrink-0 font-medium">{(item.price * item.quantity).toFixed(2)} ₺</span>
                    </div>
                  ))}
                </div>
                <div className="space-y-2 border-t border-gray-100 pt-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Ara Toplam</span>
                    <span>{subtotal.toFixed(2)} ₺</span>
                  </div>
                  {appliedCoupon && discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Kupon ({appliedCoupon.code})</span>
                      <span>-{discount.toFixed(2)} ₺</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Kargo ({totalWeight > 0 ? `${totalWeight.toFixed(1)} kg` : ""})</span>
                    <span>{shipping.toFixed(2)} ₺</span>
                  </div>
                  <div className="flex justify-between border-t border-gray-100 pt-3 text-xl font-bold">
                    <span>Toplam</span>
                    <span className="text-brand-600">{total.toFixed(2)} ₺</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary mt-6 w-full justify-center rounded-2xl py-4 text-sm leading-tight sm:text-base disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Güvenli Ödemeye Geç
                    </>
                  )}
                </button>

                <div className="mt-4 flex items-center justify-center gap-3">
                  <img src="https://www.paytr.com/img/logo.png" alt="PayTR" className="h-5 opacity-60" />
                  <span className="text-xs text-gray-400">ile güvenli ödeme</span>
                </div>

                <p className="mt-3 text-center text-xs text-gray-400">
                  Sipariş vererek{" "}
                  <a href="/gizlilik-politikasi" className="underline">gizlilik politikasını</a>{" "}
                  kabul etmiş olursunuz.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
