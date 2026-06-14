import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Mark as read/unread
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
  const read = body?.read !== false; // default true

  try {
    const message = await prisma.contactMessage.update({
      where: { id },
      data: { read },
    });
    return NextResponse.json({ message: { ...message, createdAt: message.createdAt.toISOString() } });
  } catch {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    await prisma.contactMessage.delete({ where: { id } });
  } catch {
    return NextResponse.json({ error: "Message not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true });
}
