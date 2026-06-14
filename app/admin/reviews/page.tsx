"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, MessageSquare } from "lucide-react";
import toast from "react-hot-toast";

interface AdminReview {
  id: string;
  productId: string;
  productTitle: string;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/reviews");
    const data = await res.json();
    setReviews(data.reviews ?? []);
    setLoading(false);
  }

  async function remove(id: string) {
    if (!confirm("Delete this review? This cannot be undone.")) return;
    setDeleting(id);
    const res = await fetch(`/api/reviews/${id}`, { method: "DELETE" });
    if (res.ok) {
      setReviews((rs) => rs.filter((r) => r.id !== id));
      toast.success("Review deleted");
    } else {
      toast.error("Could not delete review");
    }
    setDeleting(null);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Reviews ({reviews.length})</h1>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No reviews yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {reviews.map((r) => (
              <li key={r.id} className="px-5 py-4 flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{r.authorName}</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= r.rating ? "fill-yellow-400 text-yellow-400" : "fill-gray-200 text-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(r.createdAt).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <a href={`/products/${r.productId}`} target="_blank" rel="noreferrer"
                    className="text-xs text-blue-600 hover:underline">
                    {r.productTitle}
                  </a>
                  <p className="text-sm text-gray-600 mt-1">{r.comment}</p>
                </div>
                <button
                  onClick={() => remove(r.id)}
                  disabled={deleting === r.id}
                  className="text-gray-400 hover:text-red-600 transition-colors p-2 shrink-0 disabled:opacity-50"
                  aria-label="Delete review"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
