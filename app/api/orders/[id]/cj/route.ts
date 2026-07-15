export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createCJOrder, getVariants, getCJOrderDetail, type ShippingAddress } from "@/lib/cj";

/**
 * POST — create this order in CJ as an unpaid draft.
 * Products with more than one variant are reported back instead of guessed:
 * shipping the wrong size is worse than asking.
 */
export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (order.supplierOrderId) {
    return NextResponse.json(
      { error: "Este pedido já foi enviado ao CJ", supplierOrderId: order.supplierOrderId },
      { status: 409 }
    );
  }

  let address: ShippingAddress;
  try {
    address = JSON.parse(order.shippingAddress);
  } catch {
    return NextResponse.json({ error: "Endereço do pedido inválido" }, { status: 400 });
  }

  try {
    const products: { vid: string; quantity: number }[] = [];
    const needsChoice: { title: string; options: number }[] = [];
    const missing: string[] = [];

    for (const item of order.items) {
      const pid = item.product.supplierId;
      if (!pid) {
        missing.push(item.title);
        continue;
      }
      const variants = await getVariants(pid);
      if (variants.length === 0) {
        missing.push(item.title);
      } else if (variants.length === 1) {
        products.push({ vid: variants[0].vid, quantity: item.quantity });
      } else {
        needsChoice.push({ title: item.title, options: variants.length });
      }
    }

    if (missing.length || needsChoice.length) {
      return NextResponse.json(
        {
          error: "Pedido precisa de conferência manual",
          missing,
          needsChoice,
          hint: needsChoice.length
            ? "Produtos com variação (tamanho/cor) precisam ser pedidos no painel do CJ."
            : "Produto sem vínculo com o CJ.",
        },
        { status: 422 }
      );
    }

    const cj = await createCJOrder({
      orderNumber: order.orderNumber,
      address,
      products,
      remark: `ShopDirectUSA ${order.orderNumber}`,
    });

    await prisma.order.update({
      where: { id },
      data: { supplierOrderId: cj.orderId, supplierStatus: "draft" },
    });

    return NextResponse.json({
      success: true,
      supplierOrderId: cj.orderId,
      orderNum: cj.orderNum,
      message: "Rascunho criado no CJ. Pague no painel do CJ para despachar.",
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

/** GET — pull current CJ status and tracking number back into the shop. */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) return NextResponse.json({ error: "Pedido não encontrado" }, { status: 404 });
  if (!order.supplierOrderId) {
    return NextResponse.json({ error: "Pedido ainda não enviado ao CJ" }, { status: 404 });
  }

  try {
    const detail = await getCJOrderDetail(order.supplierOrderId);
    const tracking = detail?.trackNumber ?? detail?.trackingNumber ?? null;
    const status = detail?.orderStatus ?? detail?.status ?? null;

    const data: Record<string, unknown> = {};
    if (status) data.supplierStatus = String(status);
    if (tracking && tracking !== order.trackingNumber) {
      data.trackingNumber = tracking;
      data.status = "shipped";
      data.supplierOrdered = true;
    }
    if (Object.keys(data).length) await prisma.order.update({ where: { id }, data });

    return NextResponse.json({ supplierStatus: status, trackingNumber: tracking, detail });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
