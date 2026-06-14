"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Package, Search, Truck, CheckCircle2, Clock, XCircle, ChevronRight } from "lucide-react";

interface TrackedOrder {
  orderNumber: string;
  status: string;
  paymentStatus: string;
  trackingNumber: string | null;
  total: number;
  createdAt: string;
  items: { title: string; quantity: number; price: number; image: string | null }[];
}

const steps = ["pending", "processing", "shipped", "delivered"];
const stepLabels: Record<string, string> = {
  pending: "Order Placed",
  processing: "Processing",
  shipped: "Shipped",
  delivered: "Delivered",
};
const stepIcons: Record<string, React.ReactNode> = {
  pending: <Clock className="w-5 h-5" />,
  processing: <Package className="w-5 h-5" />,
  shipped: <Truck className="w-5 h-5" />,
  delivered: <CheckCircle2 className="w-5 h-5" />,
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setError("");
    setOrder(null);
    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Could not find your order.");
        setStatus("error");
        return;
      }
      setOrder(data.order);
      setStatus("idle");
    } catch {
      setError("Network error. Please try again.");
      setStatus("error");
    }
  }

  const isCancelled = order?.status === "cancelled";
  const currentStep = order ? steps.indexOf(order.status) : -1;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-1 text-sm text-gray-400 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-600 font-medium">Track Order</span>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Order</h1>
        <p className="text-gray-500">Enter your order number and email to see the latest status.</p>
      </div>

      <form onSubmit={track} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Order Number</label>
          <input
            required
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
            placeholder="SDU-XXXXXXXX-XXXX"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 uppercase"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {status === "loading" ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Track Order
        </button>
        {status === "error" && (
          <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
        )}
      </form>

      {order && (
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wide">Order</p>
              <p className="font-mono font-bold text-blue-600">{order.orderNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400 uppercase tracking-wide">Placed</p>
              <p className="text-sm text-gray-600">
                {new Date(order.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
              </p>
            </div>
          </div>

          {isCancelled ? (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl px-4 py-3 mb-6">
              <XCircle className="w-5 h-5" /> This order was cancelled.
            </div>
          ) : (
            <div className="flex items-center justify-between mb-6">
              {steps.map((s, i) => {
                const reached = i <= currentStep;
                return (
                  <div key={s} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div className={`absolute right-1/2 top-5 h-0.5 w-full -translate-y-1/2 ${i <= currentStep ? "bg-blue-600" : "bg-gray-200"}`} />
                    )}
                    <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center ${reached ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>
                      {stepIcons[s]}
                    </div>
                    <span className={`text-xs mt-2 text-center ${reached ? "text-gray-900 font-medium" : "text-gray-400"}`}>
                      {stepLabels[s]}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {order.trackingNumber && (
            <div className="bg-blue-50 rounded-xl px-4 py-3 mb-6 text-sm">
              <span className="text-gray-600">Tracking number: </span>
              <span className="font-mono font-semibold text-blue-700">{order.trackingNumber}</span>
            </div>
          )}

          <div className="border-t border-gray-100 pt-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-12 h-12 rounded-lg object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 line-clamp-1">{item.title}</p>
                  <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-3">
              <span>Total</span><span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
