"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { z } from "zod";
import { ArrowRight, LoaderCircle } from "lucide-react";

export default function TokenForm({ mode }: { mode: "forgot" | "reset" | "verify" }) {
  const params = useSearchParams();
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const email = params.get("email") ?? "";
  const token = params.get("token") ?? "";
  const title = mode === "forgot" ? "Reset your password" : mode === "reset" ? "Choose a new password" : "Verify your email";
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setMessage("");
    const data = new FormData(event.currentTarget);
    const payload = mode === "forgot"
      ? z.object({ email: z.email("Enter a valid email.") }).safeParse({ email: data.get("email") })
      : mode === "reset"
        ? z.object({ password: z.string().min(10).max(128).regex(/[A-Za-z]/).regex(/[0-9]/) }).safeParse({ password: data.get("password") })
        : z.object({}).safeParse({});
    if (!payload.success) { setError("Please check the form details and try again."); return; }
    setBusy(true);
    try {
      const endpoint = mode === "forgot" ? "/api/auth/forgot-password" : mode === "reset" ? "/api/auth/reset-password" : "/api/auth/verify-email";
      const body = mode === "forgot" ? { email: (payload.data as { email: string }).email } : mode === "reset" ? { email, token, password: (payload.data as { password: string }).password } : { email, token };
      const response = await fetch(endpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json(); if (!response.ok) throw new Error(result.error ?? "This request could not be completed.");
      if (mode === "forgot") setMessage(result.message);
      else { setDone(true); setMessage(mode === "reset" ? "Your password has been updated." : "Your email is verified. You can sign in now."); if (mode === "verify") router.refresh(); }
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Please try again."); }
    finally { setBusy(false); }
  };
  return <section className="auth-panel token-panel"><div className="auth-brand"><span>☼</span><strong>ade<span>tech</span></strong></div><p className="eyebrow">Account help</p><h1>{title}</h1><p className="auth-intro">{mode === "forgot" ? "We’ll send you a secure link if an account matches that email." : mode === "reset" ? "Choose a strong password you haven’t used here before." : "Confirm your email address to finish setting up your account."}</p>{error && <p className="form-message form-error" role="alert">{error}</p>}{message && <p className="form-message form-success" role="status">{message}</p>}
    {!done && <form className="auth-fields" onSubmit={submit} noValidate>{mode === "forgot" && <label>Email address<input type="email" name="email" defaultValue={email} autoComplete="email" required /></label>}{mode === "reset" && <label>New password<input type="password" name="password" autoComplete="new-password" minLength={10} required /></label>}{mode === "verify" && (!email || !token) && <p className="form-message form-error">This verification link is missing information. Open the full link from your email.</p>}<button className="auth-submit" type="submit" disabled={busy || (mode !== "forgot" && (!email || !token))}>{busy ? <LoaderCircle size={17} className="spin" /> : null}{mode === "forgot" ? "Send reset link" : mode === "reset" ? "Update password" : "Verify email"}<ArrowRight size={16} /></button></form>}
    <p className="auth-switch"><a href="/login">Back to sign in</a></p>
  </section>;
}
