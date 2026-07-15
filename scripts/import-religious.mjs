// Import religious/spiritual products from CJ Dropshipping by categoryId
// Usage: node scripts/import-religious.mjs
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dir = dirname(fileURLToPath(import.meta.url));
const envFile = join(__dir, "..", ".env.local");

// Parse .env.local
const env = {};
try {
  readFileSync(envFile, "utf8").split("\n").forEach((line) => {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, "");
  });
} catch {}

const CJ_API_KEY = process.env.CJ_API_KEY || env.CJ_API_KEY || "";
const SITE = "https://www.shopdirectusa.com";
const CJ_BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const MARKUP = 2.0;

if (!CJ_API_KEY) {
  console.error("CJ_API_KEY não encontrado em .env.local");
  process.exit(1);
}

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
  const d = await r.json();
  return d?.data ?? [];
}

async function getProductsByCategory(token, categoryId, pageNum = 1) {
  const r = await fetch(
    `${CJ_BASE}/product/list?pageNum=${pageNum}&pageSize=20&categoryId=${categoryId}`,
    { headers: { "CJ-Access-Token": token } }
  );
  const d = await r.json();
  return d?.data?.list ?? [];
}

async function importProduct(p) {
  const supplierPrice = parseFloat(p.sellPrice) || 0;
  if (!supplierPrice || supplierPrice <= 0) return null;
  if (!p.productImage || !p.productNameEn) return null;

  const price = Math.round(supplierPrice * MARKUP * 100) / 100;
  const comparePrice = Math.round(price * 1.3 * 100) / 100;

  const r = await fetch(`${SITE}/api/suppliers/import`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      supplierId: p.pid,
      title: p.productNameEn,
      supplierPrice,
      suggestedPrice: price,
      image: p.productImage,
      category: "Other",
      supplier: "cj",
      supplierUrl: `https://cjdropshipping.com/product/${p.pid}`,
      markup: MARKUP,
    }),
  });
  if (!r.ok) {
    const txt = await r.text();
    if (txt.includes("Unique constraint") || txt.includes("already exists")) return "dup";
    return null;
  }
  const d = await r.json();
  return d.product;
}

// Religious/spiritual keyword filter
function isReligious(name = "") {
  const n = name.toLowerCase();
  const keywords = [
    "cross", "crucifix", "jesus", "christ", "bible", "rosary", "rosario",
    "angel", "saint", "santa", "virgin", "mary", "blessed", "holy",
    "prayer", "church", "god", "christian", "religious", "spiritual",
    "buddha", "buddhist", "meditation", "mandala", "chakra", "namaste",
    "om", "zen", "temple", "shrine", "incense", "lotus", "hamsa",
    "evil eye", "jewish", "star of david", "menorah", "islamic", "muslim",
    "allah", "quran", "crescent", "mosque",
  ];
  return keywords.some((k) => n.includes(k));
}

function cleanTitle(t = "") {
  return t.replace(/\s+/g, " ").trim();
}

async function main() {
  console.log("Autenticando no CJ...");
  const token = await getToken();
  console.log("Token obtido.\n");

  console.log("Buscando categorias...");
  const categories = await getCategories(token);

  // Find religious-adjacent categories in the CJ tree
  const religiousKeywords = ["religious", "spiritual", "decor", "home", "gift", "art", "craft", "jewelry", "accessory"];
  const candidates = [];

  for (const first of categories) {
    for (const second of first.categorySecondList ?? []) {
      const name = (second.categoryName ?? "").toLowerCase();
      if (religiousKeywords.some((k) => name.includes(k))) {
        candidates.push({ name: second.categoryName, id: second.categoryId, parent: first.categoryName });
      }
    }
  }

  // Print all candidates so user can see
  console.log(`Categorias candidatas (${candidates.length}):`);
  candidates.forEach((c) => console.log(`  [${c.parent}] ${c.name} → ${c.id}`));

  // For religious products, we'll search across multiple categories
  // and filter by religious keywords in the product name
  const SEARCH_CATEGORIES = candidates.slice(0, 8).map((c) => c.id);

  let imported = 0;
  let skipped = 0;
  let dup = 0;

  console.log(`\nPesquisando produtos religiosos em ${SEARCH_CATEGORIES.length} categorias...\n`);

  for (const catId of SEARCH_CATEGORIES) {
    const products = await getProductsByCategory(token, catId, 1);
    for (const p of products) {
      if (!isReligious(p.productNameEn)) continue;

      const price = parseFloat(p.sellPrice) || 0;
      if (price <= 0 || price > 50) continue; // max supplier $50 = max price $100

      const result = await importProduct(p);
      if (result === "dup") {
        dup++;
      } else if (result) {
        imported++;
        const finalPrice = result.price ?? Math.round(price * MARKUP * 100) / 100;
        console.log(`  ✓ $${finalPrice.toFixed(2)} | ${cleanTitle(p.productNameEn).slice(0, 55)}`);
      } else {
        skipped++;
      }

      await new Promise((r) => setTimeout(r, 300));
    }
  }

  console.log(`\nResultado: ${imported} importados, ${dup} duplicatas, ${skipped} ignorados`);

  // If nothing religious found via category filter, try direct keyword pages
  if (imported === 0) {
    console.log("\nNenhum produto religioso encontrado via categorias. Tentando busca direta...");
    const religiousTerms = ["cross necklace", "christian jewelry", "religious gift", "rosary beads", "buddha statue"];
    for (const term of religiousTerms) {
      const r = await fetch(
        `${CJ_BASE}/product/list?pageNum=1&pageSize=20&productNameEn=${encodeURIComponent(term)}`,
        { headers: { "CJ-Access-Token": token } }
      );
      const d = await r.json();
      const list = d?.data?.list ?? [];
      for (const p of list) {
        const price = parseFloat(p.sellPrice) || 0;
        if (price <= 0 || price > 50) continue;
        const result = await importProduct(p);
        if (result && result !== "dup") {
          imported++;
          console.log(`  ✓ $${result.price?.toFixed(2)} | ${cleanTitle(p.productNameEn).slice(0, 55)}`);
        }
        await new Promise((r) => setTimeout(r, 300));
      }
    }
    console.log(`\nFinal: ${imported} importados`);
  }
}

main().catch(console.error);
