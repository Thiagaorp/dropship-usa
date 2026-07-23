// CJ Dropshipping order API (semi-automatic fulfillment).
// Docs: https://developers.cjdropshipping.com/
//
// Flow: we create the order in CJ as a DRAFT (unpaid). Nothing ships and no
// money moves until the order is paid in the CJ panel — that manual step is
// deliberate, so variants and address can be checked before dispatch.

const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

// getAccessToken is rate limited (CJ blocks repeated calls), and tokens last
// ~15 days, so the token is cached in module scope across warm invocations.
let tokenCache: { token: string; expires: number } | null = null;

export async function getCJToken(): Promise<string> {
  if (tokenCache && tokenCache.expires > Date.now()) return tokenCache.token;

  const apiKey = (process.env.CJ_API_KEY ?? "").trim();
  const email = (process.env.CJ_EMAIL ?? "").trim();
  if (!apiKey) throw new Error("CJ_API_KEY não configurada na Vercel");

  const body = apiKey.includes("@api@") ? { apiKey } : { email, password: apiKey };
  const res = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  const token = data?.data?.accessToken;
  if (!token) throw new Error(`CJ auth falhou: ${JSON.stringify(data)}`);

  tokenCache = { token, expires: Date.now() + 12 * 60 * 60 * 1000 }; // 12h
  return token;
}

async function cjFetch(path: string, init?: RequestInit) {
  const token = await getCJToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "CJ-Access-Token": token,
      ...(init?.headers ?? {}),
    },
  });
  return res.json();
}

export type CJVariant = {
  vid: string;
  variantNameEn?: string;
  variantSku?: string;
  variantSellPrice?: number;
};

/** Variants of a CJ product. A single-variant product can be ordered automatically. */
export async function getVariants(pid: string): Promise<CJVariant[]> {
  const data = await cjFetch(`/product/variant/query?pid=${encodeURIComponent(pid)}`);
  const list = data?.data;
  return Array.isArray(list) ? list : [];
}

export type ShippingAddress = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
};

export type CJOrderProduct = { vid: string; quantity: number };

/**
 * Creates the order in CJ. It lands unpaid — pay it in the CJ panel to dispatch.
 * `orderNumber` is our own reference (shows up in the CJ dashboard).
 */
export async function createCJOrder(params: {
  orderNumber: string;
  address: ShippingAddress;
  products: CJOrderProduct[];
  remark?: string;
}) {
  const { orderNumber, address, products, remark } = params;

  const name = [address.firstName, address.lastName].filter(Boolean).join(" ").trim();
  const street = [address.address1, address.address2].filter(Boolean).join(", ");

  const countryCode = (address.country || "US").toUpperCase();
  const body = {
    orderNumber,
    shippingCountry: countryCode,
    shippingCountryCode: countryCode,
    shippingProvince: address.state ?? "",
    shippingCounty: address.state ?? "",
    shippingCity: address.city ?? "",
    shippingAddress: street,
    shippingCustomerName: name || "Customer",
    shippingZip: address.zipCode ?? "",
    shippingPhone: address.phone ?? "",
    remark: remark ?? "",
    fromCountryCode: "CN",
    logisticName: "CJPacket Ordinary",
    houseNumber: "",
    products,
  };

  const data = await cjFetch("/shopping/order/createOrderV2", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!data?.result || !data?.data) {
    throw new Error(`CJ createOrder falhou: ${data?.message ?? JSON.stringify(data)}`);
  }
  return data.data as { orderId: string; orderNum?: string };
}

/** Order detail — used to pull status and the tracking number back into the shop. */
export async function getCJOrderDetail(orderId: string) {
  const data = await cjFetch(`/shopping/order/getOrderDetail?orderId=${encodeURIComponent(orderId)}`);
  return data?.data ?? null;
}

/** CJ wallet balance — a CJ order only ships when there is balance to pay it. */
export async function getCJBalance(): Promise<number | null> {
  const data = await cjFetch("/shopping/pay/getBalance");
  const amount = data?.data?.amount ?? data?.data?.balance;
  return typeof amount === "number" ? amount : null;
}
