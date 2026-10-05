import { NextResponse } from "next/server";
import { compare, hash } from "bcryptjs";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
const schema = z.object({ currentPassword: z.string().min(1).max(128), password: z.string().min(10).max(128).regex(/[A-Za-z]/).regex(/[0-9]/) });
export async function PATCH(request: Request) { const session = await auth(); if (!session?.user?.id) return NextResponse.json({ error: "Sign in required." }, { status: 401 }); if (!process.env.DATABASE_URL) return NextResponse.json({ error: "Password change unavailable." }, { status: 503 }); const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: "Choose a password with at least 10 characters, including a letter and number." }, { status: 400 }); const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { passwordHash: true } }); if (!user?.passwordHash || !(await compare(parsed.data.currentPassword, user.passwordHash))) return NextResponse.json({ error: "Your current password is incorrect." }, { status: 400 }); await prisma.user.update({ where: { id: session.user.id }, data: { passwordHash: await hash(parsed.data.password, 12) } }); return NextResponse.json({ success: true }); }
