import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  let body;
  try {
    body = await req.json();
  } catch {
    body = {};
  }

  try {
    const updated = await prisma.discountCode.update({
      where: { id },
      data: { ...(typeof body?.active === "boolean" && { active: body.active }) },
    });
    return NextResponse.json({ code: updated });
  } catch {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.discountCode.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Code not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
