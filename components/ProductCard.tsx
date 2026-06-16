"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCartStore();
  const image = product.images[0] ?? "/placeholder.jpg";
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  function handleAddToCart(e: React.MouseEvent) {
    e.preventDefault();
    addItem({
      id: `cart-${product.id}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      image,
    });
    toast.success("Added to cart!");
  }

  return (
    <Link href={`/products/${product.id}`} className="group">
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
        <div className="relative aspect-square bg-gray-50 overflow-hidden">
          <img
            src={image}
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          {discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              -{discount}%
            </span>
          )}
          {product.featured && (
            <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              Featured
            </span>
          )}
          {product.tags?.includes("us-warehouse") && (
            <span className="absolute bottom-2 left-2 bg-green-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              🇺🇸 Fast Shipping
            </span>
          )}
        </div>

        <div className="p-3">
          <p className="text-xs text-blue-500 font-medium uppercase tracking-wide mb-1">
            {product.category}
          </p>
          <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 min-h-[2.5rem]">
            {product.title}
          </h3>

          <div className="flex items-center gap-1 mb-2 min-h-[1.25rem]">
            {product.reviewCount && product.reviewCount > 0 ? (
              <>
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`w-3 h-3 ${
                      s <= Math.round(product.rating ?? 0)
                        ? "fill-yellow-400 text-yellow-400"
                        : "fill-gray-200 text-gray-200"
                    }`}
                  />
                ))}
                <span className="text-xs text-gray-400 ml-1">
                  {product.rating?.toFixed(1)} ({product.reviewCount})
                </span>
              </>
            ) : (
              <span className="text-xs text-gray-400">No reviews yet</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-base font-bold text-gray-900">
                {formatPrice(product.price)}
              </span>
              {product.comparePrice && (
                <span className="text-xs text-gray-400 line-through ml-2">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
              aria-label="Add to cart"
            >
              <ShoppingCart className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
