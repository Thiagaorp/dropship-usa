"use client";

import { useSearchParams } from "next/navigation";
import { CheckCircle2, Package, Truck, Mail } from "lucide-react";
import Link from "next/link";
import { Suspense, useEffect } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: unknown) => void };
    gtag?: (...args: unknown[]) => void;
  }
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get("order") ?? "SDU-UNKNOWN";
  const amount = parseFloat(searchParams.get("amount") ?? "0") || 0;

  // Fire ad-conversion "Purchase" events once, so Meta/TikTok optimize for buyers.
  useEffect(() => {
    const payload = { value: amount, currency: "USD" };
    try { window.fbq?.("track", "Purchase", payload); } catch {}
    try { window.ttq?.track("CompletePayment", payload); } catch {}
    try {
      window.gtag?.("event", "conversion", {
        send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/purchase`,
        value: amount,
        currency: "USD",
        transaction_id: orderNumber,
      });
    } catch {}
  }, [amount]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-12">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
        <p className="text-gray-500 mb-2">Thank you for your purchase.</p>
        <p className="text-sm bg-gray-50 rounded-xl px-4 py-2 inline-block font-mono font-semibold text-gray-700 mb-8">
          Order: {orderNumber}
        </p>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: <Mail className="w-6 h-6" />, title: "Confirmation Email", desc: "Sent to your inbox" },
            { icon: <Package className="w-6 h-6" />, title: "Processing", desc: "1–2 business days" },
            { icon: <Truck className="w-6 h-6" />, title: "Shipping", desc: "7–14 business days" },
          ].map((item) => (
            <div key={item.title} className="bg-blue-50 rounded-2xl p-4 text-center">
              <div className="text-blue-600 flex justify-center mb-2">{item.icon}</div>
              <p className="text-xs font-bold text-gray-800">{item.title}</p>
              <p className="text-xs text-gray-500 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-sm text-gray-500 mb-6">
          We&apos;ll send you a tracking number once your order ships. Questions? Email{" "}
          <a href="mailto:support@shopdirectusa.com" className="text-blue-600 hover:underline">
            support@shopdirectusa.com
          </a>
        </p>

        <Link href="/products" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl transition-colors">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-gray-400">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
