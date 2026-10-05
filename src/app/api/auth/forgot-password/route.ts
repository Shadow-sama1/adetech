import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";
import { sendEmail, siteUrl } from "@/lib/email";

const schema = z.object({ email: z.email().trim().toLowerCase() });
export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "forgot-password"), 5, 60 * 60 * 1000);
  if (!rate.success) return NextResponse.json({ message: "If an account exists for that email, reset instructions have been sent." });
  if (!process.env.DATABASE_URL) return NextResponse.json({ message: "If an account exists for that email, reset instructions have been sent." });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { email: parsed.data.email }, select: { id: true, name: true } });
  if (user) {
    await prisma.passwordResetToken.deleteMany({ where: { identifier: parsed.data.email } });
    const rawToken = randomBytes(32).toString("hex");
    const token = createHash("sha256").update(rawToken).digest("hex");
    await prisma.passwordResetToken.create({ data: { identifier: parsed.data.email, token, expires: new Date(Date.now() + 60 * 60 * 1000) } });
    await sendEmail({ to: parsed.data.email, subject: "Reset your Adetech password", html: `<p>Hello ${escapeHtml(user.name ?? "there")},</p><p><a href="${siteUrl(`/reset-password?token=${rawToken}&email=${encodeURIComponent(parsed.data.email)}`)}">Choose a new password</a>. This link expires in one hour.</p>` });
  }
  return NextResponse.json({ message: "If an account exists for that email, reset instructions have been sent." });
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char); }
