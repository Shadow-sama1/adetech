import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ name: z.string().trim().min(2).max(80), slug: z.string().trim().toLowerCase().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/), description: z.string().trim().max(500).optional(), image: z.url().optional() });
export async function POST(request: Request) { const session = await auth(); if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database unavailable." }, { status: 503 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid category details." }, { status: 400 }); const category = await prisma.category.create({ data: parsed.data }); return NextResponse.json({ category }, { status: 201 }); }
