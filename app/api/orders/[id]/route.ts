import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    order: {
      ...order,
      shippingAddress: JSON.parse(order.shippingAddress),
      createdAt: order.createdAt.toISOString(),
      updatedAt: order.updatedAt.toISOString(),
    },
  });
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();
  const { status, paymentStatus, trackingNumber, supplierOrdered } = body;

  const order = await prisma.order.update({
    where: { id },
    data: {
      ...(status && { status }),
      ...(paymentStatus && { paymentStatus }),
      ...(trackingNumber !== undefined && { trackingNumber }),
      ...(supplierOrdered !== undefined && { supplierOrdered }),
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
  });
}
