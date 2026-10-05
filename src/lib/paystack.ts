import { createHmac, timingSafeEqual } from "node:crypto";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { formatNaira } from "@/lib/format";

const secret = () => process.env.PAYSTACK_SECRET_KEY;
export function isValidPaystackSignature(rawBody: string, signature: string | null) {
  if (!secret() || !signature || !/^[a-f0-9]{64}$/i.test(signature)) return false;
  const digest = createHmac("sha512", secret()!).update(rawBody).digest("hex");
  return timingSafeEqual(Buffer.from(digest, "hex"), Buffer.from(signature, "hex"));
}

export async function verifyPaystackTransaction(reference: string) {
  if (!secret()) throw new Error("Paystack payments are not configured.");
  const response = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret()}` }, cache: "no-store" });
  const body = await response.json();
  if (!response.ok || !body.status || !body.data) throw new Error(body.message ?? "Could not verify payment.");
  return body.data as { status: string; reference: string; amount: number; currency: string; paid_at?: string };
}

export async function markOrderPaid(reference: string, gatewayAmount: number, currency: string, paidAt?: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({ where: { paystackReference: reference }, include: { items: true, user: { select: { email: true, name: true } } } });
    if (!order) throw new Error("Order not found for this payment reference.");
    if (gatewayAmount !== order.total || currency !== order.currency) throw new Error("Payment amount or currency does not match the order.");
    if (order.paymentStatus === "PAID") return { alreadyPaid: true, order };
    const transition = await tx.order.updateMany({ where: { id: order.id, paymentStatus: { not: "PAID" } }, data: { paymentStatus: "PAID", status: "PAID", paidAt: paidAt ? new Date(paidAt) : new Date() } });
    if (transition.count === 0) return { alreadyPaid: true, order };
    for (const item of order.items) {
      const inventory = await tx.product.updateMany({ where: { id: item.productId, stock: { gte: item.quantity } }, data: { stock: { decrement: item.quantity } } });
      if (inventory.count !== 1) throw new Error(`Insufficient stock to complete order ${order.orderNumber}.`);
      await tx.cartItem.deleteMany({ where: { userId: order.userId, productId: item.productId } });
    }
    return { alreadyPaid: false, order };
  }).then(async (result) => {
    const recipient = result.order.checkoutEmail ?? result.order.user.email;
    if (!result.alreadyPaid && recipient) {
      const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
      await sendEmail({ to: recipient, subject: `Adetech order ${result.order.orderNumber} confirmed`, html: `<p>Hello ${escapeHtml(result.order.user.name ?? "there")},</p><p>We received your payment of ${formatNaira(result.order.total)} for order <strong>${escapeHtml(result.order.orderNumber)}</strong>.</p><p><a href="${site}/account/orders/${encodeURIComponent(result.order.orderNumber)}">Track your order</a></p>` });
    }
    return result;
  });
}
function escapeHtml(value: string) { return value.replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[char] ?? char); }
