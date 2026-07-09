/**
 * Enriquecimiento de productos desde Fragrantica (fragantica.es, en español).
 *
 * - Playwright en modo HEADED con slowMo y user-agent real (Fragrantica está
 *   detrás de Cloudflare; en headless bloquea).
 * - Delay de 3-5 segundos aleatorio entre productos. No martillar el sitio.
 * - Guardado INCREMENTAL: el JSON se escribe después de cada producto; si el
 *   script se corta no se pierde lo ya scrapeado.
 * - Si un producto falla o el match no es confiable, queda "enriched": false.
 *   Nunca se inventan datos.
 *
 * Correr: npm run enrich
 * Re-correr es seguro: saltea los que ya tienen enriched: true.
 */
import { chromium, type Page } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const DATA_PATH = fileURLToPath(new URL("../src/data/products.json", import.meta.url));

interface Accord { name: string; intensity: number }
interface Product {
  id: string; brand: string; name: string; ml: number; price: number;
  searchQuery: string; enriched: boolean;
  /** tokens que la URL/título del match DEBE contener (verificación estricta) */
  mustMatch?: string[];
  /** tokens que descartan un match (ej: "body mist" cuando vendemos el EDP) */
  mustNotMatch?: string[];
  gender: string | null; family: string | null; year: number | null;
  perfumer: string | null; description: string | null;
  accords: Accord[];
  notes: { top: string[]; heart: string[]; base: string[]; flat: string[] };
  fragranticaUrl: string | null; image: string | null;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const politeDelay = () => sleep(3000 + Math.random() * 2000);

/**
 * Guardado por MERGE: relee el archivo y solo pisa los productos que este
 * proceso enriqueció. Así un proceso viejo/concurrente no puede clobberear
 * el trabajo de otro (lección aprendida: un zombie reseteó todo el JSON).
 */
function save(products: Product[]) {
  let current: Product[] = products;
  try {
    current = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  } catch {
    /* si el archivo está corrupto, escribimos lo nuestro completo */
  }
  const merged = current.map((c) => {
    const mine = products.find((p) => p.id === c.id);
    return mine && mine.enriched ? mine : c;
  });
  writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2), "utf8");
}

function normalize(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}

/** Divide "canela, nuez moscada y bergamota" en notas individuales. */
function splitNotes(raw: string): string[] {
  return raw
    .replace(/ e (?=i)/gi, ", ") // "... e incienso"
    .split(/,| y /i)
    .map((n) => n.trim())
    .filter((n) => n.length > 1 && n.length < 40);
}

/** Busca en fragantica.es (/buscar/, el único endpoint que no da 403). */
async function findPerfumeUrl(page: Page, product: Product): Promise<string | null> {
  const { searchQuery: query, brand, mustMatch = [], mustNotMatch = [] } = product;
  const url = `https://www.fragrantica.es/buscar/?query=${encodeURIComponent(query)}`;
  const brandNorm = normalize(brand).split(" ")[0]; // "lattafa", "french", "al"...

  // Los resultados reales son de Algolia y bajo carga a veces no renderizan
  // (queda solo el sidebar server-side). Esperamos hasta ver un link de perfume
  // DE LA MARCA buscada, con reintentos con recarga.
  let links: { href: string; text: string }[] = [];
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForFunction(
        (b: string) =>
          Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href*="/perfume/"]')).some((a) =>
            a.href.toLowerCase().includes(b),
          ),
        brandNorm,
        { timeout: 25000 },
      );
      await sleep(1500);
      links = await page.$$eval('a[href*="/perfume/"]', (as) =>
        as.map((a) => ({ href: (a as HTMLAnchorElement).href, text: a.textContent ?? "" })),
      );
      break;
    } catch {
      console.warn(`    (intento ${attempt} sin resultados de la marca, reintentando...)`);
      await sleep(5000 + Math.random() * 3000);
    }
  }
  const queryWords = normalize(query).split(" ").filter((w) => w.length > 2);
  for (const link of links) {
    const hrefNorm = normalize(decodeURIComponent(link.href));
    if (!hrefNorm.includes(brandNorm)) continue;
    const hay = hrefNorm + " " + normalize(link.text);
    // Verificación estricta por producto (segunda pasada / casos ambiguos)
    if (mustMatch.length && !mustMatch.every((t) => hay.includes(normalize(t)))) continue;
    if (mustNotMatch.some((t) => hay.includes(normalize(t)))) continue;
    // Al menos la mitad de las palabras de la búsqueda en la URL o el texto del link
    const hits = queryWords.filter((w) => hay.includes(w)).length;
    if (hits >= Math.ceil(queryWords.length / 2)) return link.href.split("#")[0];
  }
  return null;
}

