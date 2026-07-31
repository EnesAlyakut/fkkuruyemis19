"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingCart, Star, Leaf, MapPin, Factory, Clock,
  ChevronRight, Plus, Minus, Share2, Heart, Truck,
  Shield, Award, Package, Sparkles, BadgeCheck,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { ProductCard } from "@/components/ui/ProductCard";
import toast from "react-hot-toast";
import { formatDate } from "@/lib/dateFormat";

export default function ProductDetailClient({ product, related }: { product: any; related: any[] }) {
  const addItem = useCartStore((s) => s.addItem);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [reviewForm, setReviewForm] = useState({ authorName: "", email: "", rating: 5, comment: "" });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hoveredRating, setHoveredRating] = useState(0);

  const price = selectedVariant?.price || product.discountPrice || product.basePrice;
  const requiresQuote = price <= 0;
  const hasDiscount = !!product.discountPrice && !selectedVariant;
  const discountPercent = hasDiscount ? Math.round(((product.basePrice - product.discountPrice) / product.basePrice) * 100) : 0;
  const avgRating = product.reviews.length > 0 ? product.reviews.reduce((s: number, r: any) => s + r.rating, 0) / product.reviews.length : 0;

  const handleAddToCart = () => {
    if (requiresQuote) return;
    addItem({ productId: product.id, productName: product.name, productSlug: product.slug, image: product.images[0], variantId: selectedVariant?.id, variant: selectedVariant?.weight, price, quantity });
    toast.success(`${product.name} sepete eklendi!`);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await fetch(`/api/urunler/${product.id}/yorum`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(reviewForm) });
      if (res.ok) { toast.success("Yorumunuz incelemeye alındı!"); setReviewForm({ authorName: "", email: "", rating: 5, comment: "" }); }
      else toast.error("Bir hata oluştu.");
    } finally { setSubmittingReview(false); }
  };

  return (
    <div style={{ background: "linear-gradient(160deg,#ffffff 0%,#fafaf8 50%,#f7f4ee 100%)", minHeight: "100vh" }}>
      {/* Breadcrumb */}
      <div style={{ background: "rgba(200,131,14,0.05)", borderBottom: "1px solid rgba(200,131,14,0.15)" }}>
        <div className="container-main py-3">
          <nav className="flex items-center gap-1.5 text-xs text-gray-400 overflow-x-auto scrollbar-hide whitespace-nowrap">
            <Link href="/" className="hover:text-brand-600 transition-colors">Ana Sayfa</Link>
            <ChevronRight size={11} />
            <Link href="/urunler" className="hover:text-brand-600 transition-colors">Ürünler</Link>
            <ChevronRight size={11} />
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-brand-600 transition-colors">{product.category.name}</Link>
            <ChevronRight size={11} />
            <span className="text-gray-700 font-medium truncate">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container-main py-10 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20 mb-16 items-center max-w-5xl mx-auto">

          {/* ── Image Gallery ── */}
          <div className="space-y-4">
            <div className="relative aspect-square rounded-3xl overflow-hidden group bg-white"
              style={{ boxShadow: "0 20px 60px rgba(200,131,14,0.15), 0 4px 20px rgba(0,0,0,0.08)", border: "1px solid rgba(200,131,14,0.15)" }}>
              <Image src={product.images[activeImage] || "/images/leblebi-urun.png"} alt={product.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" priority sizes="(max-width:1024px) 100vw,50vw" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />

              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNatural && <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full text-white" style={{ background: "linear-gradient(135deg,#16a34a,#15803d)", boxShadow: "0 4px 12px rgba(22,163,74,0.35)" }}><Leaf size={11} />%100 Doğal</span>}
                {hasDiscount && <span className="flex items-center px-3 py-1.5 text-xs font-bold text-white rounded-full" style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)", boxShadow: "0 4px 12px rgba(239,68,68,0.35)" }}>-%{discountPercent} İndirim</span>}
                {product.isBestSeller && <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white rounded-full" style={{ background: "linear-gradient(135deg,#c8830e,#a86a0a)", boxShadow: "0 4px 12px rgba(200,131,14,0.4)" }}><Sparkles size={11} />Çok Satan</span>}
              </div>

              <div className="absolute top-4 right-4">
                <button className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-md transition-all hover:scale-110"><Share2 size={16} className="text-gray-500" /></button>
              </div>
            </div>

            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
                {product.images.map((img: string, i: number) => (
                  <button key={i} onClick={() => setActiveImage(i)}
                    className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 bg-white transition-all"
                    style={{ border: i === activeImage ? "2px solid #c8830e" : "2px solid #e5e7eb", boxShadow: i === activeImage ? "0 0 16px rgba(200,131,14,0.35)" : "0 2px 8px rgba(0,0,0,0.06)", transform: i === activeImage ? "scale(1.06)" : "scale(1)", opacity: i === activeImage ? 1 : 0.6 }}>
                    <Image src={img} alt="" fill className="object-cover" unoptimized />
                  </button>
                ))}
              </div>
            )}

            {/* Trust strip */}
            <div className="grid grid-cols-2 gap-2">
              {[
                { icon: Truck, title: "Hızlı Teslimat", sub: "1-3 iş günü" },
                { icon: Shield, title: "Güvenli Ödeme", sub: "256-bit SSL" },
                { icon: BadgeCheck, title: "%100 Doğal", sub: "Üreticiden" },
                { icon: Award, title: "Kalite Garantisi", sub: "Tam memnuniyet" },
              ].map(({ icon: Icon, title, sub }) => (
                <div key={title} className="flex items-center gap-2.5 rounded-2xl p-3 bg-white transition-all hover:shadow-md"
                  style={{ border: "1px solid rgba(200,131,14,0.12)", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg,#fef6e4,#fde8b0)" }}>
                    <Icon size={15} style={{ color: "#c8830e" }} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{title}</p>
                    <p className="text-[10px] text-gray-400">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Product Info ── */}
          <div className="flex flex-col justify-center">
            <Link href={`/kategori/${product.category.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest mb-4 group w-fit px-3 py-1.5 rounded-full transition-all hover:bg-amber-100"
              style={{ color: "#c8830e", background: "rgba(200,131,14,0.08)", border: "1px solid rgba(200,131,14,0.2)" }}>
              <Package size={12} />{product.category.name}<ChevronRight size={11} className="transition-transform group-hover:translate-x-0.5" />
            </Link>

            <h1 className="text-2xl sm:text-3xl font-bold leading-snug mb-4 text-gray-900">
              {product.name}
            </h1>

            {product.reviews.length > 0 && (
              <div className="flex items-center gap-3 mb-5">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={15} className={i < Math.round(avgRating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                  ))}
                </div>
                <span className="text-sm font-bold text-amber-600">{avgRating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">({product.reviews.length} değerlendirme)</span>
              </div>
            )}

            {product.shortDesc && <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.shortDesc}</p>}

            {/* Price Box */}
            <div className="mb-6 rounded-2xl p-5 relative overflow-hidden bg-white"
              style={{ border: "2px solid rgba(200,131,14,0.25)", boxShadow: "0 8px 30px rgba(200,131,14,0.1)" }}>
              <div className="absolute top-0 right-0 w-28 h-28 rounded-full -translate-y-6 translate-x-6 opacity-10" style={{ background: "radial-gradient(circle,#f59e0b,transparent)" }} />
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-600/60 mb-1">
                {requiresQuote ? "Fiyat" : quantity > 1 ? `Toplam (${quantity} adet)` : "Fiyat"}
              </p>
              <div className="flex items-end justify-between">
                <span className="text-4xl font-black" style={{ color: "#c8830e" }}>
                  {requiresQuote ? "Fiyat Sorunuz" : `${(price * quantity).toFixed(2)} ₺`}
                </span>
                {hasDiscount && (
                  <div className="text-right">
                    <p className="text-xs text-gray-400 mb-0.5">Eski fiyat</p>
                    <span className="text-lg text-gray-400 line-through">{(product.basePrice * quantity).toFixed(2)} ₺</span>
                    <p className="text-xs font-bold text-red-500">%{discountPercent} indirim</p>
                  </div>
                )}
              </div>
              {!requiresQuote && quantity > 1 && <p className="mt-1 text-xs text-amber-600/50">{price.toFixed(2)} ₺ × {quantity} adet</p>}
            </div>

            {/* Variants */}
            {product.variants.length > 0 && (
              <div className="mb-6">
                <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                  Seçenek {selectedVariant && <span className="text-amber-600 normal-case">· {selectedVariant.weight}</span>}
                </p>
                <div className="flex flex-wrap gap-2">
                  {product.variants.map((v: any) => (
                    <button key={v.id} onClick={() => v.stock !== 0 && setSelectedVariant(v)} disabled={v.stock === 0}
                      className="relative px-4 py-2.5 rounded-xl transition-all duration-200 bg-white"
                      style={{
                        background: selectedVariant?.id === v.id ? "linear-gradient(135deg,#c8830e,#a86a0a)" : "white",
                        border: selectedVariant?.id === v.id ? "1px solid #c8830e" : "1px solid #e5e7eb",
                        boxShadow: selectedVariant?.id === v.id ? "0 4px 16px rgba(200,131,14,0.35)" : "0 2px 6px rgba(0,0,0,0.05)",
                        opacity: v.stock === 0 ? 0.35 : 1,
                        cursor: v.stock === 0 ? "not-allowed" : "pointer",
                      }}>
                      <span className="block text-sm font-bold leading-tight" style={{ color: selectedVariant?.id === v.id ? "white" : "#1f2937" }}>{v.weight}</span>
                      <span className="block text-[11px] font-medium mt-0.5" style={{ color: selectedVariant?.id === v.id ? "#fde68a" : "#c8830e" }}>{v.price.toFixed(2)} ₺</span>
                      {v.stock === 0 && <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-500 px-1.5 py-px text-[9px] font-bold text-white">Bitti</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Qty + Cart */}
            {!requiresQuote && (
              <div className="mb-6 space-y-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold uppercase tracking-widest text-gray-400">Adet</span>
                  <div className="flex items-center overflow-hidden rounded-xl bg-white" style={{ border: "1px solid #e5e7eb", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="flex h-11 w-11 items-center justify-center transition-all hover:bg-gray-50 text-gray-400 hover:text-gray-700"><Minus size={14} /></button>
                    <span className="w-12 text-center text-base font-black text-gray-900">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="flex h-11 w-11 items-center justify-center transition-all hover:bg-gray-50 text-gray-400 hover:text-gray-700"><Plus size={14} /></button>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleAddToCart}
                    className="flex flex-1 items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-black text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                    style={{ background: "linear-gradient(135deg,#c8830e 0%,#a86a0a 100%)", boxShadow: "0 8px 25px rgba(200,131,14,0.4)" }}>
                    <ShoppingCart size={20} />Sepete Ekle
                  </button>
                  <button onClick={() => setWishlist(!wishlist)}
                    className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white transition-all duration-200 hover:scale-110"
                    style={{ border: wishlist ? "1px solid rgba(239,68,68,0.4)" : "1px solid #e5e7eb", boxShadow: wishlist ? "0 4px 12px rgba(239,68,68,0.15)" : "0 2px 6px rgba(0,0,0,0.05)" }}>
                    <Heart size={20} className={wishlist ? "fill-red-400 text-red-400" : "text-gray-300"} />
                  </button>
                </div>
              </div>
            )}

            {requiresQuote && (
              <Link href="/iletisim"
                className="mb-6 flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-base font-black text-white transition-all hover:scale-[1.02]"
                style={{ background: "linear-gradient(135deg,#c8830e,#a86a0a)", boxShadow: "0 8px 25px rgba(200,131,14,0.4)" }}>
                Fiyat ve Stok Sorun
              </Link>
            )}

            {/* Meta info */}
            {(product.origin || product.production || product.freshness) && (
              <div className="p-5 rounded-2xl space-y-3 bg-white" style={{ border: "1px solid #f0ece4", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                {product.origin && <div className="flex items-center gap-3 text-sm text-gray-600"><MapPin size={15} style={{ color: "#c8830e" }} /><span><strong className="text-gray-800">Menşei:</strong> {product.origin}</span></div>}
                {product.production && <div className="flex items-center gap-3 text-sm text-gray-600"><Factory size={15} style={{ color: "#c8830e" }} /><span><strong className="text-gray-800">Üretim:</strong> {product.production}</span></div>}
                {product.freshness && <div className="flex items-center gap-3 text-sm text-gray-600"><Clock size={15} style={{ color: "#c8830e" }} /><span><strong className="text-gray-800">Tazelik:</strong> {product.freshness}</span></div>}
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="rounded-3xl p-8 mb-6 bg-white" style={{ border: "1px solid #f0ece4", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <h2 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-3">
            <span className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom,#f59e0b,#c8830e)" }} />
            Ürün Açıklaması
          </h2>
          <div className="text-gray-600 leading-relaxed whitespace-pre-line text-sm">{product.description}</div>
        </div>

        {/* Reviews */}
        <div className="rounded-3xl p-8 mb-16 bg-white" style={{ border: "1px solid #f0ece4", boxShadow: "0 4px 16px rgba(0,0,0,0.05)" }}>
          <h2 className="text-xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <span className="w-1 h-6 rounded-full" style={{ background: "linear-gradient(to bottom,#f59e0b,#c8830e)" }} />
            Değerlendirmeler
            <span className="px-2.5 py-0.5 rounded-full text-sm font-bold text-white" style={{ background: "#c8830e" }}>{product.reviews.length}</span>
          </h2>

          {product.reviews.length > 0 ? (
            <div className="space-y-4 mb-10">
              {product.reviews.map((review: any) => (
                <div key={review.id} className="p-5 rounded-2xl transition-all hover:shadow-sm" style={{ background: "#fafaf8", border: "1px solid #f0ece4" }}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-sm shrink-0" style={{ background: "linear-gradient(135deg,#c8830e,#a86a0a)" }}>
                        {review.authorName[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{review.authorName}</p>
                        <p className="text-[11px] text-gray-400">{formatDate(review.createdAt)}</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={13} className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 mb-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center" style={{ background: "#fef6e4" }}>
                <Star size={28} className="text-amber-300" />
              </div>
              <p className="text-gray-400 font-semibold">Henüz değerlendirme yok</p>
              <p className="text-gray-300 text-sm mt-1">İlk değerlendirmeyi siz yapın!</p>
            </div>
          )}

          <div style={{ borderTop: "1px solid #f0ece4", paddingTop: "2rem" }}>
            <h3 className="text-lg font-black text-gray-900 mb-6">Değerlendirme Yaz</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Adınız *</label>
                  <input type="text" required value={reviewForm.authorName}
                    onChange={(e) => setReviewForm({ ...reviewForm, authorName: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none transition-all bg-white"
                    style={{ border: "1px solid #e5e7eb" }}
                    placeholder="Adınızı girin" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">E-posta</label>
                  <input type="email" value={reviewForm.email}
                    onChange={(e) => setReviewForm({ ...reviewForm, email: e.target.value })}
                    className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none transition-all bg-white"
                    style={{ border: "1px solid #e5e7eb" }}
                    placeholder="E-posta adresiniz" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Puan *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button key={s} type="button"
                      onMouseEnter={() => setHoveredRating(s)} onMouseLeave={() => setHoveredRating(0)}
                      onClick={() => setReviewForm({ ...reviewForm, rating: s })}
                      className="transition-transform hover:scale-125 active:scale-95">
                      <Star size={32} className={s <= (hoveredRating || reviewForm.rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Yorumunuz *</label>
                <textarea required value={reviewForm.comment}
                  onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                  className="w-full rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none h-28 resize-none transition-all bg-white"
                  style={{ border: "1px solid #e5e7eb" }}
                  placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..." />
              </div>
              <button type="submit" disabled={submittingReview}
                className="px-8 py-3.5 rounded-2xl font-black text-white transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                style={{ background: "linear-gradient(135deg,#c8830e,#a86a0a)", boxShadow: "0 8px 25px rgba(200,131,14,0.35)" }}>
                {submittingReview ? "Gönderiliyor..." : "Değerlendirme Gönder"}
              </button>
            </form>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div>
            <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
              <span className="w-1 h-7 rounded-full" style={{ background: "linear-gradient(to bottom,#f59e0b,#c8830e)" }} />
              Benzer Ürünler
            </h2>
            <div className="product-grid">
              {related.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
