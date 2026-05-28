"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, CheckCircle2, XCircle, Clock } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["pending", "processing", "shipped", "delivered", "cancelled"];

const statusConfig: Record<string, { color: string; icon: React.ReactNode }> = {
  pending: { color: "bg-yellow-100 text-yellow-700", icon: <Clock className="w-3.5 h-3.5" /> },
  processing: { color: "bg-blue-100 text-blue-700", icon: <Package className="w-3.5 h-3.5" /> },
  shipped: { color: "bg-indigo-100 text-indigo-700", icon: <Truck className="w-3.5 h-3.5" /> },
  delivered: { color: "bg-green-100 text-green-700", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  cancelled: { color: "bg-red-100 text-red-700", icon: <XCircle className="w-3.5 h-3.5" /> },
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selected, setSelected] = useState<Order | null>(null);
  const [tracking, setTracking] = useState("");

  useEffect(() => { loadOrders(); }, [filter]);

  async function loadOrders() {
    const qs = filter !== "all" ? `?status=${filter}` : "";
    const res = await fetch(`/api/orders${qs}`);
    const data = await res.json();
    setOrders(data.orders ?? []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    toast.success("Status updated");
    loadOrders();
  }

  async function addTracking(id: string) {
    await fetch(`/api/orders/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingNumber: tracking, status: "shipped" }),
    });
    toast.success("Tracking number added");
    setTracking("");
    setSelected(null);
    loadOrders();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Orders ({orders.length})</h1>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", ...STATUS_OPTIONS].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${filter === s ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-blue-400"}`}>
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Order", "Customer", "Total", "Status", "Date", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No orders</td></tr>
            ) : orders.map((order) => {
              const cfg = statusConfig[order.status] ?? { color: "bg-gray-100 text-gray-600", icon: null };
              return (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="font-mono font-semibold text-blue-600 text-xs">{order.orderNumber}</p>
                    <p className="text-xs text-gray-400">{order.items.length} items</p>
                  </td>
                  <td className="px-5 py-3">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    <p className="text-xs text-gray-400">{order.customerEmail}</p>
                  </td>
                  <td className="px-5 py-3 font-semibold">{formatPrice(order.total)}</td>
                  <td className="px-5 py-3">
                    <select value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize border-0 cursor-pointer ${cfg.color}`}>
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-5 py-3">
                    <button onClick={() => { setSelected(order); setTracking(order.trackingNumber ?? ""); }}
                      className="text-xs text-blue-600 hover:underline font-medium">
                      {order.trackingNumber ? "Edit Tracking" : "Add Tracking"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Tracking Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Tracking — {selected.orderNumber}</h2>
            <div className="mb-4">
              <label className="text-sm font-medium text-gray-700 mb-1 block">Tracking Number</label>
              <input value={tracking} onChange={(e) => setTracking(e.target.value)}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                placeholder="e.g. 1Z999AA10123456784" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setSelected(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={() => addTracking(selected.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-xl font-semibold transition-colors">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
