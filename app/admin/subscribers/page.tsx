"use client";

import { useEffect, useState } from "react";
import { Users, Download, Mail } from "lucide-react";

interface Subscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/newsletter");
    const data = await res.json();
    setSubscribers(data.subscribers ?? []);
    setLoading(false);
  }

  function exportCsv() {
    const rows = [["email", "subscribed_at"], ...subscribers.map((s) => [s.email, s.createdAt])];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "subscribers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers ({subscribers.length})</h1>
        {subscribers.length > 0 && (
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : subscribers.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No subscribers yet
          </div>
        ) : (
          <ul className="divide-y divide-gray-50">
            {subscribers.map((s) => (
              <li key={s.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="flex-1 text-sm font-medium text-gray-900">{s.email}</span>
                <span className="text-xs text-gray-400">
                  {new Date(s.createdAt).toLocaleDateString("en-US")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
