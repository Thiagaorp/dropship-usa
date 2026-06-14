import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Admin: list abandoned (non-recovered) carts
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const includeRecovered = searchParams.get("all") === "true";

  const carts = await prisma.abandonedCart.findMany({
    where: includeRecovered ? {} : { recovered: false },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  return NextResponse.json({
    carts: carts.map((c) => ({
      id: c.id,
      email: c.email,
      items: JSON.parse(c.items),
      subtotal: c.subtotal,
      recovered: c.recovered,
      updatedAt: c.updatedAt.toISOString(),
    })),
    total: carts.length,
  });
}

// Public: capture/update an abandoned cart (called from checkout when email entered)
export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const items = Array.isArray(body?.items) ? body.items : [];
  const subtotal = Number(body?.subtotal ?? 0) || 0;

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || items.length === 0) {
    return NextResponse.json({ ok: false });
  }

  await prisma.abandonedCart.upsert({
    where: { email },
    create: { email, items: JSON.stringify(items), subtotal, recovered: false },
    update: { items: JSON.stringify(items), subtotal, recovered: false },
  });

  return NextResponse.json({ ok: true });
}
