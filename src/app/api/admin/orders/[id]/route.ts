import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ status: z.enum(["PENDING", "PAID", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"]) });
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) { const session = await auth(); if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Database unavailable." }, { status: 503 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Invalid order status." }, { status: 400 }); const { id } = await params; const order = await prisma.order.update({ where: { id }, data: { status: parsed.data.status, ...(parsed.data.status === "CANCELLED" && { paymentStatus: "FAILED" }) } }); return NextResponse.json({ order }); }
