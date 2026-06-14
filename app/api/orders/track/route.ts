import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Public order lookup — requires BOTH order number and matching email
// so orders can't be enumerated by number alone.
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const orderNumber = String(body?.orderNumber ?? "").trim().toUpperCase();
  const email = String(body?.email ?? "").trim().toLowerCase();

  if (!orderNumber || !email) {
    return NextResponse.json({ error: "Order number and email are required." }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order || order.customerEmail.toLowerCase() !== email) {
    return NextResponse.json(
      { error: "No order found with that number and email." },
      { status: 404 }
    );
  }

  // Return only what the customer needs — no internal/supplier fields.
  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      status: order.status,
      paymentStatus: order.paymentStatus,
      trackingNumber: order.trackingNumber,
      total: order.total,
      createdAt: order.createdAt.toISOString(),
      items: order.items.map((i) => ({
        title: i.title,
        quantity: i.quantity,
        price: i.price,
        image: i.image,
      })),
    },
  });
}
