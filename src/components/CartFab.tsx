import { motion, useReducedMotion } from "motion/react";
import { Tote } from "@phosphor-icons/react";
import { useCart } from "../lib/cart";
import { EASE_OUT_EXPO } from "../lib/motion";

export function CartFab({ onOpen }: { onOpen: () => void }) {
  const { count } = useCart();
  const reduce = useReducedMotion();

  // Sin AnimatePresence: entra animado, sale instantáneo (los exit de
  // AnimatePresence en motion 12.42.2 no desmontan y el FAB quedaba pegado).
  if (count === 0) return null;

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      aria-label={`Abrir carrito, ${count} ${count === 1 ? "producto" : "productos"}`}
      className="pressable fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-30 flex h-14 w-14 items-center justify-center rounded-full bg-copper text-bg shadow-lg shadow-black/40"
      initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.9 }}
      animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
    >
      <Tote size={24} weight="fill" />
      {/* key={count}: cada cambio re-monta el badge y dispara el rebote spring */}
      <motion.span
        key={count}
        aria-hidden="true"
        className="tnum absolute -top-1 -right-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-ink px-1.5 text-xs font-semibold text-bg"
        initial={reduce ? false : { scale: 1.7 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.8, bounce: 0.45 }}
      >
        {count}
      </motion.span>
    </motion.button>
  );
}
