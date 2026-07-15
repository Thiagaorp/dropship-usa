// Import casual/fashion watches from CJ Dropshipping
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
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const d = await r.json();
  if (!d?.data?.accessToken) throw new Error("Auth falhou: " + JSON.stringify(d));
  return d.data.accessToken;
}

async function getCategories(token) {
  const r = await fetch(`${CJ_BASE}/product/getCategory`, {
    headers: { "CJ-Access-Token": token },
  });
  return (await r.json())?.data ?? [];
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
  if (supplierPrice <= 0 || supplierPrice > 60) return null; // max $60 supplier = $120 price

  // Skip junk: non-watch items that slip into watch categories
  const t = title.toLowerCase();
  const isJunk = /(strap only|band only|charger|cable|stand|holder|mount|case for|protector|screen|spare|replacement|bracelet kit|box only)/i.test(t);
  if (isJunk) return null;

  const price = Math.round(supplierPrice * MARKUP * 100) / 100;
  const comparePrice = Math.round(price * 1.3 * 100) / 100;

  const r = await fetch(`${SITE}/api/suppliers/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      supplierId: p.pid,
      title,
      supplierPrice,
      suggestedPrice: price,
      image: p.productImage,
      category: "Watches",
      supplier: "cj",
      supplierUrl: `https://cjdropshipping.com/product/${p.pid}`,
      markup: MARKUP,
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    if (txt.includes("Unique constraint") || txt.includes("already")) return "dup";
    return null;
  }
  existingTitles.add(title.toLowerCase());
  return (await r.json()).product;
}

async function main() {
  if (!CJ_API_KEY) { console.error("CJ_API_KEY não encontrado"); process.exit(1); }

  console.log("Autenticando...");
  const token = await getToken();

  // Get existing product titles to avoid duplicates
  const existing = await fetch(`${SITE}/api/products?limit=300`).then(r => r.json());
  const existingTitles = new Set(existing.products.map(p => p.title.toLowerCase()));
  console.log("Produtos existentes:", existing.products.length);

  console.log("\nBuscando categorias de relógio no CJ...");
  const tree = await getCategories(token);

  const watchCats = [];
  for (const first of tree) {
    const fname = (first.categoryName || "").toLowerCase();
    for (const second of first.categorySecondList ?? []) {
      const sname = (second.categoryName || "").toLowerCase();
      if (
        sname.includes("watch") ||
        fname.includes("watch") ||
        sname.includes("timepiece") ||
        (sname.includes("clock") && !sname.includes("alarm clock"))
      ) {
        watchCats.push({ name: second.categoryName, id: second.categoryId, parent: first.categoryName });
      }
    }
  }

  if (watchCats.length === 0) {
    // Fallback: broad search in Jewelry & Watches parent
    for (const first of tree) {
      if ((first.categoryName || "").toLowerCase().includes("watch") ||
          (first.categoryName || "").toLowerCase().includes("jewel")) {
        for (const second of first.categorySecondList ?? []) {
          watchCats.push({ name: second.categoryName, id: second.categoryId, parent: first.categoryName });
        }
      }
    }
  }

  console.log(`Categorias encontradas (${watchCats.length}):`);
  watchCats.forEach(c => console.log(`  [${c.parent}] ${c.name} → ${c.id}`));

  let imported = 0;
  let dup = 0;

  for (const cat of watchCats.slice(0, 6)) {
    console.log(`\nImportando de: ${cat.name}`);
    for (let page = 1; page <= 2; page++) {
      const products = await getByCategory(token, cat.id, page);
      if (!products.length) break;

      for (const p of products) {
        const result = await importProduct(p, existingTitles);
        if (result === "dup") { dup++; }
        else if (result) {
          imported++;
          console.log(`  ✓ $${result.price.toFixed(2)} | ${result.title.slice(0, 55)}`);
        }
        await new Promise(r => setTimeout(r, 250));
      }
    }
  }

  // If not enough watches, also try US warehouse watches
  if (imported < 8) {
    console.log("\nBuscando relógios em armazém US...");
    for (const cat of watchCats.slice(0, 3)) {
      const products = await getByCategory(token, cat.id + "&countryCode=US", 1).catch(() => []);
      for (const p of products) {
        const result = await importProduct(p, existingTitles);
        if (result && result !== "dup") {
          imported++;
          console.log(`  ✓ 🇺🇸 $${result.price.toFixed(2)} | ${result.title.slice(0, 55)}`);
        }
        await new Promise(r => setTimeout(r, 250));
      }
    }
  }

  console.log(`\nResultado: ${imported} relógios importados, ${dup} duplicatas`);
}

main().catch(console.error);
