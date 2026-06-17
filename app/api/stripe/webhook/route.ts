import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

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

      const resendKey = process.env.RESEND_API_KEY;
      if (resendKey) {
        const resend = new Resend(resendKey);
        const addr = (() => { try { return JSON.parse(order.shippingAddress); } catch { return {}; } })();
        const itemsList = order.items
          .map((i) => `${i.quantity}x ${i.title} — $${i.price.toFixed(2)}`)
          .join("\n");

        await resend.emails.send({
          from: "ShopDirectUSA <onboarding@resend.dev>",
          to: "thiagao.rodriguesss@gmail.com",
          subject: `💰 Nova venda! ${order.orderNumber} — $${order.total.toFixed(2)}`,
          text: `Nova venda no ShopDirectUSA!\n\nPedido: ${order.orderNumber}\nValor: $${order.total.toFixed(2)}\nCliente: ${order.customerName} (${order.customerEmail})\n\nProdutos:\n${itemsList}\n\nEndereço:\n${addr.street ?? ""}, ${addr.city ?? ""}, ${addr.state ?? ""} ${addr.zip ?? ""}\n\nVeja no painel: https://www.shopdirectusa.com/admin`,
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
