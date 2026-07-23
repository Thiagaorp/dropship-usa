// Server-side checkout validation. The store ships only to the USA, so a
// well-formed US address is required — this alone rejects the bot traffic that
// posted São Paulo + CA + a Brazilian ZIP. Prices are re-read from the DB so a
// tampered payload can't set its own totals.

export const US_STATES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
  "DC", "PR",
]);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const US_ZIP_RE = /^\d{5}(-\d{4})?$/;

export type AddressInput = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
};

/** Returns an error string if the order is invalid, or null if it passes. */
export function validateOrder(params: {
  items: unknown;
  customerEmail: unknown;
  shippingAddress: AddressInput | undefined;
}): string | null {
  const { items, customerEmail, shippingAddress: a } = params;

  if (!Array.isArray(items) || items.length === 0) return "Carrinho vazio";
  if (typeof customerEmail !== "string" || !EMAIL_RE.test(customerEmail)) {
    return "E-mail inválido";
  }
  if (!a || typeof a !== "object") return "Endereço ausente";

  const country = (a.country ?? "").toUpperCase();
  if (country !== "US") return "Enviamos apenas para os EUA (país deve ser US)";

  const state = (a.state ?? "").toUpperCase();
  if (!US_STATES.has(state)) return "Estado americano inválido";

  if (!US_ZIP_RE.test((a.zipCode ?? "").trim())) return "CEP (ZIP) americano inválido";

  if (!a.address1 || a.address1.trim().length < 3) return "Endereço incompleto";
  if (!a.city || a.city.trim().length < 2) return "Cidade inválida";
  if (!a.firstName || !a.lastName) return "Nome incompleto";

  return null;
}
