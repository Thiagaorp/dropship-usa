"use client";

import { useEffect, useState } from "react";
import { Order } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Package, Truck, CheckCircle2, XCircle, Clock, Trash2, Send, RefreshCw } from "lucide-react";
import toast from "react-hot-toast";

const CJ_PANEL = "https://cjdropshipping.com/myCJ.html#/order/list";

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
  const [busyCJ, setBusyCJ] = useState<string | null>(null);

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

  // Creates the order in CJ as an unpaid draft — payment stays manual in the CJ panel.
  async function sendToCJ(id: string) {
    setBusyCJ(id);
    try {
      const res = await fetch(`/api/orders/${id}/cj`, { method: "POST" });
      const data = await res.json();
      if (res.ok) {
        toast.success("Rascunho criado no CJ — pague no painel do CJ para despachar");
        loadOrders();
      } else if (res.status === 422) {
        const detalhes = [
          ...(data.needsChoice ?? []).map((n: { title: string; options: number }) => `${n.title}: ${n.options} variações`),
          ...(data.missing ?? []),
        ].join(" · ");
        toast.error(`Precisa de pedido manual — ${detalhes || data.hint}`, { duration: 8000 });
      } else {
        toast.error(data.error ?? "Falha ao enviar para o CJ");
      }
    } catch {
      toast.error("Falha ao enviar para o CJ");
    }
    setBusyCJ(null);
  }

  // Pulls status and tracking number back from CJ into the shop.
  async function syncCJ(id: string) {
    setBusyCJ(id);
    try {
      const res = await fetch(`/api/orders/${id}/cj`);
      const data = await res.json();
      if (res.ok) {
        toast.success(data.trackingNumber ? `Rastreio: ${data.trackingNumber}` : `Status no CJ: ${data.supplierStatus ?? "sem novidade"}`);
        loadOrders();
      } else {
        toast.error(data.error ?? "Falha ao sincronizar");
      }
    } catch {
      toast.error("Falha ao sincronizar");
    }
    setBusyCJ(null);
  }

  async function removeOrder(id: string) {
    if (!confirm("Delete this order permanently? This cannot be undone.")) return;
    const res = await fetch(`/api/orders/${id}`, { method: "DELETE" });
    if (res.ok) {
      setOrders((os) => os.filter((o) => o.id !== id));
      toast.success("Order deleted");
    } else {
      toast.error("Could not delete order");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-gray-900">Orders ({orders.length})</h1>
        <a href={CJ_PANEL} target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:underline">
          <Package className="w-4 h-4" /> Abrir painel do CJ para pagar
        </a>
      </div>

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
              {["Order", "Customer", "Total", "Status", "Supplier (CJ)", "Date", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : orders.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-gray-400">No orders</td></tr>
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
                  <td className="px-5 py-3">
                    {order.supplierOrderId ? (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                          {order.supplierStatus === "draft" ? "Rascunho — pagar no CJ" : order.supplierStatus ?? "no CJ"}
                        </span>
                        <button onClick={() => syncCJ(order.id)} disabled={busyCJ === order.id}
                          className="text-gray-400 hover:text-blue-600 transition-colors disabled:opacity-40"
                          aria-label="Sincronizar com o CJ" title="Buscar status e rastreio no CJ">
                          <RefreshCw className={`w-3.5 h-3.5 ${busyCJ === order.id ? "animate-spin" : ""}`} />
                        </button>
                      </div>
                    ) : order.paymentStatus === "paid" && order.paymentIntentId ? (
                      <button onClick={() => sendToCJ(order.id)} disabled={busyCJ === order.id}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors disabled:opacity-50">
                        <Send className="w-3 h-3" />
                        {busyCJ === order.id ? "Enviando..." : "Enviar ao CJ"}
                      </button>
                    ) : order.paymentStatus === "paid" ? (
                      <span className="text-xs text-red-500" title="Marcado pago mas sem pagamento real do Stripe">⚠ sem pgto real</span>
                    ) : (
                      <span className="text-xs text-gray-300">aguardando pgto</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-400 text-xs">
                    {new Date(order.createdAt).toLocaleDateString("en-US")}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => { setSelected(order); setTracking(order.trackingNumber ?? ""); }}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        {order.trackingNumber ? "Edit Tracking" : "Add Tracking"}
                      </button>
                      <button onClick={() => removeOrder(order.id)}
                        className="text-gray-300 hover:text-red-600 transition-colors"
                        aria-label="Delete order">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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
