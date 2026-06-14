"use client";

import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cart";
import { formatPrice } from "@/lib/utils";
import { ShippingAddress } from "@/types";
import { ShieldCheck, Lock, CreditCard, Tag } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? ""
);

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY",
];

// ── Stripe Payment Form ───────────────────────────────────────────────────────
function StripePaymentForm({
  orderId,
  onBack,
}: {
  orderId: string;
  onBack: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { clearCart } = useCartStore();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/order-confirmation?order=${orderId}`,
      },
      redirect: "if_required",
    });

    if (error) {
      toast.error(error.message ?? "Payment failed");
      setLoading(false);
    } else {
      // Payment succeeded without redirect
      await fetch(`/api/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentStatus: "paid", status: "processing" }),
      });
      clearCart();
      router.push(`/order-confirmation?order=${orderId}`);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-blue-50 text-blue-700 text-sm rounded-xl p-3 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        Your payment is encrypted and processed securely by Stripe
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <PaymentElement
          options={{
            layout: "tabs",
            defaultValues: { billingDetails: { address: { country: "US" } } },
          }}
        />
      </div>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <button
          type="submit"
          disabled={loading || !stripe}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Lock className="w-4 h-4" />
              Pay Now
            </>
          )}
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 text-xs text-gray-400">
        <Lock className="w-3 h-3" />
        Secured by Stripe &mdash; we never store your card details
      </div>
    </form>
  );
}

