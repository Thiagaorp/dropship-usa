// Create YouTube slideshow videos per category using product images + captions
// Requires: ffmpeg installed and in PATH

import { existsSync, mkdirSync, writeFileSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import https from "https";
import http from "http";

const __dir = dirname(fileURLToPath(import.meta.url));
const SITE = "https://www.shopdirectusa.com";
const OUT_DIR = join(__dir, "..", "videos");
const TMP_DIR = join(__dir, "..", "videos", "_tmp");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
if (!existsSync(TMP_DIR)) mkdirSync(TMP_DIR, { recursive: true });

// Copy arial font to tmp dir (avoids drive letter colon issue in ffmpeg drawtext on Windows)
const FONT_SRC = "C:\\Windows\\Fonts\\arial.ttf";
const FONT_DST = join(TMP_DIR, "arial.ttf");
if (!existsSync(FONT_DST)) {
  try {
    writeFileSync(FONT_DST, readFileSync(FONT_SRC));
  } catch (e) {
    console.error("Could not copy font:", e.message);
  }
}

// Captions per category: [hook line, detail line, cta]
const CAPTIONS = {
  Home:        { hook: "Upgrade your home for less!",  detail: "Premium home essentials, unbeatable prices.",  cta: "Shop Home at shopdirectusa.com" },
  Fashion:     { hook: "Style that won't break the bank!", detail: "Trendy fashion finds, shipped to your door.", cta: "Shop Fashion at shopdirectusa.com" },
  Car:         { hook: "Must-have car accessories!",    detail: "Upgrade your ride without spending a fortune.", cta: "Shop Car at shopdirectusa.com" },
  Toys:        { hook: "Kids will LOVE these toys!",   detail: "Fun, safe, and surprisingly affordable.",       cta: "Shop Toys at shopdirectusa.com" },
  Sports:      { hook: "Gear up and get moving!",      detail: "Quality sports gear for every level.",         cta: "Shop Sports at shopdirectusa.com" },
  Outdoor:     { hook: "Adventure awaits outside!",    detail: "Everything you need for the great outdoors.",  cta: "Shop Outdoor at shopdirectusa.com" },
  Wellness:    { hook: "Take care of yourself!",       detail: "Wellness gadgets that actually work.",         cta: "Shop Wellness at shopdirectusa.com" },
  Watches:     { hook: "Wear time in style!",          detail: "Affordable watches that look expensive.",      cta: "Shop Watches at shopdirectusa.com" },
  Electronics: { hook: "The gadget you didn't know you needed!", detail: "Smart tech at honest prices.",      cta: "Shop Electronics at shopdirectusa.com" },
  Spiritual:   { hook: "Carry your faith with you!",  detail: "Beautiful spiritual jewelry & accessories.",   cta: "Shop Spiritual at shopdirectusa.com" },
  Pet:         { hook: "Your pet deserves the best!",  detail: "Toys, accessories & care for furry friends.", cta: "Shop Pet at shopdirectusa.com" },
  Beauty:      { hook: "Glow up on a budget!",         detail: "Skincare & beauty that delivers real results.", cta: "Shop Beauty at shopdirectusa.com" },
};

async function fetchImageBuffer(url) {
  const client = url.startsWith("https") ? https : http;
  return new Promise((resolve, reject) => {
    function doFetch(u) {
      client.get(u, { headers: { "User-Agent": "Mozilla/5.0" } }, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          doFetch(res.headers.location); return;
        }
        const chunks = [];
        res.on("data", c => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks)));
        res.on("error", reject);
      }).on("error", reject);
    }
    doFetch(url);
  });
}

async function downloadImage(url, dest) {
  if (existsSync(dest)) return true;
  try {
    const buf = await fetchImageBuffer(url);
    if (buf.length < 500) return false;
    writeFileSync(dest, buf);
    return true;
  } catch { return false; }
}

