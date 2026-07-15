// Download the feed and find XML-invalid characters / structure issues
const url = "https://www.shopdirectusa.com/api/google-feed";

const xml = await (await fetch(url)).text();
console.log("Tamanho:", xml.length, "chars");
console.log("Itens:", (xml.match(/<item>/g) || []).length);

// Invalid XML 1.0 chars: control chars except tab(9), LF(10), CR(13)
const invalidRe = /[\x00-\x08\x0B\x0C\x0E-\x1F￾￿]/g;
let m;
let found = 0;
while ((m = invalidRe.exec(xml)) !== null && found < 20) {
  found++;
  const pos = m.index;
  const code = xml.charCodeAt(pos).toString(16).padStart(4, "0");
  // Find which item this is in
  const before = xml.slice(0, pos);
  const itemNum = (before.match(/<item>/g) || []).length;
  const ctx = xml.slice(Math.max(0, pos - 80), pos + 80).replace(invalidRe, "␀");
  console.log(`\nChar inválido U+${code} na posição ${pos} (item #${itemNum}):`);
  console.log("  ...", ctx.trim().slice(0, 150));
}
if (found === 0) console.log("\nNenhum caractere de controle inválido.");

// Check for unescaped ampersands or malformed entities
const badAmp = xml.match(/&(?!amp;|lt;|gt;|quot;|apos;|#\d+;|#x[0-9a-fA-F]+;)[^;\s]{0,10}/g);
if (badAmp) {
  console.log("\nEntidades suspeitas:", [...new Set(badAmp)].slice(0, 10));
}

// Try DOM parse via a simple well-formedness check: count tags
const opens = (xml.match(/<g:title>/g) || []).length;
const closes = (xml.match(/<\/g:title>/g) || []).length;
console.log(`\ng:title abre=${opens} fecha=${closes}`);

// Around item 297-299: dump titles to spot the culprit
const items = xml.split("<item>");
for (let i = 296; i <= 300 && i < items.length; i++) {
  const t = items[i].match(/<g:title>([\s\S]*?)<\/g:title>/);
  console.log(`item #${i}: ${t ? t[1].slice(0, 90) : "SEM TITULO"}`);
}
