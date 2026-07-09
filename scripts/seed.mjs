// Genera src/data/products.json base (sin enriquecer) a partir de la lista de stock.
// Correr una sola vez: node scripts/seed.mjs
import { writeFileSync, mkdirSync } from "node:fs";

// [id, brand, name, searchQuery, ml, price]
const stock = [
  ["french-avenue-liquid-brun", "French Avenue", "Liquid Brun", "French Avenue Liquid Brun", 100, 62000],
  ["lattafa-the-kingdom-masc", "Lattafa", "The Kingdom (Masculino)", "Lattafa The Kingdom", 100, 42000],
  ["afnan-9pm-black", "Afnan", "9PM Black", "Afnan 9PM Black", 100, 43500],
  ["lattafa-khamrah", "Lattafa", "Khamrah", "Lattafa Khamrah", 100, 41000],
  ["lattafa-mayar-cherry-intense", "Lattafa", "Mayar Cherry Intense", "Lattafa Mayar Cherry Intense", 100, 36500],
  ["armaf-odyssey-candee", "Armaf", "Odyssey Candee", "Armaf Odyssey Candee", 100, 38000],
  ["lattafa-yara-candy", "Lattafa", "Yara Candy", "Lattafa Yara Candy", 100, 38000],
  ["lattafa-the-kingdom-fem", "Lattafa", "The Kingdom (Femenino)", "Lattafa The Kingdom", 100, 41000],
  ["lattafa-fakhar-rose-gold", "Lattafa", "Fakhar Rose Gold", "Lattafa Fakhar Gold", 100, 48000],
  ["maison-alhambra-yeah-man", "Maison Alhambra", "Yeah Man", "Maison Alhambra Yeah Man", 100, 30500],
  ["lattafa-khamrah-waha", "Lattafa", "Khamrah Waha", "Lattafa Khamrah Waha", 100, 84000],
  ["lattafa-badee-al-oud-sublime", "Lattafa", "Badee Al Oud Sublime", "Lattafa Badee Al Oud Sublime", 100, 39500],
  ["rasasi-hawas-viper", "Rasasi", "Hawas Viper", "Rasasi Hawas Viper", 100, 71000],
  ["rasasi-hawas-atlantis", "Rasasi", "Hawas Atlantis", "Rasasi Hawas Atlantis", 100, 68000],
  ["rasasi-hawas-tropical", "Rasasi", "Hawas Tropical", "Rasasi Hawas Tropical", 100, 57000],
  ["lattafa-khamrah-qahwa", "Lattafa", "Khamrah Qahwa", "Lattafa Khamrah Qahwa", 100, 40000],
  ["armaf-odyssey-mandarin-sky", "Armaf", "Odyssey Mandarin Sky", "Armaf Odyssey Mandarin Sky", 100, 46000],
  ["lattafa-asad-bourbon", "Lattafa", "Asad Bourbon", "Lattafa Asad Bourbon", 100, 52500],
  ["zimaya-tiramisu-caramel", "Zimaya", "Tiramisu Caramel", "Zimaya Tiramisu Caramel", 100, 47500],
  ["al-haramain-amber-oud-gold", "Al Haramain", "Amber Oud Gold Edition", "Al Haramain Amber Oud Gold Edition", 120, 83500],
  ["french-avenue-vulcan-feu", "French Avenue", "Vulcan Feu", "French Avenue Vulcan Feu", 100, 69500],
  ["french-avenue-veneno-negro", "French Avenue", "Veneno Negro", "French Avenue Veneno", 100, 68000],
  ["afnan-9pm-night-out", "Afnan", "9PM Night Out", "Afnan 9PM Night Out", 100, 80500],
  ["lattafa-eclaire", "Lattafa", "Eclaire", "Lattafa Eclaire", 100, 49500],
  ["lattafa-musamam-black-intense", "Lattafa", "Musamam Black Intense", "Lattafa Musamam Black Intense", 100, 62000],
  ["armaf-odyssey-aqua", "Armaf", "Odyssey Aqua", "Armaf Odyssey Aqua", 100, 54000],
  ["lattafa-yara-elixir", "Lattafa", "Yara Elixir", "Lattafa Yara Elixir", 100, 50000],
  ["rasasi-hawas-for-him", "Rasasi", "Hawas for Him", "Rasasi Hawas for Him", 100, 46000],
  ["lattafa-yara-rosado", "Lattafa", "Yara", "Lattafa Yara", 100, 40000],
  ["lattafa-nebras-elixir", "Lattafa", "Nebras Elixir", "Lattafa Nebras Elixir", 100, 49500],
  ["rasasi-hawas-black", "Rasasi", "Hawas Black", "Rasasi Hawas Black", 100, 54000],
  ["afnan-9pm-elixir", "Afnan", "9PM Elixir Parfum Intense", "Afnan 9PM Elixir", 100, 63500],
  ["lattafa-eclaire-pistache", "Lattafa", "Eclaire Pistache", "Lattafa Eclaire Pistache", 100, 51000],
  ["armaf-yum-yum-delights", "Armaf", "Yum Yum Delights", "Armaf Yum Yum Delights", 100, 60000],
];

const products = stock.map(([id, brand, name, searchQuery, ml, price]) => ({
  id, brand, name, ml, price, searchQuery,
  enriched: false,
  gender: null,
  family: null,
  year: null,
  perfumer: null,
  description: null,
  accords: [],
  notes: { top: [], heart: [], base: [], flat: [] },
  fragranticaUrl: null,
  image: null,
}));

mkdirSync(new URL("../src/data/", import.meta.url), { recursive: true });
writeFileSync(new URL("../src/data/products.json", import.meta.url), JSON.stringify(products, null, 2), "utf8");
console.log(`OK: ${products.length} productos escritos en src/data/products.json`);
