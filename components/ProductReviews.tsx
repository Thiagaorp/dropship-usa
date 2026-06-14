"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, CheckCircle } from "lucide-react";
import { Review } from "@/types";
import toast from "react-hot-toast";

interface Props {
  productId: string;
}

interface ReviewData {
  reviews: Review[];
  average: number;
  count: number;
  distribution: Record<number, number>;
}

function StarRow({ value, size = "w-4 h-4" }: { value: number; size?: string }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`${size} ${
            s <= Math.round(value)
              ? "fill-yellow-400 text-yellow-400"
              : "fill-gray-200 text-gray-200"
          }`}
        />
      ))}
    </div>
  );
}

export default function ProductReviews({ productId }: Props) {
  const [data, setData] = useState<ReviewData | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    fetch(`/api/products/${productId}/reviews`)
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData({ reviews: [], average: 0, count: 0, distribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 } }));
  }, [productId]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (rating < 1) {
      toast.error("Please select a star rating.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ authorName: name, rating, comment }),
      });
      const body = await res.json();
      if (!res.ok) {
        toast.error(body.error ?? "Could not submit review.");
        return;
      }
      // Refresh list
      const refreshed = await fetch(`/api/products/${productId}/reviews`).then((r) => r.json());
      setData(refreshed);
      setDone(true);
      setName("");
      setRating(0);
      setComment("");
      setTimeout(() => {
        setShowForm(false);
        setDone(false);
      }, 1800);
    } catch {
      toast.error("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!data) {
    return (
      <div className="mt-16 flex justify-center">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxCount = Math.max(1, ...Object.values(data.distribution));

  return (
    <div className="mt-16">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Customer Reviews</h2>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 shadow-sm">
        {data.count === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="font-semibold text-gray-900">No reviews yet</p>
            <p className="text-sm text-gray-500 mt-1 mb-5">Be the first to share your thoughts on this product.</p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm"
              >
                Write a Review
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Summary */}
            <div className="md:border-r md:border-gray-100 md:pr-8">
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-extrabold text-gray-900">{data.average.toFixed(1)}</span>
                <span className="text-gray-400">/ 5</span>
              </div>
              <div className="mt-2"><StarRow value={data.average} size="w-5 h-5" /></div>
              <p className="text-sm text-gray-500 mt-1">
                Based on {data.count} review{data.count !== 1 ? "s" : ""}
              </p>

              {/* Distribution */}
              <div className="mt-5 space-y-1.5">
                {[5, 4, 3, 2, 1].map((star) => (
                  <div key={star} className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 w-3">{star}</span>
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${(data.distribution[star] / maxCount) * 100}%` }}
                      />
                    </div>
                    <span className="text-gray-400 w-6 text-right">{data.distribution[star]}</span>
                  </div>
                ))}
              </div>

              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="mt-6 w-full border border-blue-600 text-blue-600 font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
                >
                  Write a Review
                </button>
              )}
            </div>

            {/* List */}
            <div className="md:col-span-2 space-y-5">
              {data.reviews.map((r) => (
                <div key={r.id} className="border-b border-gray-50 pb-5 last:border-0">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-900">{r.authorName}</p>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                    </span>
                  </div>
                  <div className="my-1"><StarRow value={r.rating} size="w-3.5 h-3.5" /></div>
                  <p className="text-sm text-gray-600 leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Review Form */}
        {showForm && (
          <div className="mt-8 border-t border-gray-100 pt-6">
            {done ? (
              <div className="text-center py-6">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">Thanks for your review!</p>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-4 max-w-xl">
                <h3 className="font-bold text-gray-900">Write your review</h3>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your rating *</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onMouseEnter={() => setHover(s)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(s)}
                        className="p-0.5"
                        aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                      >
                        <Star
                          className={`w-7 h-7 transition-colors ${
                            s <= (hover || rating)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-gray-200 text-gray-200"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your name *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="e.g. Sarah M."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your review *</label>
                  <textarea
                    required
                    rows={4}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 resize-none"
                    placeholder="What did you like or dislike?"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 transition-colors text-sm disabled:opacity-60 flex items-center gap-2"
                  >
                    {submitting && <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                    Submit Review
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
