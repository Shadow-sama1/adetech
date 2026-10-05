import type { ReactNode } from "react";
import { requireUser } from "@/lib/auth-guards";
import AccountSidebar from "@/components/account-sidebar";
export default async function AccountLayout({ children }: { children: ReactNode }) { await requireUser(); return <div className="account-page page-width"><div className="account-heading"><p className="eyebrow">Your Adetech</p><h1>Your account</h1><p>Orders, addresses and the details you need.</p></div><div className="account-layout"><AccountSidebar /><div className="account-content">{children}</div></div></div>; }
