import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatNaira } from "@/lib/format";

type ProductCardProps = {
  product: {
    name: string;
    slug: string;
    price: number;
    compareAtPrice: number | null;
    images: string[];
    brand: string;
    category: { name: string; slug: string };
    stock: number;
    popularity?: number;
  };
};

const blurDataURL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'%3E%3Crect width='8' height='6' fill='%23f3e9dd'/%3E%3C/svg%3E";

export default function ProductCard({ product }: ProductCardProps) {
  const discount = product.compareAtPrice && product.compareAtPrice > product.price
    ? Math.round((1 - product.price / product.compareAtPrice) * 100)
    : 0;
  return <Link className="product-card" href={`/shop/${product.slug}`}>
    <div className="product-image-wrap">
      {discount > 0 && <span className="sale-tag">{discount}% OFF</span>}
      <Image src={product.images[0] ?? "/file.svg"} alt={product.name} fill sizes="(max-width: 540px) 46vw, (max-width: 900px) 30vw, 25vw" placeholder="blur" blurDataURL={blurDataURL} />
    </div>
    <div className="product-card-body">
      <span className="product-category">{product.brand} · {product.category.name}</span>
      <h2 className="product-card-title">{product.name}</h2>
      <div className="price-line"><span className="price-now">{formatNaira(product.price)}</span>{product.compareAtPrice && product.compareAtPrice > product.price && <span className="price-before">{formatNaira(product.compareAtPrice)}</span>}</div>
      <div className="product-card-bottom"><span className="rating-row"><span className="star-fill">★★★★★</span><span>Verified product</span></span><span className="quick-add" aria-hidden="true"><ArrowRight size={16} /></span></div>
      <span className={`stock-note${product.stock < 1 ? " out-of-stock" : ""}`}>{product.stock > 0 ? "In stock" : "Currently unavailable"}</span>
    </div>
  </Link>;
}
