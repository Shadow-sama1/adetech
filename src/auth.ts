import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { compare } from "bcryptjs";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit, requestKey } from "@/lib/rate-limit";

const credentialsSchema = z.object({
  identifier: z.string().trim().min(3).max(254),
  password: z.string().min(8).max(128),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret: process.env.AUTH_SECRET ?? (process.env.NODE_ENV === "development" ? "adetech-local-development-secret-change-me" : undefined),
  trustHost: true,
  session: { strategy: "jwt" },
  pages: { signIn: "/login", error: "/login" },
  providers: [
    Credentials({
      credentials: { identifier: { label: "Email or phone", type: "text" }, password: { label: "Password", type: "password" } },
      async authorize(input, request) {
        const parsed = credentialsSchema.safeParse(input);
        if (!parsed.success || !process.env.DATABASE_URL) return null;
        const identifier = parsed.data.identifier.toLowerCase();
        const address = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
        if (!checkRateLimit(`${requestKey(request, "credentials")}:${identifier}:${address}`, 10, 15 * 60 * 1000).success) return null;
        const user = await prisma.user.findFirst({ where: { OR: [{ email: identifier }, { phone: parsed.data.identifier }] } });
        if (!user?.passwordHash || !(await compare(parsed.data.password, user.passwordHash))) return null;
        if (user.email && !user.emailVerified) return null;
        return { id: user.id, name: user.name, email: user.email, image: user.image, role: user.role, emailVerified: user.emailVerified };
      },
    }),
    ...(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
      ? [Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET })]
      : []),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.role = (user as typeof user & { role?: string }).role ?? "CUSTOMER";
        token.emailVerified = Boolean((user as typeof user & { emailVerified?: Date | null }).emailVerified);
      }
      if (token.sub && !token.role && process.env.DATABASE_URL) {
        const current = await prisma.user.findUnique({ where: { id: token.sub }, select: { role: true, emailVerified: true } });
        token.role = current?.role ?? "CUSTOMER";
        token.emailVerified = Boolean(current?.emailVerified);
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.userId ?? token.sub ?? "");
        session.user.role = String(token.role ?? "CUSTOMER");
        session.user.isEmailVerified = Boolean(token.emailVerified);
      }
      return session;
    },
    async signIn({ user, account }) {
      if (account?.provider !== "google" || !user.email || !process.env.DATABASE_URL) return true;
      const existing = await prisma.user.findUnique({ where: { email: user.email }, select: { emailVerified: true } });
      return !existing || Boolean(existing.emailVerified);
    },
  },
});
