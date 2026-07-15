// Import domestic/home products from CJ by category IDs
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const env = {};
try {
  readFileSync(join(__dir, "..", ".env.local"), "utf8").split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
} catch {}

const CJ_API_KEY = process.env.CJ_API_KEY || env.CJ_API_KEY || "";
const SITE = "https://www.shopdirectusa.com";
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const MARKUP = 2.0;

async function getToken() {
  const body = CJ_API_KEY.includes("@api@") ? { apiKey: CJ_API_KEY } : {};
  const r = await fetch(`${CJ_BASE}/authentication/getAccessToken`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!d?.data?.accessToken) throw new Error("Auth falhou: " + JSON.stringify(d));
  return d.data.accessToken;
}

async function getByCategory(token, categoryId, page = 1) {
  const r = await fetch(
    `${CJ_BASE}/product/list?pageNum=${page}&pageSize=30&categoryId=${categoryId}`,
    { headers: { "CJ-Access-Token": token } }
  );
  return (await r.json())?.data?.list ?? [];
}

async function importProduct(p, existingTitles) {
  const title = (p.productNameEn || "").trim();
  if (!title || !p.productImage) return null;
  if (existingTitles.has(title.toLowerCase())) return "dup";

  const supplierPrice = parseFloat(p.sellPrice) || 0;
  if (supplierPrice <= 0 || supplierPrice > 60) return null;

  const price = Math.round(supplierPrice * MARKUP * 100) / 100;
  const comparePrice = Math.round(price * 1.3 * 100) / 100;

  const r = await fetch(`${SITE}/api/suppliers/import`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      supplierId: p.pid, title, supplierPrice, suggestedPrice: price,
      image: p.productImage, category: "Home", supplier: "cj",
      supplierUrl: `https://cjdropshipping.com/product/${p.pid}`, markup: MARKUP,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    return (t.includes("Unique") || t.includes("already")) ? "dup" : null;
  }
  existingTitles.add(title.toLowerCase());
  return (await r.json()).product;
}

// Home categories grouped by theme
const HOME_CATS = [
  // Kitchen
  { name: "Cooking Tools", id: "E448A723-43DC-4BD8-A9AD-2FB9699338B4" },
  { name: "Dinnerware", id: "0F4CFA22-8B97-4016-94A6-18066B9BD05C" },
  { name: "Drinkware", id: "CF330457-0E5B-4FAF-9BAE-7D2C247BD8DE" },
  { name: "Kitchen Knives", id: "23ADD7CB-065A-4A02-B8E8-43D3F041B90B" },
  { name: "Bakeware", id: "7C8E809A-460A-4F50-8A2F-B62AD010BFF8" },
  { name: "Kitchen Storage", id: "56845C3D-4D9E-4729-B5D4-6D7DE310C031" },
  // Storage & Organization
  { name: "Storage Bags & Boxes", id: "2502140315331600200" },
  { name: "Bathroom Storage", id: "B62EE40F-7650-4715-A7A5-BA227540593C" },
  { name: "Home Office Storage", id: "87CF251F-8D11-4DE0-A154-9694D9858EB3" },
  { name: "Clothing Storage", id: "A0E89009-FFD6-4B2E-906A-8076DF45B32C" },
  // Home Textiles
  { name: "Floor Mats", id: "2601070550351602500" },
  { name: "Pillows", id: "6939DA08-F7F8-48FB-A7E8-169AEAC92404" },
  { name: "Towels", id: "331F43CE-CA1D-45F2-BE2A-8AE62EC10251" },
  { name: "Cushion Covers", id: "300CC260-CF9D-4AEA-9FC2-6C8DB8A35B51" },
  // Lighting & Decor
  { name: "Night Lights", id: "538CB48E-B7A0-46F7-B5A2-BB8183247B23" },
  { name: "String Lights", id: "EDB5F43E-EAC0-489A-8355-5188EAB72D08" },
  { name: "Decorative Flowers", id: "7B975B46-46DF-4C3A-BC58-1F4F2DDB9413" },
  { name: "Decor Paintings", id: "2409230854411618700" },
];

// Skip clearly non-home junk that CJ sometimes places in these cats
const JUNK = /(scale|thermometer|electronic watch|smart watch|bracelet|earring|necklace|dress|pants|shirt|shoes|sneaker|pet food|dog food|car part|engine|tyre|tire|supplement|capsule|tablet|pill|serum|cream|mascara|lipstick|foundation|eyeshadow|blush|face mask|razor|trimmer|clipper|printer|laptop|phone case|charger cable|usb hub|keyboard|mouse pad)/i;

async function main() {
  if (!CJ_API_KEY) { console.error("CJ_API_KEY não encontrado"); process.exit(1); }

  console.log("Autenticando...");
  const token = await getToken();

  const existing = (await fetch(`${SITE}/api/products?limit=300`).then(r => r.json())).products;
  const existingTitles = new Set(existing.map(p => p.title.toLowerCase()));
  console.log("Produtos já no site:", existing.length);

  let imported = 0, dup = 0, skip = 0;

  for (const cat of HOME_CATS) {
    console.log(`\n[${cat.name}]`);
    const products = await getByCategory(token, cat.id, 1);
    let catImported = 0;

    for (const p of products) {
      const title = (p.productNameEn || "").trim();
      if (JUNK.test(title)) { skip++; continue; }
      const supplierPrice = parseFloat(p.sellPrice) || 0;
      if (supplierPrice <= 0 || supplierPrice > 60) { skip++; continue; }

      const result = await importProduct(p, existingTitles);
      if (result === "dup") { dup++; }
      else if (result) {
        imported++; catImported++;
        console.log(`  ✓ $${result.price.toFixed(2)} | ${title.slice(0, 55)}`);
      } else { skip++; }

      await new Promise(r => setTimeout(r, 200));
    }
    if (catImported === 0) console.log("  (nenhum novo)");
  }

  console.log(`\nTotal: ${imported} importados | ${dup} dups | ${skip} ignorados`);
}

main().catch(console.error);
