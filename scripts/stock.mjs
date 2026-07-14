/**
 * Actualiza stock y precios desde una lista de difusión de WhatsApp/IG.
 *
 * Uso: npm run stock -- ruta/a/lista.txt
 *
 * Formato esperado por línea (los emojis y decoración se ignoran):
 *   🍫 French Avenue Liquid Brun EDP — $62.000
 *
 * Reglas:
 *  - Producto matcheado en la lista  → inStock: true + precio actualizado.
 *  - Producto del JSON que NO figura → inStock: false (sigue visible como agotado).
 *  - Línea que no matchea ningún producto → se reporta como POSIBLE INGRESO
 *    NUEVO (agregarlo a mano al JSON y correr enrich + images).
 * No toca fichas ni fotos: solo inStock y price.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DATA_PATH = fileURLToPath(new URL("../src/data/products.json", import.meta.url));

const STOPWORDS = new Set(["edp", "edt", "parfum", "eau", "de", "the", "for", "intense", "100ml", "120ml", "50ml"]);
const EXPAND = { masc: "masculino", fem: "femenino" };

function tokens(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((t) => EXPAND[t] ?? t)
    .filter((t) => t && !STOPWORDS.has(t));
}

const file = process.argv[2];
if (!file) {
  console.error("Uso: npm run stock -- ruta/a/lista.txt");
  process.exit(1);
}

const products = JSON.parse(readFileSync(DATA_PATH, "utf8"));

// Parsear líneas "Nombre — $precio" (separador — o - , precio con puntos)
const lines = readFileSync(file, "utf8")
  .split(/\r?\n/)
  .map((raw) => {
    const m = raw.match(/([\p{L}\p{N} .'()]+?)\s*[—-]\s*\$\s*([\d.]+)/u);
    if (!m) return null;
    return { raw: raw.trim(), name: m[1].trim(), price: Math.round(parseFloat(m[2].replace(/\./g, ""))) };
  })
  .filter(Boolean);

if (!lines.length) {
  console.error("No encontré líneas con formato 'Nombre — $precio' en el archivo.");
  process.exit(1);
}

const matchedIds = new Set();
const newArrivals = [];

for (const line of lines) {
  const lineTokens = tokens(line.name);
  // Candidatos: productos cuyo texto (marca+nombre+id) contiene TODOS los tokens de la línea
  const candidates = products.filter((p) => {
    const hay = new Set(tokens(`${p.brand} ${p.name} ${p.id}`));
    return lineTokens.every((t) => hay.has(t));
  });
  if (!candidates.length) {
    newArrivals.push(line);
    continue;
  }
  // Ante ambigüedad (ej: "Eclaire" matchea Eclaire y Eclaire Pistache), gana el nombre más corto
  candidates.sort((a, b) => tokens(`${a.brand} ${a.name}`).length - tokens(`${b.brand} ${b.name}`).length);
  const product = candidates[0];
  if (matchedIds.has(product.id)) {
    console.warn(`⚠ "${line.raw}" matchea ${product.id}, que ya fue matcheado por otra línea. Revisar.`);
    continue;
  }
  matchedIds.add(product.id);
  const priceChanged = product.price !== line.price;
  product.inStock = true;
  product.price = line.price;
  console.log(`✓ ${product.brand} ${product.name}${priceChanged ? ` (precio → $${line.price.toLocaleString("es-AR")})` : ""}`);
}

const outOfStock = products.filter((p) => !matchedIds.has(p.id));
for (const p of outOfStock) p.inStock = false;

writeFileSync(DATA_PATH, JSON.stringify(products, null, 2), "utf8");

console.log(`\nEn stock: ${matchedIds.size} · Sin stock: ${outOfStock.length}`);
if (outOfStock.length) {
  console.log("Quedaron SIN stock:");
  outOfStock.forEach((p) => console.log(`  - ${p.brand} ${p.name}`));
}
if (newArrivals.length) {
  console.log("\nPOSIBLES INGRESOS NUEVOS (no están en el JSON, agregar a mano):");
  newArrivals.forEach((l) => console.log(`  - ${l.raw}`));
}
