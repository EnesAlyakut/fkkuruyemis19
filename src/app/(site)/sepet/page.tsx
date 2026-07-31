"use client";

import { useCartStore } from "@/store/cartStore";
import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Tag } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { calculateShippingCost, calculateTotalWeight } from "@/lib/shipping";

const CHECKOUT_COUPON_KEY = "fk-checkout-coupon";

export default function SepetPage() {
  const { items, removeItem, updateQuantity, getTotal, hasHydrated } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState("");
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const subtotal = getTotal();
  const totalWeight = items.length > 0 ? calculateTotalWeight(items) : 0;
  const shippingCost = items.length > 0 ? calculateShippingCost(totalWeight) : 0;
  const total = subtotal - discount + shippingCost;

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;

    setApplyingCoupon(true);
    try {
      const res = await fetch("/api/kupon/dogrula", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: couponCode.trim().toUpperCase(), cartTotal: subtotal }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.coupon) {
        const discountAmount = Number(data.coupon.discountAmount || 0);
        setDiscount(discountAmount);
        setCouponApplied(data.coupon.code);
        setCouponCode(data.coupon.code);
        localStorage.setItem(CHECKOUT_COUPON_KEY, JSON.stringify({ code: data.coupon.code }));
        toast.success(`Kupon uygulandı! ${discountAmount.toFixed(2)} ₺ indirim kazandınız.`);
      } else {
        localStorage.removeItem(CHECKOUT_COUPON_KEY);
        toast.error(data.message || "Geçersiz kupon kodu.");
      }
    } catch {
      toast.error("Kupon kontrol edilirken bağlantı hatası oluştu.");
    } finally {
      setApplyingCoupon(false);
    }
  };

  if (!hasHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="py-20 text-center">
          <ShoppingBag size={64} className="mx-auto mb-4 text-gray-300" />
          <h1 className="mb-3 font-display text-2xl font-bold text-gray-700">
            Sepetiniz Boş
          </h1>
          <p className="mb-8 text-gray-500">Henüz sepetinize ürün eklemediniz.</p>
          <Link href="/urunler" className="btn-primary">
            Alışverişe Başla
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-5 sm:py-8">
      <div className="container-main">
        <h1 className="mb-5 font-display text-2xl font-bold text-gray-900 sm:mb-8 md:text-3xl">
          Sepetim ({items.length} ürün)
        </h1>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          <div className="space-y-3 lg:col-span-2 sm:space-y-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="card flex gap-3 p-3 sm:gap-4 sm:p-4"
              >
                <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-gray-50 sm:h-28 sm:w-28">
                  <Image src={item.image} alt={item.productName} fill className="object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/urunler/${item.productSlug}`}
                    className="line-clamp-2 text-sm font-bold leading-snug text-gray-900 transition-colors hover:text-brand-600 sm:text-base"
                  >
                    {item.productName}
                  </Link>
                  {item.variant && <p className="mt-1 text-xs text-gray-500 sm:text-sm">{item.variant}</p>}

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="qty-btn h-8 w-8"
                        aria-label="Adedi azalt"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="w-7 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="qty-btn h-8 w-8"
                        aria-label="Adedi artır"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-base font-bold text-brand-600 sm:text-lg">
                        {(item.price * item.quantity).toFixed(2)} ₺
                      </span>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-gray-400 transition-colors hover:text-red-500"
                        aria-label="Kaldır"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <Link
              href="/urunler"
              className="inline-flex items-center gap-2 text-sm font-medium text-brand-600 hover:text-brand-700"
            >
              ‹ Alışverişe Devam Et
            </Link>
          </div>

          <div>
            <div className="card p-4 sm:p-6 lg:sticky lg:top-24">
              <h2 className="mb-6 font-display text-lg font-bold text-gray-900">
                Sipariş Özeti
              </h2>

              <div className="mb-6">
                <label className="input-label flex items-center gap-2">
                  <Tag size={14} />
                  Kupon Kodu
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="KUPON KOD"
                    className="input-field min-w-0 flex-1"
                    disabled={!!couponApplied}
                  />
                  <button
                    onClick={applyCoupon}
                    disabled={applyingCoupon || !!couponApplied}
                    className="btn-secondary shrink-0 px-4 py-3"
                  >
                    {couponApplied ? "✓" : "Uygula"}
                  </button>
                </div>
                {couponApplied && (
                  <p className="mt-1 text-xs font-medium text-green-600">
                    ✓ Kupon uygulandı: {couponApplied}
                  </p>
                )}
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Ara Toplam</span>
                  <span>{subtotal.toFixed(2)} ₺</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim</span>
                    <span>-{discount.toFixed(2)} ₺</span>
                  </div>
                )}
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Kargo ({totalWeight > 0 ? `${totalWeight.toFixed(1)} kg` : ""})</span>
                  <span>{shippingCost.toFixed(2)} ₺</span>
                </div>
                <div className="flex justify-between border-t border-gray-100 pt-3 text-lg font-bold">
                  <span>Toplam</span>
                  <span className="text-brand-600">{total.toFixed(2)} ₺</span>
                </div>
              </div>

              <Link href="/odeme" className="btn-primary w-full justify-center py-4 text-base">
                Ödemeye Geç
                <ArrowRight size={18} />
              </Link>

              <p className="mt-3 text-center text-xs text-gray-400">
                Güvenli ödeme • SSL şifreli
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
