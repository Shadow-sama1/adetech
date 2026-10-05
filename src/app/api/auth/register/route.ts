import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { randomBytes, createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requestKey, checkRateLimit } from "@/lib/rate-limit";
import { sendEmail, siteUrl } from "@/lib/email";

const schema = z.object({ name: z.string().trim().min(2).max(80), email: z.email().trim().toLowerCase().optional(), phone: z.string().trim().regex(/^\+?[0-9][0-9\s()-]{7,16}$/).optional(), password: z.string().min(10).max(128).regex(/[A-Za-z]/).regex(/[0-9]/) }).refine((data) => data.email || data.phone, { message: "Enter an email or phone number." });

export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "register"), 5, 60 * 60 * 1000);
  if (!rate.success) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Account registration is temporarily unavailable." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your details." }, { status: 400 });
  const { name, email, phone, password } = parsed.data;
  const duplicate = await prisma.user.findFirst({ where: { OR: [...(email ? [{ email }] : []), ...(phone ? [{ phone }] : [])] } });
  if (duplicate) return NextResponse.json({ error: "An account already exists with those details." }, { status: 409 });
  const user = await prisma.user.create({ data: { name, email, phone, passwordHash: await hash(password, 12) } });
  if (email) {
    const rawToken = randomBytes(32).toString("hex");
    const token = createHash("sha256").update(rawToken).digest("hex");
    await prisma.verificationToken.create({ data: { identifier: email, token, expires: new Date(Date.now() + 24 * 60 * 60 * 1000) } });
    await sendEmail({ to: email, subject: "Verify your Adetech Solar account", html: `<p>Hello ${escapeHtml(name)},</p><p>Please verify your email to finish creating your Adetech account.</p><p><a href="${siteUrl(`/verify-email?token=${rawToken}&email=${encodeURIComponent(email)}`)}">Verify email</a></p>` });
  }
  return NextResponse.json({ success: true, userId: user.id, verificationRequired: Boolean(email) }, { status: 201 });
}

function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char); }
