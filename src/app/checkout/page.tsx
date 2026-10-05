import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import CheckoutForm from "@/components/checkout-form";
import { requireUser } from "@/lib/auth-guards";
export const metadata: Metadata = { title: "Checkout" };
export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ retry?: string }> }) { const user = await requireUser("/checkout"); const params = await searchParams; const session = await auth(); if (!process.env.DATABASE_URL) return <div className="checkout-page page-width"><h1>Checkout needs setup</h1><p>Connect the Adetech database to place an order.</p><Link href="/cart">Back to cart</Link></div>; const [addresses, retryOrder] = await Promise.all([prisma.address.findMany({ where: { userId: user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }), params.retry ? prisma.order.findFirst({ where: { orderNumber: params.retry, userId: user.id }, select: { orderNumber: true, total: true, paymentStatus: true, addressId: true, addressSnapshot: true } }) : Promise.resolve(null)]); if (params.retry && !retryOrder) redirect("/account/orders"); return <div className="checkout-page page-width"><nav className="breadcrumbs"><Link href="/">Home</Link><span>/</span><Link href="/cart">Cart</Link><span>/</span><span>Checkout</span></nav><div className="checkout-heading"><p className="eyebrow">A few steps to brighter days</p><h1>{retryOrder ? "Retry your payment" : "Checkout"}</h1><p>Secure payment in Nigerian naira.</p></div><CheckoutForm addresses={addresses} email={session?.user.email ?? ""} retryOrder={retryOrder ?? undefined} /></div>; }
