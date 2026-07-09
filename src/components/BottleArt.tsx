import type { Product } from "../types";
import { accordColor } from "../lib/accords";

/**
 * Placeholder elegante por producto: gradiente tintado con el color del
 * acorde principal + inicial de la marca en Bodoni. Cuando el producto
 * tenga foto propia (campo image), se muestra la foto.
 */
export function BottleArt({ product, className = "" }: { product: Product; className?: string }) {
  if (product.image) {
    return (
      <img
        src={product.image}
        alt={`Frasco de ${product.brand} ${product.name}`}
        loading="lazy"
        decoding="async"
        className={`h-full w-full bg-white object-cover ${className}`}
      />
    );
  }

  const tint = product.accords.length ? accordColor(product.accords[0].name) : "oklch(0.76 0.03 70)";

  return (
    <div
      role="img"
      aria-label={`${product.brand} ${product.name}, foto próximamente`}
      className={`relative flex h-full w-full items-center justify-center overflow-hidden ${className}`}
      style={{
        background: `radial-gradient(120% 90% at 50% 110%, color-mix(in oklch, ${tint} 26%, var(--color-surface)) 0%, var(--color-surface) 55%, color-mix(in oklch, var(--color-surface) 70%, var(--color-bg)) 100%)`,
      }}
    >
      <span
        aria-hidden="true"
        className="font-display text-6xl"
        style={{ color: `color-mix(in oklch, ${tint} 72%, var(--color-ink))` }}
      >
        {product.brand.charAt(0)}
      </span>
      <span
        aria-hidden="true"
        className="absolute inset-x-6 bottom-4 border-t"
        style={{ borderColor: `color-mix(in oklch, ${tint} 35%, transparent)` }}
      />
    </div>
  );
}
