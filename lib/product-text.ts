/**
 * Customer-facing product text cleanup.
 *
 * WHY THIS EXISTS: the supplier import used to write every description as
 * "High-quality {title}. Sourced from verified suppliers. Fast shipping to USA."
 * All ~1,800 products in the database carry that boilerplate. "Verified
 * suppliers" is not something the store checks, and "fast shipping" contradicts
 * the 7-20 business day delivery promised in Merchant Center — both count as
 * misleading claims (Merchant Center "Misrepresentation" block, 2026-09-24).
 *
 * Rewriting the rows needs a production DB write, so the phrases are stripped
 * wherever a description is shown instead. The import no longer generates them.
 */
const BOILERPLATE = [
  /^\s*High[- ]quality\s+/i,
  /\s*Sourced from verified suppliers\.?/gi,
  /\s*Fast shipping to (the )?USA\.?/gi,
];

export function cleanDescription(description: string | null | undefined, title: string): string {
  let text = description ?? "";
  for (const pattern of BOILERPLATE) text = text.replace(pattern, "");
  text = text.trim();
  // A bare title ("Ski Helmet.") adds nothing; fall back to the title itself.
  if (!text || text.replace(/\.$/, "").toLowerCase() === title.toLowerCase()) return title;
  return text;
}
