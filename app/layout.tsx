import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import CookieBanner from "@/components/CookieBanner";
import Pixels from "@/components/Pixels";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://dropship-usa.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  verification: {
    google: "aSp4SJI5SdT-W1TRxUAIske2uDkf1oD-90FabLBz5OQ",
  },
  title: {
    default: "ShopDirectUSA — Best Deals from Top Suppliers",
    template: "%s | ShopDirectUSA",
  },
  description:
    "Shop thousands of products at unbeatable prices. Fast shipping across the USA. Electronics, Fashion, Home & more.",
  keywords: "dropshipping, online store, usa, cheap products, electronics, fashion",
  openGraph: {
    title: "ShopDirectUSA — Best Deals from Top Suppliers",
    description:
      "Shop thousands of products at unbeatable prices. Fast shipping across the USA.",
    url: SITE_URL,
    siteName: "ShopDirectUSA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ShopDirectUSA — Best Deals from Top Suppliers",
    description: "Shop thousands of products at unbeatable prices. Fast shipping across the USA.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-gray-50 min-h-screen`}>
        <Pixels />
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
