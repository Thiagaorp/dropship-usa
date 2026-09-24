import Link from "next/link";
import { Truck, ShieldCheck, Mail, Globe, Building2, RotateCcw, ChevronRight } from "lucide-react";
import { BUSINESS_LEGAL_NAME } from "@/lib/business";

export const metadata = {
  title: "About Us — ShopDirectUSA",
  description:
    "Learn about ShopDirectUSA — an online store offering everyday products at fair prices with free shipping to all 50 U.S. states.",
};

// Everything on this page must be verifiable. Google Merchant Center flagged the
// store for "Misrepresentation" when this page claimed customer counts and
// ratings the store did not have. Do not add social proof that isn't backed by
// real data (orders, reviews) — pull it from the database or leave it out.
const values = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Accurate Listings",
    desc: "We choose products from established suppliers and describe them as accurately as we can. If an item arrives damaged or not as described, we make it right.",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Free Shipping",
    desc: "Free standard shipping on every order to all 50 U.S. states. Estimated delivery is 7–20 business days after processing.",
  },
  {
    icon: <RotateCcw className="w-6 h-6" />,
    title: "30-Day Returns",
    desc: "Not happy with your purchase? Most items can be returned within 30 days of delivery for a refund or exchange.",
  },
  {
    icon: <Mail className="w-6 h-6" />,
    title: "Real Support",
    desc: "Questions about an order? Email us and we'll reply within 24 hours, Monday to Friday.",
  },
];

const facts = [
  { value: "1,700+", label: "Products" },
  { value: "Free", label: "U.S. Shipping" },
  { value: "30 days", label: "Returns" },
  { value: "Stripe", label: "Secure Checkout" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Shipping to all 50 U.S. states
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            Everyday products<br />
            <span className="text-yellow-300">at fair prices</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            ShopDirectUSA is an online store that works with suppliers around the world to offer
            useful everyday products at fair prices, with free shipping to your door.
          </p>
        </div>
      </section>

      {/* Facts */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {facts.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who we are */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Building2 className="w-6 h-6 text-blue-600" /> Who We Are
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            ShopDirectUSA is operated by <strong>{BUSINESS_LEGAL_NAME}</strong>. We are a small online
            retailer, and we work with established suppliers and fulfillment partners around the
            world to ship orders directly to customers in the United States.
          </p>
          <p>
            Because items ship from our partners&apos; warehouses, most orders arrive within 7–20
            business days. Some items are stocked in a U.S. warehouse and may arrive sooner — when
            that&apos;s the case, it&apos;s shown on the product page.
          </p>
          <p>
            Every order is paid through Stripe&apos;s secure checkout, comes with a tracking number,
            and is covered by our{" "}
            <Link href="/returns" className="text-blue-600 hover:underline">30-day return policy</Link>.
            If you have a question before or after you buy, our{" "}
            <Link href="/contact" className="text-blue-600 hover:underline">support team</Link> is
            one email away.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">What You Can Expect</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.title} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                  {v.icon}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{v.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-3xl p-10 text-white text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to start shopping?</h2>
          <p className="text-blue-100 mb-6 max-w-md mx-auto">
            Browse our catalog — free shipping on every order.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-1 bg-white text-blue-700 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Browse Products <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
