/**
 * Business identity and shipping promises — the single source of truth.
 *
 * WHY THIS EXISTS: on 2026-09-24 Google Merchant Center blocked every product
 * for "Misrepresentation". The site hid who operates the store (fake 1-800
 * number, "Location: United States") and its shipping pages promised speeds
 * and an expedited option that neither the checkout nor the Merchant Center
 * shipping settings offered.
 *
 * Every page that states who we are or how long delivery takes must read from
 * here. If you change a value, change the Merchant Center settings to match
 * (Settings > Shipping and returns), or the two will drift apart again.
 */

/** Legal entity that operates the store. The address is intentionally omitted. */
export const BUSINESS_LEGAL_NAME = "TrImports Comércio de Produtos Ltda";

export const SUPPORT_EMAIL = "support@shopdirectusa.com";

/**
 * Must match Merchant Center: handling 0–1 business day, transit 7–20 business
 * days, free standard shipping to the US. There is no paid/expedited option.
 */
export const SHIPPING = {
  handlingMaxDays: 1,
  transitMinDays: 7,
  transitMaxDays: 20,
} as const;

export const TRANSIT_LABEL = `${SHIPPING.transitMinDays}–${SHIPPING.transitMaxDays} business days`;
