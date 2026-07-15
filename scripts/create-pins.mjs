// Generate Pinterest pin images (1000x1500) for top Home/Kitchen/Decor products
// Product photo on top + white band with title, price and site
import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import https from "https";
import http from "http";

const __dir = dirname(fileURLToPath(import.meta.url));
const SITE = "https://www.shopdirectusa.com";
const OUT = join(__dir, "..", "pinterest");
const TMP = join(OUT, "_tmp");
if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

// Font (reuse the one copied for videos, else copy again)
const FONT_DST = join(TMP, "arial.ttf");
if (!existsSync(FONT_DST)) writeFileSync(FONT_DST, readFileSync("C:\\Windows\\Fonts\\arial.ttf"));
const FONT_BOLD = join(TMP, "arialbd.ttf");
if (!existsSync(FONT_BOLD)) {
  try { writeFileSync(FONT_BOLD, readFileSync("C:\\Windows\\Fonts\\arialbd.ttf")); } catch {}
}

function fetchBuf(url) {
  const client = url.startsWith("https") ? https : http;
  return new Promise((resolve, reject) => {
    function go(u, depth = 0) {
      if (depth > 3) return reject(new Error("too many redirects"));
      client.get(u, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) return go(res.headers.location, depth + 1);
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    }
    go(url);
  });
}

const esc = (s) => s.replace(/\\/g, "\\\\").replace(/'/g, "’").replace(/:/g, "\\:").replace(/\[/g, "\\[").replace(/\]/g, "\\]").replace(/,/g, "\\,");

function wrap(text, maxLen = 34) {
  const words = text.split(" ");
  const lines = [];
  let line = "";
  for (const w of words) {
    if ((line + " " + w).trim().length > maxLen) { lines.push(line.trim()); line = w; }
    else line = (line + " " + w).trim();
  }
  if (line) lines.push(line.trim());
  return lines.slice(0, 2); // max 2 lines on the pin
}

async function makePin(p, idx) {
  const slug = p.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 40).replace(/^-|-$/g, "");
  const outFile = join(OUT, `pin-${String(idx + 1).padStart(2, "0")}-${slug}.jpg`);
  if (existsSync(outFile)) { console.log("  [skip]", slug); return outFile; }

  const imgUrl = p.images[0];
  const imgFile = join(TMP, `src-${idx}.jpg`);
  if (!existsSync(imgFile)) {
    const buf = await fetchBuf(imgUrl);
    if (buf.length < 1000) { console.log("  ! imagem pequena, pulando:", slug); return null; }
    writeFileSync(imgFile, buf);
  }

  const titleLines = wrap(p.title, 34);
  const fontRel = "pinterest/_tmp/arial.ttf";
  const fontBoldRel = existsSync(FONT_BOLD) ? "pinterest/_tmp/arialbd.ttf" : fontRel;

  // Layout: image fills top 1000x1100 (cover), white band 1000x400 below
  const priceTxt = `$${p.price.toFixed(2)}`;
  const compareTxt = p.comparePrice > p.price ? `was $${p.comparePrice.toFixed(2)}` : "";

  const drawTitle = titleLines.map((line, i) =>
    `drawtext=fontfile=${fontRel}:text='${esc(line)}':fontsize=44:fontcolor=0x1f2937:x=(w-text_w)/2:y=${1160 + i * 58}`
  ).join(",");
  const drawPrice = `drawtext=fontfile=${fontBoldRel}:text='${esc(priceTxt)}':fontsize=72:fontcolor=0xdc2626:x=(w-text_w)/2:y=1290`;
  const drawCompare = compareTxt
    ? `,drawtext=fontfile=${fontRel}:text='${esc(compareTxt)}':fontsize=36:fontcolor=0x9ca3af:x=(w-text_w)/2:y=1372`
    : "";
  const drawSite = `drawtext=fontfile=${fontBoldRel}:text='shopdirectusa.com — Free US Shipping':fontsize=30:fontcolor=0x2563eb:x=(w-text_w)/2:y=1435`;

  const vf = [
    `scale=1000:1100:force_original_aspect_ratio=increase`,
    `crop=1000:1100`,
    `pad=1000:1500:0:0:white`,
    drawTitle,
    drawPrice + drawCompare,
    drawSite,
  ].join(",");

  const cmd = `ffmpeg -y -i "pinterest/_tmp/src-${idx}.jpg" -vf "${vf}" -frames:v 1 -q:v 3 "pinterest/${outFile.split("\\").pop()}"`;
  try {
    execSync(cmd, { stdio: "pipe", cwd: join(__dir, ".."), timeout: 60000 });
    console.log("  ✓", outFile.split("\\").pop());
    return outFile;
  } catch (e) {
    console.log("  ✗ ffmpeg:", slug, e.stderr?.toString().slice(-200) || e.message);
    return null;
  }
}

async function main() {
  const prods = (await fetch(`${SITE}/api/products?limit=3000`).then(r => r.json())).products;

  // Home/Kitchen/Decor picks: price sweet spot, has discount, has image, interesting keywords
  const wanted = /candle|mug|lamp|light|organizer|storage|rack|shelf|pillow|cushion|towel|blanket|kitchen|knife|cutlery|bakeware|drinkware|cup|bottle|vase|planter|decor|painting|flower|curtain|rug|mat|holder|tray|jar|humidifier|diffuser/i;
  const picks = prods
    .filter(p => p.category === "Home" && p.images?.length && p.price >= 12 && p.price <= 50 && p.comparePrice > p.price && wanted.test(p.title))
    .sort((a, b) => b.price - a.price)
    .slice(0, 12);

  console.log(`Gerando ${picks.length} pins...\n`);
  const meta = [];
  for (let i = 0; i < picks.length; i++) {
    const p = picks[i];
    console.log(`[${i + 1}] ${p.title.slice(0, 60)}`);
    const f = await makePin(p, i);
    if (f) meta.push({
      file: f.split("\\").pop(),
      title: p.title,
      price: p.price,
      comparePrice: p.comparePrice,
      link: `${SITE}/products/${p.id}`,
    });
  }

  writeFileSync(join(OUT, "pins-meta.json"), JSON.stringify(meta, null, 2));
  console.log(`\n${meta.length} pins gerados em: ${OUT}`);
  console.log("Metadados (título/preço/link) em pins-meta.json");
}

main().catch(console.error);
