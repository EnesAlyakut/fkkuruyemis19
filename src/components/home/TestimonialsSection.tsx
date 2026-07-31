import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Ayşe Kaya",
    city: "İstanbul",
    rating: 5,
    text: "Sarı leblebi tam da aradığım gibiydi! Çorum'dan sanki yeni gelmiş gibi taze. Artık düzenli sipariş veriyorum. Kargo da çok hızlı geldi.",
    product: "Sarı Leblebi",
  },
  {
    id: 2,
    name: "Mehmet Yılmaz",
    city: "Ankara",
    rating: 5,
    text: "Antep fıstığı inanılmaz kaliteli! Büyük taneli ve dolgun. Fiyat da piyasaya göre çok makul. Kesinlikle tavsiye ederim.",
    product: "Antep Fıstığı",
  },
  {
    id: 3,
    name: "Fatma Öztürk",
    city: "İzmir",
    rating: 5,
    text: "Hediyelik kutu anneme bayram hediyesi olarak gönderdim. Çok beğendi, paketi de çok şık. Müşteri hizmetleri de çok ilgili.",
    product: "Hediyelik Kutu",
  },
  {
    id: 4,
    name: "Ali Demir",
    city: "Bursa",
    rating: 4,
    text: "Çifte kavrulmuş leblebi gerçekten farklı bir lezzet. Ekstra çıtır ve aromatik. Çayın yanında mükemmel. Tavsiyem: büyük boy alın!",
    product: "Çifte Kavrulmuş",
  },
];

export default function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-10 sm:py-20">
      <div className="container-main">
        <div className="mb-7 text-center sm:mb-14">
          <h2 className="section-title">Müşteri Yorumları</h2>
          <p className="section-subtitle mx-auto">
            30.000+ mutlu müşterimizin deneyimleri
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={20} className="text-amber-400 fill-amber-400" />
            ))}
            <span className="basis-full text-sm font-semibold text-gray-600 sm:ml-2 sm:basis-auto sm:text-base">
              4.9/5 (2.400+ değerlendirme)
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t) => (
            <div key={t.id} className="card relative p-5 text-center sm:p-6 sm:text-left">
              <Quote
                size={32}
                className="text-brand-200 absolute top-4 right-4"
              />
              <div className="mb-3 flex items-center justify-center gap-1 sm:justify-start">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={14}
                    className={
                      i < t.rating
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed mb-4 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div className="flex items-center justify-between gap-2 border-t border-gray-100 pt-3 text-left">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                  <p className="text-xs text-gray-400">{t.city}</p>
                </div>
                <span className="text-xs bg-brand-50 text-brand-600 px-2 py-1 rounded-lg font-medium">
                  {t.product}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
