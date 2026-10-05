import type { ReactNode } from "react";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth-guards";
import { BarChart3, ClipboardList, Package, Users } from "lucide-react";
const links = [{ href: "/admin", label: "Overview", icon: BarChart3 }, { href: "/admin/products", label: "Products & stock", icon: Package }, { href: "/admin/orders", label: "Orders", icon: ClipboardList }, { href: "/admin/quotes", label: "Quote requests", icon: ClipboardList }, { href: "/admin/customers", label: "Customers", icon: Users }];
export default async function AdminLayout({ children }: { children: ReactNode }) { await requireAdmin(); return <div className="admin-page page-width"><header className="admin-header"><div><p className="eyebrow">Adetech operations</p><h1>Admin</h1></div><Link href="/">View storefront <span>↗</span></Link></header><div className="admin-layout"><aside className="admin-sidebar" aria-label="Admin navigation">{links.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={16} />{label}</Link>)}</aside><main className="admin-content">{children}</main></div></div>; }