/** Extrae los datos de una página de perfume (diseño 2025/2026 de fragantica.es). */
async function extractPerfume(page: Page, url: string) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForSelector("h1", { timeout: 45000 });
  await sleep(2000);

  const raw = await page.evaluate(() => {
    const clean = (s: string | null | undefined) => (s ?? "").replace(/\s+/g, " ").trim();

    // Acordes: elementos con width en % Y color de fondo inline (las barras)
    const accords: { name: string; intensity: number }[] = [];
    document.querySelectorAll<HTMLElement>("[style*='width']").forEach((el) => {
      const width = parseFloat(el.style.width || "");
      const hasBg = !!(el.style.background || el.style.backgroundColor);
      const name = clean(el.textContent);
      if (!Number.isNaN(width) && /%/.test(el.style.width) && hasBg && name && name.length < 40) {
        accords.push({ name, intensity: Math.round(width) });
      }
    });

    const h1 = clean(document.querySelector("h1")?.textContent);
    const descText = clean(document.querySelector('[itemprop="description"]')?.textContent);
    return { accords, h1, descText };
  });

  // Género (del h1: "... para Hombres y Mujeres")
  let gender: string | null = null;
  if (/para hombres y mujeres/i.test(raw.h1)) gender = "unisex";
  else if (/para mujeres/i.test(raw.h1)) gender = "femenino";
  else if (/para hombres/i.test(raw.h1)) gender = "masculino";

  const d = raw.descText;
  const familyMatch = d.match(/familia olfativa (.+?) para/i);
  const yearMatch = d.match(/se lanz[oó] en (\d{4})/i);
  const noseMatch = d.match(/narices? detr[aá]s de esta fragancia (?:es|son) (.+?)\./i);

  // Pirámide olfativa, parseada del texto de la descripción (más robusto que el DOM)
  const top = d.match(/notas de salida son ([^;.]+)[;.]/i);
  const heart = d.match(/notas de coraz[oó]n son ([^;.]+)[;.]/i);
  const base = d.match(/notas de fondo son ([^;.]+)[;.]/i);
  const flat = !top && !heart && !base ? d.match(/las notas son ([^.]+)\./i) : null;

  // Descripción: las dos primeras oraciones del bloque
  const sentences = d.split(/(?<=\.)\s+/).slice(0, 2).join(" ");

  return {
    accords: raw.accords.slice(0, 10),
    gender,
    family: familyMatch ? familyMatch[1].trim() : null,
    year: yearMatch ? parseInt(yearMatch[1], 10) : null,
    perfumer: noseMatch ? noseMatch[1].trim() : null,
    description: sentences || null,
    notes: {
      top: top ? splitNotes(top[1]) : [],
      heart: heart ? splitNotes(heart[1]) : [],
      base: base ? splitNotes(base[1]) : [],
      flat: flat ? splitNotes(flat[1]) : [],
    },
  };
}

async function main() {
  const products: Product[] = JSON.parse(readFileSync(DATA_PATH, "utf8"));
  const pending = products.filter((p) => !p.enriched);
  console.log(`${pending.length} productos pendientes de ${products.length}.`);
  if (!pending.length) return;

  const browser = await chromium.launch({
    headless: false,
    slowMo: 150,
    args: ["--disable-blink-features=AutomationControlled"],
  });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
    locale: "es-AR",
    viewport: { width: 1280, height: 900 },
  });
  const page = await context.newPage();
  // tsx/esbuild inyecta __name en las funciones de evaluate; definirlo en el browser
  await page.addInitScript(() => {
    (window as unknown as Record<string, unknown>).__name = (f: unknown) => f;
  });

  const failed: string[] = [];
  for (const product of pending) {
    const label = `${product.brand} ${product.name}`;
    try {
      console.log(`→ Buscando: ${label}`);
      const url = product.fragranticaUrl ?? (await findPerfumeUrl(page, product));
      if (!url) {
        console.warn(`  ✗ Sin resultado confiable, queda pendiente.`);
        failed.push(label);
        await politeDelay();
        continue;
      }
      await politeDelay();
      const data = await extractPerfume(page, url);
      const hasNotes = data.notes.top.length + data.notes.flat.length > 0;
      if (!data.accords.length && !hasNotes) {
        console.warn(`  ✗ Página sin datos legibles (${url}), queda pendiente.`);
        failed.push(label);
        await politeDelay();
        continue;
      }
      Object.assign(product, data, { fragranticaUrl: url, enriched: true });
      save(products); // guardado incremental
      console.log(`  ✓ OK: ${data.accords.length} acordes, año ${data.year ?? "?"} (${url})`);
    } catch (err) {
      console.warn(`  ✗ Error con ${label}: ${(err as Error).message.split("\n")[0]}`);
      failed.push(label);
      save(products);
    }
    await politeDelay();
  }

  await browser.close();
  save(products);
  console.log("\n=== RESUMEN ===");
  console.log(`Enriquecidos: ${products.filter((p) => p.enriched).length}/${products.length}`);
  if (failed.length) {
    console.log("Pendientes para completar a mano:");
    failed.forEach((f) => console.log(`  - ${f}`));
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