// ── Main Checkout Page ────────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCartStore();
  const router = useRouter();

  const [step, setStep] = useState<"shipping" | "payment">("shipping");
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const [address, setAddress] = useState<ShippingAddress>({
    firstName: "", lastName: "", address1: "", address2: "",
    city: "", state: "CA", zipCode: "", country: "US", phone: "",
  });
  const [email, setEmail] = useState("");

  // Promo / discount code
  const [promoInput, setPromoInput] = useState("");
  const [promo, setPromo] = useState<{ code: string; amount: number } | null>(null);
  const [promoMsg, setPromoMsg] = useState("");
  const [promoChecking, setPromoChecking] = useState(false);

  const sub = subtotal();
  const shipping = sub >= 35 ? 0 : 5.99;
  const tax = sub * 0.08;
  const discount = promo?.amount ?? 0;
  const total = Math.max(0, sub - discount + shipping + tax);

  async function applyPromo() {
    if (!promoInput.trim()) return;
    setPromoChecking(true);
    setPromoMsg("");
    try {
      const res = await fetch("/api/discounts/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal: sub }),
      });
      const data = await res.json();
      if (data.valid) {
        setPromo({ code: data.code, amount: data.discountAmount });
        setPromoMsg(data.message);
      } else {
        setPromo(null);
        setPromoMsg(data.message ?? "Invalid code.");
      }
    } catch {
      setPromoMsg("Could not check code. Try again.");
    } finally {
      setPromoChecking(false);
    }
  }

  function removePromo() {
    setPromo(null);
    setPromoInput("");
    setPromoMsg("");
  }

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <p className="text-gray-500 text-xl">Your cart is empty.</p>
        <a href="/products" className="text-blue-600 mt-4 inline-block font-medium">
          Continue Shopping
        </a>
      </div>
    );
  }

  async function handleShippingSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCreatingOrder(true);

    try {
      // 1. Create order in DB (pending payment)
      const orderRes = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
            price: i.price,
            title: i.title,
            image: i.image,
          })),
          customerName: `${address.firstName} ${address.lastName}`,
          customerEmail: email,
          customerPhone: address.phone,
          shippingAddress: address,
          subtotal: sub,
          shipping,
          tax,
          discountCode: promo?.code ?? null,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error ?? "Order creation failed");

      setOrderId(orderData.order.id);
      setOrderNumber(orderData.orderNumber);

      // 2. Create Stripe Payment Intent — use the server-computed total
      const piRes = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: orderData.order.total,
          metadata: { orderId: orderData.order.id, orderNumber: orderData.orderNumber },
        }),
      });

      const piData = await piRes.json();
      if (!piRes.ok) throw new Error(piData.error ?? "Payment setup failed");

      setClientSecret(piData.clientSecret);
      setStep("payment");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setCreatingOrder(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-2">
        <Lock className="w-5 h-5 text-blue-600" /> Secure Checkout
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          {/* Steps */}
          <div className="flex gap-0 mb-8 rounded-xl overflow-hidden border border-gray-200">
            {(["shipping", "payment"] as const).map((s, i) => (
              <button
                key={s}
                onClick={() => step === "payment" && s === "shipping" && setStep(s)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  step === s ? "bg-blue-600 text-white" : "bg-white text-gray-500"
                }`}
              >
                {i + 1}. {s === "shipping" ? "Shipping" : "Payment"}
              </button>
            ))}
          </div>

          {/* Shipping step */}
          {step === "shipping" && (
            <form onSubmit={handleShippingSubmit} className="space-y-5 bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg">Shipping Information</h2>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Email *</label>
                <input
                  required type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                  placeholder="your@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {(["firstName", "lastName"] as const).map((field) => (
                  <div key={field}>
                    <label className="text-sm font-medium text-gray-700 mb-1 block">
                      {field === "firstName" ? "First Name" : "Last Name"} *
                    </label>
                    <input
                      required value={address[field]}
                      onChange={(e) => setAddress({ ...address, [field]: e.target.value })}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Address *</label>
                <input
                  required value={address.address1}
                  onChange={(e) => setAddress({ ...address, address1: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                  placeholder="123 Main St"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Apt, suite, etc.</label>
                <input
                  value={address.address2}
                  onChange={(e) => setAddress({ ...address, address2: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">State *</label>
                  <select
                    required value={address.state}
                    onChange={(e) => setAddress({ ...address, state: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500"
                  >
                    {US_STATES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">City *</label>
                  <input
                    required value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">ZIP *</label>
                  <input
                    required value={address.zipCode}
                    onChange={(e) => setAddress({ ...address, zipCode: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                    placeholder="90210"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Phone</label>
                <input
                  type="tel" value={address.phone}
                  onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="+1 (555) 000-0000"
                />
              </div>

              <button
                type="submit"
                disabled={creatingOrder}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                {creatingOrder ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Setting up payment...</>
                ) : (
                  <><CreditCard className="w-4 h-4" /> Continue to Payment</>
                )}
              </button>
            </form>
          )}

          {/* Payment step — Stripe Elements */}
          {step === "payment" && clientSecret && (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
              <h2 className="font-bold text-gray-900 text-lg mb-5">Payment</h2>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: "stripe",
                    variables: {
                      colorPrimary: "#2563eb",
                      borderRadius: "12px",
                      fontFamily: "inherit",
                    },
                  },
                }}
              >
                <StripePaymentForm
                  orderId={orderId!}
                  onBack={() => setStep("shipping")}
                />
              </Elements>
            </div>
          )}

          {/* Stripe not configured warning */}
          {step === "payment" && !clientSecret && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 text-center">
              <p className="text-yellow-800 font-semibold mb-2">Stripe not configured</p>
              <p className="text-yellow-700 text-sm">
                Add your <code className="bg-yellow-100 px-1 rounded">STRIPE_SECRET_KEY</code> and{" "}
                <code className="bg-yellow-100 px-1 rounded">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> to{" "}
                <code className="bg-yellow-100 px-1 rounded">.env.local</code> to accept real payments.
              </p>
            </div>
          )}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-gray-100 p-6 sticky top-24">
            <h2 className="font-bold text-gray-900 mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 shrink-0">
                    <img
                      src={item.image} alt={item.title}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <span className="absolute -top-1.5 -right-1.5 bg-gray-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700 line-clamp-1">{item.title}</p>
                    <p className="text-xs text-gray-400">{formatPrice(item.price)} each</p>
                  </div>
                  <span className="text-sm font-semibold">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Promo code */}
            <div className="border-t border-gray-100 pt-4 mb-4">
              {promo ? (
                <div className="flex items-center justify-between bg-green-50 rounded-xl px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm">
                    <Tag className="w-4 h-4 text-green-600" />
                    <span className="font-semibold text-green-700">{promo.code}</span>
                    <span className="text-green-600">applied</span>
                  </div>
                  <button onClick={removePromo} className="text-xs text-gray-500 hover:text-red-600 font-medium">
                    Remove
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      value={promoInput}
                      onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyPromo(); } }}
                      placeholder="Promo code"
                      className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 uppercase"
                    />
                    <button
                      onClick={applyPromo}
                      disabled={promoChecking || !promoInput.trim()}
                      className="bg-gray-900 text-white text-sm font-semibold px-4 rounded-xl hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {promoChecking ? "..." : "Apply"}
                    </button>
                  </div>
                  {promoMsg && <p className="text-xs text-red-500 mt-1.5">{promoMsg}</p>}
                </>
              )}
            </div>

            <div className="border-t border-gray-100 pt-4 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span><span>{formatPrice(sub)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-sm text-green-600 font-medium">
                  <span>Discount{promo ? ` (${promo.code})` : ""}</span>
                  <span>−{formatPrice(discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm text-gray-600">
                <span>Shipping</span>
                <span className={shipping === 0 ? "text-green-600 font-medium" : ""}>
                  {shipping === 0 ? "FREE" : formatPrice(shipping)}
                </span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Tax (8%)</span><span>{formatPrice(tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-lg border-t border-gray-100 pt-2">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5" /> Secured by Stripe
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
