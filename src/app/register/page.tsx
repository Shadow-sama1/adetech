import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import AuthForm from "@/components/auth-form";
import { auth } from "@/auth";
export const metadata: Metadata = { title: "Create an account" };
export default async function RegisterPage() { const session = await auth(); if (session?.user) redirect("/account"); return <div className="auth-page auth-page-register"><div className="auth-aside"><span className="auth-aside-orbit"><span /></span><p className="eyebrow">More than a checkout</p><h2>Your power. Your plans. One account.</h2><p>Keep your addresses, orders and solar setup details close at hand.</p></div><Suspense><AuthForm mode="register" /></Suspense></div>; }
