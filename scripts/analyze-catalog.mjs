// Analyze catalog: category breakdown, price bands, margin, and US-demand keywords
const SITE = "https://www.shopdirectusa.com";

// Keywords with proven US dropshipping demand (2025-2026 trend lists)
const HOT_KEYWORDS = {
  "car accessories":   /(car seat|steering|car organizer|gps tracker|jump starter|car charger|dash cam|car vacuum|sunshade|car mount)/i,
  "pet supplies":      /(dog|cat|pet|puppy|kitten)/i,
  "home organization": /(storage|organizer|rack|holder|shelf|drawer)/i,
  "kitchen gadgets":   /(kitchen|cooking|knife|baking|drinkware|cup|mug|bottle)/i,
  "led lighting":      /(led|night light|string light|lamp|solar light)/i,
  "fitness":           /(yoga|workout|fitness|gym|resistance|exercise)/i,
  "phone accessories": /(magsafe|power bank|phone|charger|wireless charging|earbuds)/i,
  "smart devices":     /(smart watch|smartwatch|robot|bluetooth|wireless)/i,
  "beauty tools":      /(collagen|serum|facial|skincare|eyelash|face)/i,
  "baby & kids toys":  /(kids|children|baby|toddler|educational toy)/i,
  "outdoor gear":      /(camping|hiking|fishing|bird feeder|garden|bicycle)/i,
  "jewelry":           /(charm|bracelet|necklace|925 sterling|pendant)/i,
  "watches":           /(watch|quartz)/i,
  "seasonal":          /(christmas|halloween|thanksgiving|valentine)/i,
};

async function main() {
  const prods = (await fetch(`${SITE}/api/products?limit=3000`).then(r => r.json())).products;
  console.log("TOTAL:", prods.length, "\n");

  // Category breakdown with price stats
  const byCat = {};
  for (const p of prods) {
    (byCat[p.category] ??= []).push(p);
  }

  console.log("=== CATEGORIAS ===");
  for (const [cat, items] of Object.entries(byCat).sort((a, b) => b[1].length - a[1].length)) {
    const prices = items.map(p => p.price).sort((a, b) => a - b);
    const avg = prices.reduce((s, x) => s + x, 0) / prices.length;
    const median = prices[Math.floor(prices.length / 2)];
    const withCompare = items.filter(p => p.comparePrice && p.comparePrice > p.price).length;
    console.log(`${cat.padEnd(12)} ${String(items.length).padStart(4)} produtos | preço médio $${avg.toFixed(2).padStart(6)} | mediana $${median.toFixed(2).padStart(6)} | faixa $${prices[0].toFixed(2)}-$${prices[prices.length-1].toFixed(2)} | ${withCompare} c/ desconto`);
  }

  // Hot keyword matching
  console.log("\n=== PRODUTOS EM NICHOS QUENTES NOS EUA ===");
  for (const [niche, re] of Object.entries(HOT_KEYWORDS)) {
    const matches = prods.filter(p => re.test(p.title));
    if (matches.length === 0) continue;
    const prices = matches.map(p => p.price);
    const avg = prices.reduce((s, x) => s + x, 0) / prices.length;
    console.log(`${niche.padEnd(20)} ${String(matches.length).padStart(4)} produtos | preço médio $${avg.toFixed(2)}`);
  }

  // Price bands (US impulse-buy sweet spot: $15-$40)
  console.log("\n=== FAIXAS DE PREÇO ===");
  const bands = [[0, 10], [10, 15], [15, 25], [25, 40], [40, 60], [60, 100], [100, 99999]];
  for (const [lo, hi] of bands) {
    const n = prods.filter(p => p.price >= lo && p.price < hi).length;
    const label = hi > 1000 ? `$${lo}+` : `$${lo}-$${hi}`;
    console.log(`${label.padEnd(10)} ${String(n).padStart(4)} produtos (${(n / prods.length * 100).toFixed(0)}%)`);
  }

  // Top candidates: hot niche + sweet spot price + has discount displayed
  console.log("\n=== TOP 25 CANDIDATOS A CAMPEÃO (nicho quente + $15-45 + desconto visível) ===");
  const scored = prods
    .filter(p => p.price >= 15 && p.price <= 45 && p.comparePrice > p.price)
    .map(p => {
      let niches = [];
      for (const [niche, re] of Object.entries(HOT_KEYWORDS)) {
        if (re.test(p.title)) niches.push(niche);
      }
      return { ...p, niches, score: niches.length };
    })
    .filter(p => p.score > 0)
    .sort((a, b) => b.score - a.score || b.price - a.price);

  for (const p of scored.slice(0, 25)) {
    console.log(`[${p.category}] $${p.price.toFixed(2)} (de $${p.comparePrice.toFixed(2)}) — ${p.title.slice(0, 60)} — nichos: ${p.niches.join(", ")}`);
  }
  console.log(`\nTotal candidatos: ${scored.length}`);
}

main().catch(console.error);
