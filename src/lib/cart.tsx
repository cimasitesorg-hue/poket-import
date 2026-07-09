import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from "react";
import type { CartItem } from "../types";

const STORAGE_KEY = "poket-cart-v1";

interface CartState {
  items: CartItem[];
  /** timestamp del último agregado: dispara el rebote del badge */
  lastAddedAt: number;
}

type Action =
  | { type: "add"; id: string }
  | { type: "setQty"; id: string; qty: number }
  | { type: "remove"; id: string }
  | { type: "clear" };

function reducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case "add": {
      const existing = state.items.find((i) => i.id === action.id);
      const items = existing
        ? state.items.map((i) => (i.id === action.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state.items, { id: action.id, qty: 1 }];
      return { items, lastAddedAt: Date.now() };
    }
    case "setQty": {
      if (action.qty <= 0) return { ...state, items: state.items.filter((i) => i.id !== action.id) };
      return {
        ...state,
        items: state.items.map((i) => (i.id === action.id ? { ...i, qty: Math.min(action.qty, 99) } : i)),
      };
    }
    case "remove":
      return { ...state, items: state.items.filter((i) => i.id !== action.id) };
    case "clear":
      return { ...state, items: [] };
  }
}

function loadInitial(): CartState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const items = JSON.parse(raw) as CartItem[];
      if (Array.isArray(items)) return { items: items.filter((i) => i && i.id && i.qty > 0), lastAddedAt: 0 };
    }
  } catch {
    /* storage corrupto o bloqueado: carrito vacío */
  }
  return { items: [], lastAddedAt: 0 };
}

interface CartContextValue extends CartState {
  add: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  count: number;
}

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
    } catch {
      /* sin storage disponible */
    }
  }, [state.items]);

  const value = useMemo<CartContextValue>(
    () => ({
      ...state,
      add: (id) => dispatch({ type: "add", id }),
      setQty: (id, qty) => dispatch({ type: "setQty", id, qty }),
      remove: (id) => dispatch({ type: "remove", id }),
      clear: () => dispatch({ type: "clear" }),
      count: state.items.reduce((n, i) => n + i.qty, 0),
    }),
    [state],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
