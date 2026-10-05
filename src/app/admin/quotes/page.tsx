import { prisma } from "@/lib/prisma";
import QuoteManager from "@/app/admin/quotes/quote-manager";
export default async function AdminQuotesPage() { const quotes = process.env.DATABASE_URL ? await prisma.quoteRequest.findMany({ orderBy: { createdAt: "desc" }, take: 200 }) : []; return <section className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">Service enquiries</p><h2>Quote requests</h2></div></div><QuoteManager quotes={quotes} /></section>; }
