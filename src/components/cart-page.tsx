"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight, Heart, Minus, Package, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";
import { formatNaira } from "@/lib/format";

export default function CartPage({ loggedIn }: { loggedIn: boolean }) {
  const { items, hydrated, setHydrated, removeItem, setQuantity } = useCartStore();
  const router = useRouter();
  const [saved, setSaved] = useState("");
  useEffect(() => { if (!hydrated) setHydrated(true); }, [hydrated, setHydrated]);
  useEffect(() => {
    if (!hydrated || !loggedIn) return;
    const local = useCartStore.getState().items;
    fetch("/api/cart").then((response) => response.ok ? response.json() : null).then(async (result) => {
      if (!result?.items) return;
      const remoteIds = new Set<string>(result.items.map((line: { productId: string }) => line.productId));
      const localOnly = local.filter((line) => !remoteIds.has(line.productId));
      if (localOnly.length) await fetch("/api/cart", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: localOnly.map(({ productId, quantity }) => ({ productId, quantity })) }) });
      const latest = await fetch("/api/cart");
      if (!latest.ok) return;
      const refreshed = await latest.json();
      const existing = useCartStore.getState().items;
      for (const item of refreshed.items as { productId: string; quantity: number; product: { id: string; slug: string; name: string; price: number; images: string[]; stock: number } }[]) {
        const line = item.product;
        const found = existing.find((entry) => entry.productId === item.productId);
        if (!found) useCartStore.getState().addItem({ productId: line.id, slug: line.slug, name: line.name, image: line.images[0] ?? "/file.svg", price: line.price, stock: line.stock, quantity: item.quantity, includeInstallation: false });
        else useCartStore.getState().setQuantity(line.id, item.quantity);
      }
    }).catch(() => undefined);
  }, [hydrated, loggedIn]);
  useEffect(() => { const count = items.reduce((sum, line) => sum + line.quantity, 0); window.localStorage.setItem("adetech-cart-count", String(count)); window.dispatchEvent(new Event("adetech:cart-updated")); }, [items]);
  const subtotal = items.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const installation = items.some((line) => line.includeInstallation);
  const saveForLater = async (productId: string) => {
    if (!loggedIn) { router.push("/login?callbackUrl=%2Fcart"); return; }
    const response = await fetch(`/api/account/wishlist/${productId}`, { method: "POST" });
    if (response.ok) setSaved(productId);
  };
  if (!hydrated) return <div className="cart-loading" aria-live="polite">Loading your cart…</div>;
  return <div className="cart-page page-width"><nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><span>Cart</span></nav><div className="cart-heading"><div><p className="eyebrow">Your solar shortlist</p><h1>Your cart <span>({items.reduce((sum, line) => sum + line.quantity, 0)})</span></h1></div><Link href="/shop">Continue shopping <ArrowRight size={15} /></Link></div>{items.length ? <div className="cart-layout"><section className="cart-lines" aria-label="Cart items">{items.map((item) => <article className="cart-line" key={item.productId}><Link className="cart-thumb" href={`/shop/${item.slug}`}><Image src={item.image} alt={item.name} fill sizes="120px" /></Link><div className="cart-line-info"><Link href={`/shop/${item.slug}`}><h2>{item.name}</h2></Link><span className="cart-stock">{item.stock > 0 ? "In stock" : "Unavailable"}</span><div className="cart-line-actions"><div className="quantity-stepper"><button type="button" aria-label={`Decrease quantity of ${item.name}`} onClick={() => setQuantity(item.productId, item.quantity - 1)}><Minus size={14} /></button><output>{item.quantity}</output><button type="button" aria-label={`Increase quantity of ${item.name}`} disabled={item.quantity >= item.stock} onClick={() => setQuantity(item.productId, item.quantity + 1)}><Plus size={14} /></button></div><button type="button" className="cart-text-action" onClick={() => saveForLater(item.productId)}><Heart size={14} />{saved === item.productId ? "Saved" : "Save for later"}</button><button type="button" className="cart-text-action remove-action" onClick={() => removeItem(item.productId)}><Trash2 size={14} /> Remove</button></div></div><strong className="cart-line-price">{formatNaira(item.price * item.quantity)}</strong></article>)}</section><aside className="cart-summary"><h2>Order summary</h2><div><span>Subtotal</span><strong>{formatNaira(subtotal)}</strong></div><div><span>Delivery</span><span className="summary-estimate">Calculated at checkout</span></div>{installation && <div><span>Installation</span><span className="summary-estimate">Confirmed at checkout</span></div>}<div className="cart-total"><span>Estimated total</span><strong>{formatNaira(subtotal)}</strong></div><p>Delivery and any installation fees are calculated using your address and service choices.</p><Link className="primary-button cart-checkout" href="/checkout">{loggedIn ? "Continue to checkout" : "Sign in to checkout"}<ArrowRight size={16} /></Link><div className="cart-trust"><span><ShieldCheck size={15} /> Secure Paystack payment</span><span><Truck size={15} /> Nationwide delivery</span></div></aside></div> : <div className="cart-empty"><span><Package size={26} /></span><h2>Your cart is waiting for some sunshine.</h2><p>Find panels, inverters, batteries and complete kits for your home.</p><Link href="/shop" className="primary-button">Explore the shop <ArrowRight size={16} /></Link></div>}</div>;
}
