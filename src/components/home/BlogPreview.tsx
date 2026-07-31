import Link from "next/link";
import Image from "next/image";
import { ArrowRight, BookOpen } from "lucide-react";

export default function BlogPreview({ posts }: { posts: any[] }) {
  if (!posts.length) return null;

  return (
    <section className="bg-white py-10 sm:py-20">
      <div className="container-main">
        <div className="mb-6 flex flex-col items-center gap-3 text-center sm:mb-10 sm:flex-row sm:items-end sm:justify-between sm:text-left">
          <div>
            <div className="mb-2 flex items-center justify-center gap-2 sm:justify-start">
              <BookOpen size={16} className="text-brand-500" />
              <span className="text-brand-600 font-semibold text-[11px] sm:text-sm uppercase tracking-widest">
                Blog
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-1 sm:mb-3">Çorum Hatırası Notları</h2>
            <p className="text-sm sm:text-lg text-gray-500">
              Hediyelik kutular, LüksLeb lezzetleri ve özel sunum fikirleri
            </p>
          </div>
          <Link href="/blog" className="hidden sm:inline-flex btn-secondary gap-2">
            Tüm Yazılar <ArrowRight size={16} />
          </Link>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory gap-3 pb-6 md:grid md:grid-cols-3 sm:gap-6 md:overflow-visible md:pb-0 scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {posts.map((post) => (
            <div key={post.id} className="w-[280px] sm:w-auto shrink-0 snap-start">
              <Link
                href={`/blog/${post.slug}`}
                className="card overflow-hidden group block h-full"
              >
                <div className="relative aspect-video overflow-hidden bg-brand-50">
                  {post.coverImage ? (
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <BookOpen size={40} className="text-brand-300" />
                    </div>
                  )}
                </div>
                <div className="p-4 flex flex-col h-[calc(100%-56.25%)]">
                  <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-brand-600 transition-colors font-display text-[15px] sm:text-lg">
                    {post.title}
                  </h3>
                  {post.excerpt && (
                    <p className="text-gray-600 text-xs sm:text-sm line-clamp-3 mb-4 flex-1">
                      {post.excerpt}
                    </p>
                  )}
                  <div className="flex items-center justify-between text-[10px] sm:text-xs text-gray-400 pt-3 border-t border-gray-100 mt-auto">
                    <span>{post.authorName}</span>
                    {post.publishedAt && (
                      <span>
                        {post.publishedAt
                          ? new Date(post.publishedAt).toISOString().slice(0, 10).split("-").reverse().join(".")
                          : ""}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
        <div className="mt-2 text-center sm:hidden">
          <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
            Tüm Yazılar <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}
