import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// CJ Dropshipping product search
// Docs: https://developers.cjdropshipping.com/
async function searchCJ(keyword: string, pageNum = 1) {
  const baseUrl = "https://developers.cjdropshipping.com/api2.0/v1";

  // Get access token
  const tokenRes = await fetch(`${baseUrl}/authentication/getAccessToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: process.env.CJ_EMAIL,
      password: process.env.CJ_API_KEY,
    }),
  });
  const tokenData = await tokenRes.json();
  const token = tokenData?.data?.accessToken;
  if (!token) throw new Error("CJ auth failed");

  const res = await fetch(
    `${baseUrl}/product/list?pageNum=${pageNum}&pageSize=20&productNameEn=${encodeURIComponent(keyword)}`,
    { headers: { "CJ-Access-Token": token } }
  );
  const data = await res.json();
  return data?.data?.list ?? [];
}

// Mock data for demo (used when API keys not configured)
function getMockProducts(keyword: string) {
  const items = [
    { id: "mock-001", title: `${keyword} Pro Wireless Earbuds`, price: 12.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", category: "Electronics" },
    { id: "mock-002", title: `${keyword} Smart Watch`, price: 24.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", category: "Electronics" },
    { id: "mock-003", title: `${keyword} Phone Case`, price: 3.99, image: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400", category: "Electronics" },
    { id: "mock-004", title: `${keyword} LED Desk Lamp`, price: 18.50, image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400", category: "Home" },
    { id: "mock-005", title: `${keyword} Yoga Mat`, price: 14.00, image: "https://images.unsplash.com/photo-1601925228269-52c07ef879c7?w=400", category: "Sports" },
    { id: "mock-006", title: `${keyword} Minimalist Wallet`, price: 9.99, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=400", category: "Fashion" },
  ];
  return items.map((item) => ({
    supplierId: item.id,
    title: item.title,
    supplierPrice: item.price,
    suggestedPrice: Math.round(item.price * 2.5 * 100) / 100,
    image: item.image,
    category: item.category,
    supplier: "cj",
    supplierUrl: `https://cjdropshipping.com/product/${item.id}`,
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const keyword = searchParams.get("keyword") ?? "";
  const page = parseInt(searchParams.get("page") ?? "1");

  if (!keyword) {
    return NextResponse.json({ error: "keyword is required" }, { status: 400 });
  }

  let products;
  if (process.env.CJ_API_KEY && process.env.CJ_API_KEY !== "YOUR_CJ_API_KEY") {
    try {
      const raw = await searchCJ(keyword, page);
      products = raw.map((p: Record<string, string>) => ({
        supplierId: p.pid,
        title: p.productNameEn,
        supplierPrice: parseFloat(p.sellPrice),
        suggestedPrice: parseFloat(p.sellPrice) * 2.5,
        image: p.productImage,
        category: p.categoryName,
        supplier: "cj",
        supplierUrl: `https://cjdropshipping.com/product/${p.pid}`,
      }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return NextResponse.json({ error: "CJ_AUTH_FAILED", detail: msg, products: getMockProducts(keyword) });
    }
  } else {
    products = getMockProducts(keyword);
  }

  return NextResponse.json({ products });
}
