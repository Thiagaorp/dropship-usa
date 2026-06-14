import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const reviews = await prisma.review.findMany({
    where: { productId: id },
    orderBy: { createdAt: "desc" },
  });

  const count = reviews.length;
  const average =
    count > 0
      ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10
      : 0;

  // Star distribution (5 → 1)
  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  for (const r of reviews) {
    if (distribution[r.rating] !== undefined) distribution[r.rating] += 1;
  }

  return NextResponse.json({
    reviews: reviews.map((r) => ({ ...r, createdAt: r.createdAt.toISOString() })),
    average,
    count,
    distribution,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const authorName = String(body?.authorName ?? "").trim();
  const comment = String(body?.comment ?? "").trim();
  const rating = Number(body?.rating);

  if (!authorName || !comment) {
    return NextResponse.json({ error: "Name and comment are required." }, { status: 400 });
  }
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return NextResponse.json({ error: "Please select a rating from 1 to 5 stars." }, { status: 400 });
  }

  // Ensure the product exists
  const product = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 });
  }

  const review = await prisma.review.create({
    data: { productId: id, authorName, rating, comment },
  });

  return NextResponse.json(
    { review: { ...review, createdAt: review.createdAt.toISOString() } },
    { status: 201 }
  );
}
