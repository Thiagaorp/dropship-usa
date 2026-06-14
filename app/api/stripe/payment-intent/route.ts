import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const { amount, currency = "usd", metadata } = await req.json();

  if (!amount || amount < 0.5) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey === "sk_test_YOUR_STRIPE_SECRET_KEY") {
    return NextResponse.json(
      { error: "Stripe not configured. Add STRIPE_SECRET_KEY to Vercel environment variables." },
      { status: 503 }
    );
  }

  try {
    // Dynamically require stripe so it is never in Turbopack's module graph
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Stripe = require("stripe");
    // Use the Fetch-based HTTP client — the default Node http client throws
    // StripeConnectionError on Vercel's serverless runtime.
    const stripe = new Stripe(secretKey, {
      apiVersion: "2026-05-27.dahlia",
      httpClient: Stripe.createFetchHttpClient(),
    });

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      automatic_payment_methods: { enabled: true },
      metadata: metadata ?? {},
    });
    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (err: unknown) {
    const e = err as { message?: string; type?: string; code?: string; name?: string; statusCode?: number };
    return NextResponse.json(
      {
        error: e?.message ?? "Stripe error",
        debug: { type: e?.type, code: e?.code, name: e?.name, statusCode: e?.statusCode },
      },
      { status: 500 }
    );
  }
}
