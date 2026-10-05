import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export async function GET() { const session = await auth(); if (session?.user?.role !== "ADMIN") return NextResponse.json({ error: "Admin access required." }, { status: 403 }); if (!process.env.DATABASE_URL) return NextResponse.json({ quotes: [] }); const quotes = await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 }); return NextResponse.json({ quotes }); }
