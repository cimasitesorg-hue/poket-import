// Restaura las URLs de Fragrantica verificadas (auditadas a mano el 8-9/7/2026,
// las últimas 4 confirmadas por el dueño: 9PM Black = 9PM original, Mandarin
// Sky = EDP, Yeah Man = Yeah Parfum, Yum Yum Delights = Yum Yum).
// Con fragranticaUrl prefijada, npm run enrich saltea la búsqueda: no puede
// volver a matchear mal. Correr: node scripts/restore-urls.mjs && npm run enrich
import { readFileSync, writeFileSync } from "node:fs";

const PATH = new URL("../src/data/products.json", import.meta.url);
const BASE = "https://www.fragrantica.es/perfume/";

const urls = {
  "french-avenue-liquid-brun": "French-Avenue/Liquid-Brun-94713.html",
  "lattafa-the-kingdom-masc": "Lattafa-Perfumes/The-Kingdom-For-Men-97995.html",
  "lattafa-khamrah": "Lattafa-Perfumes/Khamrah-75805.html",
  "lattafa-mayar-cherry-intense": "Lattafa-Perfumes/Mayar-Cherry-Intense-99872.html",
  "armaf-odyssey-candee": "Armaf/Odyssey-Candee-96990.html",
  "lattafa-yara-candy": "Lattafa-Perfumes/Yara-Candy-95752.html",
  "lattafa-the-kingdom-fem": "Lattafa-Perfumes/The-Kingdom-For-Women-98648.html",
  "lattafa-fakhar-rose-gold": "Lattafa-Perfumes/Fakhar-Rose-70466.html",
  "lattafa-khamrah-waha": "Lattafa-Perfumes/Khamrah-Waha-132409.html",
  "lattafa-badee-al-oud-sublime": "Lattafa-Perfumes/Bade-e-Al-Oud-Sublime-83309.html",
  "rasasi-hawas-viper": "Rasasi/Hawas-Viper-113594.html",
  "rasasi-hawas-atlantis": "Rasasi/Hawas-Atlantis-112309.html",
  "rasasi-hawas-tropical": "Rasasi/Hawas-Tropical-108054.html",
  "lattafa-khamrah-qahwa": "Lattafa-Perfumes/Khamrah-Qahwa-88175.html",
  "armaf-odyssey-mandarin-sky": "Armaf/Odyssey-Mandarin-Sky-83132.html",
  "afnan-9pm-black": "Afnan/9pm-65414.html",
  "maison-alhambra-yeah-man": "Maison-Alhambra/Yeah-Parfum-94159.html",
  "armaf-yum-yum-delights": "Armaf/Yum-Yum-98717.html",
  "lattafa-asad-bourbon": "Lattafa-Perfumes/Asad-Bourbon-101124.html",
  "zimaya-tiramisu-caramel": "Zimaya/Tiramisu-Caramel-98691.html",
  "al-haramain-amber-oud-gold": "Al-Haramain-Perfumes/Amber-Oud-Gold-Edition-51816.html",
  "french-avenue-vulcan-feu": "French-Avenue/Vulcan-Feu-105520.html",
  "french-avenue-veneno-negro": "French-Avenue/Veneno-105519.html",
  "afnan-9pm-night-out": "Afnan/9-PM-Night-Out-123313.html",
  "lattafa-eclaire": "Lattafa-Perfumes/Eclaire-93628.html",
  "lattafa-musamam-black-intense": "Lattafa-Perfumes/Musamam-Black-Intense-119987.html",
  "armaf-odyssey-aqua": "Armaf/Odyssey-Aqua-Edition-83134.html",
  "lattafa-yara-elixir": "Lattafa-Perfumes/Yara-Elixir-117615.html",
  "rasasi-hawas-for-him": "Rasasi/Hawas-for-Him-46890.html",
  "lattafa-yara-rosado": "Lattafa-Perfumes/Yara-76880.html",
  "lattafa-nebras-elixir": "Lattafa-Perfumes/Nebras-Elixir-113906.html",
  "rasasi-hawas-black": "Rasasi/Hawas-Black-96817.html",
  "afnan-9pm-elixir": "Afnan/9PM-Elixir-111894.html",
  "lattafa-eclaire-pistache": "Lattafa-Perfumes/Eclaire-Pistache-113777.html",
};

const products = JSON.parse(readFileSync(PATH, "utf8"));
let n = 0;
for (const p of products) {
  if (urls[p.id] && !p.fragranticaUrl) {
    p.fragranticaUrl = BASE + urls[p.id];
    n++;
  }
}
writeFileSync(PATH, JSON.stringify(products, null, 2), "utf8");
console.log(`URLs restauradas: ${n}. Sin URL (no existen en Fragrantica): ${products.filter((p) => !p.fragranticaUrl).length}`);
