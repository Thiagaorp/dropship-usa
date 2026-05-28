"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/utils";
import { Search, Download, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface SupplierProduct {
  supplierId: string;
  title: string;
  supplierPrice: number;
  suggestedPrice: number;
  image: string;
  category: string;
  supplier: string;
  supplierUrl: string;
}

export default function AdminSuppliersPage() {
  const [keyword, setKeyword] = useState("");
  const [results, setResults] = useState<SupplierProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [imported, setImported] = useState<Set<string>>(new Set());
  const [markup, setMarkup] = useState("2.5");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!keyword.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/suppliers/search?keyword=${encodeURIComponent(keyword)}`);
    const data = await res.json();
    setResults(data.products ?? []);
    setLoading(false);
  }

  async function handleImport(product: SupplierProduct) {
    const res = await fetch("/api/suppliers/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...product, markup: parseFloat(markup) }),
    });
    if (res.ok) {
      toast.success(`"${product.title}" imported to store!`);
      setImported((prev) => new Set([...prev, product.supplierId]));
    } else {
      toast.error("Import failed");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Import Products</h1>
        <p className="text-gray-500 text-sm mt-1">Search CJ Dropshipping &amp; AliExpress products and add them to your store</p>
      </div>

      <form onSubmit={handleSearch} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={keyword} onChange={(e) => setKeyword(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-500"
              placeholder="e.g. wireless earbuds, phone case, yoga mat..." />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700 whitespace-nowrap">Markup:</label>
            <input type="number" step="0.1" min="1" value={markup} onChange={(e) => setMarkup(e.target.value)}
              className="w-20 border border-gray-200 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-blue-500" />
            <span className="text-sm text-gray-500">x</span>
          </div>
          <button type="submit"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap">
            <Search className="w-4 h-4" /> Search
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          💡 Tip: Set markup to 2.5x to price items at 2.5× supplier cost. Suggested prices are calculated automatically.
        </p>
      </form>

      {loading && (
        <div className="flex justify-center py-10">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {results.map((product) => {
            const isImported = imported.has(product.supplierId);
            return (
              <div key={product.supplierId} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="aspect-video bg-gray-50 overflow-hidden">
                  <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                </div>
                <div className="p-4">
                  <p className="text-xs text-blue-500 font-medium uppercase mb-1">{product.category} · {product.supplier.toUpperCase()}</p>
                  <p className="text-sm font-semibold text-gray-900 line-clamp-2 mb-3">{product.title}</p>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-gray-400">Supplier cost</p>
                      <p className="text-sm font-bold text-gray-600">{formatPrice(product.supplierPrice)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Your price ({markup}x)</p>
                      <p className="text-base font-bold text-green-600">{formatPrice(product.supplierPrice * parseFloat(markup))}</p>
                    </div>
                  </div>
                  <button onClick={() => handleImport(product)} disabled={isImported}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${isImported ? "bg-green-100 text-green-700 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white"}`}>
                    {isImported ? <><CheckCircle2 className="w-4 h-4" /> Imported</> : <><Download className="w-4 h-4" /> Import to Store</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && results.length === 0 && keyword && (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <p className="text-gray-400">No results. Try a different keyword.</p>
        </div>
      )}
    </div>
  );
}
