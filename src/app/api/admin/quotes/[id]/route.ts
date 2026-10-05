import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ status: z.enum(["NEW", "CONTACTED", "QUOTED", "CLOSED"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const session = await auth(); if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database unavailable." }, { status: 503 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid quote status." }, { status: 400 }); const { id } = await params; const quote = await prisma.quoteRequest.update({ where: { id }, data: { status: parsed.data.status } }); return NextResponse.json({ quote }); }
