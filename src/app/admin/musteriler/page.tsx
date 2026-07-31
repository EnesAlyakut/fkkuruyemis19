import { prisma } from "@/lib/prisma";
import { Users, Mail, Phone, MapPin, ShoppingBag, TrendingUp, Award, Calendar } from "lucide-react";

export const metadata = { title: "Müşteriler" };
export const dynamic = "force-dynamic";

function formatPrice(value: number) {
  return value.toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(name: string) {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n.charAt(0).toUpperCase())
    .join("");
}

const avatarColors = [
  "from-violet-500 to-purple-600",
  "from-blue-500 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-sky-500 to-cyan-600",
  "from-fuchsia-500 to-pink-600",
  "from-lime-500 to-green-600",
];

function getAvatarColor(email: string) {
  let hash = 0;
  for (let i = 0; i < email.length; i++) hash = email.charCodeAt(i) + ((hash << 5) - hash);
  return avatarColors[Math.abs(hash) % avatarColors.length];
}

export default async function AdminMusterilerPage() {
  const orders = await prisma.order.findMany({ orderBy: { createdAt: "desc" } });

  const customersMap = new Map<string, any>();

  for (const order of orders) {
    const email = order.customerEmail.toLowerCase().trim();

    if (!customersMap.has(email)) {
      customersMap.set(email, {
        name: order.customerName,
        email,
        phone: order.customerPhone,
        city: order.city,
        district: order.district,
        totalSpent: 0,
        orderCount: 0,
        lastOrderDate: order.createdAt,
      });
    }

    const customer = customersMap.get(email);

    if (order.status !== "CANCELLED" && order.status !== "REFUNDED") {
      customer.totalSpent += order.total;
      customer.orderCount += 1;
    }

    if (new Date(order.createdAt) > new Date(customer.lastOrderDate)) {
      customer.lastOrderDate = order.createdAt;
      customer.name = order.customerName;
      customer.phone = order.customerPhone;
      customer.city = order.city;
      customer.district = order.district;
    }
  }

  const customers = Array.from(customersMap.values()).sort((a, b) => b.totalSpent - a.totalSpent);
  const totalCustomers = customers.length;
  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const successfulOrders = orders.filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED").length;
  const avgOrderValue = successfulOrders > 0 ? totalRevenue / successfulOrders : 0;

  const statCards = [
    {
      label: "Toplam Müşteri",
      value: totalCustomers.toString(),
      icon: Users,
      gradient: "from-blue-500 to-indigo-600",
      bg: "bg-blue-50",
      text: "text-blue-600",
      sub: "Benzersiz alıcı",
    },
    {
      label: "Başarılı Sipariş",
      value: successfulOrders.toString(),
      icon: ShoppingBag,
      gradient: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      sub: "İptal hariç",
    },
    {
      label: "Toplam Ciro",
      value: `${formatPrice(totalRevenue)} ₺`,
      icon: TrendingUp,
      gradient: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
      text: "text-amber-600",
      sub: "Tüm zamanlar",
    },
    {
      label: "Ort. Sipariş",
      value: `${formatPrice(avgOrderValue)} ₺`,
      icon: Award,
      gradient: "from-violet-500 to-purple-600",
      bg: "bg-violet-50",
      text: "text-violet-600",
      sub: "Sipariş başına",
    },
  ];

  return (
    <div className="p-4 pt-20 sm:p-6 lg:p-8 lg:pt-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-gray-900 sm:text-3xl">Müşteriler</h1>
        <p className="mt-1.5 text-sm text-gray-500">
          Sipariş geçmişine göre sıralanmış {totalCustomers} müşteri
        </p>
      </div>

      {/* Stat Cards */}
      <div className="mb-8 grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${card.gradient} shadow-sm`}>
                  <Icon size={18} className="text-white" />
                </div>
              </div>
              <p className="mt-3 truncate text-lg font-black text-gray-900 sm:text-xl">{card.value}</p>
              <p className="mt-0.5 text-xs font-semibold text-gray-600 sm:text-sm">{card.label}</p>
              <p className="mt-0.5 text-[11px] text-gray-400">{card.sub}</p>
              {/* decorative gradient */}
              <div className={`absolute -right-4 -top-4 h-16 w-16 rounded-full bg-gradient-to-br ${card.gradient} opacity-[0.06]`} />
            </div>
          );
        })}
      </div>

      {/* Desktop Table */}
      <div className="hidden overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm lg:block">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <p className="font-semibold text-gray-800">Müşteri Listesi</p>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
            En yüksek harcamaya göre
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60">
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">#</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Müşteri</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">İletişim</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Konum</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400 text-center">Sipariş</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Toplam</th>
                <th className="px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-gray-400">Son Sipariş</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {customers.map((customer, index) => {
                const avatarGradient = getAvatarColor(customer.email);
                const isTop3 = index < 3;
                return (
                  <tr key={customer.email} className="group transition-colors hover:bg-gray-50/80">
                    <td className="px-6 py-4">
                      {isTop3 ? (
                        <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-black text-white bg-gradient-to-br ${
                          index === 0 ? "from-amber-400 to-orange-500" :
                          index === 1 ? "from-gray-400 to-gray-500" :
                          "from-amber-600 to-amber-700"
                        }`}>
                          {index + 1}
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-gray-400">{index + 1}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-xs font-bold text-white shadow-sm`}>
                          {getInitials(customer.name)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[160px]">{customer.name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1 text-xs text-gray-500">
                        <div className="flex items-center gap-1.5">
                          <Mail size={11} className="shrink-0 text-gray-300" />
                          <span className="truncate max-w-[180px]">{customer.email}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Phone size={11} className="shrink-0 text-gray-300" />
                          <span>{customer.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <MapPin size={11} className="shrink-0 text-gray-300" />
                        <span>{customer.district}, {customer.city}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="inline-flex h-7 min-w-[28px] items-center justify-center rounded-lg bg-brand-50 px-2 text-xs font-bold text-brand-700">
                        {customer.orderCount}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900">{formatPrice(customer.totalSpent)} ₺</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar size={11} className="shrink-0" />
                        {formatDate(customer.lastOrderDate)}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {customers.length === 0 && (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-50">
                <Users size={28} className="text-gray-300" />
              </div>
              <p className="font-semibold text-gray-700">Henüz kayıtlı müşteri yok</p>
              <p className="mt-1 text-sm text-gray-400">Sipariş alındıkça müşteriler burada listelenecektir.</p>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="space-y-3 lg:hidden">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-700">Müşteri Listesi</p>
          <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-semibold text-gray-500">
            En yüksek harcama
          </span>
        </div>

        {customers.map((customer, index) => {
          const avatarGradient = getAvatarColor(customer.email);
          const isTop3 = index < 3;
          return (
            <div
              key={customer.email}
              className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm"
            >
              {/* Top bar — sadece ilk 3 için */}
              {isTop3 && (
                <div className={`h-1 w-full bg-gradient-to-r ${
                  index === 0 ? "from-amber-400 to-orange-500" :
                  index === 1 ? "from-gray-300 to-gray-400" :
                  "from-amber-600 to-amber-700"
                }`} />
              )}

              <div className="p-4">
                <div className="flex items-center gap-3">
                  {/* Rank + Avatar */}
                  <div className="relative shrink-0">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient} text-sm font-bold text-white shadow-md`}>
                      {getInitials(customer.name)}
                    </div>
                    {isTop3 && (
                      <span className={`absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white bg-gradient-to-br ${
                        index === 0 ? "from-amber-400 to-orange-500" :
                        index === 1 ? "from-gray-400 to-gray-500" :
                        "from-amber-600 to-amber-700"
                      } shadow-sm`}>
                        {index + 1}
                      </span>
                    )}
                  </div>

                  {/* Name + email */}
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-gray-900 truncate">{customer.name}</p>
                    <p className="truncate text-xs text-gray-400">{customer.email}</p>
                  </div>

                  {/* Total */}
                  <div className="shrink-0 text-right">
                    <p className="font-black text-gray-900">{formatPrice(customer.totalSpent)} ₺</p>
                    <span className="inline-flex items-center gap-0.5 rounded-lg bg-brand-50 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                      {customer.orderCount} sipariş
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="mt-3 grid grid-cols-2 gap-y-1.5 gap-x-3 border-t border-gray-50 pt-3 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5 col-span-2">
                    <Phone size={11} className="shrink-0 text-gray-300" />
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin size={11} className="shrink-0 text-gray-300" />
                    <span className="truncate">{customer.district}, {customer.city}</span>
                  </div>
                  <div className="flex items-center gap-1.5 justify-end text-gray-400">
                    <Calendar size={11} className="shrink-0" />
                    <span>{formatDate(customer.lastOrderDate)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {customers.length === 0 && (
          <div className="rounded-2xl border border-gray-100 bg-white py-16 text-center shadow-sm">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-50">
              <Users size={26} className="text-gray-300" />
            </div>
            <p className="font-semibold text-gray-700">Henüz kayıtlı müşteri yok</p>
            <p className="mt-1 text-xs text-gray-400">Sipariş alındıkça müşteriler burada listelenecektir.</p>
          </div>
        )}
      </div>
    </div>
  );
}
