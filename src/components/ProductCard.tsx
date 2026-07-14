import { motion } from "motion/react";
import type { Product } from "../types";
import { formatARS } from "../lib/format";
import { AccordChips } from "./AccordChips";
import { BottleArt } from "./BottleArt";

interface Props {
  product: Product;
  onOpen: (product: Product) => void;
  stagger: number;
}

export function ProductCard({ product, onOpen, stagger }: Props) {
  return (
    <li className="reveal" style={{ "--stagger": `${stagger}ms` } as React.CSSProperties}>
      <button
        type="button"
        onClick={() => onOpen(product)}
        className="pressable group block w-full overflow-hidden rounded-2xl bg-surface text-left"
        aria-label={`Ver detalle de ${product.brand} ${product.name}${product.inStock ? "" : ", sin stock"}`}
      >
        <motion.div layoutId={`art-${product.id}`} className="aspect-[4/5] w-full overflow-hidden">
          {/* Zoom sutil solo en dispositivos con hover real (desktop) */}
          <div className="h-full w-full transition-transform duration-700 ease-out-expo motion-safe:group-hover:scale-[1.06]">
            <BottleArt product={product} />
          </div>
        </motion.div>
        <div className="flex flex-col gap-2 p-4">
          <div>
            <p className="text-xs tracking-wide text-ink-muted uppercase">{product.brand}</p>
            <h3 className="font-display mt-0.5 text-lg leading-snug">{product.name}</h3>
          </div>
          <AccordChips accords={product.accords} />
          <div className="mt-1 flex items-baseline justify-between">
            <span className="tnum text-lg font-medium text-copper">{formatARS(product.price)}</span>
            {product.inStock ? (
              <span className="text-xs text-ink-muted">{product.ml}ml</span>
            ) : (
              <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-ink">
                Sin stock
              </span>
            )}
          </div>
        </div>
      </button>
    </li>
  );
}

/** Skeleton con la misma silueta que la card final (sin CLS). */
export function ProductCardSkeleton() {
  return (
    <li aria-hidden="true">
      <div className="overflow-hidden rounded-2xl bg-surface">
        <div className="skeleton aspect-[4/5] w-full" />
        <div className="flex flex-col gap-3 p-4">
          <div className="skeleton h-3 w-16 rounded-full" />
          <div className="skeleton h-5 w-3/4 rounded-full" />
          <div className="flex gap-1.5">
            <div className="skeleton h-5 w-14 rounded-full" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
          <div className="skeleton h-6 w-24 rounded-full" />
        </div>
      </div>
    </li>
  );
}
