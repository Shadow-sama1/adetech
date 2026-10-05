import Image from "next/image";
import Link from "next/link";
import NewsletterForm from "@/components/newsletter-form";
import { ArrowDownRight, ArrowRight, BadgeCheck, BatteryCharging, ChevronRight, CircleHelp, Clock3, ShieldCheck, Sun, Truck, Zap } from "lucide-react";

const blurPlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 8 6'%3E%3Crect width='8' height='6' fill='%23f3e9dd'/%3E%3C/svg%3E";

const categories = [
  { title: "Solar panels", detail: "Monocrystalline power", href: "/shop?category=solar-panels", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=720&q=80", imageAlt: "Solar panels catching afternoon light" },
  { title: "Inverters", detail: "Pure sine wave systems", href: "/shop?category=inverters", image: "https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?auto=format&fit=crop&w=720&q=80", imageAlt: "Clean energy infrastructure in a green landscape" },
  { title: "Batteries", detail: "Lithium & deep cycle", href: "/shop?category=batteries", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=720&q=80", imageAlt: "Modern energy storage battery system" },
  { title: "Complete kits", detail: "Everything, working together", href: "/shop?category=solar-kits", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=720&q=80", imageAlt: "A rooftop solar panel installation" },
];

const products = [
  { name: "550W Mono PERC Half-Cell Solar Panel", category: "Solar panel · 550W", price: 185000, before: 210000, discount: "12% OFF", rating: "4.8", reviews: "(36)", image: "https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=700&q=80", imageAlt: "Rows of high-efficiency solar panels" },
  { name: "2.5kVA 24V Hybrid Solar Inverter", category: "Hybrid inverter · 2.5kVA", price: 685000, before: 740000, discount: "7% OFF", rating: "4.9", reviews: "(21)", image: "https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=700&q=80", imageAlt: "Electric power distribution equipment" },
  { name: "5.12kWh Lithium Wall-Mount Battery", category: "Lithium battery · 5.12kWh", price: 1485000, before: 1620000, discount: "8% OFF", rating: "4.9", reviews: "(18)", image: "https://images.unsplash.com/photo-1593941707882-a5bba14938c7?auto=format&fit=crop&w=700&q=80", imageAlt: "Residential battery energy storage" },
  { name: "Complete 1kVA Home Solar Starter Kit", category: "Complete kit · 1kVA", price: 1275000, before: 1390000, discount: "8% OFF", rating: "4.7", reviews: "(42)", image: "https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=700&q=80", imageAlt: "Solar panels installed on a home roof" },
];

const formatNaira = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(value);

function SectionHeading({ eyebrow, title, href, linkText = "Shop all", titleId }: { eyebrow: string; title: string; href: string; linkText?: string; titleId?: string }) {
  return <div className="section-heading"><div><p className="eyebrow">{eyebrow}</p><h2 className="section-title" id={titleId}>{title}</h2></div><Link className="section-link" href={href}>{linkText} <ArrowRight size={16} aria-hidden="true" /></Link></div>;
}

export default function Home() {
  return <>
    <section className="hero page-width" aria-labelledby="hero-title">
      <Image className="hero-image" src="https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?auto=format&fit=crop&w=2000&q=88" alt="A home fitted with solar panels under a clear sky" fill priority sizes="100vw" placeholder="blur" blurDataURL={blurPlaceholder} />
      <div className="hero-shade" /><div className="hero-grid-pattern" aria-hidden="true" />
      <div className="hero-content"><span className="hero-kicker"><Sun size={15} aria-hidden="true" /> ENERGY THAT SHOWS UP</span><h1 id="hero-title">Power your home.<br /><span>Own your day.</span></h1><p className="hero-copy">Genuine solar, carefully matched to your life. Shop the equipment or let our experts design your system.</p><div className="hero-actions"><Link className="primary-button" href="/shop">Find your solar <ArrowRight size={17} aria-hidden="true" /></Link><Link className="outline-button" href="/services/system-sizing">Get a system quote <ArrowDownRight size={16} aria-hidden="true" /></Link></div><div className="hero-note"><span className="hero-note-dot" /> Trusted solar, delivered across Nigeria</div></div>
      <div className="hero-stamp" aria-hidden="true"><span>BUILT FOR</span><strong>BRIGHTER<br />DAYS</strong><Sun size={21} /></div><div className="hero-counter" aria-hidden="true"><span>01</span> / 03</div>
    </section>

    <section className="assurance page-width" aria-label="Adetech promises">
      <div className="assurance-item"><span className="assurance-icon"><BadgeCheck size={19} /></span><span><strong>Genuine products</strong><small>Trusted brands, real warranties</small></span></div>
      <div className="assurance-item"><span className="assurance-icon"><Truck size={19} /></span><span><strong>Delivery nationwide</strong><small>We bring power to your door</small></span></div>
      <div className="assurance-item"><span className="assurance-icon"><ShieldCheck size={19} /></span><span><strong>Expert installation</strong><small>Support from quote to switch-on</small></span></div>
      <div className="assurance-item assurance-help"><span className="assurance-icon"><CircleHelp size={19} /></span><span><strong>Need a little help?</strong><small>Talk to a solar specialist</small></span></div>
    </section>

    <section className="category-section page-width" aria-labelledby="category-title"><SectionHeading eyebrow="Start with the right essentials" title="Shop solar your way" titleId="category-title" href="/shop" /><div className="category-grid">{categories.map((category, index) => <Link className={`category-tile category-tile-${index + 1}`} href={category.href} key={category.title}><Image src={category.image} alt={category.imageAlt} fill sizes="(max-width: 640px) 48vw, (max-width: 1000px) 48vw, 25vw" placeholder="blur" blurDataURL={blurPlaceholder} /><span className="category-tint" /><span className="category-copy"><small>{category.detail}</small><strong>{category.title}</strong><span className="category-action">Explore <ChevronRight size={15} /></span></span></Link>)}</div></section>

    <section className="deal-band" aria-labelledby="deal-title"><div className="page-width deal-inner"><div className="deal-heading"><span className="deal-mark"><Zap size={20} fill="currentColor" /></span><div><p className="eyebrow">Good energy, better prices</p><h2 id="deal-title">Today&apos;s bright deals</h2></div></div><div className="deal-timer"><Clock3 size={16} /> Deals worth catching</div><Link className="deal-link" href="/shop?sort=discount">See all deals <ArrowRight size={15} /></Link></div></section>

    <section className="products-section page-width" aria-labelledby="bestseller-title"><SectionHeading eyebrow="Picked by our customers" title="Best sellers" titleId="bestseller-title" href="/shop?sort=popularity" /><div className="product-grid">{products.map((product) => <Link className="product-card" href="/shop" key={product.name}><div className="product-image-wrap"><span className="sale-tag">{product.discount}</span><Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 540px) 46vw, (max-width: 900px) 30vw, 25vw" placeholder="blur" blurDataURL={blurPlaceholder} /></div><div className="product-card-body"><span className="product-category">{product.category}</span><h3 className="product-card-title">{product.name}</h3><div className="price-line"><span className="price-now">{formatNaira(product.price)}</span><span className="price-before">{formatNaira(product.before)}</span></div><div className="product-card-bottom"><span className="rating-row"><span className="star-fill">★★★★★</span> {product.rating} <span>{product.reviews}</span></span><span className="quick-add" aria-label="View product"><ArrowRight size={16} /></span></div></div></Link>)}</div></section>

    <section className="kit-section" aria-labelledby="kit-title"><div className="page-width kit-layout"><div className="kit-copy"><p className="eyebrow">One system. No guesswork.</p><h2 id="kit-title">The right kit is a brighter kind of simple.</h2><p>Matched components, expert sizing and installation options, all in one place.</p><Link className="primary-button" href="/shop?category=solar-kits">Find your complete kit <ArrowRight size={17} /></Link><div className="kit-sizes"><Link href="/shop?kit=1kva"><BatteryCharging size={16} /> 1kVA <span>Essentials</span></Link><Link href="/shop?kit=2.5kva"><BatteryCharging size={16} /> 2.5kVA <span>Everyday home</span></Link><Link href="/shop?kit=5kva"><BatteryCharging size={16} /> 5kVA <span>Whole home</span></Link></div></div><div className="kit-visual"><Image src="https://images.unsplash.com/photo-1509391366360-2e959784a276?auto=format&fit=crop&w=1100&q=85" alt="A solar array powering a home" fill sizes="(max-width: 760px) 100vw, 50vw" placeholder="blur" blurDataURL={blurPlaceholder} /><span className="kit-visual-label"><Sun size={16} /> Sized for your home</span><span className="kit-visual-index">ADETECH / SYSTEMS 001</span></div></div></section>

    <section className="quote-strip page-width" aria-label="Customer review"><div className="quote-stars" aria-label="5 out of 5 stars">★★★★★</div><blockquote>“From the first call to the final switch-on, they made solar feel simple.”</blockquote><span className="quote-byline">— Tola A. <BadgeCheck size={14} /> Verified customer</span><Link href="/reviews" className="section-link">Read their stories <ArrowRight size={15} /></Link></section>

    <section className="newsletter-section"><div className="page-width newsletter-inner"><div><p className="eyebrow">A brighter inbox</p><h2>Good energy, delivered.</h2><p>New arrivals, practical solar advice and offers worth opening.</p></div><NewsletterForm /></div></section>
    <div className="page-width home-footnote"><span>Thoughtfully chosen. Ready for real life.</span><span>Delivery options shown at checkout</span></div>
  </>;
}
