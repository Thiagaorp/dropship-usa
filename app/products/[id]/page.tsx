"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/store/cart";
import toast from "react-hot-toast";
import { ShoppingCart, Star, Truck, ShieldCheck, RefreshCcw, ChevronLeft, Plus, Minus } from "lucide-react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import ProductReviews from "@/components/ProductReviews";

export default function ProductDetailPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();

  useEffect(() => {
    fetch(`/api/products/${params.id}`)
      .then((r) => r.json())
      .then((data) => {
        setProduct(data.product);
        setRelated(data.related ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500">Product not found.</p>
        <Link href="/products" className="text-blue-600 mt-4 inline-block">Back to products</Link>
      </div>
    );
  }

  const image = product.images[selectedImage] ?? product.images[0];
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  function handleAddToCart() {
    if (!product) return;
    addItem({
      id: `cart-${product.id}`,
      productId: product.id,
      title: product.title,
      price: product.price,
      image: product.images[0],
      quantity,
    });
    toast.success(`${quantity}x added to cart!`);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-blue-600 mb-6">
        <ChevronLeft className="w-4 h-4" /> Back to products
      </Link>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-10 shadow-sm">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-gray-50 mb-4">
            <img src={image} alt={product.title} className="w-full h-full object-cover" />
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={i} onClick={() => setSelectedImage(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden shrink-0 border-2 transition-colors ${i === selectedImage ? "border-blue-600" : "border-transparent"}`}>
                  <img src={img} alt={`${product.title} ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col">
          <p className="text-sm text-blue-500 font-semibold uppercase tracking-wide mb-2">{product.category}</p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{product.title}</h1>

          <div className="flex items-center gap-2 mb-4">
            {product.reviewCount && product.reviewCount > 0 ? (
              <>
                <div className="flex">
                  {[1,2,3,4,5].map((s) => (
                    <Star
                      key={s}
                      className={`w-4 h-4 ${
                        s <= Math.round(product.rating ?? 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-sm text-gray-500">
                  {product.rating?.toFixed(1)} · {product.reviewCount} review{product.reviewCount !== 1 ? "s" : ""}
                </span>
              </>
            ) : (
              <span className="text-sm text-gray-400">No reviews yet</span>
            )}
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-extrabold text-gray-900">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <>
                <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
                <span className="bg-red-100 text-red-600 text-sm font-bold px-2 py-0.5 rounded-full">-{discount}% OFF</span>
              </>
            )}
          </div>

          <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>

          <div className="flex items-center gap-3 mb-6">
            <p className="text-sm font-medium text-gray-700">Quantity:</p>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                <Minus className="w-4 h-4" />
              </button>
              <span className="px-4 py-2 font-semibold min-w-[3rem] text-center">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="px-3 py-2 hover:bg-gray-50 transition-colors">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm text-gray-400">{product.stock} in stock</span>
          </div>

          <button onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-colors mb-3 text-lg">
            <ShoppingCart className="w-5 h-5" />
            Add to Cart — {formatPrice(product.price * quantity)}
          </button>

          <Link href="/checkout"
            onClick={handleAddToCart}
            className="flex items-center justify-center gap-2 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-bold py-4 px-8 rounded-xl transition-colors mb-6">
            Buy Now
          </Link>

          <div className="border-t border-gray-100 pt-6 space-y-3">
            {[
              { icon: <Truck className="w-4 h-4" />, text: "Free shipping on all US orders" },
              { icon: <ShieldCheck className="w-4 h-4" />, text: "Secure payment via Stripe" },
              { icon: <RefreshCcw className="w-4 h-4" />, text: "30-day hassle-free returns" },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-blue-500">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>

          {product.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <span key={tag} className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Related Products */}
      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
