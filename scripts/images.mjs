// Descarga la foto de frasco de cada producto enriquecido (CDN de Fragrantica,
// usando el ID de la URL ya scrapeada) y la autohostea en public/img/.
// OJO: son fotos de terceros para el showcase; reemplazar por fotos propias
// cuando estén. Re-correr es seguro: saltea las que ya existen.
// Correr: npm run images
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DATA_PATH = fileURLToPath(new URL("../src/data/products.json", import.meta.url));
const IMG_DIR = fileURLToPath(new URL("../public/img/", import.meta.url));
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(IMG_DIR, { recursive: true });

const products = JSON.parse(readFileSync(DATA_PATH, "utf8"));
let ok = 0;
const failed = [];

for (const p of products) {
  if (!p.fragranticaUrl) continue;
  const id = p.fragranticaUrl.match(/-(\d+)\.html$/)?.[1];
  if (!id) continue;
  const file = `${p.id}.jpg`;
  const dest = IMG_DIR + file;

  if (!existsSync(dest)) {
    try {
      const res = await fetch(`https://fimgs.net/mdimg/perfume/375x500.${id}.jpg`, {
        headers: { "User-Agent": UA, Referer: "https://www.fragrantica.es/" },
      });
      if (!res.ok || !res.headers.get("content-type")?.includes("image")) {
        throw new Error(`HTTP ${res.status}`);
      }
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length < 3000) throw new Error("imagen vacía/placeholder");
      writeFileSync(dest, buf);
      await sleep(800 + Math.random() * 700);
    } catch (e) {
      console.warn(`✗ ${p.id}: ${e.message}`);
      failed.push(p.id);
      continue;
    }
  }
  p.image = `/img/${file}`;
  ok++;
  console.log(`✓ ${p.id}`);
}

writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), "utf8");
console.log(`\nCon foto: ${ok}/${products.length}. Sin foto (placeholder): ${products.length - ok}.`);
if (failed.length) console.log("Fallaron:", failed.join(", "));
