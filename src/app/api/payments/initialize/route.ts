import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { requestKey, checkRateLimit } from "@/lib/rate-limit";

const schema = z.object({ items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(50), includeInstallation: z.boolean().default(false) })).max(50).optional(), addressId: z.string().min(1).optional(), deliveryMethod: z.enum(["HOME", "PICKUP"]).optional(), checkoutEmail: z.email().trim().toLowerCase().optional(), retryOrderNumber: z.string().optional() }).refine((value) => value.retryOrderNumber || (value.items?.length && value.addressId && value.deliveryMethod), { message: "Cart, address and delivery method are required." });
const stateFees: Record<string, number> = { Lagos: 2500000, "FCT - Abuja": 3500000, Rivers: 3500000, Ogun: 3000000, Oyo: 3500000, "Akwa Ibom": 4500000, Anambra: 4500000, Kano: 5000000, Kaduna: 4500000, Delta: 4000000 };
const defaultDeliveryFee = 5000000;
const installationFee = 15000000;

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Sign in before checkout.", redirectTo: "/login?callbackUrl=%2Fcheckout" }, { status: 401 });
  const rate = checkRateLimit(requestKey(request, "pay-init"), 8, 60 * 60 * 1000);
  if (!rate.success) return NextResponse.json({ error: "Too many payment attempts. Try again later." }, { status: 429 });
  if (!process.env.DATABASE_URL || !process.env.PAYSTACK_SECRET_KEY) return NextResponse.json({ error: "Checkout payments are not configured yet." }, { status: 503 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Check your checkout details." }, { status: 400 });
  const { addressId, deliveryMethod, checkoutEmail, retryOrderNumber } = parsed.data;
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { email: true } });
  const email = user?.email ?? checkoutEmail;
  if (!email) return NextResponse.json({ error: "Add an email address to your account or checkout details for the Paystack receipt." }, { status: 400 });
  let order;
  if (retryOrderNumber) {
    order = await prisma.order.findFirst({ where: { orderNumber: retryOrderNumber, userId: session.user.id } });
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 });
    if (order.paymentStatus === "PAID") return NextResponse.json({ error: "This order is already paid." }, { status: 409 });
    if (order.status === "CANCELLED") return NextResponse.json({ error: "This order was cancelled and cannot be paid." }, { status: 409 });
  } else {
    const address = await prisma.address.findFirst({ where: { id: addressId!, userId: session.user.id } });
    if (!address) return NextResponse.json({ error: "Choose one of your saved delivery addresses." }, { status: 400 });
    const items = parsed.data.items!;
    const productIds = [...new Set(items.map((item) => item.productId))];
    const products = await prisma.product.findMany({ where: { id: { in: productIds }, isActive: true } });
    if (products.length !== productIds.length) return NextResponse.json({ error: "One or more products are no longer available." }, { status: 409 });
    const productMap = new Map(products.map((product) => [product.id, product]));
    for (const item of items) { const product = productMap.get(item.productId)!; if (product.stock < item.quantity) return NextResponse.json({ error: `${product.name} does not have enough stock for that quantity.` }, { status: 409 }); }
    const subtotal = items.reduce((sum, item) => sum + productMap.get(item.productId)!.price * item.quantity, 0);
    const deliveryFee = deliveryMethod === "PICKUP" ? 0 : (stateFees[address.state] ?? defaultDeliveryFee);
    const installationTotal = items.some((item) => item.includeInstallation) ? installationFee : 0;
    const total = subtotal + deliveryFee + installationTotal;
    const orderNumber = `ADE-${new Date().toISOString().slice(2, 10).replaceAll("-", "")}-${randomBytes(3).toString("hex").toUpperCase()}`;
    order = await prisma.order.create({ data: { orderNumber, userId: session.user.id, checkoutEmail: email, addressId: address.id, subtotal, deliveryFee, installationFee: installationTotal, total, deliveryMethod: deliveryMethod!, addressSnapshot: { recipientName: address.recipientName, phone: address.phone, addressLine: address.addressLine, city: address.city, state: address.state, lga: address.lga, postalCode: address.postalCode }, items: { create: items.map((item) => { const product = productMap.get(item.productId)!; return { productId: product.id, productName: product.name, image: product.images[0] ?? null, quantity: item.quantity, unitPrice: product.price, lineTotal: product.price * item.quantity }; }) } } });
  }
  const reference = `ade_${order.orderNumber.toLowerCase()}_${randomBytes(5).toString("hex")}`;
  await prisma.order.update({ where: { id: order.id }, data: { paystackReference: reference, paymentStatus: "PENDING" } });
  const response = await fetch("https://api.paystack.co/transaction/initialize", { method: "POST", headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ email, amount: order.total, currency: "NGN", reference, callback_url: `${process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin}/checkout/success`, metadata: { orderNumber: order.orderNumber, userId: session.user.id, custom_fields: [{ display_name: "Order number", variable_name: "order_number", value: order.orderNumber }] } }), cache: "no-store" });
  const gateway = await response.json();
  if (!response.ok || !gateway.status || !gateway.data?.authorization_url) { await prisma.order.update({ where: { id: order.id }, data: { paymentStatus: "FAILED" } }); return NextResponse.json({ error: gateway.message ?? "Paystack could not start this payment." }, { status: 502 }); }
  return NextResponse.json({ authorizationUrl: gateway.data.authorization_url, orderNumber: order.orderNumber, reference });
}
