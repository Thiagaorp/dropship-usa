import Link from "next/link";
import { prisma } from "@/lib/db";
import { parseJSON } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import { Product } from "@/types";
import { ShieldCheck, Truck, RefreshCcw, Headphones, ChevronRight, Zap } from "lucide-react";

async function getFeaturedProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { active: true, featured: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({
    ...p,
    images: parseJSON<string[]>(p.images, []),
    tags: parseJSON<string[]>(p.tags, []),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

async function getNewProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { active: true },
    take: 8,
    orderBy: { createdAt: "desc" },
  });
  return products.map((p) => ({
    ...p,
    images: parseJSON<string[]>(p.images, []),
    tags: parseJSON<string[]>(p.tags, []),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));
}

const categories = [
  { name: "Electronics", icon: "⚡", color: "bg-blue-50 border-blue-100" },
  { name: "Fashion", icon: "👗", color: "bg-pink-50 border-pink-100" },
  { name: "Home", icon: "🏠", color: "bg-green-50 border-green-100" },
  { name: "Sports", icon: "🏃", color: "bg-orange-50 border-orange-100" },
  { name: "Beauty", icon: "💄", color: "bg-purple-50 border-purple-100" },
  { name: "Toys", icon: "🧸", color: "bg-yellow-50 border-yellow-100" },
];

const perks = [
  { icon: <Truck className="w-6 h-6" />, title: "Free US Shipping", desc: "On orders over $35" },
  { icon: <ShieldCheck className="w-6 h-6" />, title: "Secure Payments", desc: "256-bit SSL encryption" },
  { icon: <RefreshCcw className="w-6 h-6" />, title: "30-Day Returns", desc: "Hassle-free returns" },
  { icon: <Headphones className="w-6 h-6" />, title: "24/7 Support", desc: "Always here to help" },
];

export default async function HomePage() {
  const [featured, newProducts] = await Promise.all([
    getFeaturedProducts(),
    getNewProducts(),
  ]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              New arrivals every day
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6">
              Shop Smart,<br />
              <span className="text-yellow-300">Save Big</span>
            </h1>
            <p className="text-lg text-blue-100 mb-8 max-w-lg">
              Thousands of top-quality products from trusted global suppliers, delivered fast to your door across the USA.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <Link href="/products" className="bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors text-center">
                Shop Now
              </Link>
              <Link href="/products?featured=true" className="border border-white/40 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors text-center">
                View Featured
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="relative">
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-3xl rotate-6 absolute inset-0" />
              <div className="w-64 h-64 md:w-80 md:h-80 bg-white/10 rounded-3xl -rotate-3 absolute inset-0" />
              <div className="relative w-64 h-64 md:w-80 md:h-80 bg-white/20 rounded-3xl backdrop-blur-sm flex items-center justify-center">
                <span className="text-8xl">🛍️</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Perks */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {perks.map((perk) => (
              <div key={perk.title} className="flex items-center gap-3">
                <div className="text-blue-600 shrink-0">{perk.icon}</div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{perk.title}</p>
                  <p className="text-xs text-gray-500">{perk.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Shop by Category</h2>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {categories.map((cat) => (
            <Link key={cat.name} href={`/products?category=${cat.name}`}
              className={`${cat.color} border rounded-2xl p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow`}>
              <span className="text-3xl">{cat.icon}</span>
              <span className="text-sm font-semibold text-gray-700">{cat.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured */}
      {featured.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">⭐ Featured Products</h2>
            <Link href="/products?featured=true" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* New Arrivals */}
      {newProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">🆕 New Arrivals</h2>
            <Link href="/products" className="flex items-center gap-1 text-blue-600 font-medium text-sm hover:underline">
              See all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {newProducts.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to find amazing deals?</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">Browse our full catalog — new items added daily!</p>
          <Link href="/products" className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors">
            Browse All Products
          </Link>
        </div>
      </section>
    </div>
  );
}
