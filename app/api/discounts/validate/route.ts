import { NextRequest, NextResponse } from "next/server";
import { evaluateDiscount } from "@/lib/discounts";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ valid: false, message: "Invalid request" }, { status: 400 });
  }

  const code = String(body?.code ?? "");
  const subtotal = Number(body?.subtotal ?? 0);

  const result = await evaluateDiscount(code, subtotal);
  return NextResponse.json(result);
}
