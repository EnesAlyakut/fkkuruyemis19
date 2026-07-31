"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ChevronDown, Menu, Search, ShoppingCart, X, Clock } from "lucide-react";
import { useCartStore } from "@/store/cartStore";

type NavCategory = {
  name: string;
  href: string;
};

const fallbackCategories: NavCategory[] = [
  { name: "Leblebi", href: "/kategori/leblebi" },
  { name: "Kuruyemiş", href: "/kategori/kuruyemis" },
  { name: "Kuru Meyve", href: "/kategori/kuru-meyve" },
  { name: "Karışık Paket", href: "/kategori/karisik-paket" },
  { name: "Hediyelik Kutu", href: "/kategori/hediyelik-kutu" },
  { name: "LüksLeb Kurabiyeleri", href: "/kategori/luksleb-kurabiyeleri" },
  { name: "Çorum Hatırası Kutular", href: "/kategori/corum-hatirasi-kutular" },
  { name: "Karışık Hediyelikler", href: "/kategori/karisik-hediyelikler" },
  { name: "Boş Ambalajlar", href: "/kategori/bos-ambalajlar" },
  { name: "Hatıra Ürünleri", href: "/kategori/hatira-urunleri" },
];

const navLinks = [
  { name: "Ana Sayfa", href: "/" },
  { name: "Ürünler", href: "/urunler", hasDropdown: true },
  { name: "Blog", href: "/blog" },
  { name: "Hakkımızda", href: "/hakkimizda" },
  { name: "İletişim", href: "/iletisim" },
];

const announcementMessages = [
  "🌰 Bir avuç leblebi, hem midene hem ruhuna iyi gelir.",
  "✨ Çorum'un leblebisi; asırlık ateşte, özenli ellerde kavrulur.",
  "🥜 Kuruyemiş tüketmek için bahane arama, yiyin yeter!",
  "💛 Günde bir avuç ceviz yiyen beyin 'teşekkür ederim' der.",
  "🌿 Doğal, katkısız, taze — çünkü iyi şeyler basit olur.",
  "😄 Mutlu olmak için bazen tek gereken bir kâse leblebidir.",
  "🎁 En güzel hediye; içi dolu, kalbi sıcak bir kuruyemiş kutusu.",
  "🏔️ Çorum dağlarının havası leblebiye geçer, leblebiden size.",
  "🌰 Fıstık, ceviz, badem — doğanın küçük enerji depoları.",
  "☕ Çayın yanında leblebi; Çorum'un en kadim ikilisi.",
  "💪 Spor sonrası bir avuç badem, hem kas hem moral yapar.",
  "🤎 Kuru kayısı tatlı isteğini bastırır — neredeyse!",
  "🌱 İyi kuruyemiş; tarladan sofraya kısa yoldan gelir.",
  "✨ Sevdiklerinize Çorum'dan bir lezzet gönderin, anlatsınlar!",
];

