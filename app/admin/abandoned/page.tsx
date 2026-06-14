"use client";

import { useEffect, useState } from "react";
import { ShoppingCart, Mail } from "lucide-react";
import { formatPrice } from "@/lib/utils";

interface AbandonedCart {
  id: string;
  email: string;
  items: { title: string; quantity: number; price: number; image: string | null }[];
  subtotal: number;
  recovered: boolean;
  updatedAt: string;
}

export default function AdminAbandonedPage() {
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/abandoned-cart");
    const data = await res.json();
    setCarts(data.carts ?? []);
    setLoading(false);
  }

  const potentialRevenue = carts.reduce((sum, c) => sum + c.subtotal, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Abandoned Carts ({carts.length})</h1>
        {carts.length > 0 && (
          <span className="text-sm text-gray-500">
            Potential revenue: <span className="font-bold text-gray-900">{formatPrice(potentialRevenue)}</span>
          </span>
        )}
      </div>

      <p className="text-sm text-gray-500 -mt-2">
        Shoppers who entered their email at checkout but didn&apos;t complete the order. Reach out with a
        discount code (e.g. <span className="font-mono font-semibold">WELCOME10</span>) to win them back.
      </p>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : carts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <ShoppingCart className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No abandoned carts — nice!
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {carts.map((c) => (
              <li key={c.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{c.email}</span>
                    <span className="text-xs text-gray-400">
                      {new Date(c.updatedAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {c.items.map((i) => `${i.title} ×${i.quantity}`).join(", ")}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 mt-1">{formatPrice(c.subtotal)}</p>
                </div>
                <a
                  href={`mailto:${c.email}?subject=${encodeURIComponent("Complete your order — 10% off inside!")}&body=${encodeURIComponent("Hi! You left some items in your cart at ShopDirectUSA. Use code WELCOME10 for 10% off to complete your order.")}`}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white text-xs font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors shrink-0"
                >
                  <Mail className="w-3.5 h-3.5" /> Email
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
