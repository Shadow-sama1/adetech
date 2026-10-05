import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BadgeCheck, ChevronRight, PackageCheck, ShieldCheck, Star, Truck } from "lucide-react";
import ProductBuyControls from "@/components/product-buy-controls";
import ProductCard from "@/components/product-card";
import ProductGallery from "@/components/product-gallery";
import { getProductBySlug, getRelatedProducts } from "@/lib/catalog";
import { formatNaira } from "@/lib/format";
import type { DemoProduct } from "@/lib/demo-products";

type DetailProduct = DemoProduct & { reviews?: { id: string; rating: number; title: string | null; body: string; createdAt: Date; user: { name: string | null } }[] };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  return product ? { title: product.name, description: product.description.slice(0, 155), openGraph: { title: product.name, description: product.description.slice(0, 155), images: product.images.slice(0, 1) } } : { title: "Product not found" };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug) as DetailProduct | null;
  if (!product || ("isActive" in product && !product.isActive)) notFound();
  const related = await getRelatedProducts(product.category.slug, product.slug);
  const discount = product.compareAtPrice && product.compareAtPrice > product.price ? Math.round((1 - product.price / product.compareAtPrice) * 100) : 0;
  const averageRating = product.reviews?.length ? (product.reviews.reduce((sum, review) => sum + review.rating, 0) / product.reviews.length).toFixed(1) : null;
  const specs = Object.entries(product.specs as Record<string, string>);
  const jsonLd = { "@context": "https://schema.org", "@type": "Product", name: product.name, description: product.description, image: product.images, brand: { "@type": "Brand", name: product.brand }, offers: { "@type": "Offer", priceCurrency: "NGN", price: (product.price / 100).toFixed(2), availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/shop/${product.slug}` }, ...(averageRating && { aggregateRating: { "@type": "AggregateRating", ratingValue: averageRating, reviewCount: product.reviews?.length } }) };

  return <div className="product-page page-width"><nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link><span>/</span><span>{product.name}</span></nav>
    <div className="product-detail"><ProductGallery images={product.images} name={product.name} /><section className="product-info"><p className="eyebrow">{product.brand} · {product.category.name}</p><h1>{product.name}</h1><div className="product-rating"><span aria-label={averageRating ? `${averageRating} out of 5 stars` : "No reviews yet"}><Star size={15} fill="currentColor" /> {averageRating ?? "New"}</span>{product.reviews?.length ? <a href="#reviews">{product.reviews.length} reviews</a> : <span>Customer reviews coming soon</span>}</div><div className="detail-price"><strong>{formatNaira(product.price)}</strong>{product.compareAtPrice && product.compareAtPrice > product.price && <><del>{formatNaira(product.compareAtPrice)}</del><span>{discount}% off</span></>}</div><p className="product-description">{product.description}</p><div className={`availability${product.stock < 1 ? " unavailable" : ""}`}><span />{product.stock > 0 ? `${product.stock} available to order` : "Currently out of stock"}</div><ProductBuyControls product={product} /><div className="product-promises"><span><Truck size={17} /> Nationwide delivery</span><span><BadgeCheck size={17} /> Genuine product</span><span><ShieldCheck size={17} /> {product.warrantyMonths} month warranty</span><span><PackageCheck size={17} /> Secure Paystack payment</span></div><p className="seller-note">Sold and supported by <strong>Adetech Solar</strong></p></section></div>
    <section className="product-lower"><div className="specs-panel"><div className="detail-section-heading"><div><p className="eyebrow">The details that matter</p><h2>Specifications</h2></div></div><dl>{specs.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}{product.wattage && <div><dt>Wattage</dt><dd>{product.wattage}W</dd></div>}{product.voltage && <div><dt>Voltage</dt><dd>{product.voltage}V</dd></div>}{product.dimensions && <div><dt>Dimensions</dt><dd>{product.dimensions}</dd></div>}<div><dt>Warranty</dt><dd>{product.warrantyMonths} months</dd></div></dl></div>
      <div className="reviews-panel" id="reviews"><div className="detail-section-heading"><div><p className="eyebrow">Real-world feedback</p><h2>Customer reviews</h2></div><span>{product.reviews?.length ?? 0} reviews</span></div>{product.reviews?.length ? <div className="reviews-list">{product.reviews.map((review) => <article key={review.id}><div><span className="review-stars">{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</span><time>{new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(new Date(review.createdAt))}</time></div>{review.title && <h3>{review.title}</h3>}<p>{review.body}</p><small>{review.user.name ?? "Verified customer"} · <BadgeCheck size={12} /> Verified purchase</small></article>)}</div> : <p className="empty-reviews">No reviews yet. Be the first to share how this product works for you.</p>}</div></section>
    {related.length > 0 && <section className="related-section"><div className="section-heading"><div><p className="eyebrow">Good together</p><h2 className="section-title">You might also like</h2></div><Link className="section-link" href={`/shop?category=${product.category.slug}`}>More in {product.category.name} <ChevronRight size={15} /></Link></div><div className="product-grid">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></section>}
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
  </div>;
}
