import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Minus, Plus, Trash, WhatsappLogo, CaretLeft } from "@phosphor-icons/react";
import type { Product } from "../types";
import { formatARS } from "../lib/format";
import { buildWaLink, type OrderLine } from "../lib/whatsapp";
import { useCart } from "../lib/cart";
import { Sheet } from "./Sheet";
import { BottleArt } from "./BottleArt";
import { EASE_OUT_EXPO as EASE } from "../lib/motion";

interface Props {
  open: boolean;
  onClose: () => void;
  products: Product[];
}

export function CartSheet({ open, onClose, products }: Props) {
  const { items, setQty, remove } = useCart();
  const [confirming, setConfirming] = useState(false);
  const reduce = useReducedMotion();

  const lines = useMemo<OrderLine[]>(
    () =>
      items
        .map((item) => {
          const product = products.find((p) => p.id === item.id);
          return product ? { product, qty: item.qty } : null;
        })
        .filter(Boolean) as OrderLine[],
    [items, products],
  );

  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);

  const close = () => {
    setConfirming(false);
    onClose();
  };

  // Transición direccional entre pasos: confirmar entra desde la derecha,
  // volver al carrito entra desde la izquierda (comunica adelante/atrás).
  const stepMotion = (dir: 1 | -1) =>
    reduce
      ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
      : {
          initial: { opacity: 0, x: 36 * dir },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -24 * dir },
        };

  return (
    <Sheet open={open} onClose={close} label={confirming ? "Confirmar pedido" : "Tu carrito"}>
      {lines.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-line font-display text-2xl text-ink-faint"
          >
            0
          </span>
          <p className="font-display text-xl">Tu carrito está vacío</p>
          <p className="max-w-[32ch] text-sm text-ink-muted">
            Tocá cualquier perfume del catálogo y agregalo desde su ficha.
          </p>
        </div>
      ) : (
        <AnimatePresence mode="wait" initial={false}>
          {confirming ? (
            /* ===== Paso de confirmación antes de mandar ===== */
            <motion.div
              key="confirmar"
              {...stepMotion(1)}
              transition={{ duration: 0.32, ease: EASE }}
              className="flex flex-col gap-5 pt-1 pb-2"
            >
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="pressable -ml-2 inline-flex min-h-11 w-fit items-center gap-1 rounded-full px-2 text-sm text-ink-muted hover:text-ink"
              >
                <CaretLeft size={16} weight="bold" />
                Volver al carrito
              </button>
              <div className="flex flex-col gap-3 rounded-2xl bg-surface-2 p-4">
                {lines.map(({ product, qty }) => (
                  <div key={product.id} className="flex items-baseline justify-between gap-3 text-sm">
                    <span className="text-ink-muted">
                      {qty}x {product.brand} {product.name} ({product.ml}ml)
                    </span>
                    <span className="tnum shrink-0">{formatARS(product.price * qty)}</span>
                  </div>
                ))}
                <div className="flex items-baseline justify-between border-t border-line pt-3">
                  <span className="font-medium">Total</span>
                  <span className="tnum font-display text-xl text-copper">{formatARS(total)}</span>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-ink-muted">
                Al tocar el botón se abre WhatsApp con este pedido ya escrito. Lo revisás y lo mandás
                vos: nada se envía solo.
              </p>
              <a
                href={buildWaLink(lines)}
                target="_blank"
                rel="noopener noreferrer"
                className="pressable inline-flex min-h-13 items-center justify-center gap-2.5 rounded-full bg-copper px-6 py-3.5 text-base font-medium text-bg hover:bg-copper-deep"
              >
                <WhatsappLogo size={22} weight="fill" />
                Abrir WhatsApp con el pedido
              </a>
            </motion.div>
          ) : (
            /* ===== Carrito editable ===== */
            <motion.div
              key="carrito"
              {...stepMotion(-1)}
              transition={{ duration: 0.32, ease: EASE }}
              className="flex flex-col gap-4 pt-1 pb-2"
            >
              <ul className="flex flex-col gap-3">
                <AnimatePresence initial={false} mode="popLayout">
                  {lines.map(({ product, qty }) => (
                    <motion.li
                      key={product.id}
                      layout={!reduce}
                      initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
                      animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
                      exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.32, ease: EASE }}
                      className="flex items-center gap-3 rounded-2xl bg-surface-2 p-3"
                    >
                      <div className="h-20 w-16 shrink-0 overflow-hidden rounded-lg">
                        <BottleArt product={product} />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <p className="truncate text-xs tracking-wide text-ink-muted uppercase">
                          {product.brand}
                        </p>
                        <p className="font-display truncate leading-tight">{product.name}</p>
                        <p className="tnum text-sm text-copper">{formatARS(product.price)}</p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <button
                          type="button"
                          onClick={() => remove(product.id)}
                          aria-label={`Quitar ${product.name} del carrito`}
                          className="pressable flex h-9 w-9 items-center justify-center rounded-full text-ink-faint hover:text-danger"
                        >
                          <Trash size={16} />
                        </button>
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty - 1)}
                            aria-label={`Restar uno de ${product.name}`}
                            className="pressable flex h-11 w-11 items-center justify-center rounded-l-full text-ink-muted hover:text-ink"
                          >
                            <Minus size={14} weight="bold" />
                          </button>
                          <span className="tnum w-6 text-center text-sm font-medium" aria-live="polite">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => setQty(product.id, qty + 1)}
                            aria-label={`Sumar uno de ${product.name}`}
                            className="pressable flex h-11 w-11 items-center justify-center rounded-r-full text-ink-muted hover:text-ink"
                          >
                            <Plus size={14} weight="bold" />
                          </button>
                        </div>
                      </div>
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              <div className="sticky bottom-0 -mx-5 flex items-center justify-between gap-4 border-t border-line bg-surface px-5 pt-4 pb-1">
                <div className="flex flex-col">
                  <span className="text-xs text-ink-muted">Subtotal</span>
                  {/* key={total}: cada cambio re-monta y "tickea" el número */}
                  <span aria-live="polite">
                    <motion.span
                      key={total}
                      initial={reduce ? false : { opacity: 0.2, y: 9 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.28, ease: EASE }}
                      className="tnum font-display inline-block text-2xl text-copper"
                    >
                      {formatARS(total)}
                    </motion.span>
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setConfirming(true)}
                  className="pressable inline-flex min-h-12 items-center gap-2 rounded-full bg-copper px-6 py-3 font-medium text-bg hover:bg-copper-deep"
                >
                  <WhatsappLogo size={20} weight="fill" />
                  <span className="whitespace-nowrap">Pedir por WhatsApp</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </Sheet>
  );
}
