import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Fixed, additive, idempotent migration — vercel env pull can't read the DB
// secrets locally, so the app (which can reach the DB) applies its own columns.
// Only these hardcoded statements run; there is no arbitrary SQL input.
const STATEMENTS = [
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supplierOrderId" TEXT`,
  `ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "supplierStatus" TEXT`,
];

async function handleMigrate(req: NextRequest) {
  const token = new URL(req.url).searchParams.get("token");
  const secret = process.env.SEED_SECRET || "seed123";
  if (token !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const applied: string[] = [];
  try {
    for (const sql of STATEMENTS) {
      await prisma.$executeRawUnsafe(sql);
      applied.push(sql);
    }
    // Sanity check: the columns are now queryable
    const count = await prisma.order.count();
    return NextResponse.json({ success: true, applied, orders: count });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg, applied }, { status: 500 });
  }
}

export async function GET(req: NextRequest) { return handleMigrate(req); }
export async function POST(req: NextRequest) { return handleMigrate(req); }
