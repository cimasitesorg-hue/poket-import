import { useEffect, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { X } from "@phosphor-icons/react";
import { EASE_DRAWER } from "../lib/motion";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

/**
 * Bottom sheet base: overlay con blur, panel que sube con la curva de drawer
 * iOS, swipe-down para cerrar con dismiss por velocidad, Escape, tap en el
 * overlay, foco contenido (Tab cicla adentro) y devuelto al trigger al
 * cerrar. Con reduced-motion degrada a crossfade.
 */
export function Sheet({ open, onClose, label, children }: SheetProps) {
  const reduce = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);

  // Bloqueo de scroll del body mientras el sheet está abierto
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Foco: al abrir va al panel, Tab queda contenido, al cerrar vuelve al trigger
  useEffect(() => {
    if (!open) return;
    const trigger = document.activeElement as HTMLElement | null;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
          (el) => el.offsetParent !== null,
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        const active = document.activeElement;
        if (e.shiftKey && (active === first || active === panelRef.current)) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKey);
    panelRef.current?.focus();
    return () => {
      window.removeEventListener("keydown", onKey);
      trigger?.focus?.();
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-40" role="dialog" aria-modal="true" aria-label={label}>
          <motion.button
            type="button"
            aria-label="Cerrar"
            tabIndex={-1}
            onClick={onClose}
            className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[88dvh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl bg-surface outline-none"
            initial={reduce ? { opacity: 0 } : { y: "100%" }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: "100%" }}
            transition={reduce ? { duration: 0.25 } : { duration: 0.62, ease: EASE_DRAWER }}
            drag={reduce ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={(_, info) => {
              // Flick rápido o arrastre largo: cerrar
              if (info.velocity.y > 400 || info.offset.y > 140) onClose();
            }}
          >
            <div className="flex items-center justify-between px-5 pt-3 pb-1">
              <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-2 h-1 w-10 -translate-x-1/2 rounded-full bg-line" />
              <span className="text-sm text-ink-muted">{label}</span>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="pressable -mr-2 flex h-11 w-11 items-center justify-center rounded-full text-ink-muted hover:text-ink"
              >
                <X size={20} weight="bold" />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
