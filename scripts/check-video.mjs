import { readFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const env = {};
try {
  const envFile = existsSync(join(__dir, "..", ".env.production")) ? ".env.production" : ".env.local";
  readFileSync(join(__dir, "..", envFile), "utf8").split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
} catch {}

const CJ_API_KEY = process.env.CJ_API_KEY || env.CJ_API_KEY || "";
const BASE = "https://developers.cjdropshipping.com/api2.0/v1";

async function getToken() {
  const r = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: CJ_API_KEY }),
  });
  const d = await r.json();
  return d?.data?.accessToken;
}

async function main() {
  const token = await getToken();
  if (!token) { console.log("auth fail"); return; }

  // Get products from DB to find their CJ pids
  const prods = (await fetch("https://www.shopdirectusa.com/api/products?limit=3000").then(r => r.json())).products;

  // Pick one product per category that has a supplierId
  const cats = ["Home", "Fashion", "Car", "Toys", "Sports", "Outdoor", "Wellness", "Watches", "Electronics", "Spiritual", "Pet", "Beauty"];

  for (const cat of cats) {
    const p = prods.find(x => x.category === cat && x.supplierId);
    if (!p) { console.log(cat + ": no product with supplierId"); continue; }

    const r = await fetch(`${BASE}/product/query?pid=${p.supplierId}`, {
      headers: { "CJ-Access-Token": token }
    });
    const d = await r.json();
    const data = d?.data || {};

    // Find video-related fields
    const videoFields = Object.keys(data).filter(k =>
      k.toLowerCase().includes("video") ||
      k.toLowerCase().includes("media") ||
      k.toLowerCase().includes("mp4")
    );

    if (videoFields.length > 0) {
      videoFields.forEach(k => console.log(`[${cat}] ${k}: ${data[k]}`));
    } else {
      // Print all keys to see what's available
      console.log(`[${cat}] pid=${p.supplierId} — keys: ${Object.keys(data).join(", ")}`);
      // Check productImages for video
      if (data.productImageSet) {
        const imgs = typeof data.productImageSet === "string"
          ? JSON.parse(data.productImageSet)
          : data.productImageSet;
        const vids = imgs.filter(u => typeof u === "string" && (u.includes(".mp4") || u.includes("video")));
        if (vids.length) console.log(`  VIDEOS:`, vids);
      }
    }

    await new Promise(r => setTimeout(r, 300));
  }
}

main().catch(console.error);
