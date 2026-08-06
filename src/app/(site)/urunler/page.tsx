import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import ProductsClient from "./ProductsClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tüm Ürünler | Çorum Hatırası, LüksLeb ve Hediyelik Kutular",
  description:
    "FK KURUYEMİŞ ürün kataloğu. Çorum Hatırası kutular, LüksLeb kurabiyeleri, karışık hediyelikler, boş ambalajlar ve hatıra ürünleri.",
};

interface SearchParams {
  kategori?: string;
  filtre?: string;
  ara?: string;
  sayfa?: string;
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" &&
          (item.startsWith("/") || /^https?:\/\//.test(item))
      )
    : [];
}

export default async function UrunlerPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { kategori, filtre, ara, sayfa } = searchParams;
  const page = Number.parseInt(sayfa || "1", 10) || 1;
  const perPage = 12;

  const where = {
    isActive: true,
    ...(kategori ? { category: { slug: kategori } } : {}),
    ...(filtre === "cok-satan" ? { isBestSeller: true } : {}),
    ...(filtre === "yeni" ? { isNew: true } : {}),
    ...(filtre === "indirimli" ? { discountPrice: { not: null } } : {}),
    ...(filtre === "dogal" ? { isNatural: true } : {}),
    ...(ara?.trim()
      ? {
          OR: [
            { name: { contains: ara.trim() } },
            { description: { contains: ara.trim() } },
            { shortDesc: { contains: ara.trim() } },
          ],
        }
      : {}),
  };

  let products: any[] = [];
  let totalCount = 0;
  let categories: any[] = [];
  let activeCategory: any = null;

  try {
    const results = await Promise.allSettled([
      prisma.product.findMany({
        where,
        include: {
          category: { select: { id: true, name: true, slug: true } },
          variants: { orderBy: { price: "asc" } },
          reviews: {
            where: { isApproved: true },
            select: { rating: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * perPage,
        take: perPage,
      }),
      prisma.product.count({ where }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { order: "asc" },
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      }),
      kategori
        ? prisma.category.findFirst({
            where: { slug: kategori, isActive: true },
            select: { id: true, name: true, slug: true },
          })
        : Promise.resolve(null),
    ]);
    
    products = results[0].status === "fulfilled" ? results[0].value : [];
    totalCount = results[1].status === "fulfilled" ? results[1].value : 0;
    categories = results[2].status === "fulfilled" ? results[2].value : [];
    activeCategory = results[3].status === "fulfilled" ? results[3].value : null;

    results.forEach((result) => {
      if (result.status === "rejected") {
        console.error("Urunler page DB error (partial):", result.reason);
      }
    });
  } catch (error) {
    console.error("Urunler page DB error (unexpected):", error);
  }

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const normalizedProducts = products.map((product) => ({
    ...product,
    images: toStringArray(product.images),
  }));

  return (
    <ProductsClient
      products={normalizedProducts}
      categories={categories}
      totalCount={totalCount}
      totalPages={totalPages}
      currentPage={page}
      activeCategory={activeCategory}
      searchParams={searchParams}
    />
  );
}
