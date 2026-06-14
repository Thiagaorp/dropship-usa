"use client";

import { useEffect, useState } from "react";
import { Tag, Trash2, Plus, Power } from "lucide-react";
import toast from "react-hot-toast";

interface DiscountCode {
  id: string;
  code: string;
  type: string;
  value: number;
  minSubtotal: number;
  active: boolean;
  maxUses: number | null;
  usedCount: number;
  expiresAt: string | null;
  createdAt: string;
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ code: "", type: "percent", value: "", minSubtotal: "", maxUses: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => { load(); }, []);

  async function load() {
    const res = await fetch("/api/discounts");
    const data = await res.json();
    setCodes(data.codes ?? []);
    setLoading(false);
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const res = await fetch("/api/discounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minSubtotal: form.minSubtotal ? Number(form.minSubtotal) : 0,
        maxUses: form.maxUses ? Number(form.maxUses) : null,
      }),
    });
    const data = await res.json();
    if (res.ok) {
      toast.success("Code created");
      setForm({ code: "", type: "percent", value: "", minSubtotal: "", maxUses: "" });
      setShowForm(false);
      load();
    } else {
      toast.error(data.error ?? "Could not create code");
    }
    setSaving(false);
  }

  async function toggle(c: DiscountCode) {
    await fetch(`/api/discounts/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !c.active }),
    });
    setCodes((cs) => cs.map((x) => (x.id === c.id ? { ...x, active: !x.active } : x)));
  }

  async function remove(id: string) {
    if (!confirm("Delete this code?")) return;
    const res = await fetch(`/api/discounts/${id}`, { method: "DELETE" });
    if (res.ok) {
      setCodes((cs) => cs.filter((c) => c.id !== id));
      toast.success("Code deleted");
    } else {
      toast.error("Could not delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Discount Codes ({codes.length})</h1>
        <button
          onClick={() => setShowForm((s) => !s)}
          className="flex items-center gap-2 bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Code
        </button>
      </div>

      {showForm && (
        <form onSubmit={create} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Code *</label>
            <input
              required value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="WELCOME10"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500 uppercase"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount ($)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Value * {form.type === "percent" ? "(%)" : "($)"}
            </label>
            <input
              required type="number" step="0.01" min="0" value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder={form.type === "percent" ? "10" : "5.00"}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Min. order ($)</label>
            <input
              type="number" step="0.01" min="0" value={form.minSubtotal}
              onChange={(e) => setForm({ ...form, minSubtotal: e.target.value })}
              placeholder="0"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Max uses (optional)</label>
            <input
              type="number" min="1" value={form.maxUses}
              onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              placeholder="Unlimited"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-blue-500"
            />
          </div>
          <div className="sm:col-span-2 flex gap-3">
            <button type="button" onClick={() => setShowForm(false)}
              className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl hover:bg-gray-50 text-sm">
              Cancel
            </button>
            <button type="submit" disabled={saving}
              className="bg-blue-600 text-white font-semibold px-6 py-2.5 rounded-xl hover:bg-blue-700 text-sm disabled:opacity-60">
              {saving ? "Creating..." : "Create Code"}
            </button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-gray-400">Loading...</div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-40" />
            No discount codes yet
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Code", "Discount", "Min", "Uses", "Status", ""].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {codes.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono font-bold text-gray-900">{c.code}</td>
                  <td className="px-5 py-3">{c.type === "percent" ? `${c.value}%` : `$${c.value.toFixed(2)}`}</td>
                  <td className="px-5 py-3 text-gray-500">{c.minSubtotal > 0 ? `$${c.minSubtotal.toFixed(2)}` : "—"}</td>
                  <td className="px-5 py-3 text-gray-500">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                  <td className="px-5 py-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${c.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {c.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3 justify-end">
                      <button onClick={() => toggle(c)} className="text-gray-400 hover:text-blue-600" aria-label="Toggle active">
                        <Power className="w-4 h-4" />
                      </button>
                      <button onClick={() => remove(c.id)} className="text-gray-400 hover:text-red-600" aria-label="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
