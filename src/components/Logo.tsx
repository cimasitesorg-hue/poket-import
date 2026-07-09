/**
 * Logo Poket Import recreado en SVG vectorial (mismas fuentes del sitio):
 * monograma P+I superpuestos en Bodoni + "POKET IMPORT" en arco.
 * Toma el color vía currentColor y anima por partes al montar
 * (clases logo-* definidas en index.css, con reduced-motion cubierto).
 */
export function Logo({
  variant = "full",
  className = "",
  animated = false,
}: {
  variant?: "full" | "mark";
  className?: string;
  animated?: boolean;
}) {
  const a = (name: string) => (animated ? name : "");

  if (variant === "mark") {
    return (
      <svg viewBox="60 70 105 120" className={className} aria-hidden="true" fill="currentColor">
        <text x="88" y="152" textAnchor="middle" fontFamily="var(--font-display)" fontSize="104" fontWeight="500">
          P
        </text>
        <text x="132" y="186" textAnchor="middle" fontFamily="var(--font-display)" fontSize="104" fontWeight="500">
          I
        </text>
      </svg>
    );
  }

  return (
    <svg viewBox="20 10 180 185" className={className} role="img" aria-label="Poket Import" fill="currentColor">
      <defs>
        <path id="pi-arc" d="M 48 102 A 66 66 0 0 1 172 102" fill="none" />
      </defs>
      <text className={a("logo-p")} x="94" y="152" textAnchor="middle" fontFamily="var(--font-display)" fontSize="104" fontWeight="500">
        P
      </text>
      <text className={a("logo-i")} x="140" y="186" textAnchor="middle" fontFamily="var(--font-display)" fontSize="104" fontWeight="500">
        I
      </text>
      <text className={a("logo-arc")} fontFamily="var(--font-body)" fontSize="14.5" fontWeight="500" letterSpacing="4.5">
        <textPath href="#pi-arc" startOffset="50%" textAnchor="middle">
          POKET IMPORT
        </textPath>
      </text>
    </svg>
  );
}
