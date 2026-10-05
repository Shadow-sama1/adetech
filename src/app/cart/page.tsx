import type { Metadata } from "next";
import { auth } from "@/auth";
import CartPage from "@/components/cart-page";
export const metadata: Metadata = { title: "Your cart" };
export default async function CartRoute() { const session = await auth(); return <CartPage loggedIn={Boolean(session?.user)} />; }
