import { Truck, ShieldCheck, PackageCheck, Store } from "lucide-react";

const features = [
  {
    icon: Truck,
    title: "Güvenli Gönderim",
    desc: "Darbeye karşı özenli paket",
    color: "text-blue-600",
    bg: "bg-blue-50",
  },
  {
    icon: ShieldCheck,
    title: "Güvenli Ödeme",
    desc: "256-bit SSL",
    color: "text-green-600",
    bg: "bg-green-50",
  },
  {
    icon: Store,
    title: "Çorum Mağazası",
    desc: "Doğrudan leblebiciden",
    color: "text-forest-600",
    bg: "bg-forest-50",
  },
  {
    icon: PackageCheck,
    title: "Taze Paketleme",
    desc: "Siparişe özenli hazırlık",
    color: "text-purple-600",
    bg: "bg-purple-50",
  },
];

export default function FeaturesBar() {
  return (
    <section className="border-b border-gray-100 bg-white py-6 sm:py-10">
      <div className="container-main">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="flex min-h-[118px] flex-col items-center justify-center gap-2 rounded-xl bg-gray-50/70 p-3 text-center transition-colors hover:bg-gray-50 sm:min-h-0 sm:rounded-2xl sm:p-4"
              >
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} ${feature.color}`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-xs font-semibold leading-snug text-gray-900 sm:text-sm">
                    {feature.title}
                  </p>
                  <p className="text-[11px] text-gray-500 sm:text-xs">{feature.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
