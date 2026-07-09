import { useState } from "react";
import { WhatsappLogo } from "@phosphor-icons/react";
import type { Product } from "./types";
import { useProducts } from "./hooks/useProducts";
import { CartProvider } from "./lib/cart";
import { WHATSAPP_NUMBER } from "./lib/whatsapp";
import { Hero } from "./components/Hero";
import { Catalog } from "./components/Catalog";
import { ProductSheet } from "./components/ProductSheet";
import { CartFab } from "./components/CartFab";
import { CartSheet } from "./components/CartSheet";

export default function App() {
  const { products, loading, error } = useProducts();
  const [selected, setSelected] = useState<Product | null>(null);
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <CartProvider>
      <Hero />
      <main>
        <Catalog products={products} loading={loading} error={error} onOpen={setSelected} />
      </main>
      <footer className="border-t border-line">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-5 py-12 md:flex-row md:items-center md:justify-between md:px-10">
          <div>
            <p className="font-display text-lg">Poket Import</p>
            <p className="mt-1 text-sm text-ink-muted">Perfumes importados, en stock real.</p>
          </div>
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="pressable inline-flex min-h-11 w-fit items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink hover:border-copper"
          >
            <WhatsappLogo size={18} weight="fill" className="text-copper" />
            Escribinos por WhatsApp
          </a>
        </div>
      </footer>

      <ProductSheet product={selected} onClose={() => setSelected(null)} />
      <CartSheet open={cartOpen} onClose={() => setCartOpen(false)} products={products} />
      <CartFab onOpen={() => setCartOpen(true)} />
    </CartProvider>
  );
}
