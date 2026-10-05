import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) { const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Address book unavailable." }, { status: 503 }); const { id } = await params; const result = await prisma.address.deleteMany({ where: { id, userId: session.user.id } }); return result.count ? NextResponse.json({ success: true }) : NextResponse.json({ error: "Address not found." }, { status: 404 }); }
