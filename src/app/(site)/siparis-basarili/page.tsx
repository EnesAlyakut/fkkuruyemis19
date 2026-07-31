"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, Mail, Package, ShoppingBag } from "lucide-react";

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderNo = searchParams.get("no");

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-amber-50/30 to-stone-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Success Card */}
        <div className="bg-white rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400" />

          <div className="p-8 text-center">
            {/* Animated icon */}
            <div className="relative mx-auto mb-6 w-24 h-24">
              <div className="absolute inset-0 rounded-full bg-green-50 animate-ping opacity-30" />
              <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
                <CheckCircle size={48} className="text-green-500" strokeWidth={1.5} />
              </div>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Siparişiniz Alındı! 🎉
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Teşekkürler! Siparişiniz başarıyla sisteme kaydedildi.
            </p>

            {/* Order number */}
            {orderNo && (
              <div className="mb-6 rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50 p-5">
                <p className="text-xs font-semibold uppercase tracking-widest text-amber-600 mb-1">
                  Sipariş Numaranız
                </p>
                <p className="text-3xl font-black text-amber-700 font-mono tracking-wide">
                  #{orderNo}
                </p>
                <p className="mt-2 text-xs text-amber-600/70">
                  Bu numarayı saklayın, takip için gerekebilir
                </p>
              </div>
            )}

            {/* Email info */}
            <div className="mb-6 flex items-start gap-3 rounded-xl bg-blue-50 p-4 text-left">
              <Mail size={18} className="mt-0.5 shrink-0 text-blue-500" />
              <div>
                <p className="text-sm font-semibold text-blue-800">Onay E-postası</p>
                <p className="mt-0.5 text-xs text-blue-600 leading-relaxed">
                  Sipariş onayınız e-posta adresinize gönderildi. Gelmezse lütfen spam
                  klasörünü kontrol edin veya bizi arayın.
                </p>
              </div>
            </div>

            {/* Shipping info */}
            <div className="mb-8 flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3 text-left">
              <Package size={18} className="shrink-0 text-gray-400" />
              <p className="text-sm text-gray-600">
                Siparişiniz <strong>1-3 iş günü</strong> içinde kargoya verilecektir.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border-2 border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              >
                <Home size={16} />
                Ana Sayfa
              </Link>
              <Link
                href="/urunler"
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 px-5 py-3 text-sm font-bold text-stone-900 shadow-[0_4px_16px_rgba(251,191,36,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(251,191,36,0.5)]"
              >
                <ShoppingBag size={16} />
                Alışverişe Devam
              </Link>
            </div>
          </div>
        </div>

        {/* Support note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Sorun mu yaşıyorsunuz?{" "}
          <a href="tel:+905058898828" className="font-medium text-brand-600 hover:underline">
            0 (505) 889 88 28
          </a>{" "}
          numarasını arayın.
        </p>
      </div>
    </div>
  );
}

export default function SiparisBasariliPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-200 border-t-amber-500" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
