import type { Product } from "../types";

/**
 * Color por acorde en OKLCH (nombres en español, como los devuelve fragantica.es).
 *
 * Colorimetría: cada color se define en una grilla perceptual fija en vez de
 * hex a ojo. Luminosidad L ∈ [0.66, 0.88] (piso 0.66 garantiza ≥3:1 sobre las
 * superficies oscuras), croma C ∈ [0.02, 0.13] según cuán "saturado" huele el
 * acorde, y el HUE es el que carga el significado (cítrico→95° amarillo,
 * amaderado→65° marrón, acuático→220° celeste...). Al compartir banda de L y C,
 * todos los chips pesan lo mismo visualmente: ninguno grita, todos se leen.
 */
type Oklch = [l: number, c: number, h: number];

const ACCORD_COLORS: Record<string, Oklch> = {
  citrico: [0.84, 0.12, 95],
  amaderado: [0.72, 0.06, 65],
  dulce: [0.8, 0.09, 355],
  vainilla: [0.84, 0.06, 80],
  avainillado: [0.84, 0.06, 80],
  caramelo: [0.78, 0.1, 70],
  "calido especiado": [0.72, 0.12, 45],
  "fresco especiado": [0.8, 0.08, 160],
  ambar: [0.78, 0.11, 75],
  afrutado: [0.76, 0.11, 25],
  afrutados: [0.76, 0.11, 25],
  cereza: [0.72, 0.12, 10],
  floral: [0.8, 0.1, 340],
  rosas: [0.8, 0.1, 340],
  "flores blancas": [0.86, 0.04, 330],
  atalcado: [0.82, 0.05, 320],
  cuero: [0.68, 0.07, 55],
  oud: [0.66, 0.05, 60],
  tabaco: [0.72, 0.08, 70],
  cafe: [0.68, 0.07, 65],
  chocolate: [0.68, 0.07, 65],
  cacao: [0.68, 0.07, 65],
  lactonico: [0.86, 0.04, 75],
  almizclado: [0.8, 0.04, 300],
  acuatico: [0.8, 0.09, 220],
  ozonico: [0.8, 0.09, 220],
  marino: [0.8, 0.09, 220],
  verde: [0.8, 0.1, 135],
  aromatico: [0.8, 0.07, 165],
  coco: [0.88, 0.04, 85],
  ron: [0.74, 0.1, 60],
  whisky: [0.74, 0.1, 60],
  ahumado: [0.72, 0.02, 60],
  terroso: [0.7, 0.06, 80],
  pachuli: [0.7, 0.06, 80],
  animalico: [0.7, 0.07, 50],
  miel: [0.8, 0.11, 85],
  anisado: [0.82, 0.05, 170],
  aldehidico: [0.84, 0.02, 240],
  salado: [0.82, 0.04, 210],
  metalico: [0.76, 0.02, 250],
  "frutas tropicales": [0.78, 0.11, 55],
  almendra: [0.8, 0.06, 75],
  balsamico: [0.72, 0.08, 70],
  canela: [0.7, 0.11, 50],
};

const DEFAULT_COLOR: Oklch = [0.76, 0.03, 70];

function toCss([l, c, h]: Oklch): string {
  return `oklch(${l} ${c} ${h})`;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();
}

export function accordColor(name: string): string {
  const key = normalize(name);
  if (ACCORD_COLORS[key]) return toCss(ACCORD_COLORS[key]);
  for (const [k, v] of Object.entries(ACCORD_COLORS)) {
    if (key.includes(k) || k.includes(key)) return toCss(v);
  }
  return toCss(DEFAULT_COLOR);
}

/** Familias olfativas propias, derivadas de los acordes (para filtros). */
const FAMILIES: Record<string, string[]> = {
  "Dulce y gourmand": ["dulce", "vainilla", "caramelo", "lactonico", "chocolate", "cacao", "cafe", "miel", "ron", "whisky", "almendra", "avainillado"],
  Amaderada: ["amaderado", "oud", "cuero", "tabaco", "terroso", "pachuli", "ahumado"],
  "Fresca y cítrica": ["citrico", "acuatico", "ozonico", "marino", "verde", "aromatico", "fresco especiado", "salado"],
  Floral: ["floral", "rosas", "flores blancas", "atalcado", "aldehidico"],
  "Especiada y ámbar": ["calido especiado", "ambar", "canela", "anisado", "balsamico", "animalico"],
  Frutal: ["afrutado", "cereza", "coco", "frutas tropicales"],
};

export function deriveFamily(product: Product): string | null {
  if (!product.accords.length) return null;
  let best: string | null = null;
  let bestScore = 0;
  for (const [family, keys] of Object.entries(FAMILIES)) {
    let score = 0;
    for (const accord of product.accords) {
      const key = normalize(accord.name);
      if (keys.some((k) => key === k || key.includes(k))) score += accord.intensity;
    }
    if (score > bestScore) {
      bestScore = score;
      best = family;
    }
  }
  return best;
}

export const FAMILY_NAMES = Object.keys(FAMILIES);
