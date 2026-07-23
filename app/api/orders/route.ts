import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { evaluateDiscount } from "@/lib/discounts";
import { validateOrder } from "@/lib/validate-order";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const page = parseInt(searchParams.get("page") ?? "1");
  const limit = parseInt(searchParams.get("limit") ?? "20");

  const where: Record<string, unknown> = {};
  if (status) where.status = status;

  const [rawOrders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.order.count({ where }),
  ]);

  const orders = rawOrders.map((o) => ({
    ...o,
    shippingAddress: JSON.parse(o.shippingAddress),
    createdAt: o.createdAt.toISOString(),
    updatedAt: o.updatedAt.toISOString(),
  }));

  return NextResponse.json({ orders, total });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    items, customerName, customerEmail, customerPhone,
    shippingAddress, discountCode,
  } = body;

  // Reject malformed / non-US orders (blocks the bot traffic) before touching the DB.
  const invalid = validateOrder({ items, customerEmail, shippingAddress });
  if (invalid) return NextResponse.json({ error: invalid }, { status: 400 });

  // Re-price every line from the DB — never trust prices sent by the client.
  const productIds = items.map((i: { productId: string }) => i.productId);
  const dbProducts = await prisma.product.findMany({
    where: { id: { in: productIds }, active: true },
  });
  const priceById = new Map(dbProducts.map((p) => [p.id, p.price]));

  const pricedItems = items.map((i: { productId: string; quantity: number; title: string; image?: string }) => {
    const realPrice = priceById.get(i.productId);
    if (realPrice == null) throw new Error(`Produto inválido: ${i.productId}`);
    const qty = Math.max(1, Math.min(99, Math.floor(Number(i.quantity) || 1)));
    return { productId: i.productId, quantity: qty, price: realPrice, title: i.title, image: i.image };
  });

  const subtotal = Math.round(pricedItems.reduce((s: number, i: { price: number; quantity: number }) => s + i.price * i.quantity, 0) * 100) / 100;

  const orderNumber = generateOrderNumber();

  // Re-evaluate any discount server-side so the total can't be tampered with.
  let discount = 0;
  let appliedCode: string | null = null;
  if (discountCode) {
    const result = await evaluateDiscount(String(discountCode), subtotal);
    if (result.valid && result.discountAmount) {
      discount = result.discountAmount;
      appliedCode = result.code ?? null;
      await prisma.discountCode.updateMany({
        where: { code: appliedCode ?? undefined },
        data: { usedCount: { increment: 1 } },
      });
    }
  }

  // Shipping and tax are computed server-side (store rule: free shipping, 8% tax)
  // so the client can't send its own values.
  const shippingCost = 0;
  const taxAmount = Math.round(Math.max(0, subtotal - discount) * 0.08 * 100) / 100;
  const total = Math.max(0, subtotal - discount + shippingCost + taxAmount);

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: JSON.stringify(shippingAddress),
      subtotal,
      shipping: shippingCost,
      tax: taxAmount,
      discount,
      discountCode: appliedCode,
      total,
      status: "pending",
      // Orders start UNPAID. Only the Stripe webhook (payment_intent.succeeded)
      // may flip this to "paid" — otherwise a bot that POSTs the checkout form
      // creates a "paid" order without ever paying, and fulfilment ships for free.
      paymentStatus: "pending",
      items: { create: pricedItems },
    },
    include: { items: true },
  });

  // Mark any abandoned cart for this email as recovered.
  if (customerEmail) {
    await prisma.abandonedCart.updateMany({
      where: { email: String(customerEmail).toLowerCase() },
      data: { recovered: true },
    });
  }

  return NextResponse.json({
    order: {
      ...order,
      shippingAddress: JSON.parse(order.shippingAddress),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
    orderNumber: order.orderNumber,
  }, { status: 201 });
}
