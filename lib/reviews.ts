import { prisma } from "@/lib/db";

export interface ReviewStats {
  rating: number; // average, rounded to 1 decimal; 0 when no reviews
  reviewCount: number;
}

/**
 * Aggregate review rating + count for a set of products in a single query.
 * Returns a map keyed by productId. Products with no reviews are omitted
 * (callers should default to { rating: 0, reviewCount: 0 }).
 */
export async function getReviewStats(
  productIds: string[]
): Promise<Record<string, ReviewStats>> {
  if (productIds.length === 0) return {};

  const grouped = await prisma.review.groupBy({
    by: ["productId"],
    where: { productId: { in: productIds } },
    _avg: { rating: true },
    _count: { _all: true },
  });

  const map: Record<string, ReviewStats> = {};
  for (const g of grouped) {
    map[g.productId] = {
      rating: Math.round((g._avg.rating ?? 0) * 10) / 10,
      reviewCount: g._count._all,
    };
  }
  return map;
}

/** Convenience for a single product. */
export async function getProductReviewStats(productId: string): Promise<ReviewStats> {
  const stats = await getReviewStats([productId]);
  return stats[productId] ?? { rating: 0, reviewCount: 0 };
}
