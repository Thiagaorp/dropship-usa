// Stripe is loaded lazily via require() so it is never evaluated at
// module import time (which would fail during Next.js build when
// STRIPE_SECRET_KEY is not available in the static-analysis phase).
// The "stripe" package is also listed in serverExternalPackages so
// Turbopack never bundles it — it is loaded from node_modules at runtime.

import type Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your Vercel environment variables."
      );
    }
    // Dynamic require keeps the import out of Turbopack's module graph.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const StripeClass = require("stripe") as typeof import("stripe");
    // stripe exports the class as .default in CJS interop
    const Ctor = (
      typeof StripeClass === "function" ? StripeClass : (StripeClass as { default: typeof Stripe }).default
    ) as new (key: string, opts: { apiVersion: string }) => Stripe;
    _stripe = new Ctor(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}
