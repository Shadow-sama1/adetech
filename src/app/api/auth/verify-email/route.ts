import { NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const schema = z.object({ email: z.email().trim().toLowerCase(), token: z.string().min(32).max(128) });
export async function POST(request: Request) {
  const rate = checkRateLimit(requestKey(request, "verify-email"), 10, 60 * 60 * 1000);
  if (!rate.success) return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Email verification is temporarily unavailable." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "This verification link is invalid." }, { status: 400 });
  const token = createHash("sha256").update(parsed.data.token).digest("hex");
  const record = await prisma.verificationToken.findFirst({ where: { identifier: parsed.data.email, token, expires: { gt: new Date() } } });
  if (!record) return NextResponse.json({ error: "This verification link is invalid or expired." }, { status: 400 });
  await prisma.$transaction([prisma.user.update({ where: { email: parsed.data.email }, data: { emailVerified: new Date() } }), prisma.verificationToken.deleteMany({ where: { identifier: parsed.data.email } })]);
  return NextResponse.json({ success: true });
}
