// Try to find video URLs from CJ product pages (public)
// Then create SRT captions and burn them with ffmpeg

const SITE = "https://www.shopdirectusa.com";

async function main() {
  const prods = (await fetch(`${SITE}/api/products?limit=3000`).then(r => r.json())).products;

  const cats = ["Home", "Fashion", "Car", "Toys", "Sports", "Outdoor", "Wellness", "Watches", "Electronics", "Spiritual", "Pet", "Beauty"];

  for (const cat of cats) {
    // Pick product with supplierId
    const p = prods.find(x => x.category === cat && x.supplierId);
    if (!p) { console.log(`[${cat}] no supplierId`); continue; }

    const cjUrl = p.supplierUrl || `https://cjdropshipping.com/product/${p.supplierId}`;
    console.log(`\n[${cat}] ${p.title.slice(0, 50)}`);
    console.log(`  CJ URL: ${cjUrl}`);
    console.log(`  Image: ${p.image}`);

    // Try fetching the CJ page to find video
    try {
      const html = await fetch(cjUrl, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
      }).then(r => r.text());

      // Look for video URLs
      const mp4 = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/gi) || [];
      const videoUrls = [...new Set(mp4)];

      if (videoUrls.length > 0) {
        console.log(`  VIDEOS FOUND (${videoUrls.length}):`);
        videoUrls.slice(0, 3).forEach(v => console.log(`    ${v.slice(0, 120)}`));
      } else {
        // Check if page has video tags or other indicators
        if (html.includes("video") || html.includes(".mp4")) {
          console.log(`  Page mentions video but URLs not easily extractable (JS-rendered)`);
        } else {
          console.log(`  No video found on page`);
        }
        // Show image from product
        console.log(`  Will use product image instead: ${p.image?.slice(0, 80)}`);
      }
    } catch (e) {
      console.log(`  Error fetching CJ page: ${e.message}`);
    }

    await new Promise(r => setTimeout(r, 500));
  }
}

main().catch(console.error);
