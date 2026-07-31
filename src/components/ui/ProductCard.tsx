"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, Leaf, TrendingUp, Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import toast from "react-hot-toast";

interface ProductVariant {
  id: string;
  weight: string;
  price: number;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  shortDesc?: string | null;
  images: string[];
  basePrice: number;
  discountPrice?: number | null;
  isNatural: boolean;
  isBestSeller: boolean;
  isNew: boolean;
  category: { name: string; slug: string };
  variants: ProductVariant[];
  reviews?: { rating: number }[];
}

const FALLBACK_IMAGE = "/images/leblebi-urun.png";

export function ProductCard({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = product.images?.length ? product.images : [FALLBACK_IMAGE];

  useEffect(() => {
    // 1'den fazla görsel varsa ve üzerine gelinmemişse 5 saniyede bir otomatik geçiş yap
    if (images.length > 1 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
      }, 5000); 
      return () => clearInterval(interval);
    }
  }, [images.length, isHovered]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const price = product.discountPrice || product.basePrice;
  const hasDiscount = !!product.discountPrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.discountPrice!) / product.basePrice) * 100)
    : 0;

  const reviews = product.reviews || [];
  const avgRating = reviews.length
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;

  const cheapestVariant = [...product.variants].sort((a, b) => a.price - b.price)[0];
  const requiresQuote = price <= 0;

  const handleAddToCart = (event: React.MouseEvent) => {
    if (requiresQuote) return;

    event.preventDefault();
    event.stopPropagation();

    addItem({
      productId: product.id,
      productName: product.name,
      productSlug: product.slug,
      image: images[0],
      variantId: cheapestVariant?.id,
      variant: cheapestVariant?.weight,
      price: cheapestVariant?.price || price,
      quantity: 1,
    });

    toast.success(`${product.name} sepete eklendi!`);
  };

  return (
    <Link href={`/urunler/${product.slug}`} className="product-card group block h-full">
      <div 
        className="product-card-image relative overflow-hidden bg-gray-50"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {images.map((img, index) => {
          if (index !== 0 && index !== currentImageIndex && !isHovered) return null; // Sadece ilk resmi ve aktif resmi render et (hover yoksa)
          return (
            <Image
              key={`${img}-${index}`}
              src={img}
              alt={`${product.name} - ${index + 1}`}
              fill
              className={`object-cover transition-opacity duration-1000 ${
                index === currentImageIndex ? "opacity-100" : "opacity-0"
              }`}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          );
        })}

        {images.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 -translate-x-4 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:translate-x-0 group-hover:opacity-100 sm:h-8 sm:w-8"
              aria-label="Önceki görsel"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 flex h-7 w-7 translate-x-4 items-center justify-center rounded-full bg-white/90 text-gray-700 opacity-0 shadow-md backdrop-blur-sm transition-all hover:bg-white group-hover:translate-x-0 group-hover:opacity-100 sm:h-8 sm:w-8"
              aria-label="Sonraki görsel"
            >
              <ChevronRight size={18} />
            </button>
            
            {/* Nokta Göstergeleri (Dots) */}
            <div className="absolute bottom-3 left-1/2 z-20 flex -translate-x-1/2 gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === currentImageIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
                  }`}
                />
              ))}
            </div>
          </>
        )}

        <div className="absolute left-2 top-2 flex flex-col gap-1 sm:left-3 sm:top-3 sm:gap-1.5 z-10 pointer-events-none">
          {hasDiscount && <span className="badge-discount">-%{discountPercent}</span>}
          {product.isNew && <span className="badge-new">Yeni</span>}
          {product.isBestSeller && (
            <span className="badge-bestseller">
              <TrendingUp size={10} />
              Çok Satan
            </span>
          )}
        </div>

        {product.isNatural && (
          <div className="absolute right-2 top-2 hidden min-[380px]:block sm:right-3 sm:top-3">
            <span className="badge-natural">
              <Leaf size={10} />
              Doğal
            </span>
          </div>
        )}

        {!requiresQuote && <button
          onClick={handleAddToCart}
          className="btn-primary absolute bottom-3 left-1/2 hidden -translate-x-1/2 whitespace-nowrap px-3 py-2 text-xs opacity-100 shadow-lg transition-all duration-300 sm:inline-flex sm:translate-y-2 sm:px-4 sm:text-sm sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100"
        >
          <ShoppingCart size={14} />
          Sepete Ekle
        </button>}
      </div>

      <div className="flex min-h-[138px] flex-col p-2.5 sm:min-h-[168px] sm:p-4">
        <p className="mb-1 truncate text-[11px] font-medium text-brand-600 sm:text-xs">
          {product.category.name}
        </p>
        <h3 className="mb-1.5 line-clamp-2 min-h-[2.5rem] font-sans text-[13px] font-bold leading-tight text-gray-900 sm:mb-2 sm:text-base">
          {product.name}
        </h3>

        <p className="mb-2 line-clamp-2 min-h-[2.1rem] text-[11px] leading-relaxed text-gray-500 sm:text-xs">
          {product.shortDesc || "Taze ve özenle paketlenen mağaza ürünü."}
        </p>

        {avgRating > 0 && (
          <div className="mb-1.5 flex items-center gap-0.5 sm:mb-2 sm:gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                size={11}
                className={
                  index < Math.round(avgRating)
                    ? "fill-amber-400 text-amber-400"
                    : "fill-gray-200 text-gray-200"
                }
              />
            ))}
            <span className="ml-0.5 text-[11px] text-gray-500 sm:ml-1 sm:text-xs">
              ({reviews.length})
            </span>
          </div>
        )}

        {product.variants.length > 0 && (
          <div className="mb-2 flex gap-1 overflow-hidden sm:mb-3 sm:flex-wrap">
            {product.variants.slice(0, 2).map((variant) => (
              <span
                key={variant.id}
                className="truncate rounded-md bg-gray-100 px-1.5 py-0.5 text-[10px] text-gray-600 sm:px-2 sm:text-xs"
              >
                {variant.weight}
              </span>
            ))}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-1.5 sm:gap-2">
          <div className="min-w-0">
            <span className="price-current">
              {requiresQuote ? "Fiyat Sorunuz" : `${price.toFixed(2)} ₺`}
            </span>
            {hasDiscount && (
              <span className="price-original ml-0 block sm:ml-2 sm:inline">
                {product.basePrice.toFixed(2)} ₺
              </span>
            )}
            <p className="mt-0.5 truncate text-[10px] text-gray-400 sm:text-xs">
              {requiresQuote ? "Sipariş öncesi teyit" : `${cheapestVariant?.weight || "1 kg"} için`}
            </p>
          </div>
          {!requiresQuote && <button
            onClick={handleAddToCart}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm transition-colors hover:bg-brand-700 sm:h-9 sm:w-9 sm:rounded-xl"
            aria-label="Sepete ekle"
          >
            <Plus size={16} className="sm:hidden" />
            <ShoppingCart size={16} className="hidden sm:block" />
          </button>}
        </div>
      </div>
    </Link>
  );
}
