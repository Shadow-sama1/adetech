import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const from = process.env.EMAIL_FROM ?? "Adetech Solar <onboarding@resend.dev>";

export async function sendEmail(input: { to: string; subject: string; html: string }) {
  if (!resend) return { skipped: true as const };
  return resend.emails.send({ from, ...input });
}

export function siteUrl(path: string) {
  return new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").toString();
}
