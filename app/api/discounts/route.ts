import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const codes = await prisma.discountCode.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    codes: codes.map((c) => ({
      ...c,
      expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
      createdAt: c.createdAt.toISOString(),
    })),
  });
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const code = String(body?.code ?? "").trim().toUpperCase();
  const type = body?.type === "fixed" ? "fixed" : "percent";
  const value = Number(body?.value);
  const minSubtotal = Number(body?.minSubtotal ?? 0) || 0;
  const maxUses = body?.maxUses != null && body.maxUses !== "" ? Number(body.maxUses) : null;
  const expiresAt = body?.expiresAt ? new Date(body.expiresAt) : null;

  if (!code) {
    return NextResponse.json({ error: "Code is required." }, { status: 400 });
  }
  if (!Number.isFinite(value) || value <= 0) {
    return NextResponse.json({ error: "Value must be greater than 0." }, { status: 400 });
  }
  if (type === "percent" && value > 100) {
    return NextResponse.json({ error: "Percentage cannot exceed 100." }, { status: 400 });
  }

  try {
    const created = await prisma.discountCode.create({
      data: { code, type, value, minSubtotal, maxUses, expiresAt },
    });
    return NextResponse.json({ code: created }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string })?.code === "P2002") {
      return NextResponse.json({ error: "A code with that name already exists." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not create code." }, { status: 500 });
  }
}
