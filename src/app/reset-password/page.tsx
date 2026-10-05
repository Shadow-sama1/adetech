import type { Metadata } from "next";
import { Suspense } from "react";
import TokenForm from "@/components/token-form";
export const metadata: Metadata = { title: "Choose a new password" };
export default function ResetPasswordPage() { return <div className="auth-standalone"><Suspense><TokenForm mode="reset" /></Suspense></div>; }
