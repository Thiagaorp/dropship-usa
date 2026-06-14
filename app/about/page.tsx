import Link from "next/link";
import { Truck, ShieldCheck, Heart, Globe, Users, Sparkles, ChevronRight } from "lucide-react";

export const metadata = {
  title: "About Us — ShopDirectUSA",
  description:
    "Learn about ShopDirectUSA — our mission to bring top-quality products at unbeatable prices, shipped fast across the United States.",
};

const values = [
  {
    icon: <ShieldCheck className="w-6 h-6" />,
    title: "Quality First",
    desc: "Every product is carefully selected from trusted, vetted suppliers so you get exactly what you expect.",
  },
  {
    icon: <Truck className="w-6 h-6" />,
    title: "Fast & Free Shipping",
    desc: "Free standard shipping on orders over $35, delivered quickly to your door across all 50 states.",
  },
  {
    icon: <Heart className="w-6 h-6" />,
    title: "Customer Obsessed",
    desc: "Our support team is here for you 7 days a week — your satisfaction is our top priority.",
  },
  {
    icon: <Sparkles className="w-6 h-6" />,
    title: "Unbeatable Value",
    desc: "By sourcing directly from suppliers, we cut out the middleman and pass the savings on to you.",
  },
];

const stats = [
  { value: "10,000+", label: "Happy Customers" },
  { value: "500+", label: "Products" },
  { value: "50", label: "States Served" },
  { value: "4.8★", label: "Average Rating" },
];

export default function AboutPage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-medium mb-6">
            <Globe className="w-4 h-4" />
            Proudly serving the USA
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6">
            We make great products<br />
            <span className="text-yellow-300">affordable for everyone</span>
          </h1>
          <p className="text-lg text-blue-100 max-w-2xl mx-auto">
            ShopDirectUSA was founded on a simple idea: top-quality products shouldn&apos;t cost a
            fortune. We connect you directly with trusted global suppliers, delivering amazing deals
            straight to your doorstep.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-6 h-6 text-blue-600" /> Our Story
        </h2>
        <div className="space-y-4 text-gray-600 leading-relaxed">
          <p>
            ShopDirectUSA started with a frustration we all share — paying too much for everyday
            products simply because of layers of middlemen and markups. We knew there had to be a
            better way.
          </p>
          <p>
            So we built a store that sources products directly from trusted manufacturers and
            suppliers around the world, cutting out unnecessary costs. The result? The same quality
            products you love, at prices that actually make sense.
          </p>
          <p>
            Today, we&apos;re proud to serve thousands of customers across all 50 states, offering
            everything from electronics and fashion to home essentials and fitness gear — all backed
            by fast shipping, secure checkout, and friendly support.
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="bg-gray-50 border-y border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">Why Shop With Us</h2>
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
            Join thousands of happy customers and discover amazing deals today.
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
