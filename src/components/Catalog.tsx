import { useMemo, useState } from "react";
import { ArrowCounterClockwise, WarningCircle } from "@phosphor-icons/react";
import type { Product } from "../types";
import { deriveFamily, FAMILY_NAMES } from "../lib/accords";
import { useReveal } from "../hooks/useReveal";
import { ProductCard, ProductCardSkeleton } from "./ProductCard";

const GENDERS = [
  { key: "todos", label: "Todos" },
  { key: "masculino", label: "Masculino" },
  { key: "femenino", label: "Femenino" },
  { key: "unisex", label: "Unisex" },
] as const;

type GenderKey = (typeof GENDERS)[number]["key"];

interface Props {
  products: Product[];
  loading: boolean;
  error: boolean;
  onOpen: (product: Product) => void;
}

function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`pressable min-h-11 shrink-0 rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${
        active
          ? "border-copper bg-copper/15 text-copper"
          : "border-line text-ink-muted hover:border-ink-faint hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function Catalog({ products, loading, error, onOpen }: Props) {
  const [gender, setGender] = useState<GenderKey>("todos");
  const [family, setFamily] = useState<string>("todas");

  const families = useMemo(() => {
    const present = new Set(products.map((p) => deriveFamily(p)).filter(Boolean) as string[]);
    return FAMILY_NAMES.filter((f) => present.has(f));
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (gender !== "todos" && p.gender !== gender) return false;
        if (family !== "todas" && deriveFamily(p) !== family) return false;
        return true;
      }),
    [products, gender, family],
  );

  const hasFilters = gender !== "todos" || family !== "todas";
  const revealRef = useReveal<HTMLUListElement>([filtered, loading]);

  return (
    <section id="catalogo" aria-label="Catálogo de perfumes" className="mx-auto w-full max-w-5xl px-5 py-16 md:px-10 md:py-24">
      <div className="flex flex-col gap-2">
        <h2 className="text-3xl md:text-4xl">El catálogo</h2>
        <p className="max-w-[48ch] text-ink-muted">
          Todo lo que ves está en stock. Tocá un perfume para ver sus notas y acordes.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-3">
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filtrar por género">
          {GENDERS.map((g) => (
            <FilterPill key={g.key} active={gender === g.key} onClick={() => setGender(g.key)}>
              {g.label}
            </FilterPill>
          ))}
        </div>
        {families.length > 0 && (
          <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 md:mx-0 md:flex-wrap md:px-0" role="group" aria-label="Filtrar por familia olfativa">
            <FilterPill active={family === "todas"} onClick={() => setFamily("todas")}>
              Todas las familias
            </FilterPill>
            {families.map((f) => (
              <FilterPill key={f} active={family === f} onClick={() => setFamily(f)}>
                {f}
              </FilterPill>
            ))}
          </div>
        )}
      </div>

      {error ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <WarningCircle size={40} className="text-copper" aria-hidden="true" />
          <p className="max-w-[36ch] text-ink-muted">
            No pudimos cargar el catálogo. Revisá tu conexión y volvé a intentar.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="pressable rounded-full border border-line px-5 py-2.5 text-sm text-ink hover:border-copper"
          >
            Reintentar
          </button>
        </div>
      ) : loading ? (
        <ul className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5" aria-label="Cargando catálogo">
          {Array.from({ length: 6 }, (_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </ul>
      ) : filtered.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-4 text-center">
          <span
            aria-hidden="true"
            className="flex h-16 w-16 items-center justify-center rounded-full border border-line font-display text-2xl text-ink-faint"
          >
            ∅
          </span>
          <div>
            <p className="font-display text-xl">Nada con esa combinación</p>
            <p className="mt-1 max-w-[36ch] text-sm text-ink-muted">
              Probá con otra familia olfativa u otro género: el stock cambia seguido.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setGender("todos");
              setFamily("todas");
            }}
            className="pressable inline-flex items-center gap-2 rounded-full border border-line px-5 py-2.5 text-sm text-ink hover:border-copper"
          >
            <ArrowCounterClockwise size={16} weight="bold" />
            Limpiar filtros
          </button>
        </div>
      ) : (
        <>
          <p className="tnum mt-8 text-sm text-ink-muted" aria-live="polite">
            {filtered.length} {filtered.length === 1 ? "perfume" : "perfumes"}
            {hasFilters ? " con estos filtros" : " en stock"}
          </p>
          <ul ref={revealRef} className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} onOpen={onOpen} stagger={(i % 3) * 120} />
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
