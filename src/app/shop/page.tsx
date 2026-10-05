import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight, SlidersHorizontal } from "lucide-react";
import ProductCard from "@/components/product-card";
import { getCatalogMeta, listProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Shop solar products", description: "Browse solar panels, inverters, batteries, charge controllers, complete kits and accessories at Adetech Solar." };

type SearchParams = Promise<Record<string, string | string[] | undefined>>;
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;
const numeric = (value: string | undefined) => value && /^\d+(\.\d+)?$/.test(value) ? Number(value) : undefined;

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const q = first(params.q)?.slice(0, 100);
  const category = first(params.category);
  const brand = first(params.brand);
  const sort = first(params.sort) ?? "popular";
  const page = Math.max(1, Number(first(params.page)) || 1);
  const filters = { q, category, brand, sort, page, minPrice: numeric(first(params.min)), maxPrice: numeric(first(params.max)), wattage: numeric(first(params.wattage)), capacity: numeric(first(params.capacity)), inStock: first(params.stock) === "true" };
  const [{ products, total, pageCount }, { categories, brands }] = await Promise.all([listProducts(filters), getCatalogMeta()]);
  const activeCategory = categories.find((item) => item.slug === category);
  const paginationHref = (nextPage: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) if (typeof value === "string" && key !== "page") next.set(key, value);
    next.set("page", String(nextPage));
    return `/shop?${next.toString()}`;
  };

  return <div className="shop-page page-width">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link href="/">Home</Link><span>/</span><span>Shop</span>{activeCategory && <><span>/</span><span>{activeCategory.name}</span></>}</nav>
    <header className="shop-heading"><div><p className="eyebrow">Genuine products · Expert support</p><h1>{activeCategory?.name ?? (q ? `Results for “${q}”` : "Shop solar products")}</h1><p>{total} carefully chosen products for brighter, more reliable days.</p></div><form className="sort-form" action="/shop"><label htmlFor="sort">Sort by</label><select id="sort" name="sort" defaultValue={sort}><option value="popular">Popularity</option><option value="newest">Newest</option><option value="price-asc">Price: low to high</option><option value="price-desc">Price: high to low</option></select>{category && <input type="hidden" name="category" value={category} />}{q && <input type="hidden" name="q" value={q} />}<button type="submit">Apply</button></form></header>
    <div className="shop-layout">
      <aside className="filter-sidebar" aria-label="Product filters"><div className="filter-title"><SlidersHorizontal size={17} /><h2>Filters</h2></div><form action="/shop" className="filter-form">
        {q && <input type="hidden" name="q" value={q} />}{sort !== "popular" && <input type="hidden" name="sort" value={sort} />}
        <fieldset><legend>Category</legend><label className="filter-option"><input type="radio" name="category" value="" defaultChecked={!category} /> All solar</label>{categories.map((item) => <label className="filter-option" key={item.slug}><input type="radio" name="category" value={item.slug} defaultChecked={category === item.slug} /> {item.name}</label>)}</fieldset>
        <fieldset><legend>Brand</legend><select name="brand" aria-label="Filter by brand" defaultValue={brand ?? ""}><option value="">All brands</option>{brands.map((item) => <option value={item} key={item}>{item}</option>)}</select></fieldset>
        <fieldset><legend>Price (₦)</legend><div className="range-inputs"><label><span className="visually-hidden">Minimum price</span><input type="number" name="min" min="0" placeholder="Min" defaultValue={first(params.min)} /></label><span>to</span><label><span className="visually-hidden">Maximum price</span><input type="number" name="max" min="0" placeholder="Max" defaultValue={first(params.max)} /></label></div></fieldset>
        <fieldset><legend>Power & capacity</legend><label className="filter-field">Minimum wattage<input type="number" name="wattage" min="0" placeholder="e.g. 400W" defaultValue={first(params.wattage)} /></label><label className="filter-field">Minimum capacity<input type="number" name="capacity" min="0" placeholder="Ah or kWh" defaultValue={first(params.capacity)} /></label></fieldset>
        <label className="filter-option stock-filter"><input type="checkbox" name="stock" value="true" defaultChecked={filters.inStock} /> In stock only</label>
        <button className="filter-submit" type="submit">Apply filters</button><Link className="filter-reset" href="/shop">Clear all filters</Link>
      </form></aside>
      <section className="shop-results" aria-label="Products"><div className="results-bar"><span>Showing <strong>{total === 0 ? 0 : (page - 1) * 12 + 1}–{Math.min(page * 12, total)}</strong> of <strong>{total}</strong></span><span className="mobile-filter-indicator"><SlidersHorizontal size={14} /> Filters are below</span></div>{products.length ? <div className="product-grid">{products.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <div className="empty-results"><span className="empty-sun">☼</span><h2>No products match those filters</h2><p>Try widening the price range or choosing another category.</p><Link href="/shop" className="primary-button">Clear filters <ArrowRight size={16} /></Link></div>}
        {pageCount > 1 && <nav className="pagination" aria-label="Product pages">{page > 1 && <Link href={paginationHref(page - 1)}><ArrowLeft size={15} /> Previous</Link>}<span>Page {page} of {pageCount}</span>{page < pageCount && <Link href={paginationHref(page + 1)}>Next <ArrowRight size={15} /></Link>}</nav>}
      </section>
    </div>
  </div>;
}
