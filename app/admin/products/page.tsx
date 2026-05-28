"use client";

import { useEffect, useState } from "react";
import { Product } from "@/types";
import { formatPrice } from "@/lib/utils";
import { Plus, Pencil, Trash2, ToggleLeft, ToggleRight, Search } from "lucide-react";
import toast from "react-hot-toast";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [form, setForm] = useState({
    title: "", description: "", price: "", comparePrice: "",
    images: "", category: "Electronics", tags: "",
    stock: "100", featured: false, active: true,
  });

  useEffect(() => { loadProducts(); }, []);

  async function loadProducts() {
    const res = await fetch("/api/products?limit=100");
    const data = await res.json();
    setProducts(data.products ?? []);
    setLoading(false);
  }

  function openCreate() {
    setEditProduct(null);
    setForm({ title: "", description: "", price: "", comparePrice: "", images: "", category: "Electronics", tags: "", stock: "100", featured: false, active: true });
    setShowForm(true);
  }

  function openEdit(p: Product) {
    setEditProduct(p);
    setForm({
      title: p.title, description: p.description,
      price: String(p.price), comparePrice: String(p.comparePrice ?? ""),
      images: p.images.join(", "), category: p.category,
      tags: p.tags.join(", "), stock: String(p.stock),
      featured: p.featured, active: p.active,
    });
    setShowForm(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      title: form.title, description: form.description,
      price: parseFloat(form.price),
      comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
      images: form.images.split(",").map((s) => s.trim()).filter(Boolean),
      category: form.category,
      tags: form.tags.split(",").map((s) => s.trim()).filter(Boolean),
      stock: parseInt(form.stock),
      featured: form.featured,
      active: form.active,
    };

    const res = editProduct
      ? await fetch(`/api/products/${editProduct.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) })
      : await fetch("/api/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });

    if (res.ok) {
      toast.success(editProduct ? "Product updated!" : "Product created!");
      setShowForm(false);
      loadProducts();
    } else {
      toast.error("Failed to save product");
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    toast.success("Product deleted");
    loadProducts();
  }

  async function toggleActive(p: Product) {
    await fetch(`/api/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    loadProducts();
  }

  const filtered = products.filter((p) =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const categories = ["Electronics", "Fashion", "Home", "Sports", "Beauty", "Toys", "Other"];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products ({products.length})</h1>
        <button onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
          placeholder="Search products..." />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              {["Product", "Category", "Price", "Stock", "Status", "Actions"].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {loading ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-gray-400">No products</td></tr>
            ) : filtered.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    {p.images[0] && <img src={p.images[0]} alt="" className="w-10 h-10 object-cover rounded-lg" />}
                    <div>
                      <p className="font-medium text-gray-900 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-400 capitalize">{p.supplier}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3 text-gray-600">{p.category}</td>
                <td className="px-5 py-3">
                  <span className="font-semibold">{formatPrice(p.price)}</span>
                  {p.comparePrice && <span className="text-xs text-gray-400 line-through ml-1">{formatPrice(p.comparePrice)}</span>}
                </td>
                <td className="px-5 py-3 text-gray-600">{p.stock}</td>
                <td className="px-5 py-3">
                  <button onClick={() => toggleActive(p)} className="flex items-center gap-1 text-sm">
                    {p.active
                      ? <><ToggleRight className="w-5 h-5 text-green-500" /><span className="text-green-600 font-medium">Active</span></>
                      : <><ToggleLeft className="w-5 h-5 text-gray-400" /><span className="text-gray-400">Inactive</span></>}
                  </button>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-50 rounded-lg text-blue-600 transition-colors">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {editProduct ? "Edit Product" : "New Product"}
            </h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Title *</label>
                <input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Description *</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Price (USD) *</label>
                  <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Compare Price</label>
                  <input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Images (URLs, comma-separated)</label>
                <input value={form.images} onChange={(e) => setForm({ ...form, images: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="https://example.com/img1.jpg, https://..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500">
                    {categories.map((c) => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 mb-1 block">Tags (comma-separated)</label>
                <input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-blue-500"
                  placeholder="wireless, bluetooth, audio" />
              </div>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
                  Featured
                </label>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 cursor-pointer">
                  <input type="checkbox" checked={form.active} onChange={(e) => setForm({ ...form, active: e.target.checked })} />
                  Active
                </label>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 font-semibold py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors">
                  {editProduct ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
