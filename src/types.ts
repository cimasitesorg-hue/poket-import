export interface Accord {
  name: string;
  intensity: number; // 0-100, ancho relativo de Fragrantica
}

export interface Product {
  id: string;
  brand: string;
  name: string;
  ml: number;
  price: number; // ARS
  inStock: boolean;
  searchQuery: string;
  enriched: boolean;
  gender: "masculino" | "femenino" | "unisex" | null;
  family: string | null;
  year: number | null;
  perfumer: string | null;
  description: string | null;
  accords: Accord[];
  notes: { top: string[]; heart: string[]; base: string[]; flat: string[] };
  fragranticaUrl: string | null;
  image: string | null;
}

export interface CartItem {
  id: string;
  qty: number;
}
