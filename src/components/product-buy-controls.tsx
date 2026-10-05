"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/cart-store";

type ProductForCart = { id: string; slug: string; name: string; price: number; images: string[]; stock: number };

export default function ProductBuyControls({ product }: { product: ProductForCart }) {
  const [quantity, setQuantity] = useState(1);
  const [installation, setInstallation] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((state) => state.addItem);
  const router = useRouter();
  const add = (buyNow = false) => {
    if (product.stock < 1) return;
    addItem({ productId: product.id, slug: product.slug, name: product.name, image: product.images[0] ?? "/file.svg", price: product.price, stock: product.stock, quantity, includeInstallation: installation });
    const count = useCartStore.getState().items.reduce((sum, item) => sum + item.quantity, 0);
    window.localStorage.setItem("adetech-cart-count", String(count));
    window.dispatchEvent(new Event("adetech:cart-updated"));
    if (buyNow) router.push("/cart");
    else { setAdded(true); window.setTimeout(() => setAdded(false), 1800); }
  };
  return <div className="buy-controls"><div className="quantity-row"><span>Quantity</span><div className="quantity-stepper"><button type="button" aria-label="Decrease quantity" onClick={() => setQuantity((value) => Math.max(1, value - 1))}><Minus size={15} /></button><output aria-live="polite">{quantity}</output><button type="button" aria-label="Increase quantity" onClick={() => setQuantity((value) => Math.min(product.stock, value + 1))} disabled={quantity >= product.stock}><Plus size={15} /></button></div><small>{product.stock} available</small></div>
    <label className="installation-option"><input type="checkbox" checked={installation} onChange={(event) => setInstallation(event.target.checked)} /><span className="custom-check">{installation && <Check size={12} />}</span><span><strong>Add professional installation</strong><small>Our team will contact you to arrange a site assessment.</small></span><Link href="/services/installation" aria-label="Learn about solar installation"><ArrowRight size={15} /></Link></label>
    <div className="buy-buttons"><button className="primary-button" type="button" disabled={!product.stock} onClick={() => add()}>{added ? <><Check size={17} /> Added to cart</> : <><ShoppingBag size={17} /> Add to cart</>}</button><button className="buy-now-button" type="button" disabled={!product.stock} onClick={() => add(true)}>Buy now <ArrowRight size={16} /></button></div>
  </div>;
}
