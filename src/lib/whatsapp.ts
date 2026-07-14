import type { Product } from "../types";
import { formatARS } from "./format";

/** Número en formato internacional, sin +, espacios ni guiones (como lo espera wa.me). */
export const WHATSAPP_NUMBER = "5491124678706";

export interface OrderLine {
  product: Product;
  qty: number;
}

export function buildOrderText(lines: OrderLine[]): string {
  const rows = lines.map(
    ({ product, qty }) =>
      `${qty}x ${product.brand} ${product.name} (${product.ml}ml) - ${formatARS(product.price * qty)}`,
  );
  const total = lines.reduce((sum, l) => sum + l.product.price * l.qty, 0);
  return [
    "¡Hola Poket Import! Quiero hacer este pedido:",
    "",
    ...rows,
    "",
    `Total: ${formatARS(total)}`,
  ].join("\n");
}

/** encodeURIComponent convierte los \n en %0A, que es lo que espera wa.me. */
export function buildWaLink(lines: OrderLine[]): string {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildOrderText(lines))}`;
}

/** Para productos sin stock: pedir aviso de reingreso. */
export function buildNotifyLink(product: Product): string {
  const text = `¡Hola Poket Import! ¿Me avisás cuando vuelva ${product.brand} ${product.name} (${product.ml}ml)?`;
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}
