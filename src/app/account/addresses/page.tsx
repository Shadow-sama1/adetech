import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import AddressManager from "@/components/address-manager";
export default async function AddressesPage() { const session = await auth(); const addresses = process.env.DATABASE_URL ? await prisma.address.findMany({ where: { userId: session!.user.id }, orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }] }) : []; return <section className="account-section"><div className="account-section-head"><div><p className="eyebrow">Where we deliver</p><h2>Address book</h2></div></div><AddressManager addresses={addresses} /></section>; }
