import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import UrunlerPage from "@/app/(site)/urunler/page";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    select: { name: true, description: true, slug: true },
  });

  if (!category) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://fkkuruyemis.com";
  const canonical = `${siteUrl}/kategori/${category.slug}`;

  return {
    title: `${category.name} | FK KURUYEMİŞ`,
    description: category.description || `${category.name} kategorisindeki en taze ürünleri keşfedin.`,
    alternates: { canonical },
    openGraph: {
      title: `${category.name} | FK KURUYEMİŞ`,
      description: category.description || `${category.name} kategorisindeki en taze ürünleri keşfedin.`,
      url: canonical,
      type: "website",
    },
  };
}

export default async function KategoriPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: Record<string, string>;
}) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug, isActive: true },
  });

  if (!category) {
    notFound();
  }

  // UrunlerPage beklediği yapıya uygun parametreleri iletiyoruz
  return <UrunlerPage searchParams={{ ...searchParams, kategori: params.slug }} />;
}
