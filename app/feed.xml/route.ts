import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
  "https://www.shopdirectusa.com";

export async function GET() {
  const products = await prisma.product.findMany({
    where: { active: true },
    orderBy: { createdAt: "desc" },
  });

  const items = products
    .map((p) => {
      const images: string[] = (() => {
        try {
          return JSON.parse(p.images);
        } catch {
          return [p.images];
        }
      })();
      const image = images[0] ?? "";
      const price = p.price.toFixed(2);
      const comparePrice = p.comparePrice ? p.comparePrice.toFixed(2) : null;
      const productUrl = `${SITE_URL}/products/${p.id}`;

      return `
    <item>
      <g:id>${p.id}</g:id>
      <g:title><![CDATA[${p.title}]]></g:title>
      <g:description><![CDATA[${p.description.slice(0, 5000)}]]></g:description>
      <g:link>${productUrl}</g:link>
      <g:image_link>${image}</g:image_link>
      <g:condition>new</g:condition>
      <g:availability>${p.stock > 0 ? "in stock" : "out of stock"}</g:availability>
      <g:price>${price} USD</g:price>
      ${comparePrice ? `<g:sale_price>${price} USD</g:sale_price>` : ""}
      <g:brand>ShopDirectUSA</g:brand>
      <g:google_product_category>${mapCategory(p.category)}</g:google_product_category>
      <g:shipping>
        <g:country>US</g:country>
        <g:price>0 USD</g:price>
      </g:shipping>
      ${p.sku ? `<g:mpn>${p.sku}</g:mpn>` : ""}
      <g:identifier_exists>no</g:identifier_exists>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>ShopDirectUSA</title>
    <link>${SITE_URL}</link>
    <description>Best deals from top US suppliers — free shipping on all orders.</description>
    ${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function mapCategory(category: string): string {
  const map: Record<string, string> = {
    Electronics: "Electronics",
    Fashion: "Apparel & Accessories",
    "Home & Garden": "Home & Garden",
    Sports: "Sporting Goods",
    Beauty: "Health & Beauty",
    Toys: "Toys & Games",
    Pet: "Animals & Pet Supplies",
    Wellness: "Health & Beauty",
    Car: "Vehicles & Parts",
    Outdoor: "Sporting Goods",
  };
  return map[category] ?? "Home & Garden";
}
