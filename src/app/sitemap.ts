import type { MetadataRoute } from "next";
import { demoProducts } from "@/lib/demo-products";
import { prisma } from "@/lib/prisma";
const services = ["installation", "site-survey", "maintenance", "system-sizing"];
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
	const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://adetech.ng";
	let products = demoProducts.map((product) => ({ slug: product.slug, updatedAt: new Date() }));
	if (process.env.DATABASE_URL) {
		try {
			products = await prisma.product.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
		} catch {
			// A database outage should not take the public sitemap offline.
		}
	}
	return [
		{ url: base, changeFrequency: "weekly", priority: 1 },
		{ url: `${base}/shop`, changeFrequency: "daily", priority: 0.9 },
		...services.map((service) => ({ url: `${base}/services/${service}`, changeFrequency: "monthly" as const, priority: 0.7 })),
		...products.map((product) => ({ url: `${base}/shop/${product.slug}`, lastModified: product.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
	];
}
