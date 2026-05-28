import Stripe from "stripe";

let _stripe: Stripe | undefined;

/**
 * Returns a cached Stripe instance, initialised lazily at request time
 * (never at module evaluation / build time).
 */
export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) {
      throw new Error(
        "STRIPE_SECRET_KEY is not set. Add it to your environment variables."
      );
    }
    _stripe = new Stripe(key, { apiVersion: "2026-05-27.dahlia" });
  }
  return _stripe;
}
