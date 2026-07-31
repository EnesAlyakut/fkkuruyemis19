import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, MapPin, PackageCheck, Scale } from "lucide-react";

const reasons = [
  { icon: MapPin, title: "Çorum'da mağaza", text: "Ürünlerimizi yerinde seçiyor ve hazırlıyoruz." },
  { icon: PackageCheck, title: "Özenli hazırlık", text: "Her sipariş gönderim öncesi kontrol edilip paketleniyor." },
  { icon: Scale, title: "Açık fiyat bilgisi", text: "Ürün ve gramaj seçeneklerini satın almadan önce görürsünüz." },
  { icon: CheckCircle2, title: "Gerçek ürün sunumu", text: "Ürünleri gerçeğine sadık, anlaşılır görsellerle sergiliyoruz." },
];

export default function WhyUs() {
  return (
    <section className="bg-stone-950 py-14 text-white sm:py-24">
      <div className="container-main grid items-center gap-10 lg:grid-cols-[1.05fr_.95fr] lg:gap-16">
        <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/10 bg-stone-900 shadow-2xl">
          <Image
            src="/images/hakkimizda-bg.png"
            alt="FK Kuruyemiş Çorum mağazası ve geleneksel leblebi ürünleri"
            fill
            sizes="(max-width: 1024px) 100vw, 52vw"
            quality={82}
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
          <div className="absolute bottom-0 left-0 p-6 sm:p-8">
            <p className="text-sm font-semibold uppercase tracking-[.18em] text-amber-300">Çorum&apos;dan sofranıza</p>
            <p className="mt-2 max-w-md text-xl font-bold text-white sm:text-2xl">Geleneksel lezzeti modern ve güvenilir alışverişle buluşturuyoruz.</p>
          </div>
        </div>

        <div>
          <p className="text-sm font-bold uppercase tracking-[.2em] text-amber-400">Neden FK Kuruyemiş?</p>
          <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-5xl">Leblebiciden alışveriş yaptığınız belli olsun.</h2>
          <p className="mt-5 max-w-xl leading-7 text-stone-300">Çorum&apos;un leblebi kültürünü; sade ürün bilgisi, düzenli kategori yapısı ve özenli paketlemeyle çevrim içi mağazamıza taşıyoruz.</p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {reasons.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-white/10 bg-white/[.04] p-5">
                <Icon size={22} className="text-amber-400" aria-hidden="true" />
                <h3 className="mt-3 text-base font-bold text-white">{title}</h3>
                <p className="mt-1 text-sm leading-6 text-stone-400">{text}</p>
              </div>
            ))}
          </div>

          <Link href="/hakkimizda" className="mt-8 inline-flex items-center gap-2 font-bold text-amber-400 transition hover:text-amber-300">
            Hikâyemizi okuyun <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </section>
  );
}
