import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatNaira } from "@/lib/format";
export default async function WishlistPage() { const session = await auth(); const items = process.env.DATABASE_URL ? await prisma.wishlistItem.findMany({ where: { userId: session!.user.id }, include: { product: { include: { category: true } } }, orderBy: { createdAt: "desc" } }) : []; return <section className="account-section"><div className="account-section-head"><div><p className="eyebrow">Things you love</p><h2>Saved items</h2></div></div>{items.length ? <div className="wishlist-grid">{items.map(({ id, product }) => <article className="wishlist-card" key={id}><Link href={`/shop/${product.slug}`}><div><Image src={product.images[0] ?? "/file.svg"} alt={product.name} fill sizes="160px" /></div><h3>{product.name}</h3><strong>{formatNaira(product.price)}</strong></Link><form action={`/api/account/wishlist/${product.id}`} method="post"><button type="submit" aria-label={`Remove ${product.name} from saved items`}><Trash2 size={15} /> Remove</button></form></article>)}</div> : <div className="account-empty"><Heart size={23} /><p>No saved items yet.</p><Link href="/shop">Find something to save <ArrowRight size={14} /></Link></div>}</section>; }
