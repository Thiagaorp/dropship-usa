"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Package, ShoppingBag, Search, LogOut, ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/suppliers", label: "Import Products", icon: Search },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-56 bg-gray-900 text-gray-300 flex flex-col shrink-0">
        <div className="p-5 border-b border-gray-800">
          <p className="text-white font-bold text-lg">⚙️ Admin Panel</p>
          <p className="text-xs text-gray-500 mt-0.5">ShopDirectUSA</p>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link key={href} href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-blue-600 text-white" : "hover:bg-gray-800"}`}>
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <Link href="/" target="_blank"
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm hover:bg-gray-800 transition-colors">
            <LogOut className="w-4 h-4" /> View Store
          </Link>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <span>Admin</span>
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-900 capitalize">
              {pathname.replace("/admin", "").replace("/", "") || "Dashboard"}
            </span>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
