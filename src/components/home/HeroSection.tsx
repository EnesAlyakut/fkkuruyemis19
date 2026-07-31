"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, MapPin, ShieldCheck, Sparkles, Truck, Star, Package } from "lucide-react";

const trustItems = [
  { icon: MapPin, title: "Çorum'dan", text: "Doğrudan mağazamızdan" },
  { icon: Gift, title: "Özenli paket", text: "Hediyeye hazır sunum" },
  { icon: Truck, title: "Türkiye geneli", text: "Güvenli gönderim" },
];

const heroSlides = [
  { src: "/images/hero-leblebi-1.jpg", alt: "Çorum leblebisi ve seçkin kuruyemişler" },
  { src: "/images/hero-karisik-kuruyemis.png", alt: "Premium karışık kuruyemiş ve kuru meyve seçkisi" },
  { src: "/images/hero-leblebi-2.jpg", alt: "Leblebi, kuruyemiş ve kuru meyve seçkisi" },
  { src: "/images/hero-hediyelik-kutu.png", alt: "Özel hediyelik kuruyemiş kutusu sunumu" },
  { src: "/images/hero-leblebi-3.jpg", alt: "Özenle hazırlanan hediyelik leblebi kutusu" },
];


const stats = [
  { icon: Star, value: "4.9", label: "Müşteri puanı", color: "#f59e0b" },
  { icon: Package, value: "500+", label: "Ürün çeşidi", color: "#34d399" },
  { icon: Truck, value: "10K+", label: "Teslimat", color: "#60a5fa" },
];

export default function HeroSection() {
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;
    const interval = window.setInterval(() => {
      setActiveSlide((c) => (c + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <section className="relative isolate overflow-hidden bg-stone-950">
      {/* Slides */}
      {heroSlides.map((slide, index) => {
        if (index !== activeSlide && index !== 0) return null; // Avoid rendering hidden slides initially to save bandwidth
        return (
          <Image
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fill
            priority={index === 0}
            quality={84}
            sizes="100vw"
            unoptimized={slide.src.endsWith(".png")}
            aria-hidden={index !== activeSlide}
            className={`object-cover object-center transition-opacity duration-1000 ease-in-out ${
              index === activeSlide ? "opacity-100" : "opacity-0"
            }`}
          />
        );
      })}

      {/* Overlays */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(15,10,5,.97)_0%,rgba(15,10,5,.80)_50%,rgba(15,10,5,.35)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(245,158,11,.18),transparent_40%)]" />

      {/* Live clock removed - now in Navbar */}

      <div className="container-main relative flex min-h-[680px] items-center py-24 sm:min-h-[720px] lg:min-h-[760px]">
        <div className="max-w-2xl">

          {/* Badge */}
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-300/30 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-200 backdrop-blur-sm">
            <Sparkles size={15} className="text-amber-400" fill="#f59e0b" />
            Çorum&apos;un geleneksel lezzeti, özenli sunumla
          </div>

          {/* Heading */}
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Leblebiciden çıkan
            <span className="mt-2 block" style={{ color: "#f59e0b" }}>gerçek lezzet,</span>
            <span className="mt-1 block text-3xl sm:text-4xl lg:text-5xl font-bold text-white/80">kapınıza kadar.</span>
          </h1>

          <p className="mt-6 max-w-xl text-sm leading-7 text-stone-300 sm:text-base">
            Çorum leblebisi, taze kuruyemiş, özel draje ve hediyelik kutular.
            Mağazamızda gördüğünüz ürünleri anlaşılır fiyatlarla, güvenle keşfedin.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/urunler"
              className="group inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-amber-500 px-7 text-base font-bold text-stone-950 shadow-[0_12px_32px_rgba(245,158,11,.35)] transition hover:bg-amber-400"
            >
              Ürünleri Keşfet
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/kategori/corum-hatirasi-kutular"
              className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/10 px-7 text-base font-bold text-white backdrop-blur-sm transition hover:border-amber-300/50 hover:bg-white/15"
            >
              <Gift size={18} />
              Hediyelik Kutular
            </Link>
          </div>

          {/* Stats row */}
          <div className="mt-10 flex flex-wrap gap-4">
            {stats.map(({ icon: Icon, value, label, color }) => (
              <div key={label} className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-black/30 px-4 py-2.5 backdrop-blur-sm">
                <Icon size={16} style={{ color }} />
                <span className="text-base font-black text-white">{value}</span>
                <span className="text-xs text-stone-400">{label}</span>
              </div>
            ))}
          </div>

          {/* Trust items */}
          <div className="mt-6 grid max-w-xl grid-cols-1 gap-2.5 sm:grid-cols-3">
            {trustItems.map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/25 p-3 backdrop-blur-sm">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-400/15 text-amber-300">
                  <Icon size={17} />
                </span>
                <span>
                  <span className="block text-xs font-bold text-white">{title}</span>
                  <span className="block text-[11px] text-stone-400">{text}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div
        className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/15 bg-black/35 px-3 py-2 backdrop-blur-sm"
        role="group"
        aria-label="Ana sayfa görselleri"
      >
        {heroSlides.map((slide, index) => (
          <button
            key={slide.src}
            type="button"
            onClick={() => setActiveSlide(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeSlide ? "w-7 bg-amber-400" : "w-2 bg-white/50 hover:bg-white"
            }`}
            aria-label={`${index + 1}. görseli göster`}
            aria-current={index === activeSlide ? "true" : undefined}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />
      <span className="sr-only"><ShieldCheck /> Güvenli alışveriş</span>
    </section>
  );
}