async function createVideo(cat, images, caps) {
  const outFile = join(OUT_DIR, `${cat.toLowerCase()}-shorts.mp4`);
  if (existsSync(outFile)) {
    console.log(`  [skip] ${outFile} already exists`);
    return outFile;
  }

  // Download images
  const localImages = [];
  for (let i = 0; i < images.length; i++) {
    const dest = join(TMP_DIR, `${cat}_${i}.jpg`);
    const ok = await downloadImage(images[i], dest);
    if (ok) localImages.push(dest);
  }

  if (localImages.length === 0) {
    console.log(`  [skip] No images downloaded for ${cat}`);
    return null;
  }

  // Limit to 4 images
  const imgs = localImages.slice(0, 4);
  const duration = 4; // seconds per image
  const totalDur = imgs.length * duration;

  // Build ffmpeg command for 9:16 Shorts (1080x1920)
  const W = 1080, H = 1920;
  // Use relative path to avoid Windows C: drive letter colon issue in ffmpeg drawtext
  // CWD is always the project root (dropship-usa/) when script is run from there
  const FONT = "videos/_tmp/arial.ttf";

  // Escape text for ffmpeg drawtext filter script (different rules than shell)
  const esc = (s) => s
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "’")   // smart apostrophe avoids quoting issues
    .replace(/:/g, "\\:")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");

  const wrapText = (text, maxLen = 28) => {
    const words = text.split(" ");
    const lines = [];
    let line = "";
    for (const w of words) {
      if ((line + " " + w).trim().length > maxLen) { lines.push(line.trim()); line = w; }
      else line = (line + " " + w).trim();
    }
    if (line) lines.push(line.trim());
    return lines;
  };

  const detailLines = wrapText(caps.detail, 28);
  const hookY = 100, detailY = H - 280, ctaY = H - 140;

  const toFwd = (p) => p.replace(/\\/g, "/");

  // Scale each image to target size
  const scaleFilters = imgs.map((_, i) =>
    `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},setsar=1[v${i}]`
  ).join(";\n");

  // Concat all scaled images
  const concatInputs = imgs.map((_, i) => `[v${i}]`).join("");
  const concatFilter = `${concatInputs}concat=n=${imgs.length}:v=1:a=0[vcat]`;

  // Drawtext overlay
  const drawHook    = `drawtext=fontfile=${FONT}:text='${esc(caps.hook)}':fontsize=68:fontcolor=white:shadowcolor=black:shadowx=3:shadowy=3:x=(w-text_w)/2:y=${hookY}:enable='between(t,0,${totalDur})'`;
  const drawDetails = detailLines.map((line, li) =>
    `drawtext=fontfile=${FONT}:text='${esc(line)}':fontsize=42:fontcolor=white:shadowcolor=black:shadowx=2:shadowy=2:x=(w-text_w)/2:y=${detailY + li * 52}:enable='between(t,${(totalDur * 0.45).toFixed(1)},${totalDur})'`
  ).join(",");
  const drawCta     = `drawtext=fontfile=${FONT}:text='${esc(caps.cta)}':fontsize=36:fontcolor=yellow:shadowcolor=black:shadowx=2:shadowy=2:x=(w-text_w)/2:y=${ctaY}:enable='between(t,${(totalDur * 0.55).toFixed(1)},${totalDur})'`;

  const textChain = [drawHook, drawDetails, drawCta].join(",");

  // Write filter_complex to a script file
  const filterScript = `${scaleFilters};\n${concatFilter};\n[vcat]${textChain}[vout]`;
  const scriptFile = join(TMP_DIR, `${cat}_filter.txt`);
  writeFileSync(scriptFile, filterScript, "utf8");

  const inputArgs = imgs.map(p => `-loop 1 -t ${duration} -i "${toFwd(p)}"`).join(" ");
  const cmd = `ffmpeg -y ${inputArgs} -/filter_complex "${toFwd(scriptFile)}" -map "[vout]" -t ${totalDur} -c:v libx264 -preset fast -crf 23 -r 25 -pix_fmt yuv420p "${toFwd(outFile)}"`;

  console.log(`  Running ffmpeg for ${cat}...`);
  const PROJECT_ROOT = join(__dir, "..");
  try {
    execSync(cmd, { stdio: "pipe", timeout: 180000, cwd: PROJECT_ROOT });
    if (existsSync(outFile)) console.log(`  ✓ Created: ${outFile}`);
    return outFile;
  } catch (e) {
    console.error(`  ✗ ffmpeg error for ${cat}:`, e.stderr?.toString().slice(-500) || e.message);
    return null;
  }
}

async function main() {
  console.log("Fetching products...");
  const prods = (await fetch(`${SITE}/api/products?limit=3000`).then(r => r.json())).products;
  console.log(`Total: ${prods.length} products\n`);

  // Change to Object.keys(CAPTIONS) to run all 12 categories
  const cats = process.argv[2] ? [process.argv[2]] : Object.keys(CAPTIONS);

  for (const cat of cats) {
    console.log(`\n[${cat}]`);
    // Get top products with images, sorted by price desc (higher price = more interesting)
    const catProds = prods
      .filter(p => p.category === cat && p.images?.length > 0)
      .sort((a, b) => b.price - a.price)
      .slice(0, 4);

    if (catProds.length === 0) {
      console.log("  No products with images found");
      continue;
    }

    const images = catProds.map(p => p.images[0]).filter(Boolean);
    console.log(`  Using ${images.length} product images`);
    images.forEach((u, i) => console.log(`  ${i + 1}. ${u.slice(0, 80)}`));

    await createVideo(cat, images, CAPTIONS[cat]);
  }

  console.log("\n\nDone! Videos saved in:", OUT_DIR);
  console.log("Upload each MP4 to YouTube Shorts — suggested titles:");
  cats.forEach(cat => {
    console.log(`  ${cat}: use the title from the YouTube captions guide`);
  });
}

main().catch(console.error);
