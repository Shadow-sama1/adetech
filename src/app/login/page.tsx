import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth-form";
import { auth } from "@/auth";
export const metadata: Metadata = { title: "Sign in" };
export default async function LoginPage() { const session = await auth(); if (session?.user) redirect("/account"); return <div className="auth-page"><div className="auth-aside"><span className="auth-aside-orbit"><span /></span><p className="eyebrow">Power that feels like yours</p><h2>Brighter days start with a better plan.</h2><p>Your solar journey, products and orders, all in one place.</p><Link href="/shop">Explore the shop <span>→</span></Link></div><Suspense><AuthForm mode="login" /></Suspense></div>; }
