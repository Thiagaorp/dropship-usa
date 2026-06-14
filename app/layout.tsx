import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CookieBanner from "@/components/CookieBanner";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "ShopDirectUSA — Best Deals from Top Suppliers",
  description:
    "Shop thousands of products at unbeatable prices. Fast shipping across the USA. Electronics, Fashion, Home & more.",
  keywords: "dropshipping, online store, usa, cheap products, electronics, fashion",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Header />
        <CartDrawer />
        <main>{children}</main>
        <Footer />
        <CookieBanner />
        <Toaster
          position="top-right"
          toastOptions={{
            style: { borderRadius: "10px", fontFamily: "inherit" },
          }}
        />
      </body>
    </html>
  );
}
