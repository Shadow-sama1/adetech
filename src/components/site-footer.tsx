import Link from "next/link";
import { Instagram, Mail, MapPin, Phone, Sun } from "lucide-react";

const footerGroups = [
  { title: "Shop solar", links: [["Solar panels", "/shop?category=solar-panels"], ["Inverters", "/shop?category=inverters"], ["Batteries", "/shop?category=batteries"], ["Complete kits", "/shop?category=solar-kits"]] },
  { title: "Here to help", links: [["Track an order", "/account/orders"], ["Delivery information", "/help/delivery"], ["Returns & warranty", "/help/returns"], ["Contact us", "/contact"]] },
  { title: "Solar services", links: [["Solar installation", "/services/installation"], ["Site survey", "/services/site-survey"], ["System sizing", "/services/system-sizing"], ["Maintenance", "/services/maintenance"]] },
];

export default function SiteFooter() {
  return <footer className="site-footer">
    <div className="page-width footer-main">
      <div className="footer-brand-column"><Link className="brand-mark footer-brand" href="/" aria-label="Adetech Solar home"><span className="brand-icon"><Sun size={24} aria-hidden="true" /></span><span className="brand-wordmark">ade<span>tech</span><small>SOLAR & POWER</small></span></Link><p>Thoughtful solar for brighter, more reliable days. Genuine equipment and the people who know how to make it work.</p><div className="footer-socials"><a href="https://www.instagram.com/" aria-label="Adetech on Instagram"><Instagram size={17} /></a><a href="https://wa.me/2348000000000" aria-label="Chat with Adetech on WhatsApp">WA</a></div></div>
      {footerGroups.map((group) => <div className="footer-link-column" key={group.title}><h2>{group.title}</h2>{group.links.map(([label, href]) => <Link href={href} key={label}>{label}</Link>)}</div>)}
      <div className="footer-contact-column"><h2>Come say hello</h2><a href="tel:+2348000000000"><Phone size={16} /> +234 800 000 0000</a><a href="mailto:hello@adetech.ng"><Mail size={16} /> hello@adetech.ng</a><span><MapPin size={16} /> Serving homes across Nigeria</span><div className="payment-methods" aria-label="Accepted payment methods"><span>PAYMENT METHODS</span><strong>VISA</strong><strong>Verve</strong><strong>Paystack</strong></div></div>
    </div>
    <div className="footer-bottom"><div className="page-width footer-bottom-inner"><span>© {new Date().getFullYear()} Adetech Solar. Made for brighter days.</span><span>Secure payments · Genuine products · Expert support</span></div></div>
  </footer>;
}
