import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { Edit, Eye, Package, Plus } from "lucide-react";
import DeleteCategoryButton from "@/components/admin/DeleteCategoryButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kategori Yönetimi" };

export default async function AdminKategorilerPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div className="p-6 pt-20 lg:p-8 lg:pt-8">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            Kategori Yönetimi
          </h1>
          <p className="mt-1 text-gray-500">{categories.length} kategori</p>
        </div>
        <Link href="/admin/kategoriler/yeni" className="btn-primary">
          <Plus size={16} />
          Yeni Kategori
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <div
            key={category.id}
            className="flex items-center gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
          >
            {category.image ? (
              <Image
                src={category.image}
                alt={category.name}
                width={56}
                height={56}
                className="h-14 w-14 shrink-0 rounded-xl object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-50">
                <Package size={22} className="text-brand-400" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold text-gray-900">{category.name}</p>
              <p className="truncate font-mono text-xs text-gray-400">
                {category.slug}
              </p>
              <p className="mt-1 text-sm text-gray-500">
                {category._count.products} ürün
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2">
              <Link
                href={`/admin/kategoriler/${category.id}`}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-blue-500 transition-colors hover:bg-blue-50"
                title="Düzenle"
              >
                <Edit size={14} />
              </Link>
              <Link
                href={`/kategori/${category.slug}`}
                target="_blank"
                className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-50"
                title="Sitede Gör"
              >
                <Eye size={14} />
              </Link>
              <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
            </div>
          </div>
        ))}
        {categories.length === 0 && (
          <div className="col-span-full py-16 text-center text-gray-400">
            Henüz kategori yok.
          </div>
        )}
      </div>
    </div>
  );
}
