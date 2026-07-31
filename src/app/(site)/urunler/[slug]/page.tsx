import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import ProductDetailClient from "./ProductDetailClient";

interface Props {
  params: { slug: string };
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

async function getProduct(slug: string) {
  const product = await prisma.product.findFirst({
    where: { slug, isActive: true },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: { orderBy: { price: "asc" } },
      reviews: {
        where: { isApproved: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return product ? { ...product, images: toStringArray(product.images) } : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.slug);

  if (!product) return { title: "Ürün Bulunamadı" };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fkkuruyemis.com";
  const description =
    product.metaDescription || product.description?.slice(0, 155) || `${product.name} ürününü FK Kuruyemiş güvencesiyle inceleyin.`;
  const canonical = `${siteUrl}/urunler/${product.slug}`;

  return {
    title: product.metaTitle || `${product.name} | FK KURUYEMİŞ`,
    description,
    alternates: { canonical },
    openGraph: {
      title: product.metaTitle || product.name,
      description,
      url: canonical,
      type: "website",
      images: product.images[0] ? [{ url: product.images[0] }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: product.metaTitle || product.name,
      description,
      images: product.images[0] ? [product.images[0]] : [],
    },
  };
}

export default async function ProductDetailPage({ params }: Props) {
  const product = await getProduct(params.slug);

  if (!product) notFound();

  const relatedProducts = await prisma.product.findMany({
    where: {
      isActive: true,
      categoryId: product.categoryId,
      id: { not: product.id },
    },
    include: {
      category: { select: { id: true, name: true, slug: true } },
      variants: { orderBy: { price: "asc" } },
      reviews: {
        where: { isApproved: true },
        select: { rating: true },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  const related = relatedProducts.map((item) => ({
    ...item,
    images: toStringArray(item.images),
  }));

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.id,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fkkuruyemis.com"}/urunler/${product.slug}`,
    brand: { "@type": "Brand", name: "FK KURUYEMİŞ" },
    offers: {
      "@type": "Offer",
      price: (product.discountPrice || product.basePrice).toFixed(2),
      priceCurrency: "TRY",
      url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://fkkuruyemis.com"}/urunler/${product.slug}`,
      seller: { "@type": "Organization", name: "FK KURUYEMİŞ" },
      availability:
        product.totalStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
    },
    aggregateRating:
      product.reviews.length > 0
        ? {
            "@type": "AggregateRating",
            ratingValue: (
              product.reviews.reduce((sum, review) => sum + review.rating, 0) /
              product.reviews.length
            ).toFixed(1),
            reviewCount: product.reviews.length,
          }
        : undefined,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema).replace(/</g, "\\u003c") }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
