// Bulk import for Car, Fashion, Toys, Wellness, Sports, Outdoor
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
const BASE = "https://developers.cjdropshipping.com/api2.0/v1";
const MARKUP = 2.0;

async function getToken() {
  const r = await fetch(`${BASE}/authentication/getAccessToken`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey: CJ_API_KEY }),
  });
  const d = await r.json();
  if (!d?.data?.accessToken) throw new Error("Auth falhou: " + JSON.stringify(d));
  return d.data.accessToken;
}

async function getProducts(token, categoryId, page = 1) {
  const r = await fetch(`${BASE}/product/list?pageNum=${page}&pageSize=30&categoryId=${categoryId}`, {
    headers: { "CJ-Access-Token": token },
  });
  return (await r.json())?.data?.list ?? [];
}

async function importOne(p, category, existingTitles) {
  const title = (p.productNameEn || "").trim();
  if (!title || !p.productImage) return null;
  if (existingTitles.has(title.toLowerCase())) return "dup";
  const sp = parseFloat(p.sellPrice) || 0;
  if (sp <= 0 || sp > 60) return null;
  const price = Math.round(sp * MARKUP * 100) / 100;
  const r = await fetch(`${SITE}/api/suppliers/import`, {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      supplierId: p.pid, title, supplierPrice: sp,
      suggestedPrice: price, image: p.productImage,
      category, supplier: "cj",
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

// Global junk filter — applies to all categories
const GLOBAL_JUNK = /(replacement part|spare part|auto sensor|spark plug|brake pad|windscreen wiper|exhaust system|motor brake|interior part|exterior part|engine|piston|gear box|supplement|capsule|tablet|pill|ingestible|health care product|hair weave|hair extension|wig|lace front|cosplay wig|nail gel|nail art|wedding dress|prom dress|bridesmaid|flower girl dress|invitation card|fabric|lace ribbon|sewing|cross stitch|diamond painting|shipping\s*$)/i;

const CATS = [
  // ── CAR ──────────────────────────────────────────
  { cat: "Car", name: "Car Floor Mats",      id: "090E48F4-B406-438B-9EBF-D52450AC370A" },
  { cat: "Car", name: "Car Aromatherapy",    id: "2601070551311618400" },
  { cat: "Car", name: "Car Perfume",         id: "2601070551481626500" },
  { cat: "Car", name: "Car Stowing/Tidying", id: "D44C3391-0AF1-455A-A671-29214DA68F27" },
  { cat: "Car", name: "Steering Covers",     id: "5559DD57-7F12-44BC-9C29-9E9BD1CDB029" },
  { cat: "Car", name: "Car Seat Covers",     id: "808A409E-8E16-43A8-879A-153672135DB9" },
  { cat: "Car", name: "GPS Trackers",        id: "B39B6F95-9C89-4D6C-9E98-1633DA6A51CF" },
  { cat: "Car", name: "Jump Starters",       id: "C7B399B2-4D26-4363-8062-C6F451DA55B3" },
  { cat: "Car", name: "Car Radios",          id: "A3E67E41-8A5C-449F-8C22-739889760AAD" },
  { cat: "Car", name: "Car Stickers",        id: "255A489E-8518-4E31-AC84-A2E8EB645C78" },

  // ── FASHION ──────────────────────────────────────
  { cat: "Fashion", name: "Women Tops",       id: "1357251872037146624" },
  { cat: "Fashion", name: "Women Dresses",    id: "D2432903-0D4E-4787-886F-D3D9DA7890D9" },
  { cat: "Fashion", name: "Women Blouses",    id: "5A3E7341-18B5-4C61-BFCD-8965B3479A9A" },
  { cat: "Fashion", name: "Women Hoodies",    id: "5E656DFB-9BAE-44DD-A755-40AFA2E0E686" },
  { cat: "Fashion", name: "Women Leggings",   id: "396E962A-5632-49C2-B9BF-9529DE3B9141" },
  { cat: "Fashion", name: "Men T-Shirts Print", id: "BE11EEDB-B765-4A39-8A3D-F6015FC7A846" },
  { cat: "Fashion", name: "Men Hoodies",      id: "976399B4-534B-46F0-B18A-62075824A717" },
  { cat: "Fashion", name: "Men Casual Pants", id: "C992BFAB-12A9-4C61-A1DA-6E09C926BB81" },
  { cat: "Fashion", name: "Women Crossbody",  id: "2410301013451614000" },
  { cat: "Fashion", name: "Women Backpacks",  id: "78BCE010-8E22-416F-82E2-6E5C6AE0CECE" },
  { cat: "Fashion", name: "Men Backpacks",    id: "CDCCB9B1-D5DD-4C20-AF32-101FE427B63C" },
  { cat: "Fashion", name: "Baseball Caps",    id: "0203EC28-49AF-49E4-B899-333C0A235BD4" },

  // ── TOYS ─────────────────────────────────────────
  { cat: "Toys", name: "Building Blocks",   id: "835F7743-8432-4D0F-90F0-E76C89F7C5B7" },
  { cat: "Toys", name: "Plush Animals",     id: "DD918287-C279-466A-B9C6-56079DE4B37A" },
  { cat: "Toys", name: "Action Figures",    id: "F18491A9-2F33-4D85-A154-78EE4CD2AD33" },
  { cat: "Toys", name: "Electronic Pets",   id: "6614840A-DB50-4FBB-80FD-705F4FD59BFA" },
  { cat: "Toys", name: "Gamepads",          id: "1F23F16D-0A39-4D38-AB9C-1F21EEDEBEDD" },
  { cat: "Toys", name: "Handheld Games",    id: "2F6CCFAA-853F-41EF-8B91-24028A333948" },

  // ── WELLNESS ─────────────────────────────────────
  { cat: "Wellness", name: "Personal Care Appliances", id: "02EA33AA-4174-497D-86F4-D4FF9E525B81" },
  { cat: "Wellness", name: "Adult Wellness",           id: "1697200256204677120" },
  { cat: "Wellness", name: "First Aid Supplies",       id: "2601070551041636400" },
  { cat: "Wellness", name: "Face Skin Care Tools",     id: "AB11F624-D292-4A8E-9284-BD368B893A2C" },
  { cat: "Wellness", name: "Electric Face Cleanser",   id: "6D086E0D-8C3F-4B99-BA44-140F3F7C444E" },
  { cat: "Wellness", name: "Facial Steamer",           id: "D23FFB85-4185-4FA3-BAF0-224A4F516741" },

  // ── SPORTS ───────────────────────────────────────
  { cat: "Sports", name: "Fitness & Bodybuilding", id: "C20B25A2-348C-48C8-A2C8-FE33749A40DE" },
  { cat: "Sports", name: "Sports Accessories",     id: "79F47CD1-F813-4B4D-8D21-2B35966FBA66" },
  { cat: "Sports", name: "Sports Bags",            id: "937A06CE-ECCC-4C7D-A270-B216DE612AC0" },
  { cat: "Sports", name: "Outdoor Shorts",         id: "8E8CE199-A134-45B1-9EDE-0D4F122F4568" },
  { cat: "Sports", name: "Hiking Jackets",         id: "AB04A021-C988-476D-88E7-3CAAE3019D9E" },
  { cat: "Sports", name: "Fishing Lures",          id: "9704D88F-46A0-49F6-98C4-929AE91941F5" },
  { cat: "Sports", name: "Swimming Goggles",       id: "2605290527531628800" },

  // ── OUTDOOR ──────────────────────────────────────
  { cat: "Outdoor", name: "Camping & Hiking",   id: "EA851596-F20F-4AA5-8869-4BB5CA1968DC" },
  { cat: "Outdoor", name: "Solar Lamps",         id: "F9749558-9C47-4612-9411-88FF301DB7AD" },
  { cat: "Outdoor", name: "Garden Tools",        id: "CDB10A90-3D34-4396-99B2-919E7CAD4B53" },
  { cat: "Outdoor", name: "Bicycle Lights",      id: "161FA128-487C-4451-8B49-CB81B5A30A54" },
  { cat: "Outdoor", name: "Bicycle Helmets",     id: "3D0169CF-0F24-4EEA-948E-E48C3980862E" },
];

async function main() {
  if (!CJ_API_KEY) { console.error("CJ_API_KEY não encontrado"); process.exit(1); }
  console.log("Autenticando...");
  const token = await getToken();

  const existing = (await fetch(`${SITE}/api/products?limit=1000`).then(r => r.json())).products;
  const existingTitles = new Set(existing.map(p => p.title.toLowerCase()));
  console.log("Produtos existentes:", existing.length, "\n");

  const totals = {};
  let grandTotal = 0;

  for (const { cat, name, id } of CATS) {
    const products = await getProducts(token, id, 1);
    let n = 0;
    for (const p of products) {
      if (GLOBAL_JUNK.test(p.productNameEn || "")) continue;
      const result = await importOne(p, cat, existingTitles);
      if (result && result !== "dup") {
        n++;
        grandTotal++;
        process.stdout.write(`  [${cat}] $${result.price.toFixed(2)} | ${result.title.slice(0, 50)}\n`);
      }
      await new Promise(r => setTimeout(r, 180));
    }
    totals[cat] = (totals[cat] || 0) + n;
    if (n > 0) console.log(`  → ${n} novos de "${name}"`);
  }

  console.log("\n══ RESULTADO ══");
  Object.entries(totals).forEach(([c, n]) => console.log(`  ${c}: +${n}`));
  console.log(`  Total: +${grandTotal}`);
}

main().catch(console.error);
