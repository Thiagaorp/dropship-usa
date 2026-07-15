// Fix Google Merchant Center disapprovals:
// 1. Delete policy-violating products (weapons, tobacco-related)
// 2. Clean promotional text from titles
const SITE = "https://www.shopdirectusa.com";

const DELETE_IDS = [
  "cmqml7cqj012804ieryp5ez6o", // Tactical Pen (weapons policy)
  "cmqmkirqa003r04iec30sf21i", // Hookah Charcoal Burner (tobacco policy)
];

// Strip promo/marketplace tokens from titles
function cleanTitle(t) {
  let s = t;
  const patterns = [
    /\b(20\d{2}|26)\s+(new\s+)?/gi,
    /cross[- ]?border\s*/gi,
    /\bamazon(\.com)?\s*/gi,
    /\bindependent\s+(station|site)\s*/gi,
    /\bforeign\s+trade\s*/gi,
    /\bbest[- ]?seller\s*/gi,
    /\bhot[- ]?selling\s*/gi,
    /\bhot\s+sale\s*/gi,
    /\beuropean\s+and\s+american\s*/gi,
    /\beuropean\s*&\s*american\s*/gi,
    /\bnew\s+style\s*/gi,
    /\bnew\s+products?\s*/gi,
    /\bspring\s+(and|&)\s+summer\s*/gi,
    /\bautumn\s+and\s+winter\s*/gi,
  ];
  for (const re of patterns) s = s.replace(re, " ");
  // Tidy whitespace and leftover punctuation
  s = s.replace(/\s{2,}/g, " ").replace(/^\s*[-,&]\s*/, "").replace(/\s*[-,&]\s*$/, "").trim();
  // Capitalize first letter
  if (s) s = s[0].toUpperCase() + s.slice(1);
  return s;
}

async function main() {
  // 1. Delete violations
  console.log("=== REMOVENDO VIOLACOES ===");
  for (const id of DELETE_IDS) {
    const r = await fetch(`${SITE}/api/products/${id}`, { method: "DELETE" });
    console.log(r.ok ? "  ✓ removido" : "  ✗ falhou", id);
    await new Promise(r => setTimeout(r, 200));
  }

  // 2. Clean titles
  const prods = (await fetch(`${SITE}/api/products?limit=3000`).then(r => r.json())).products;
  const promoRe = /cross[- ]?border|independent station|independent site|amazon|aliexpress|ebay|wish\b|shein|hot sale|hot-selling|best ?seller|foreign trade|european and american|european & american/i;
  const targets = prods.filter(p => promoRe.test(p.title));

  console.log(`\n=== LIMPANDO ${targets.length} TITULOS ===`);
  let ok = 0, fail = 0;
  for (const p of targets) {
    const newTitle = cleanTitle(p.title);
    if (!newTitle || newTitle.length < 10) {
      console.log(`  ! pulado (título ficaria curto): ${p.title.slice(0, 60)}`);
      continue;
    }
    const r = await fetch(`${SITE}/api/products/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle }),
    });
    if (r.ok) {
      ok++;
      console.log(`  ✓ ${p.title.slice(0, 55)}`);
      console.log(`    → ${newTitle.slice(0, 55)}`);
    } else {
      fail++;
      console.log(`  ✗ falhou: ${p.id} (${r.status})`);
    }
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`\nTitulos: ${ok} limpos, ${fail} falhas`);
}

main().catch(console.error);
