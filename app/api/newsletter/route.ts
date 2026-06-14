import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "100");

  const [subscribers, total] = await Promise.all([
    prisma.newsletterSubscriber.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
    }),
    prisma.newsletterSubscriber.count(),
  ]);

  return NextResponse.json({
    subscribers: subscribers.map((s) => ({ ...s, createdAt: s.createdAt.toISOString() })),
    total,
  });
}

export async function POST(req: NextRequest) {
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const email = String(body?.email ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  try {
    await prisma.newsletterSubscriber.create({ data: { email } });
  } catch (err: unknown) {
    // Unique constraint → already subscribed; treat as success (idempotent)
    const code = (err as { code?: string })?.code;
    if (code === "P2002") {
      return NextResponse.json({ success: true, alreadySubscribed: true });
    }
    return NextResponse.json({ error: "Could not subscribe. Please try again." }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
