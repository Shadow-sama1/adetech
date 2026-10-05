import type { Metadata } from "next";
import { Suspense } from "react";
import TokenForm from "@/components/token-form";
export const metadata: Metadata = { title: "Reset your password" };
export default function ForgotPasswordPage() { return <div className="auth-standalone"><Suspense><TokenForm mode="forgot" /></Suspense></div>; }
