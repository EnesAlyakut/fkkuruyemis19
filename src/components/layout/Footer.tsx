import Link from "next/link";
import Image from "next/image";
import NewsletterForm from "@/components/ui/NewsletterForm";
import { getSiteSettings } from "@/lib/settings";
import {
  Phone,
  MapPin,
  Instagram,
  Facebook,
  MessageCircle,
  Mail,
} from "lucide-react";

const whatsappNumber =
  process.env.NEXT_PUBLIC_WHATSAPP_NUMBER?.replace(/[^0-9]/g, "") ||
  "905058898828";

const footerLinks = {
  urunler: [
    { name: "LüksLeb Kurabiyeleri", href: "/kategori/luksleb-kurabiyeleri" },
    { name: "Çorum Hatırası Kutular", href: "/kategori/corum-hatirasi-kutular" },
    { name: "Karışık Hediyelikler", href: "/kategori/karisik-hediyelikler" },
    { name: "Boş Ambalajlar", href: "/kategori/bos-ambalajlar" },
    { name: "Hatıra Ürünleri", href: "/kategori/hatira-urunleri" },
  ],
  kurumsal: [
    { name: "Hakkımızda", href: "/hakkimizda" },
    { name: "Blog", href: "/blog" },
    { name: "İletişim", href: "/iletisim" },
  ],
  musteri: [
    { name: "Sepetim", href: "/sepet" },
    { name: "Tüm Ürünler", href: "/urunler" },
    { name: "Bize Ulaşın", href: "/iletisim" },
  ],
};

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="bg-stone-900 text-gray-300">
      {/* Newsletter Banner */}
      <div className="bg-brand-600 py-12 sm:py-16">
        <div className="container-main text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white text-brand-600 mb-6 shadow-sm">
            <Mail size={32} strokeWidth={1.5} />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 font-display">
            Kampanyalardan Haberdar Olun
          </h2>
          <p className="text-brand-100 mb-8 max-w-lg mx-auto text-lg">
            E-posta listemize katılın, ilk alışverişinize özel <span className="font-bold text-white">%10 indirim</span> kazanın!
          </p>
          <NewsletterForm />
        </div>
      </div>

      {/* Main Footer */}
      <div className="py-10 sm:py-16">
        <div className="container-main">
          <div className="grid grid-cols-1 gap-8 text-center sm:grid-cols-2 sm:text-left lg:grid-cols-5 lg:gap-12">
            {/* Brand Info */}
            <div className="sm:col-span-2 lg:col-span-2">
              <Link href="/" className="mb-4 flex items-center justify-center gap-3 sm:justify-start">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-white shadow-md ring-2 ring-white/15">
                  <Image
                    src="/images/logo_circular.png"
                    alt={`${settings.siteName} Logo`}
                    fill
                    sizes="48px"
                    className="object-contain"
                  />
                </div>
                <div>
                  <span className="text-xl font-bold text-white font-display uppercase">
                    {settings.siteName}
                  </span>
                  <p className="text-brand-400 text-sm">Doğal & Taze</p>
                </div>
              </Link>
              <p className="mx-auto mb-6 max-w-xs text-sm leading-relaxed text-gray-400 sm:mx-0">
                1995'ten bu yana Çorum'un eşsiz leblebileri, Çorum Hatırası
                hediyelikleri ve LüksLeb özel ürünleri sizinle. Şık ambalaj,
                taze dolum ve hızlı teslimat garantisi.
              </p>
              <div className="space-y-3">
                <a
                  href={`tel:${(settings?.contactPhone || "+90 505 889 88 28").replace(/\s/g, "")}`}
                  className="flex items-center justify-center gap-2 text-sm transition-colors hover:text-brand-400 sm:justify-start"
                >
                  <Phone size={14} className="text-brand-500" />
                  {settings?.contactPhone || "+90 505 889 88 28"}
                </a>
                <div className="flex items-start justify-center gap-2 text-sm sm:justify-start">
                  <MapPin
                    size={14}
                    className="text-brand-500 mt-0.5 shrink-0"
                  />
                  {settings.address}
                </div>
              </div>
              <div className="mt-6 flex items-center justify-center gap-3 sm:justify-start">
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-pink-600 rounded-xl flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 bg-gray-800 hover:bg-green-600 rounded-xl flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle size={16} />
                </a>
              </div>
            </div>

            {/* Products */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Ürünler
              </h3>
              <ul className="space-y-2">
                {footerLinks.urunler.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Corporate */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Kurumsal
              </h3>
              <ul className="space-y-2">
                {footerLinks.kurumsal.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Customer */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wider">
                Müşteri Hizmetleri
              </h3>
              <ul className="space-y-2">
                {footerLinks.musteri.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-brand-400 transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-6 p-3 bg-gray-800 rounded-xl">
                <p className="text-xs text-gray-400 font-medium mb-1">
                  Çalışma Saatleri
                </p>
                <p className="text-xs text-white">Hafta içi & Cumartesi: 09:00 - 20:00</p>
                <p className="text-xs text-gray-500">Pazar: Kapalı</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800 py-6">
        <div className="container-main flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © {new Date().getFullYear()} {settings.siteName}. Tüm hakları saklıdır.
          </p>
          <div className="flex items-center gap-3 sm:gap-4 flex-wrap justify-center">
            <span className="text-xs text-gray-600">
              Güvenli ödeme ile korunuyorsunuz
            </span>
            <div className="flex gap-2">
              {["Visa", "MC", "Iyzico"].map((pay) => (
                <span
                  key={pay}
                  className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 font-mono"
                >
                  {pay}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
