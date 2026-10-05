import { prisma } from "@/lib/prisma";
import OrderManager from "@/app/admin/orders/order-manager";
export default async function AdminOrdersPage() { const orders = process.env.DATABASE_URL ? await prisma.order.findMany({ include: { user: { select: { name: true, email: true } } }, orderBy: { createdAt: "desc" }, take: 200 }) : []; return <section className="admin-section"><div className="admin-section-heading"><div><p className="eyebrow">Fulfilment</p><h2>Orders</h2></div></div><OrderManager orders={orders} /></section>; }
