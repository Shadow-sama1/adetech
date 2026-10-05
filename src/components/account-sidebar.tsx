"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { BadgeCheck, Heart, MapPin, Package, Settings, UserRound } from "lucide-react";
const links = [{ href: "/account", label: "Overview", icon: UserRound }, { href: "/account/orders", label: "Orders", icon: Package }, { href: "/account/wishlist", label: "Saved items", icon: Heart }, { href: "/account/addresses", label: "Address book", icon: MapPin }, { href: "/account/settings", label: "Account settings", icon: Settings }, { href: "/account/reviews", label: "Pending reviews", icon: BadgeCheck }];
export default function AccountSidebar() { const pathname = usePathname(); return <aside className="account-sidebar" aria-label="Account navigation"><p className="account-nav-label">MY ACCOUNT</p><nav>{links.map(({ href, label, icon: Icon }) => <Link href={href} className={pathname === href || (href === "/account/orders" && pathname.startsWith(`${href}/`)) ? "is-active" : ""} aria-current={pathname === href ? "page" : undefined} key={href}><Icon size={17} />{label}</Link>)}</nav><button className="account-signout" type="button" onClick={() => signOut({ redirectTo: "/" })}><span>↪</span> Sign out</button></aside>; }
