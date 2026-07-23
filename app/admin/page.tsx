"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { ShoppingBag, Package, DollarSign, TrendingUp } from "lucide-react";

interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  total: number;
  status: string;
  paymentStatus: string;
  paymentIntentId: string | null;
  createdAt: string;
  items: { id: string }[];
}

interface Stats {
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  revenue: number;
  recentOrders: Order[];
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  processing: "bg-blue-100 text-blue-700",
  shipped: "bg-indigo-100 text-indigo-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [ordersRes, productsRes] = await Promise.all([
          fetch("/api/orders?limit=10"),
          fetch("/api/products?limit=1"),
        ]);
        const ordersData = await ordersRes.json();
        const productsData = await productsRes.json();

        const orders: Order[] = ordersData.orders ?? [];
        const pending = orders.filter((o) => o.status === "pending").length;
        // Only count revenue Stripe actually confirmed (paid AND a real
        // paymentIntentId), so bot/unpaid orders don't inflate the number.
        const revenue = orders
          .filter((o) => o.paymentStatus === "paid" && o.paymentIntentId)
          .reduce((sum, o) => sum + o.total, 0);

        setStats({
          totalOrders: ordersData.total ?? 0,
          totalProducts: productsData.total ?? 0,
          pendingOrders: pending,
          revenue,
          recentOrders: orders,
        });
      } catch {
        setStats({ totalOrders: 0, totalProducts: 0, pendingOrders: 0, revenue: 0, recentOrders: [] });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = stats
    ? [
        { label: "Total Orders", value: stats.totalOrders, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
        { label: "Active Products", value: stats.totalProducts, icon: Package, color: "text-green-600 bg-green-50" },
        { label: "Pending Orders", value: stats.pendingOrders, icon: TrendingUp, color: "text-orange-600 bg-orange-50" },
        { label: "Revenue (recent)", value: formatPrice(stats.revenue), icon: DollarSign, color: "text-purple-600 bg-purple-50" },
      ]
    : [];

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-100 rounded mb-3 w-2/3" />
                <div className="h-8 bg-gray-100 rounded w-1/2" />
              </div>
            ))
          : statCards.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500 font-medium">{label}</p>
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
              </div>
            ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                {["Order #", "Customer", "Items", "Total", "Status", "Date"].map((h) => (
                  <th key={h} className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : stats?.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">No orders yet</td>
                </tr>
              ) : (
                stats?.recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-mono font-semibold text-blue-600">{order.orderNumber}</td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{order.customerName}</p>
                      <p className="text-xs text-gray-400">{order.customerEmail}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{order.items.length} item{order.items.length !== 1 ? "s" : ""}</td>
                    <td className="px-6 py-4 font-semibold">{formatPrice(order.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-xs">
                      {new Date(order.createdAt).toLocaleDateString("en-US")}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
