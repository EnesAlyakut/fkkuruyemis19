import type { Metadata } from "next";
import dynamic from "next/dynamic";
import HeroSection from "@/components/home/HeroSection";
import FeaturesBar from "@/components/home/FeaturesBar";
import CategoriesSection from "@/components/home/CategoriesSection";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { getBlogPosts } from "@/data/blogCatalog";
import { prisma } from "@/lib/prisma";

// Dynamic imports for below-the-fold components to improve initial load time
const BestSellers = dynamic(() => import("@/components/home/BestSellers"), { ssr: true });
const DiscountedProducts = dynamic(() => import("@/components/home/DiscountedProducts"), { ssr: true });
const WhyUs = dynamic(() => import("@/components/home/WhyUs"), { ssr: true });
const BlogPreview = dynamic(() => import("@/components/home/BlogPreview"), { ssr: true });

export const revalidate = 300;

export const metadata: Metadata = {
  title: {
    absolute: "FK KURUYEMİŞ | Çorum Hatırası, LüksLeb ve Hediyelik Leblebi",
  },
  description:
    "Çorum Hatırası hediyelik kutuları, LüksLeb leblebi kurabiyeleri ve özel Çorum leblebisi sunumları. Şık ambalaj, taze dolum ve hızlı teslimat.",
};

async function getHomeData() {
  let categories: any[] = [];
  let featuredProducts: any[] = [];
  let bestSellers: any[] = [];
  let discountedProducts: any[] = [];

  try {
    const results = await Promise.all([
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: [{ order: "asc" }, { name: "asc" }],
        include: {
          _count: {
            select: { products: { where: { isActive: true } } },
          },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          category: { select: { name: true, slug: true } },
          variants: { select: { id: true, weight: true, price: true, stock: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true, isBestSeller: true },
        orderBy: { updatedAt: "desc" },
        take: 8,
        include: {
          category: { select: { name: true, slug: true } },
          variants: { select: { id: true, weight: true, price: true, stock: true } },
          reviews: { select: { rating: true } },
        },
      }),
      prisma.product.findMany({
        where: { isActive: true, discountPrice: { not: null } },
        orderBy: { updatedAt: "desc" },
        take: 4,
        include: {
          category: { select: { name: true, slug: true } },
          variants: { select: { id: true, weight: true, price: true, stock: true } },
          reviews: { select: { rating: true } },
        },
      }),
    ]);
    categories = results[0];
    featuredProducts = results[1];
    bestSellers = results[2];
    discountedProducts = results[3];
  } catch (error) {
    console.error("HomePage DB error during build:", error);
  }

  const blogPosts = getBlogPosts().slice(0, 3);
  const normalizeProduct = (product: (typeof featuredProducts)[number]) => ({
    id: product.id,
    name: product.name,
    slug: product.slug,
    images: toStringArray(product.images),
    basePrice: product.basePrice,
    discountPrice: product.discountPrice,
    isNatural: product.isNatural,
    isBestSeller: product.isBestSeller,
    isNew: product.isNew,
    category: product.category,
    variants: product.variants,
    reviews: product.reviews,
  });

  return {
    categories,
    featuredProducts: featuredProducts.map(normalizeProduct),
    bestSellers: bestSellers.map(normalizeProduct),
    discountedProducts: discountedProducts.map(normalizeProduct),
    blogPosts,
  };
}

function toStringArray(value: unknown) {
  const images = Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && (item.startsWith("/") || item.startsWith("http"))
      )
    : [];

  return images.length > 0 ? images : ["/images/leblebi-urun.png"];
}

export default async function HomePage() {
  const { featuredProducts, bestSellers, discountedProducts, categories, blogPosts } =
    await getHomeData();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fkkuruyemis.com";
  const storeSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    "@id": `${siteUrl}/#store`,
    name: "FK KURUYEMİŞ",
    description: "Çorum leblebisi, kuruyemiş ve hediyelik Çorum ürünleri mağazası",
    url: siteUrl,
    logo: `${siteUrl}/images/logo_circular.png`,
    image: `${siteUrl}/images/hero-leblebi-1.jpg`,
    telephone: "+90 505 889 88 28",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Çöplü Mahallesi Camikebir 3. Sokak",
      addressLocality: "Çorum",
      addressCountry: "TR",
    },
    sameAs: [
      "https://www.instagram.com/fkkuruyemiss/",
      "https://www.facebook.com/p/FK-Kuruyemi%C5%9F-Fatih-Karaku%C5%9F-61585467575881/",
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storeSchema).replace(/</g, "\\u003c"),
        }}
      />

      <HeroSection />
      <FeaturesBar />
      <CategoriesSection categories={categories} />
      <FeaturedProducts products={featuredProducts} />
      <BestSellers products={bestSellers} />
      {discountedProducts.length > 0 && (
        <DiscountedProducts products={discountedProducts} />
      )}
      <WhyUs />
      <BlogPreview posts={blogPosts} />
    </>
  );
}
