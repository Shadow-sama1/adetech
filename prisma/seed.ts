import { PrismaClient } from "@prisma/client";
import { demoProducts } from "../src/lib/demo-products";

const prisma = new PrismaClient();

async function main() {
  const categories = [...new Map(demoProducts.map((product) => [product.category.slug, product.category])).values()];
  const categoryIds = new Map<string, string>();
  for (const category of categories) {
    const row = await prisma.category.upsert({ where: { slug: category.slug }, create: { name: category.name, slug: category.slug }, update: { name: category.name } });
    categoryIds.set(category.slug, row.id);
  }
  for (const product of demoProducts) {
    const { category, ...data } = product;
    await prisma.product.upsert({ where: { slug: product.slug }, create: { ...data, categoryId: categoryIds.get(category.slug)!, isActive: true, isFeatured: product.popularity >= 94 }, update: { ...data, categoryId: categoryIds.get(category.slug)!, isActive: true, isFeatured: product.popularity >= 94 } });
  }
  console.info(`Seeded ${categories.length} categories and ${demoProducts.length} solar products.`);
}

main().catch((error) => { console.error(error); process.exitCode = 1; }).finally(async () => { await prisma.$disconnect(); });
