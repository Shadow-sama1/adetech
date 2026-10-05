import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";
const schema = z.object({ email: z.email().trim().toLowerCase() });
export async function POST(request: Request) { const rate = checkRateLimit(requestKey(request, "newsletter"), 5, 60 * 60 * 1000); if (!rate.success) return NextResponse.json({ error: "Please wait before subscribing again." }, { status: 429 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Newsletter sign-up is temporarily unavailable." }, { status: 503 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 }); await prisma.newsletterSubscriber.upsert({ where: { email: parsed.data.email }, create: { email: parsed.data.email }, update: {} }); return NextResponse.json({ success: true }); }
