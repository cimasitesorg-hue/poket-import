import type { Accord } from "../types";
import { accordColor } from "../lib/accords";

/** Chips compactos para la card (máx 3 acordes). */
export function AccordChips({ accords, max = 3 }: { accords: Accord[]; max?: number }) {
  if (!accords.length) return null;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Acordes principales">
      {accords.slice(0, max).map((a) => {
        const color = accordColor(a.name);
        return (
          <li
            key={a.name}
            className="rounded-full px-2.5 py-0.5 text-xs lowercase"
            style={{
              color,
              background: `color-mix(in oklch, ${color} 14%, transparent)`,
            }}
          >
            {a.name}
          </li>
        );
      })}
    </ul>
  );
}

/** Barras con intensidad para el detalle: se pintan al aparecer (clip-path). */
export function AccordBars({ accords }: { accords: Accord[] }) {
  if (!accords.length) return null;
  const maxIntensity = Math.max(...accords.map((a) => a.intensity));
  return (
    <ul className="flex flex-col gap-2" aria-label="Acordes principales con intensidad">
      {accords.slice(0, 8).map((a, i) => {
        const color = accordColor(a.name);
        const width = Math.max(24, Math.round((a.intensity / maxIntensity) * 100));
        return (
          <li key={a.name} className="relative h-7">
            <span
              className="accord-fill absolute inset-y-0 left-0 flex items-center rounded-full px-3"
              style={
                {
                  width: `${width}%`,
                  minWidth: "fit-content",
                  background: `color-mix(in oklch, ${color} 22%, var(--color-surface))`,
                  "--i": i,
                } as React.CSSProperties
              }
            >
              <span className="text-xs lowercase whitespace-nowrap" style={{ color }}>
                {a.name}
              </span>
            </span>
          </li>
        );
      })}
    </ul>
  );
}
