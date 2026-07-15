// Remove non-home items that slipped into the Home category import
const SITE = "https://www.shopdirectusa.com";

const REMOVE = [
  /^CJST[A-Z0-9]+$/i,
  /yoga slider/i,
  /grounding sheet/i,
  /car-mounted.*cooler/i,
  /^packaging box$/i,
  /usd coin sorter/i,
  /shein cross-border/i,
  /bear air cushion comb/i,
  /mattress plug/i,
  /kitten quilt holder/i,
  /sports headband/i,
  /mountaineering hat/i,
  /toiletries bag/i,
  /little ghost pendant/i,
  /automatic buckle head/i,
  /snow ice box/i,
  /board game cards.*spanish/i,
  /virus generation/i,
  /pleated magic bag/i,
  /duschschlauch/i,
  /chrom bidet duschbrause/i,
  /all-in-one pet shampoo/i,
  /ultraviolet banknote detector/i,
  /nail lamp/i,
  /inflatable river floater/i,
  /hummingbird butterfly dragonfly wind chime/i,
  /ring buckle automatic umbrella/i,
  /retractable storage compartment for car accessories/i,
  /foldable non-slip workbench for board repair/i,
  /brooch display fixed/i,
  /collect.*cloth armbands/i,
  /book clip display medal badge/i,
  /deodorant stick/i,
  /antiperspirant/i,
  /chamomile.*hibiscus.*tea/i,
  /zinc alloy metal personalized keycaps/i,
  /red light infrared therapy lamp/i,
  /liquid household three high laser/i,
  /garage door remote/i,
  /181pcs.*party supplies/i,
  /cute ghost table sign/i,
  /parachute santa/i,
  /cute plush seal.*keychain/i,
  /3d.*waterproof stair.*crow.*tombstone/i,
  /quick drying antiperspirant/i,
  /multi aroma womens antiperspirant/i,
  /wood-carved tray for pipe/i,
  /skull-and-finger design color-printed/i,
  /door.*chinese-style antique/i,
  /tool cabinet tool cart.*drawers/i,
  /wardrobe aroma pendant/i,
];

function shouldRemove(title) {
  return REMOVE.some(re => re.test(title));
}

async function main() {
  const all = (await fetch(`${SITE}/api/products?limit=500`).then(r => r.json())).products;
  const home = all.filter(p => p.category === "Home");
  console.log("Home total:", home.length);

  let removed = 0;
  for (const p of home) {
    if (shouldRemove(p.title)) {
      const r = await fetch(`${SITE}/api/products/${p.id}`, { method: "DELETE" });
      if (r.ok) {
        removed++;
        console.log("  ✗", p.title.slice(0, 65));
      }
      await new Promise(r => setTimeout(r, 80));
    }
  }
  console.log("\nRemovidos:", removed);
  console.log("Home final:", home.length - removed);
}

main().catch(console.error);
