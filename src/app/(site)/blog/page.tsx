import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ArrowUpRight, Clock } from "lucide-react";
import { getBlogPosts } from "@/data/blogCatalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog | Çorum Hatırası, LüksLeb ve Hediyelik Leblebi",
  description:
    "Çorum Hatırası hediyelik kutuları, LüksLeb leblebi kurabiyeleri, boş ambalajlar ve kurumsal hediyelikler hakkında yazılar.",
};

const TAG_COLORS: Record<string, string> = {
  "Çorum Hatırası": "bg-amber-100 text-amber-800",
  "Hediyelik Kutu": "bg-orange-100 text-orange-700",
  "LüksLeb": "bg-yellow-100 text-yellow-800",
  "Leblebi Kurabiyesi": "bg-rose-100 text-rose-700",
  "Kurumsal Hediye": "bg-blue-100 text-blue-700",
  "Boş Ambalaj": "bg-emerald-100 text-emerald-700",
  "Saat Kulesi": "bg-violet-100 text-violet-700",
  "default": "bg-stone-100 text-stone-700",
};

function getTagColor(tag: string) {
  return TAG_COLORS[tag] ?? TAG_COLORS["default"];
}

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" }).format(date);
}

export default async function BlogPage() {
  const posts = getBlogPosts();
  const [hero, second, ...gridPosts] = posts;

  return (
    <div className="min-h-screen bg-[#faf8f4]">

      {/* ━━━━━━━━━━━━━━━━ MASTHEAD ━━━━━━━━━━━━━━━━ */}
      <div className="relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2d1a06 0%,#3d2408 60%,#2d1a06 100%)" }}>
        {/* decorative glows */}
        <div className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse at 15% 50%, rgba(200,131,14,0.2) 0%, transparent 55%), radial-gradient(ellipse at 85% 30%, rgba(245,158,11,0.15) 0%, transparent 55%)" }}
        />
        {/* thin top accent line */}
        <div className="h-1 w-full bg-gradient-to-r from-brand-600 via-amber-400 to-brand-600" />
        <div className="container-main relative py-14 sm:py-20 text-center">
          <p className="text-xs font-bold tracking-[0.35em] text-amber-400 uppercase mb-4">
            Çorum Hatırası Notları
          </p>
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-display font-black text-white leading-none mb-5">
            Blog
          </h1>
          <div className="w-16 h-1.5 rounded-full bg-amber-500 mx-auto mb-5" />
          <p className="text-amber-100/70 max-w-xl mx-auto text-base">
            Hediyelik kutular, LüksLeb lezzetleri, ambalaj seçimi ve Çorum&apos;a özel sunum fikirleri
          </p>
        </div>
      </div>

      <div className="container-main py-12 sm:py-16">

        {/* ━━━━━━━━━━━━━━━━ HERO POST ━━━━━━━━━━━━━━━━ */}
        {hero && (
          <Link
            href={`/blog/${hero.slug}`}
            className="group relative mb-5 flex flex-col lg:flex-row min-h-[480px] overflow-hidden rounded-3xl bg-stone-900"
          >
            {/* BG image */}
            <div className="absolute inset-0">
              <Image
                src={hero.coverImage}
                alt={hero.title}
                fill
                className="object-cover opacity-50 group-hover:opacity-60 group-hover:scale-105 transition-all duration-700"
                sizes="100vw"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />
            </div>

            {/* Content */}
            <div className="relative flex flex-col justify-end p-8 sm:p-12 md:p-16 max-w-3xl">
              <div className="flex flex-wrap gap-2 mb-5">
                <span className="rounded-full bg-brand-500 px-4 py-1.5 text-xs font-bold text-white tracking-wide uppercase">
                  Öne Çıkan
                </span>
                {hero.tags.slice(0, 2).map((tag) => (
                  <span key={tag} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${getTagColor(tag)}`}>
                    {tag}
                  </span>
                ))}
              </div>
              <h2 className="font-display font-black text-3xl sm:text-4xl md:text-5xl text-white leading-tight mb-5 group-hover:text-brand-300 transition-colors">
                {hero.title}
              </h2>
              <p className="text-stone-300 text-base sm:text-lg leading-relaxed mb-7 line-clamp-2">
                {hero.excerpt}
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0 mt-2">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-brand-500 text-white flex items-center justify-center text-xs font-bold">
                    FK
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-stone-300 font-semibold text-sm">{hero.authorName}</span>
                    <span className="text-stone-500 text-sm hidden sm:inline">·</span>
                    <span className="text-stone-400 text-xs sm:text-sm">{formatDate(hero.publishedAt)}</span>
                  </div>
                </div>
                <div className="sm:ml-auto">
                  <span className="inline-flex w-full sm:w-auto justify-center items-center gap-2 rounded-xl bg-white text-stone-900 font-bold text-sm px-5 py-3 sm:py-2.5 group-hover:bg-brand-500 group-hover:text-white transition-all duration-300 shadow-lg">
                    Yazıyı Oku <ArrowUpRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* ━━━━━━━━━━━━━━━━ TWO-COL + SIDEBAR ━━━━━━━━━━━━━━━━ */}
        {second && (
          <div className="mb-5 grid grid-cols-1 md:grid-cols-5 gap-5">

            {/* Second post – wider */}
            <Link
              href={`/blog/${second.slug}`}
              className="group md:col-span-3 relative overflow-hidden rounded-3xl bg-stone-800 min-h-[300px] flex flex-col justify-end"
            >
              <div className="absolute inset-0">
                <Image
                  src={second.coverImage}
                  alt={second.title}
                  fill
                  className="object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition-all duration-500"
                  sizes="(max-width: 768px) 100vw, 60vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/40 to-transparent" />
              </div>
              <div className="relative p-7 sm:p-8">
                <div className="flex flex-wrap gap-2 mb-3">
                  {second.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className={`rounded-full px-3 py-1 text-[11px] font-bold ${getTagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
                <h3 className="font-display font-black text-xl sm:text-2xl text-white leading-snug mb-2 group-hover:text-brand-300 transition-colors">
                  {second.title}
                </h3>
                <p className="text-stone-300 text-sm line-clamp-2 mb-4">{second.excerpt}</p>
                <span className="inline-flex items-center gap-1.5 text-sm font-bold text-brand-400 group-hover:gap-3 transition-all">
                  Oku <ArrowRight size={14} />
                </span>
              </div>
            </Link>

            {/* Sidebar – stacked remaining */}
            {gridPosts.slice(0, 2).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group md:col-span-1 relative overflow-hidden rounded-3xl bg-white border border-stone-200 hover:border-brand-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-[16/9] md:aspect-[4/3] overflow-hidden bg-stone-100">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, 25vw"
                  />
                </div>
                <div className="flex flex-col flex-1 p-5">
                  <div className="flex flex-wrap gap-1.5 mb-2.5">
                    {post.tags.slice(0, 1).map((tag) => (
                      <span key={tag} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-sm sm:text-base text-stone-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors flex-1">
                    {post.title}
                  </h3>
                  <div className="mt-4 flex items-center justify-between border-t border-stone-100 pt-3">
                    <span className="text-xs text-stone-400">{formatDate(post.publishedAt)}</span>
                    <ArrowRight size={14} className="text-brand-500 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━ REMAINING GRID ━━━━━━━━━━━━━━━━ */}
        {gridPosts.slice(2).length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {gridPosts.slice(2).map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-2xl bg-white border border-stone-200 hover:border-brand-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
                <div className="flex flex-col flex-1 p-5 sm:p-6">
                  <div className="flex flex-wrap gap-2 mb-3">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span key={tag} className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${getTagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                  <h3 className="font-display font-bold text-base text-stone-900 leading-snug line-clamp-2 group-hover:text-brand-600 transition-colors mb-2 flex-1">
                    {post.title}
                  </h3>
                  <p className="text-stone-500 text-sm line-clamp-2 mb-4 leading-relaxed">{post.excerpt}</p>
                  <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                    <span className="text-xs text-stone-400 flex items-center gap-1.5">
                      <Clock size={12} /> {formatDate(post.publishedAt)}
                    </span>
                    <span className="flex items-center gap-1 text-brand-600 font-bold text-xs group-hover:gap-2 transition-all">
                      Oku <ArrowRight size={12} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ━━━━━━━━━━━━━━━━ BOTTOM CTA ━━━━━━━━━━━━━━━━ */}
        <div className="mt-14 rounded-3xl p-10 sm:p-14 text-center relative overflow-hidden" style={{ background: "linear-gradient(135deg,#2d1a06 0%,#3d2408 60%,#2d1a06 100%)" }}>
          <div className="absolute inset-0 opacity-20"
            style={{ backgroundImage: "radial-gradient(circle at 20% 80%, #c2410c 0%, transparent 50%), radial-gradient(circle at 80% 20%, #d97706 0%, transparent 50%)" }}
          />
          <div className="relative">
            <p className="text-brand-400 font-bold tracking-widest uppercase text-xs mb-4">Toptan & Özel Sipariş</p>
            <h3 className="font-display font-black text-3xl sm:text-4xl text-white mb-4">
              Özel Sipariş veya Teklif mi İstiyorsunuz?
            </h3>
            <p className="text-stone-400 mb-8 max-w-lg mx-auto">
              Kurumsal hediyelik, toptan alım veya özel dolum için bizimle hemen iletişime geçin.
            </p>
            <Link
              href="/iletisim"
              className="inline-flex items-center gap-2 rounded-xl bg-brand-500 text-white font-bold px-8 py-3.5 hover:bg-brand-600 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              Bize Ulaşın <ArrowRight size={18} />
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
