import type { Metadata } from "next";
import { Suspense } from "react";
import TokenForm from "@/components/token-form";
export const metadata: Metadata = { title: "Verify your email" };
export default function VerifyEmailPage() { return <div className="auth-standalone"><Suspense><TokenForm mode="verify" /></Suspense></div>; }
