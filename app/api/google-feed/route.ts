import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

// Google Merchant Center product feed (RSS 2.0 with the g: namespace).
// Add this URL as a "scheduled fetch" feed in Merchant Center:
//   https://www.shopdirectusa.com/api/google-feed
const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.shopdirectusa.com").replace(/\/$/, "");

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  const items = products
    .map((p) => {
      let images: string[] = [];
      let tags: string[] = [];
      try { images = JSON.parse(p.images || "[]"); } catch {}
      try { tags = JSON.parse(p.tags || "[]"); } catch {}
      const img = images.find((i) => /^https?:\/\//.test(i));
      if (!img) return null; // Merchant Center requires a valid image_link

      const desc = (p.description || p.title).slice(0, 4900);
      const fast = tags.includes("us-warehouse");
      return `    <item>
      <g:id>${esc(p.id)}</g:id>
      <g:title>${esc(p.title)}</g:title>
      <g:description>${esc(desc)}</g:description>
      <g:link>${SITE}/products/${p.id}</g:link>
      <g:image_link>${esc(img)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:price>${(p.comparePrice && p.comparePrice > p.price ? p.comparePrice : p.price).toFixed(2)} USD</g:price>${
        p.comparePrice && p.comparePrice > p.price
          ? `\n      <g:sale_price>${p.price.toFixed(2)} USD</g:sale_price>`
          : ""
      }
      <g:condition>new</g:condition>
      <g:brand>ShopDirectUSA</g:brand>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(p.category)}</g:product_type>
      <g:shipping>
        <g:country>US</g:country>
        <g:service>${fast ? "Fast US Shipping (2-7 days)" : "Standard"}</g:service>
        <g:price>0.00 USD</g:price>
      </g:shipping>
    </item>`;
    })
    .filter(Boolean)
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ShopDirectUSA</title>
    <link>${SITE}</link>
    <description>Top-quality products shipped fast across the USA.</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
