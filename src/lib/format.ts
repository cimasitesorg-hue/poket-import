/** Formato ARS: $62.000 (punto como separador de miles, sin decimales). */
export function formatARS(n: number): string {
  return "$" + Math.round(n).toLocaleString("es-AR", { maximumFractionDigits: 0 });
}
