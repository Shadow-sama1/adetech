import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import PaymentResult from "@/components/payment-result";
import { auth } from "@/auth";
export const metadata: Metadata = { title: "Payment confirmation" };
export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ reference?: string }> }) { const session = await auth(); const params = await searchParams; if (!session?.user) redirect(`/login?callbackUrl=${encodeURIComponent(`/checkout/success?reference=${params.reference ?? ""}`)}`); return <div className="payment-result-page page-width"><Suspense><PaymentResult /></Suspense></div>; }
