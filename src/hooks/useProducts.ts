import { useEffect, useState } from "react";
import type { Product } from "../types";
import productsUrl from "../data/products.json?url";

interface State {
  products: Product[];
  loading: boolean;
  error: boolean;
}

/**
 * El catálogo se sirve como JSON estático (asset con hash de Vite) y se
 * fetchea en runtime: en 3G el skeleton loader es real, no decorativo.
 */
export function useProducts(): State {
  const [state, setState] = useState<State>({ products: [], loading: true, error: false });

  useEffect(() => {
    let alive = true;
    fetch(productsUrl)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json();
      })
      .then((products: Product[]) => {
        if (alive) setState({ products, loading: false, error: false });
      })
      .catch(() => {
        if (alive) setState({ products: [], loading: false, error: true });
      });
    return () => {
      alive = false;
    };
  }, []);

  return state;
}
