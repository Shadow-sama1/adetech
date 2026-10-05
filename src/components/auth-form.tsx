"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import { z } from "zod";
import { ArrowRight, Eye, EyeOff, LoaderCircle, Sun } from "lucide-react";

const schema = z.object({
  name: z.string().trim().min(2, "Enter your full name.").max(80).optional(),
  identifier: z.string().trim().min(3, "Enter your email or phone number.").max(254),
  password: z.string().min(10, "Use at least 10 characters.").max(128).regex(/[A-Za-z]/, "Include at least one letter.").regex(/[0-9]/, "Include at least one number."),
});

export default function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register";
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/account";
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    const identifier = String(data.get("identifier") ?? "").trim();
    const parsed = schema.safeParse({ name: data.get("name") || undefined, identifier, password: data.get("password") });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the details and try again."); return; }
    setBusy(true);
    try {
      if (isRegister) {
        const isEmail = identifier.includes("@");
        const response = await fetch("/api/auth/register", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: parsed.data.name, ...(isEmail ? { email: identifier.toLowerCase() } : { phone: identifier }), password: parsed.data.password }) });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error ?? "Could not create your account.");
        setMessage(result.verificationRequired ? "Account created. Check your email for a verification link before signing in." : "Account created. You can sign in now.");
      } else {
        const result = await signIn("credentials", { identifier, password: parsed.data.password, redirect: false, callbackUrl });
        if (result?.error) throw new Error("Those sign-in details weren’t recognised.");
        router.push(result?.url ?? callbackUrl);
        router.refresh();
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Something went wrong. Try again.");
    } finally { setBusy(false); }
  }

  async function googleSignIn() {
    setBusy(true); setError("");
    try { await signIn("google", { callbackUrl }); }
    catch { setError("Google sign-in is currently unavailable."); setBusy(false); }
  }

  return <section className="auth-panel"><div className="auth-brand"><span><Sun size={23} /></span><strong>ade<span>tech</span></strong></div><p className="eyebrow">{isRegister ? "Start brighter" : "Welcome back"}</p><h1>{isRegister ? "Create your account" : "Sign in to Adetech"}</h1><p className="auth-intro">{isRegister ? "Save your addresses, track deliveries and make checkout easier." : "Sign in to manage orders and continue to checkout."}</p>
    {error && <p className="form-message form-error" role="alert">{error}</p>}{message && <p className="form-message form-success" role="status">{message}</p>}
    <form className="auth-fields" onSubmit={submit} noValidate>
      {isRegister && <label>Full name<input name="name" type="text" autoComplete="name" placeholder="Your name" required /></label>}
      <label>Email or phone number<input name="identifier" type="text" autoComplete={isRegister ? "email" : "username"} placeholder="you@example.com or +234..." required /></label>
      <label>Password<span className="password-field"><input name="password" type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} placeholder={isRegister ? "At least 10 characters" : "Your password"} required minLength={10} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></span></label>
      {!isRegister && <Link className="forgot-link" href="/forgot-password">Forgot password?</Link>}
      <button className="auth-submit" type="submit" disabled={busy}>{busy ? <LoaderCircle size={17} className="spin" /> : null}{isRegister ? "Create account" : "Sign in"}<ArrowRight size={16} /></button>
    </form>
    <div className="auth-divider"><span>or continue with</span></div><button className="google-button" type="button" onClick={googleSignIn} disabled={busy}><span className="google-g">G</span> Continue with Google</button>
    <p className="auth-switch">{isRegister ? "Already have an account?" : "New to Adetech?"} <Link href={isRegister ? "/login" : "/register"}>{isRegister ? "Sign in" : "Create an account"}</Link></p>
  </section>;
}
