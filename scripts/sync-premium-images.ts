import { PrismaClient } from "@prisma/client";
import { storeCategories, storeProducts } from "../src/data/storeCatalog";

const prisma = new PrismaClient();

async function main() {
  const productUpdates = storeProducts.map((product) =>
    prisma.product.updateMany({
      where: { slug: product.slug },
      data: { images: product.images },
    })
  );

  const categoryUpdates = storeCategories.map((category) =>
    prisma.category.updateMany({
      where: { slug: category.slug },
      data: { image: category.image },
    })
  );

  const results = await prisma.$transaction([...productUpdates, ...categoryUpdates]);
  const changed = results.reduce((sum, result) => sum + result.count, 0);
  console.log(`${storeProducts.length} ürün ve ${storeCategories.length} kategori işlendi; ${changed} kayıt güncellendi.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => prisma.$disconnect());
