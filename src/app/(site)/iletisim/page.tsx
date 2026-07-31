import type { Metadata } from "next";
import { MapPin, Phone, Clock, MessageCircle, Mail, Package } from "lucide-react";
import ContactForm from "@/components/ui/ContactForm";
import { getSiteSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "İletişim",
  description: "FATİH KARAKUŞ ile iletişime geçin. Perakende siparişleriniz veya toptan satış talepleriniz için bize ulaşın.",
};

export default async function IletisimPage() {
  const settings = await getSiteSettings();
  const rawPhone = settings.contactPhone.replace(/[^0-9]/g, "");

  return (
    <div
      className="min-h-screen"
      style={{ background: "linear-gradient(135deg, #fffdf5 0%, #fef6e0 50%, #fff9ec 100%)" }}
    >
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-brand-500 py-12 sm:py-14">
        <div className="container-main text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display mb-4 drop-shadow-sm">
            İletişim
          </h1>
          <p className="text-brand-100 text-base sm:text-lg max-w-2xl mx-auto">
            1997 yılından günümüze, Çorum&apos;un bereketli topraklarından gelen geleneksel
            lezzetleri en taze haliyle sizlerle buluşturuyoruz. Perakende siparişleriniz veya
            toptan satış talepleriniz için bize ulaşın.
          </p>
        </div>
      </div>

      <div className="container-main py-12 sm:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">

          {/* İletişim Kartları */}
          <div className="lg:col-span-2 space-y-5">

            <a
              href={`tel:${settings.contactPhone.replace(/\s/g, "")}`}
              className="flex items-start sm:items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-brand-100 shadow-sm hover:shadow-warm hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-brand-50 text-brand-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-brand-100 transition-colors">
                <Phone size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-brand-500 uppercase tracking-wider mb-0.5">Telefon &amp; WhatsApp</p>
                <p className="text-lg font-bold text-gray-900">{settings.contactPhone}</p>
                <p className="text-sm text-gray-500">Hafta içi ve Cumartesi: 09:00 – 20:00</p>
              </div>
            </a>

            <a
              href={`https://wa.me/${rawPhone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start sm:items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-green-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                <MessageCircle size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-green-500 uppercase tracking-wider mb-0.5">WhatsApp</p>
                <p className="text-lg font-bold text-gray-900">{settings.contactPhone}</p>
                <p className="text-sm text-gray-500">Hızlı yanıt için yazın</p>
              </div>
            </a>

            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(settings.address)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start sm:items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-purple-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-purple-100 transition-colors">
                <MapPin size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-500 uppercase tracking-wider mb-0.5">Adresimiz</p>
                <p className="font-bold text-gray-900 leading-snug line-clamp-2">{settings.address}</p>
              </div>
            </a>

            <a
              href={`mailto:${settings.contactEmail}`}
              className="flex items-start sm:items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-sky-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <div className="w-14 h-14 bg-sky-50 text-sky-600 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-sky-100 transition-colors">
                <Mail size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-sky-500 uppercase tracking-wider mb-0.5">E-Posta</p>
                <p className="font-bold text-gray-900 break-all">{settings.contactEmail}</p>
              </div>
            </a>

            <div className="flex items-start sm:items-center gap-4 p-4 sm:p-5 bg-white rounded-2xl border border-amber-100 shadow-sm">
              <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                <Clock size={22} />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-500 uppercase tracking-wider mb-1">Çalışma Saatleri</p>
                <p className="text-sm text-gray-700 font-medium">Hafta içi ve Cumartesi: 09:00 – 20:00</p>
                <p className="text-sm text-gray-500">Pazar: Kapalı</p>
              </div>
            </div>

            <div
              className="p-5 rounded-2xl"
              style={{ background: "linear-gradient(135deg, #fef6e0, #fde8b0)" }}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-brand-600 text-white rounded-xl flex items-center justify-center shrink-0">
                  <Package size={18} />
                </div>
                <p className="text-brand-800 font-bold text-base">Toptan Alımlar İçin Özel Teklif!</p>
              </div>
              <p className="text-brand-700 text-sm leading-relaxed">
                Türkiye&apos;nin her yerine toptan kuruyemiş ve leblebi gönderimi sağlıyoruz.
                Restoranlar, kafeler ve satış noktaları için özel fiyatlandırma için arayın.
              </p>
            </div>

            <div className="p-4 rounded-2xl text-center border border-brand-100 bg-white">
              <p className="text-brand-700 font-bold text-sm uppercase">{settings.siteName}</p>
              <p className="text-brand-600 text-xs mt-1">Tazeliğin ve Geleneksel Lezzetin Adresi</p>
            </div>
          </div>

          {/* Mesaj Formu */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-brand-100 shadow-warm p-5 sm:p-8 md:p-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 font-display">
              Mesaj Gönderin
            </h2>
            <p className="text-gray-500 text-sm mb-8">En kısa sürede size geri döneceğiz.</p>
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
