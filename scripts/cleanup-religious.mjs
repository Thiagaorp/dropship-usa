// Remove products that were incorrectly imported as "religious"
// Keeps only genuinely religious/spiritual items
const SITE = "https://www.shopdirectusa.com";

const KEEP_KEYWORDS = [
  "cross necklace", "crucifix", "rosary", "st benedict", "saint benedict",
  "christian", "religious", "bible", "prayer", "jesus", "christ", "holy",
  "angel", "blessed", "virgin mary", "chakra", "buddha", "buddhist",
  "meditation", "hamsa", "evil eye", "om ", "namaste", "lotus",
  "incense", "mandala", "zen", "spiritual", "faith", "god", "church",
  "islamic", "quran", "jewish", "star of david", "menorah",
  "mustard seed", "real mustard", "benedict medal",
  "jadeite", "laughing buddha", "yantra", "geomantic",
  "7 chakra", "chakra heishi",
];

const REMOVE_KEYWORDS = [
  "cross-border", "cross border", "cross-strap", "v-neck", "v neck",
  "womens", "women's", "denim", "shorts", "pants", "swimsuit",
  "batwing", "flared", "colorful d", "mother's day", "mothers day",
  "birthstone necklace", "anklet necklace", "travel", "suitcase",
  "airplane", "zodiac beaded diy", "diy sisterhood", "copper gradient butterfly",
  "gratitude mother", "pearl earring", "stud earring", "hoop earring",
  "click hoop", "zircon", "rhinestone", "gemstone pendant",
  "sterling silver 4-leaf", "brushed polka dot", "sunflower click",
  "twisted circle stud", "rhombus lattice", "multicolor crystal flower",
  "korean elegant pearl bow", "water drop click", "fine silver brushed",
  "cat's eye five-pointed", "heavy craft multicolor crystal",
  "fine silver necklace for women studded",
  "magnetic heart matching necklace for couples",
  "commemorative coin", "statue of liberty", "liberty statue",
  "halloween ghost", "desk goose", "goose clothes", "goose outfit",
  "wood-grain cat statue", "vogeltränke", "vogelbad", "bird bath",
  "hair care gift set", "recording box", "voice prompter",
  "eau de cologne", "cologne for men",
  "baby footprint", "newborn", "retro log animal bookmark",
  "original artistic feast oil painting", "cute lucky elephant diy",
  "lucky zodiac beaded", "charms beads diy jewelry accessories bracelets",
  "electroplated silver cartoon charm beads",
  "marine life starfish", "charming marine",
  "silver-plated 6mm hollow buddha bead bracelet, couples",
  "creative european-style metal rectangular home beads",
  "world travel series", "airplane suitcase",
];

async function main() {
  const all = (await fetch(`${SITE}/api/products?limit=300`).then(r => r.json())).products;
  let removed = 0;
  let kept = 0;

  for (const p of all) {
    const t = p.title.toLowerCase();

    // Check if it's a "recently added" product (rough — check if it has no description beyond default)
    const isDefaultDesc = !p.description || p.description.startsWith("High-quality");
    if (!isDefaultDesc) continue; // only clean imported-via-script items

    const hasKeepWord = KEEP_KEYWORDS.some(k => t.includes(k));
    const hasRemoveWord = REMOVE_KEYWORDS.some(k => t.includes(k));

    // Remove if explicitly in remove list, regardless of keep words
    // OR if it's a fashion/clothing-sounding item without a clear religious word
    const isFashion = /(top|shirt|pants|shorts|dress|swimsuit|earring|stud|hoop|necklace.*women|bracelet.*couples|cologne|hair care|recording|voice|bookmark|butterfly|batwing|flared|denim|swimsuit)/i.test(t);
    const isNonReligiousJewelry = isFashion && !hasKeepWord;

    if (hasRemoveWord || isNonReligiousJewelry) {
      const r = await fetch(`${SITE}/api/products/${p.id}`, { method: "DELETE" });
      if (r.ok) {
        removed++;
        console.log(`  ✗ removido: ${p.title.slice(0, 60)}`);
      }
    } else if (hasKeepWord) {
      kept++;
      console.log(`  ✓ mantido:  ${p.title.slice(0, 60)}`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\nLimpeza: ${removed} removidos, ${kept} mantidos`);
}

main().catch(console.error);
