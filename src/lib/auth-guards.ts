import { redirect } from "next/navigation";
import { auth } from "@/auth";

export async function requireUser(returnTo = "/account") {
  const session = await auth();
  if (!session?.user?.id) redirect(`/login?callbackUrl=${encodeURIComponent(returnTo)}`);
  return session.user;
}

export async function requireAdmin() {
  const user = await requireUser("/admin");
  if (user.role !== "ADMIN") redirect("/account");
  return user;
}
