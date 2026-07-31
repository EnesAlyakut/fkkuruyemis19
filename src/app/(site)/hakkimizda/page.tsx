import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Award, Leaf, Heart, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "Hakkımızda",
  description:
    "FK Kuruyemiş olarak doğanın en taze ve en doğal lezzetlerini en saf haliyle sofralarınıza ulaştırıyoruz. Çorum'un bereketli topraklarından aldığımız güçle, geleneksel yöntemlerle hazırlıyoruz.",
};

export default function HakkimizdaPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-brand-600 to-brand-500 py-14 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 opacity-15">
          <div className="w-full h-full" style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #fde8b0 0%, transparent 50%), radial-gradient(circle at 70% 50%, #fff9ec 0%, transparent 50%)" }} />
        </div>
        <div className="container-main relative z-10 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white font-display mb-4 sm:mb-6">
            Hakkımızda
          </h1>
          <p className="text-brand-100 text-base sm:text-xl max-w-2xl mx-auto">
            Dalından Sofranıza — FK Kuruyemiş'in Hikayesi
          </p>
        </div>
      </div>

      {/* Story */}
      <div className="container-main py-12 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center mb-12 sm:mb-20">
          <div>
            <span className="text-brand-600 font-semibold text-sm uppercase tracking-wider mb-3 block">
              Hikayemiz
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 font-display mb-6">
              Dalından Sofranıza, FK Kuruyemiş'in Hikayesi
            </h2>
            <div className="space-y-4 text-gray-600 leading-relaxed">
              <p>
                FK Kuruyemiş olarak yolculuğumuza, doğanın bize sunduğu en taze ve en doğal
                lezzetleri en saf haliyle sofralarınıza ulaştırma hayaliyle başladık.
                Kuruyemişin sadece bir atıştırmalık değil, aynı zamanda bir kültür,
                bir sohbet eşlikçisi ve bir sağlık kaynağı olduğuna inanıyoruz.
              </p>
              <p>
                Yılların verdiği tecrübe ve kuruyemişin merkezi Çorum'un bereketli
                topraklarından aldığımız güçle, her bir nohudu özenle seçiyor, her bir
                çekirdeği tam kıvamında kavuruyoruz. Bizim için <strong>'tazelik'</strong> sadece
                bir kelime değil, markamızın en temel sözüdür. Ürünlerimizi hazırlarken
                geleneksel yöntemleri modern hijyen standartlarıyla birleştiriyor,
                doğallıktan asla ödün vermiyoruz.
              </p>
              <p>
                FK Kuruyemiş ailesi olarak, ailemize yedirmeyeceğimiz hiçbir ürünü sizin
                sofranıza göndermiyoruz. En taze leblebiden, en çıtır fındığa kadar geniş
                ürün yelpazemizle, <strong>sağlığı ve lezzeti kapınıza getiriyoruz.</strong>
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-square rounded-3xl overflow-hidden shadow-warm-lg">
              <Image
                src="/images/hakkimizda-bg.png"
                alt="FK KURUYEMİŞ - Leblebi Fıçı"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={82}
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-6 bg-brand-600 text-white p-4 sm:p-5 rounded-2xl shadow-lg">
              <p className="text-3xl sm:text-4xl font-bold font-display">30+</p>
              <p className="text-brand-200 text-sm">Yıllık Tecrübe</p>
            </div>
          </div>
        </div>

        {/* Values */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 font-display">
            Değerlerimiz
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
          {[
            { icon: Leaf, title: "Doğallık", desc: "Hiçbir ürününe yapay katkı maddesi eklenmez.", color: "text-forest-600 bg-forest-50" },
            { icon: Award, title: "Kalite", desc: "Her parti ürün sevkiyat öncesinde test edilir.", color: "text-brand-600 bg-brand-50" },
            { icon: Heart, title: "Tutku", desc: "İşimizi sevgi ve tutkuyla yapıyoruz.", color: "text-red-600 bg-red-50" },
            { icon: Star, title: "Güven", desc: "Açık ürün bilgisi ve özenli paketleme.", color: "text-amber-600 bg-amber-50" },
          ].map((v) => {
            const Icon = v.icon;
            return (
              <div key={v.title} className="text-center p-6 rounded-2xl bg-gray-50 hover:shadow-warm transition-all hover:-translate-y-1 duration-300">
                <div className={`w-14 h-14 ${v.color} rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <Icon size={24} />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-gray-500 text-sm">{v.desc}</p>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="text-center bg-gradient-to-r from-brand-600 to-brand-700 rounded-3xl p-6 sm:p-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white font-display mb-4">
            Bizimle Alışveriş Yapın
          </h2>
          <p className="text-white/80 mb-8 text-base sm:text-lg">
            Çorum'un bereketli topraklarından sofralarınıza, taze ve doğal lezzetler sizi bekliyor.
          </p>
          <Link
            href="/urunler"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 sm:px-8 py-4 bg-white text-brand-700 font-bold rounded-2xl hover:bg-brand-50 transition-colors text-base sm:text-lg"
          >
            Ürünleri Keşfet
          </Link>
        </div>
      </div>
    </div>
  );
}
