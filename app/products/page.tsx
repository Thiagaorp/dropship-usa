export const dynamic = "force-dynamic";

import { prisma } from "@/lib/db";
import { parseJSON } from "@/lib/utils";
import { getReviewStats } from "@/lib/reviews";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { SlidersHorizontal } from "lucide-react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{
    category?: string;
    featured?: string;
    search?: string;
    sort?: string;
    page?: string;
  }>;
}

const ITEMS_PER_PAGE = 16;

const categories = ["Electronics", "Fashion", "Home", "Sports", "Beauty", "Toys", "Pet", "Wellness", "Car", "Outdoor", "Other"];
const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category;
  const featured = params.featured === "true";
  const search = params.search;
  const sort = params.sort ?? "newest";
  const page = parseInt(params.page ?? "1");
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = { active: true };
  if (category) where.category = category;
  if (featured) where.featured = true;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const orderBy: Record<string, string> =
    sort === "price_asc"
      ? { price: "asc" }
      : sort === "price_desc"
      ? { price: "desc" }
      : { createdAt: "desc" };

  const [rawProducts, total] = await Promise.all([
    prisma.product.findMany({ where, orderBy, take: ITEMS_PER_PAGE, skip }),
    prisma.product.count({ where }),
  ]);

  const stats = await getReviewStats(rawProducts.map((p) => p.id));

  const products: Product[] = rawProducts.map((p) => ({
    ...p,
    images: parseJSON<string[]>(p.images, []),
    tags: parseJSON<string[]>(p.tags, []),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
    rating: stats[p.id]?.rating ?? 0,
    reviewCount: stats[p.id]?.reviewCount ?? 0,
  }));

  const totalPages = Math.ceil(total / ITEMS_PER_PAGE);

  function buildUrl(overrides: Record<string, string | undefined>) {
    const merged = { ...params, ...overrides };
    const qs = new URLSearchParams();
    Object.entries(merged).forEach(([k, v]) => {
      if (v) qs.set(k, v);
    });
    return `/products?${qs.toString()}`;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <aside className="w-full md:w-56 shrink-0">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <SlidersHorizontal className="w-4 h-4" /> Filters
            </h3>

            <div className="mb-6">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Category</p>
              <ul className="space-y-1">
                <li>
                  <Link href={buildUrl({ category: undefined, page: undefined })}
                    className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${!category ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                    All Products
                  </Link>
                </li>
                {categories.map((cat) => (
                  <li key={cat}>
                    <Link href={buildUrl({ category: cat, page: undefined })}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${category === cat ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                      {cat}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Sort By</p>
              <ul className="space-y-1">
                {sortOptions.map((opt) => (
                  <li key={opt.value}>
                    <Link href={buildUrl({ sort: opt.value, page: undefined })}
                      className={`block px-3 py-1.5 rounded-lg text-sm transition-colors ${sort === opt.value ? "bg-blue-600 text-white font-medium" : "text-gray-600 hover:bg-gray-50"}`}>
                      {opt.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </aside>

        {/* Products Grid */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {category ?? featured ? (featured ? "Featured Products" : category) : "All Products"}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">{total} products found</p>
            </div>

            {/* Search */}
            <form action="/products" method="GET" className="hidden md:flex">
              {category && <input type="hidden" name="category" value={category} />}
              <div className="flex rounded-xl overflow-hidden border border-gray-200">
                <input
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search products..."
                  className="px-4 py-2 text-sm outline-none w-48"
                />
                <button type="submit" className="bg-blue-600 text-white px-4 text-sm font-medium hover:bg-blue-700">
                  Search
                </button>
              </div>
            </form>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
              <p className="text-gray-400 text-5xl mb-4">😕</p>
              <p className="text-gray-600 font-semibold">No products found</p>
              <p className="text-gray-400 text-sm mt-1">Try a different filter or search term</p>
              <Link href="/products" className="inline-block mt-4 text-blue-600 font-medium text-sm hover:underline">
                Clear filters
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-10">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link key={p} href={buildUrl({ page: String(p) })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${p === page ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400"}`}>
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