function LiveClock() {
  const [time, setTime] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }));
      setDate(now.toLocaleDateString("tr-TR", { weekday: "short", day: "numeric", month: "short" }));
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  if (!time) return null;

  return (
    <div className="hidden md:flex items-center gap-2 rounded-xl border-2 border-brand-200 bg-brand-50 px-3 py-1.5 ml-6 shadow-sm">
      <Clock size={14} className="text-brand-600 shrink-0" />
      <div className="leading-none">
        <span className="block text-sm font-black text-brand-800 tracking-tight">{time}</span>
        <span className="block text-[10px] text-brand-500 capitalize mt-0.5">{date}</span>
      </div>
    </div>
  );
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [categories, setCategories] = useState<NavCategory[]>(fallbackCategories);
  const [announcementIndex, setAnnouncementIndex] = useState(0);
  const [announcementVisible, setAnnouncementVisible] = useState(true);
  const pathname = usePathname();
  const items = useCartStore((state) => state.items);
  const hasHydrated = useCartStore((state) => state.hasHydrated);

  const totalItems =
    mounted && hasHydrated
      ? items.reduce((sum, item) => sum + item.quantity, 0)
      : 0;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnnouncementVisible(false);
      setTimeout(() => {
        setAnnouncementIndex((i) => (i + 1) % announcementMessages.length);
        setAnnouncementVisible(true);
      }, 400);
    }, 7000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let ignore = false;

    fetch("/api/kategoriler?withCount=false")
      .then((response) => (response.ok ? response.json() : []))
      .then((data: Array<{ name: string; slug: string }>) => {
        if (!ignore && Array.isArray(data) && data.length > 0) {
          setCategories(
            data.map((category) => ({
              name: category.name,
              href: `/kategori/${category.slug}`,
            }))
          );
        }
      })
      .catch(() => undefined);

    return () => {
      ignore = true;
    };
  }, []);

  const handleScroll = useCallback(() => {
    setIsScrolled(window.scrollY > 20);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.classList.toggle("mobile-menu-open", isMenuOpen);
    return () => document.body.classList.remove("mobile-menu-open");
  }, [isMenuOpen]);

  return (
    <>
      <div className="bg-gradient-to-r from-brand-700 via-brand-600 to-amber-500 py-1.5 text-center text-[11px] font-medium text-white sm:py-2 sm:text-sm overflow-hidden">
        <span className="container-main flex items-center justify-center leading-snug px-3">
          <span
            style={{
              display: "inline-block",
              opacity: announcementVisible ? 1 : 0,
              transform: announcementVisible ? "translateY(0)" : "translateY(-8px)",
              transition: "opacity 0.35s ease, transform 0.35s ease",
            }}
          >
            {announcementMessages[announcementIndex]}
          </span>
        </span>
      </div>

      <nav
        className={`sticky top-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-cream-50/95 backdrop-blur-md shadow-sm border-b border-brand-100"
            : "bg-white border-b border-brand-50"
        }`}
      >
        <div className="container-main">
          <div className="flex h-14 items-center justify-between gap-2 md:h-20">
            <Link href="/" className="flex min-w-0 shrink items-center gap-2">
              <Image
                src="/images/logo_circular.png"
                alt="FATİH KARAKUŞ Logo"
                width={36}
                height={36}
                className="object-contain shrink-0"
                priority
              />
              <div className="min-w-0">
                <span className="block max-w-[9rem] truncate text-sm font-bold text-brand-700 font-display sm:max-w-none sm:text-xl">
                  FATİH KARAKUŞ
                </span>
                <p className="text-xs text-brand-500 hidden sm:block">
                  Doğal & Taze
                </p>
              </div>
            </Link>


            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) =>
                link.hasDropdown ? (
                  <div
                    key={link.name}
                    className="relative"
                    onMouseEnter={() => setIsDropdownOpen(true)}
                    onMouseLeave={() => setIsDropdownOpen(false)}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-1 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                        pathname.startsWith("/urunler")
                          ? "text-brand-700 bg-brand-50"
                          : "text-gray-700 hover:text-brand-700 hover:bg-brand-50"
                      }`}
                    >
                      {link.name}
                      <ChevronDown
                        size={14}
                        className={`transition-transform duration-200 ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </Link>
                    {isDropdownOpen && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-warm-lg border border-brand-100 overflow-hidden animate-fade-in z-50">
                        {categories.map((category) => (
                          <Link
                            key={category.name}
                            href={category.href}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-brand-50 hover:text-brand-700 transition-colors border-b border-gray-50 last:border-0"
                          >
                            {category.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
                      pathname === link.href
                        ? "text-brand-700 bg-brand-50"
                        : "text-gray-700 hover:text-brand-700 hover:bg-brand-50"
                    }`}
                  >
                    {link.name}
                  </Link>
                )
              )}
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="btn-icon hidden sm:flex"
                aria-label="Ara"
              >
                <Search size={18} />
              </button>

              <Link
                href="/sepet"
                className="relative btn-icon"
                aria-label={`Sepet - ${totalItems} ürün`}
              >
                <ShoppingCart size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-600 text-white text-xs font-bold rounded-full flex items-center justify-center animate-fade-in">
                    {totalItems > 99 ? "99+" : totalItems}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="btn-icon lg:hidden"
                aria-label="Menü"
              >
                {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
              <LiveClock />
            </div>
          </div>

          {searchOpen && (
            <div className="pb-3 animate-slide-up">
              <form action="/urunler" method="get" className="flex gap-2">
                <input
                  type="search"
                  name="ara"
                  placeholder="Leblebi, kuruyemiş veya hediye kutusu ara..."
                  className="input-field"
                  autoFocus
                />
                <button type="submit" className="btn-primary px-4">
                  <Search size={16} />
                </button>
              </form>
            </div>
          )}
        </div>

        {isMenuOpen && (
          <div className="max-h-[calc(100svh-6.5rem)] overflow-y-auto overscroll-contain border-t border-gray-100 bg-white animate-slide-up lg:hidden">
            <div className="container-main py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block rounded-xl px-4 py-3 text-center font-medium transition-all ${
                    pathname === link.href
                      ? "text-brand-700 bg-brand-50"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-2 border-t border-gray-100">
                <p className="px-4 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Kategoriler
                </p>
                <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
                  {categories.map((category) => (
                    <Link
                      key={category.name}
                      href={category.href}
                      className="block rounded-xl px-4 py-2.5 text-center text-sm text-gray-600 transition-colors hover:bg-brand-50 hover:text-brand-700"
                    >
                      {category.name}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-2">
                <form action="/urunler" method="get">
                  <input
                    type="search"
                    name="ara"
                    placeholder="Ürün ara..."
                    className="input-field"
                  />
                </form>
              </div>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
