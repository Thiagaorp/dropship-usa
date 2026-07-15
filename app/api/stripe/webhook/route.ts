import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";
import { createCJOrder, getVariants, type ShippingAddress } from "@/lib/cj";

export const dynamic = "force-dynamic";

type CJResult =
  | { ok: true; supplierOrderId: string }
  | { ok: false; reason: string };

/**
 * Places the paid order in CJ as an unpaid draft so fulfilment is one click in
 * the CJ panel instead of retyping the address. Never throws: the customer has
 * already paid, so a CJ hiccup must not fail the webhook (Stripe would retry
 * and the order would be duplicated).
 */
async function criarRascunhoCJ(order: {
  id: string;
  orderNumber: string;
  shippingAddress: string;
  items: { title: string; quantity: number; productId: string }[];
}): Promise<CJResult> {
  try {
    if (!process.env.CJ_API_KEY) return { ok: false, reason: "CJ_API_KEY não configurada" };

    const address: ShippingAddress = JSON.parse(order.shippingAddress);
    const products: { vid: string; quantity: number }[] = [];

    for (const item of order.items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      const pid = product?.supplierId;
      if (!pid) return { ok: false, reason: `"${item.title}" não tem vínculo com o CJ` };

      const variants = await getVariants(pid);
      if (variants.length === 0) return { ok: false, reason: `"${item.title}" sem variação no CJ` };
      if (variants.length > 1) {
        return { ok: false, reason: `"${item.title}" tem ${variants.length} variações — escolha no painel do CJ` };
      }
      products.push({ vid: variants[0].vid, quantity: item.quantity });
    }

    const cj = await createCJOrder({
      orderNumber: order.orderNumber,
      address,
      products,
      remark: `ShopDirectUSA ${order.orderNumber}`,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { supplierOrderId: cj.orderId, supplierStatus: "draft" },
    });
    return { ok: true, supplierOrderId: cj.orderId };
  } catch (err) {
    return { ok: false, reason: err instanceof Error ? err.message : String(err) };
  }
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const secretKey = process.env.STRIPE_SECRET_KEY;

  if (!sig || !webhookSecret || !secretKey) {
    return NextResponse.json({ error: "Stripe not configured" }, { status: 400 });
  }

  // Dynamically require stripe so it is never in Turbopack's module graph
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const Stripe = require("stripe");
  const stripe = new Stripe(secretKey, { apiVersion: "2026-05-27.dahlia" });

  let event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "payment_intent.succeeded") {
    const pi = event.data.object;
    const orderId = pi.metadata?.orderId;
    if (orderId) {
      const order = await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "paid", paymentIntentId: pi.id, status: "processing" },
        include: { items: true },
      });

      const cj = await criarRascunhoCJ(order);

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        const addr: ShippingAddress = (() => {
          try { return JSON.parse(order.shippingAddress); } catch { return {}; }
        })();
        const itemsList = order.items
          .map((i) => `${i.quantity}x ${i.title} — $${i.price.toFixed(2)}`)
          .join("\n");
        const enderecoFmt = [
          [addr.firstName, addr.lastName].filter(Boolean).join(" "),
          [addr.address1, addr.address2].filter(Boolean).join(", "),
          `${addr.city ?? ""}, ${addr.state ?? ""} ${addr.zipCode ?? ""}`.trim(),
          addr.country ?? "US",
          addr.phone ? `Tel: ${addr.phone}` : "",
        ].filter(Boolean).join("\n");

        const cjBloco = cj.ok
          ? `✅ PEDIDO JÁ CRIADO NO CJ (rascunho, não pago)\nCJ Order ID: ${cj.supplierOrderId}\n\n➡️ Só falta PAGAR no painel do CJ para despachar:\nhttps://cjdropshipping.com/myCJ.html#/order/list`
          : `⚠️ AÇÃO MANUAL NECESSÁRIA — não deu para criar no CJ automaticamente\nMotivo: ${cj.reason}\n\n➡️ Faça o pedido manualmente:\nhttps://cjdropshipping.com/myCJ.html#/order/list`;

        await resend.emails.send({
          from: "ShopDirectUSA <onboarding@resend.dev>",
          to: "thiagao.rodriguesss@gmail.com",
          subject: `💰 Nova venda! ${order.orderNumber} — $${order.total.toFixed(2)}`,
          text: `Nova venda no ShopDirectUSA!\n\nPedido: ${order.orderNumber}\nValor: $${order.total.toFixed(2)}\nCliente: ${order.customerName} (${order.customerEmail})\n\nProdutos:\n${itemsList}\n\nEndereço de entrega:\n${enderecoFmt}\n\n${cjBloco}\n\nPainel da loja: https://www.shopdirectusa.com/admin/orders`,
        });
      }
    }
  }

  if (event.type === "payment_intent.payment_failed") {
    const pi = event.data.object;
    const orderId = pi.metadata?.orderId;
    if (orderId) {
      await prisma.order.update({
        where: { id: orderId },
        data: { paymentStatus: "failed" },
      });
    }
  }

  return NextResponse.json({ received: true });
}
