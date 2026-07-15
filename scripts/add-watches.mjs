// Additive seed: inserts watch products without deleting anything.
// Idempotent — skips a watch if its SKU already exists.
//
// Local (dev.db):   node scripts/add-watches.mjs
// Production (Neon): DATABASE_URL="<neon-url>" node scripts/add-watches.mjs
//
// NOTE: images below are placeholder stock photos. Before going live, swap
// each `images` entry for the REAL product photos from the CJ listing so the
// customer receives exactly what is pictured.

import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { readFileSync } from "fs";

// Load DATABASE_URL from .env.local / .env if not already in the environment.
function loadEnv() {
  if (process.env.DATABASE_URL) return;
  for (const file of [".env.local", ".env"]) {
    try {
      for (const line of readFileSync(file, "utf8").split("\n")) {
        const m = line.match(/^\s*DATABASE_URL\s*=\s*(.*)\s*$/);
        if (m) {
          process.env.DATABASE_URL = m[1].replace(/^["']|["']$/g, "");
          return;
        }
      }
    } catch {
      /* file not present — try next */
    }
  }
}

async function createPrisma() {
  loadEnv();
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL not set and not found in .env.local/.env");

  const { neon } = await import("@neondatabase/serverless");
  const sql = neon(url);
  const adapter = new PrismaNeon(sql);
  return { prisma: new PrismaClient({ adapter }), target: "Neon (production)" };
}

const watches = [
  {
    sku: "WATCH-SKEL-001",
    title: "Skeleton Automatic Mechanical Watch — Self-Winding",
    description:
      "A true automatic mechanical watch — no battery needed. The open-heart skeleton dial lets you watch the self-winding movement in action. Stainless steel case, scratch-resistant glass, and a genuine leather strap. The kind of watch people stop you to ask about.",
    price: 59.99,
    comparePrice: 119.99,
    images: ["https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=600"],
    category: "Watches",
    tags: ["watch", "automatic", "mechanical", "skeleton", "mens", "us-warehouse"],
    stock: 120,
    weight: 0.15,
    featured: true,
  },
  {
    sku: "WATCH-MESH-002",
    title: "Minimalist Mesh Strap Watch — Ultra-Thin Unisex",
    description:
      "Clean, modern, and ultra-thin. A minimalist dial on a Milanese mesh strap that slides to any size. Goes with everything from a t-shirt to a suit. Water-resistant and unisex.",
    price: 39.99,
    comparePrice: 79.99,
    images: ["https://images.unsplash.com/photo-1434056886845-dac89ffe9b56?w=600"],
    category: "Watches",
    tags: ["watch", "minimalist", "mesh", "unisex", "thin", "us-warehouse"],
    stock: 200,
    weight: 0.1,
    featured: true,
  },
  {
    sku: "WATCH-CHRONO-003",
    title: "Men's Chronograph Sport Watch — Stainless Steel",
    description:
      "A bold chronograph with functional sub-dials, luminous hands, and a solid stainless steel bracelet. Date window, 30m water resistance, and a heavy, premium feel on the wrist. Looks like it costs five times the price.",
    price: 49.99,
    comparePrice: 99.99,
    images: ["https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600"],
    category: "Watches",
    tags: ["watch", "chronograph", "sport", "mens", "steel", "us-warehouse"],
    stock: 150,
    weight: 0.18,
    featured: true,
  },
  {
    sku: "WATCH-ROSE-004",
    title: "Women's Rose Gold Bracelet Watch — Crystal Dial",
    description:
      "An elegant rose gold watch with a crystal-accented dial and a delicate link bracelet that doubles as jewelry. Lightweight, adjustable, and beautifully boxed. A go-to gift that always lands.",
    price: 44.99,
    comparePrice: 89.99,
    images: ["https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600"],
    category: "Watches",
    tags: ["watch", "women", "rose-gold", "elegant", "gift", "us-warehouse"],
    stock: 180,
    weight: 0.12,
    featured: true,
  },
  {
    sku: "WATCH-MIL-005",
    title: "Military Digital Sport Watch — Shockproof & Waterproof",
    description:
      "Built for the outdoors. Dual analog-digital display, LED backlight, stopwatch, alarm, and 50m water resistance in a rugged shockproof case. Tactical look that holds up to real use.",
    price: 42.99,
    comparePrice: 84.99,
    images: ["https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=600"],
    category: "Watches",
    tags: ["watch", "military", "digital", "sport", "waterproof", "us-warehouse"],
    stock: 160,
    weight: 0.16,
    featured: false,
  },
  {
    sku: "WATCH-COUPLE-006",
    title: "His & Hers Couples Watch Set — Matching Leather Pair",
    description:
      "Two matching minimalist watches — one sized for him, one for her — on soft leather straps, presented in a single gift box. The perfect anniversary or wedding gift, ready to give.",
    price: 64.99,
    comparePrice: 129.99,
    images: ["https://images.unsplash.com/photo-1533139502658-0198f920d8e8?w=600"],
    category: "Watches",
    tags: ["watch", "couples", "set", "gift", "leather", "us-warehouse"],
    stock: 90,
    weight: 0.25,
    featured: false,
  },
];

const { prisma, target } = await createPrisma();

console.log(`\nTarget DB: ${target}`);
console.log("Adding watches (skipping any SKU that already exists)...\n");

let added = 0;
let skipped = 0;

for (const w of watches) {
  const existing = await prisma.product.findFirst({ where: { sku: w.sku } });
  if (existing) {
    console.log(`- skip  ${w.sku}  (already exists)`);
    skipped++;
    continue;
  }
  await prisma.product.create({
    data: {
      title: w.title,
      description: w.description,
      price: w.price,
      comparePrice: w.comparePrice,
      images: JSON.stringify(w.images),
      category: w.category,
      tags: JSON.stringify(w.tags),
      stock: w.stock,
      sku: w.sku,
      weight: w.weight,
      supplier: "cj",
      active: false, // draft — flip to true once bound to a real CJ product + real photos
      featured: w.featured,
    },
  });
  console.log(`+ added ${w.sku}  ${w.title.slice(0, 40)}`);
  added++;
}

console.log(`\nDone. ${added} added, ${skipped} skipped.`);
await prisma.$disconnect();
