"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowRight, BatteryCharging, ChevronDown, CircleHelp, Grid2X2, PackageCheck, Search, ShoppingBag, Sun, UserRound, X, Zap } from "lucide-react";

const categories = [
  { title: "Solar Panels", description: "Monocrystalline & more", href: "/shop?category=solar-panels", icon: Sun },
  { title: "Inverters", description: "Pure sine wave power", href: "/shop?category=inverters", icon: Zap },
  { title: "Batteries", description: "Store more, stay on", href: "/shop?category=batteries", icon: BatteryCharging },
  { title: "Charge Controllers", description: "Smarter solar charging", href: "/shop?category=controllers", icon: Grid2X2 },
  { title: "Complete Solar Kits", description: "Matched for your home", href: "/shop?category=solar-kits", icon: PackageCheck },
  { title: "Accessories", description: "Cables, mounts & more", href: "/shop?category=accessories", icon: CircleHelp },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const drawerRef = useRef<HTMLElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const previousPath = useRef(pathname);

  useEffect(() => {
    const syncCartCount = () => {
      const count = Number(window.localStorage.getItem("adetech-cart-count") ?? 0);
      setCartCount(Number.isFinite(count) ? count : 0);
    };
    syncCartCount();
    window.addEventListener("storage", syncCartCount);
    window.addEventListener("adetech:cart-updated", syncCartCount);
    return () => {
      window.removeEventListener("storage", syncCartCount);
      window.removeEventListener("adetech:cart-updated", syncCartCount);
    };
  }, []);

  useEffect(() => {
    if (previousPath.current !== pathname) {
      setDrawerOpen(false);
      setMenuOpen(false);
      previousPath.current = pathname;
    }
  }, [pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    drawerRef.current?.querySelector<HTMLElement>("button, a, input")?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setDrawerOpen(false);
        menuButtonRef.current?.focus();
        return;
      }
      if (event.key !== "Tab" || !drawerRef.current) return;
      const focusable = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])'))
        .filter((element) => element.offsetParent !== null);
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [drawerOpen]);

  const closeDrawer = () => {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  };

  return <>
    <div className="announcement-bar"><p><Sun size={14} aria-hidden="true" /> Real solar. Real support. Delivered across Nigeria.</p><Link href="/services">Explore our installation services <ArrowRight size={13} aria-hidden="true" /></Link></div>
    <header className="site-header">
      <div className="page-width header-main">
        <Link className="brand-mark" href="/" aria-label="Adetech Solar home"><span className="brand-icon"><Sun size={24} strokeWidth={2.25} aria-hidden="true" /></span><span className="brand-wordmark">ade<span>tech</span><small>SOLAR & POWER</small></span></Link>
        <form className="desktop-search" action="/shop" role="search"><label className="visually-hidden" htmlFor="site-search">Search solar products</label><Search size={18} aria-hidden="true" /><input id="site-search" name="q" type="search" placeholder="Search panels, inverters, batteries..." /><button type="submit">Search</button></form>
        <div className="header-actions">
          <Link className="header-action account-action" href="/login"><UserRound size={20} aria-hidden="true" /><span><small>Welcome</small><strong>Account</strong></span></Link>
          <Link className="header-action help-action" href="/help"><CircleHelp size={20} aria-hidden="true" /><span><small>Here to help</small><strong>Help</strong></span></Link>
          <Link className="cart-action" href="/cart" aria-label={`Cart, ${cartCount} items`}><ShoppingBag size={21} aria-hidden="true" /><span>Cart</span><span className="cart-count" aria-live="polite">{cartCount}</span></Link>
          <button className={`mobile-menu-toggle${drawerOpen ? " is-open" : ""}`} ref={menuButtonRef} type="button" aria-label={drawerOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={drawerOpen} aria-controls="mobile-navigation" onClick={() => setDrawerOpen((open) => !open)}><span className="menu-lines" aria-hidden="true"><span /><span /><span /></span></button>
        </div>
      </div>
      <nav className="category-nav" aria-label="Shop categories">
        <div className="page-width category-nav-inner">
          <button className={`category-menu-trigger${menuOpen ? " is-active" : ""}`} type="button" aria-expanded={menuOpen} aria-controls="category-mega-menu" onClick={() => setMenuOpen((open) => !open)} onMouseEnter={() => setMenuOpen(true)}><Grid2X2 size={16} /> Shop by category <ChevronDown size={14} /></button>
          <Link href="/shop?category=solar-kits">Complete kits</Link><Link href="/services">Installation & services</Link><Link href="/shop?sort=discount">Deals</Link><span className="category-nav-spacer" /><Link href="/services/system-sizing">Get a free system sizing <ArrowRight size={14} /></Link>
        </div>
        {menuOpen && <div className="mega-menu" id="category-mega-menu" onMouseLeave={() => setMenuOpen(false)}><div className="page-width mega-menu-inner"><div className="mega-menu-intro"><p className="eyebrow">Find your way to better power</p><h2>Shop by category</h2><Link href="/shop" onClick={() => setMenuOpen(false)}>Browse everything <ArrowRight size={15} /></Link></div><div className="mega-category-grid">{categories.map(({ title, description, href, icon: Icon }) => <Link href={href} className="mega-category" key={title} onClick={() => setMenuOpen(false)}><span><Icon size={19} /></span><span><strong>{title}</strong><small>{description}</small></span><ArrowRight size={14} /></Link>)}<Link href="/services" className="mega-category" onClick={() => setMenuOpen(false)}><span><CircleHelp size={19} /></span><span><strong>Solar services</strong><small>Installation, sizing & care</small></span><ArrowRight size={14} /></Link></div></div></div>}
      </nav>
    </header>
    <div className={`drawer-backdrop${drawerOpen ? " is-visible" : ""}`} aria-hidden="true" onClick={closeDrawer} />
    <nav className={`mobile-drawer${drawerOpen ? " is-open" : ""}`} id="mobile-navigation" ref={drawerRef} aria-label="Mobile navigation" aria-hidden={!drawerOpen} inert={!drawerOpen}>
      <div className="drawer-head"><Link className="brand-mark" href="/" onClick={closeDrawer}><span className="brand-icon"><Sun size={23} aria-hidden="true" /></span><span className="brand-wordmark">ade<span>tech</span><small>SOLAR & POWER</small></span></Link><button className="drawer-close" type="button" onClick={closeDrawer} aria-label="Close menu"><X size={21} /></button></div>
      <form className="drawer-search" action="/shop" role="search"><label className="visually-hidden" htmlFor="drawer-search">Search solar products</label><Search size={18} aria-hidden="true" /><input id="drawer-search" name="q" type="search" placeholder="What are you looking for?" /><button type="submit" aria-label="Submit search"><ArrowRight size={18} /></button></form>
      <div className="drawer-account-links"><Link href="/login" onClick={closeDrawer}><UserRound size={18} /> Login / My Account <ArrowRight size={15} /></Link><Link href="/account/orders" onClick={closeDrawer}><PackageCheck size={18} /> My orders <ArrowRight size={15} /></Link></div>
      <div className="drawer-section-label">Shop solar</div>
      <div className="drawer-category-list">{categories.map(({ title, href, icon: Icon }) => <Link href={href} key={title} onClick={closeDrawer}><Icon size={18} /><span>{title}</span><ArrowRight size={14} /></Link>)}</div>
      <div className="drawer-contact"><span>Need a hand choosing?</span><Link href="/contact" onClick={closeDrawer}>Talk to our solar team <ArrowRight size={15} /></Link></div>
      <div className="drawer-bottom-links"><Link href="/services" onClick={closeDrawer}>Installation & services</Link><Link href="/help" onClick={closeDrawer}>Help centre</Link></div>
    </nav>
  </>;
}
