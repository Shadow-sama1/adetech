import { prisma } from "@/lib/prisma";
import { demoProducts, type DemoProduct } from "@/lib/demo-products";

export type CatalogFilters = {
  q?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  wattage?: number;
  capacity?: number;
  inStock?: boolean;
  sort?: string;
  page?: number;
  pageSize?: number;
};

type ProductWithCategory = DemoProduct;

export async function listProducts(filters: CatalogFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(48, Math.max(1, filters.pageSize ?? 12));
  const skip = (page - 1) * pageSize;

  if (!process.env.DATABASE_URL) {
    const result = filterProducts(demoProducts, filters);
    return {
      products: result.slice(skip, skip + pageSize),
      total: result.length,
      page,
      pageSize,
      pageCount: Math.max(1, Math.ceil(result.length / pageSize)),
    };
  }

  const where = {
    isActive: true,
    ...(filters.category ? { category: { slug: filters.category } } : {}),
    ...(filters.brand ? { brand: filters.brand } : {}),
    ...(filters.inStock ? { stock: { gt: 0 } } : {}),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? { price: { ...(filters.minPrice !== undefined ? { gte: filters.minPrice * 100 } : {}), ...(filters.maxPrice !== undefined ? { lte: filters.maxPrice * 100 } : {}) } }
      : {}),
    ...(filters.wattage !== undefined ? { wattage: { gte: filters.wattage } } : {}),
    ...(filters.capacity !== undefined ? { OR: [{ capacityAh: { gte: filters.capacity } }, { capacityKwh: { gte: filters.capacity } }] } : {}),
    ...(filters.q ? { AND: [{ OR: [{ name: { contains: filters.q, mode: "insensitive" as const } }, { brand: { contains: filters.q, mode: "insensitive" as const } }, { description: { contains: filters.q, mode: "insensitive" as const } }] }] } : {}),
  };
  const orderBy = filters.sort === "price-asc"
    ? { price: "asc" as const }
    : filters.sort === "price-desc"
      ? { price: "desc" as const }
      : filters.sort === "newest"
        ? { createdAt: "desc" as const }
        : { popularity: "desc" as const };
  try {
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, include: { category: { select: { name: true, slug: true } } }, orderBy, skip, take: pageSize }),
      prisma.product.count({ where }),
    ]);
    return { products: products as ProductWithCategory[], total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
  } catch {
    const result = filterProducts(demoProducts, filters);
    return { products: result.slice(skip, skip + pageSize), total: result.length, page, pageSize, pageCount: Math.max(1, Math.ceil(result.length / pageSize)) };
  }
}

export async function getProductBySlug(slug: string) {
  if (!process.env.DATABASE_URL) return demoProducts.find((product) => product.slug === slug) ?? null;
  try {
    return await prisma.product.findUnique({
      where: { slug },
      include: {
        category: { select: { name: true, slug: true } },
        reviews: {
          where: { isApproved: true },
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "desc" },
          take: 12,
        },
      },
    }) ?? demoProducts.find((product) => product.slug === slug) ?? null;
  } catch {
    return demoProducts.find((product) => product.slug === slug) ?? null;
  }
}

export async function getRelatedProducts(categorySlug: string, exceptSlug: string) {
  if (!process.env.DATABASE_URL) return demoProducts.filter((product) => product.category.slug === categorySlug && product.slug !== exceptSlug).slice(0, 4);
  try {
    const products = await prisma.product.findMany({ where: { isActive: true, category: { slug: categorySlug }, slug: { not: exceptSlug } }, include: { category: { select: { name: true, slug: true } } }, orderBy: { popularity: "desc" }, take: 4 });
    return products as ProductWithCategory[];
  } catch {
    return demoProducts.filter((product) => product.category.slug === categorySlug && product.slug !== exceptSlug).slice(0, 4);
  }
}

export async function getCatalogMeta() {
  if (!process.env.DATABASE_URL) {
    return { categories: [...new Map(demoProducts.map((product) => [product.category.slug, product.category])).values()], brands: [...new Set(demoProducts.map((product) => product.brand))].sort() };
  }
  try {
    const [categories, brandRows] = await Promise.all([
      prisma.category.findMany({ orderBy: { name: "asc" } }),
      prisma.product.findMany({ where: { isActive: true }, distinct: ["brand"], select: { brand: true }, orderBy: { brand: "asc" } }),
    ]);
    return { categories, brands: brandRows.map((item) => item.brand) };
  } catch {
    return { categories: [...new Map(demoProducts.map((product) => [product.category.slug, product.category])).values()], brands: [...new Set(demoProducts.map((product) => product.brand))].sort() };
  }
}

function filterProducts(products: DemoProduct[], filters: CatalogFilters) {
  const filtered = products.filter((product) =>
    (!filters.category || product.category.slug === filters.category) &&
    (!filters.brand || product.brand === filters.brand) &&
    (!filters.inStock || product.stock > 0) &&
    (filters.minPrice === undefined || product.price >= filters.minPrice * 100) &&
    (filters.maxPrice === undefined || product.price <= filters.maxPrice * 100) &&
    (filters.wattage === undefined || (product.wattage ?? 0) >= filters.wattage) &&
    (filters.capacity === undefined || (product.capacityAh ?? 0) >= filters.capacity || (product.capacityKwh ?? 0) >= filters.capacity) &&
    (!filters.q || `${product.name} ${product.brand} ${product.description}`.toLowerCase().includes(filters.q.toLowerCase())),
  );
  return filtered.sort((a, b) => {
    if (filters.sort === "price-asc") return a.price - b.price;
    if (filters.sort === "price-desc") return b.price - a.price;
    if (filters.sort === "newest") return b.id.localeCompare(a.id);
    return b.popularity - a.popularity;
  });
}
