import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Check, Plus } from "@phosphor-icons/react";
import type { Product } from "../types";
import { formatARS } from "../lib/format";
import { deriveFamily } from "../lib/accords";
import { useCart } from "../lib/cart";
import { Sheet } from "./Sheet";
import { AccordBars } from "./AccordChips";
import { BottleArt } from "./BottleArt";

const GENDER_LABEL: Record<string, string> = {
  masculino: "Masculino",
  femenino: "Femenino",
  unisex: "Unisex",
};

function NotesBlock({ title, notes }: { title: string; notes: string[] }) {
  if (!notes.length) return null;
  return (
    <div className="flex flex-col gap-1.5">
      <h4 className="font-body text-xs font-medium tracking-wide text-ink-muted uppercase">{title}</h4>
      <p className="text-sm leading-relaxed text-ink-muted">{notes.join(", ")}</p>
    </div>
  );
}

export function ProductSheet({ product, onClose }: { product: Product | null; onClose: () => void }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const reduce = useReducedMotion();

  const handleAdd = () => {
    if (!product) return;
    add(product.id);
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1400);
  };

  const family = product ? deriveFamily(product) : null;
  const { top = [], heart = [], base = [], flat = [] } = product?.notes ?? {};
  const hasPyramid = top.length + heart.length + base.length > 0;

  return (
    <Sheet open={!!product} onClose={onClose} label="Detalle del perfume">
      {product && (
        <div className="flex flex-col gap-6 pt-1">
          <div className="flex gap-4">
            <motion.div
              layoutId={`art-${product.id}`}
              className="h-36 w-28 shrink-0 overflow-hidden rounded-xl"
            >
              <BottleArt product={product} />
            </motion.div>
            <div className="flex min-w-0 flex-col justify-center gap-1">
              <p className="text-xs tracking-wide text-ink-muted uppercase">
                {product.brand}
                {product.year ? ` · ${product.year}` : ""}
              </p>
              <h2 className="font-display text-2xl leading-tight">{product.name}</h2>
              <div className="mt-1 flex flex-wrap gap-1.5 text-xs text-ink-muted">
                {product.gender && (
                  <span className="rounded-full border border-line px-2.5 py-0.5">
                    {GENDER_LABEL[product.gender]}
                  </span>
                )}
                {family && <span className="rounded-full border border-line px-2.5 py-0.5">{family}</span>}
                <span className="rounded-full border border-line px-2.5 py-0.5">{product.ml}ml</span>
              </div>
            </div>
          </div>

          {product.enriched ? (
            <>
              <AccordBars accords={product.accords} />

              {product.description && (
                <p
                  className="sheet-in max-w-[60ch] text-sm leading-relaxed text-ink-muted"
                  style={{ "--i": 3 } as React.CSSProperties}
                >
                  {product.description}
                </p>
              )}

              {hasPyramid ? (
                <div
                  className="sheet-in flex flex-col gap-4 rounded-2xl bg-surface-2 p-4"
                  style={{ "--i": 4 } as React.CSSProperties}
                >
                  <NotesBlock title="Notas de salida" notes={top} />
                  <NotesBlock title="Notas de corazón" notes={heart} />
                  <NotesBlock title="Notas de fondo" notes={base} />
                </div>
              ) : flat.length > 0 ? (
                <div
                  className="sheet-in rounded-2xl bg-surface-2 p-4"
                  style={{ "--i": 4 } as React.CSSProperties}
                >
                  <NotesBlock title="Notas" notes={flat} />
                </div>
              ) : null}

              {product.perfumer && (
                <p className="sheet-in text-sm text-ink-muted" style={{ "--i": 5 } as React.CSSProperties}>
                  Perfumista: {product.perfumer}
                </p>
              )}
            </>
          ) : (
            <div className="sheet-in rounded-2xl bg-surface-2 p-4" style={{ "--i": 1 } as React.CSSProperties}>
              <p className="text-sm leading-relaxed text-ink-muted">
                La ficha olfativa de este perfume está en preparación. Si querés saber más, escribinos
                por WhatsApp y te contamos todo.
              </p>
            </div>
          )}

          <div className="sticky bottom-0 -mx-5 mt-2 flex items-center justify-between gap-4 border-t border-line bg-surface px-5 pt-4 pb-1">
            <div className="flex flex-col">
              <span className="tnum font-display text-2xl text-copper">{formatARS(product.price)}</span>
              <span className="text-xs text-ink-muted">{product.ml}ml</span>
            </div>
            <button
              type="button"
              onClick={handleAdd}
              className={`pressable relative inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-6 py-3 font-medium transition-colors duration-200 ${
                added ? "bg-surface-2 text-copper" : "bg-copper text-bg hover:bg-copper-deep"
              }`}
            >
              {/* Blur crossfade: enmascara el swap de texto/ícono entre estados */}
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={added ? "ok" : "agregar"}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, filter: "blur(6px)" }}
                  transition={{ duration: 0.26 }}
                  className="inline-flex items-center gap-2 whitespace-nowrap"
                >
                  {added ? (
                    <>
                      <Check size={18} weight="bold" />
                      Agregado
                    </>
                  ) : (
                    <>
                      <Plus size={18} weight="bold" />
                      Agregar al carrito
                    </>
                  )}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}
