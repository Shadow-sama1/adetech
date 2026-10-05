import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ProfileSettings from "@/components/profile-settings";
export default async function AccountSettingsPage() { const session = await auth(); const user = process.env.DATABASE_URL ? await prisma.user.findUnique({ where: { id: session!.user.id }, select: { name: true, email: true, phone: true } }) : null; return <section className="account-section"><div className="account-section-head"><div><p className="eyebrow">Your details, your way</p><h2>Account settings</h2></div></div><ProfileSettings name={user?.name ?? session?.user.name ?? ""} email={user?.email ?? session?.user.email ?? ""} phone={user?.phone ?? ""} /></section>; }
