import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { motion } from "motion/react";
import { X } from "@phosphor-icons/react";

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/** Duración máxima de la salida (ver .sheet-root en index.css) + margen. */
const EXIT_MS = 400;

interface SheetProps {
  open: boolean;
  onClose: () => void;
  label: string;
  children: ReactNode;
}

/**
 * Bottom sheet base: overlay con blur, panel que sube con la curva de drawer
 * iOS, swipe-down para cerrar con dismiss por velocidad, Escape, tap en el
 * overlay, foco contenido (Tab cicla adentro) y devuelto al trigger al cerrar.
 *
 * El montaje/desmontaje es MANUAL (estado mounted + timeout) y la entrada y
 * salida son transiciones CSS puras (.sheet-root/.sheet-panel en index.css,
 * con @starting-style). Motion queda solo para el drag: AnimatePresence de
 * motion 12.42.2 no desmonta hijos al completar el exit y dejaba el sheet
 * (y su overlay) pegado para siempre. No volver a AnimatePresence acá sin
 * verificar el cierre en el browser.
 */
export function Sheet({ open, onClose, label, children }: SheetProps) {
  const [mounted, setMounted] = useState(open);
  const panelRef = useRef<HTMLDivElement>(null);

  // Desmontaje diferido: al cerrar, la transición CSS corre y recién después
  // sacamos el nodo del DOM.
  useEffect(() => {
    if (open) {
      setMounted(true);
      return;
    }
    const t = window.setTimeout(() => setMounted(false), EXIT_MS);
    return () => window.clearTimeout(t);
  }, [open]);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="sheet-root fixed inset-0 z-40"
      data-state={open ? "open" : "closed"}
      role="dialog"
      aria-modal="true"
      aria-label={label}
    >
      <button
        type="button"
        aria-label="Cerrar"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/60 backdrop-blur-sm"
      />
      {/* Wrapper: el slide de entrada/salida es CSS; el transform inline del
          drag de Motion vive en el hijo y no pisa la transición. */}
      <div className="sheet-panel absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg">
        <motion.div
          ref={panelRef}
          tabIndex={-1}
          className="relative flex max-h-[88dvh] flex-col overflow-hidden rounded-t-3xl bg-surface outline-none"
          drag="y"
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
    </div>,
    document.body,
  );
}
