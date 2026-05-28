import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  const { amount, currency = "usd", metadata } = await req.json();

  if (!amount || amount < 0.5) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "sk_test_YOUR_STRIPE_SECRET_KEY") {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to environment variables." },
      { status: 503 }
    );
  }

  try {
    const paymentIntent = await getStripe().paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: metadata ?? {},
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Stripe error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
