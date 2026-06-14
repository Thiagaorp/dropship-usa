import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// List all reviews across products (admin moderation)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = parseInt(searchParams.get("limit") ?? "100");

  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { product: { select: { id: true, title: true } } },
  });

  return NextResponse.json({
    reviews: reviews.map((r) => ({
      id: r.id,
      productId: r.productId,
      productTitle: r.product?.title ?? "(deleted product)",
      authorName: r.authorName,
      rating: r.rating,
      comment: r.comment,
      createdAt: r.createdAt.toISOString(),
    })),
    total: reviews.length,
  });
}
