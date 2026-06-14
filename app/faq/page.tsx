import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "FAQ — ShopDirectUSA",
  description: "Frequently asked questions about ordering, shipping, payment, and returns.",
};

const faqs = [
  {
    q: "How long does shipping take?",
    a: "Most orders are processed within 1–2 business days and delivered within 7–15 business days across the United States. You'll receive a tracking number by email once your order ships.",
  },
  {
    q: "Is shipping really free?",
    a: "Yes! We offer free standard shipping on all orders over $35. Orders under $35 have a flat $4.99 shipping fee.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express, Discover) through our secure Stripe checkout, protected with 256-bit SSL encryption.",
  },
  {
    q: "Can I return an item?",
    a: "Absolutely. We offer a 30-day return policy on all unused items in their original packaging. See our Returns & Refunds page for full details.",
  },
  {
    q: "How do I track my order?",
    a: "Once your order ships, we'll email you a tracking link. You can also reply to your order confirmation email at any time and our team will help you locate your package.",
  },
  {
    q: "Do you ship internationally?",
    a: "Currently we only ship within the United States, including Alaska and Hawaii. We're working on expanding to international destinations soon.",
  },
  {
    q: "What if my item arrives damaged?",
    a: "We're sorry if that happens! Email us at support@shopdirectusa.com within 48 hours of delivery with a photo, and we'll send a free replacement or full refund right away.",
  },
  {
    q: "How can I contact customer support?",
    a: "You can reach our support team at support@shopdirectusa.com. We typically respond within 24 hours, Monday through Friday.",
  },
];

export default function FAQPage() {
  return (
    <LegalPage title="Frequently Asked Questions" subtitle="Everything you need to know about shopping with us.">
      <div className="not-prose space-y-4 mt-6">
        {faqs.map((faq) => (
          <details key={faq.q} className="group bg-white border border-gray-100 rounded-2xl px-5 py-4 shadow-sm">
            <summary className="flex items-center justify-between cursor-pointer font-semibold text-gray-900 list-none">
              {faq.q}
              <span className="text-blue-600 text-xl group-open:rotate-45 transition-transform">+</span>
            </summary>
            <p className="text-gray-600 leading-relaxed mt-3">{faq.a}</p>
          </details>
        ))}
      </div>
    </LegalPage>
  );
}
