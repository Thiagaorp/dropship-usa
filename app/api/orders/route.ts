import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";

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
    shippingAddress, subtotal, shipping, tax, total,
  } = body;

  const orderNumber = generateOrderNumber();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      customerName,
      customerEmail,
      customerPhone,
      shippingAddress: JSON.stringify(shippingAddress),
      subtotal,
      shipping,
      tax,
      total,
      status: "pending",
      paymentStatus: "paid",
      items: {
        create: items.map((item: {
          productId: string;
          quantity: number;
          price: number;
          title: string;
          image?: string;
        }) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          title: item.title,
          image: item.image,
        })),
      },
    },
    include: { items: true },
  });

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
