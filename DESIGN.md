# DESIGN.md — Poket Import

**Dirección:** "attar de noche". Dark luxury cálido, un solo tema (oscuro), serif display grande, mucho aire. La calidez vive en el acento cobre y en los tintes por acorde, no en fondos crema.

## Tokens (definidos en src/index.css con @theme, todo en OKLCH)

Colorimetría: neutrales tintados hacia el hue del cobre (55°) con croma 0.006-0.014; el acento se escala por pasos de luminosidad perceptual. Nunca volver a hex a ojo: cualquier color nuevo se define eligiendo L/C/H sobre esta lógica.

| Token | Valor | Uso |
| --- | --- | --- |
| `bg` | `oklch(0.135 0.008 55)` | fondo de página |
| `surface` | `oklch(0.205 0.01 55)` | cards, sheets |
| `surface-2` | `oklch(0.255 0.012 55)` | bloques dentro de sheets |
| `line` | `oklch(0.32 0.014 55)` | bordes, divisores |
| `ink` | `oklch(0.975 0.004 55)` | texto principal |
| `ink-muted` | `oklch(0.73 0.014 55)` | texto secundario, metadatos, labels (AA sobre bg y surfaces) |
| `ink-faint` | `oklch(0.56 0.014 55)` | SOLO decorativo aria-hidden e íconos ≥3:1; nunca texto informativo |
| `copper` | `oklch(0.75 0.125 55)` | acento único: CTAs, precios, badge |
| `copper-deep` | `oklch(0.66 0.13 55)` | hover/pressed del acento |
| `danger` | `oklch(0.72 0.15 25)` | quitar/eliminar |

Acordes olfativos (`src/lib/accords.ts`): grilla perceptual fija, L ∈ [0.66, 0.88] (piso 0.66 = ≥3:1 sobre surfaces), C ∈ [0.02, 0.13], el HUE carga el significado (cítrico 95°, amaderado 65°, acuático 220°...). Todos los chips pesan igual visualmente. Las mezclas siempre con `color-mix(in oklch, ...)` y contra `var(--color-*)`, nunca hex literales.

## Tipografía

- Display: **Bodoni Moda Variable** (h1-h3, nombres de perfume, precios grandes).
- Body/UI: **Jost Variable**, base 16px.
- Precios y cantidades siempre con `.tnum` (tabular-nums).

## Forma y espaciado

- Escala 4px. Secciones `py-16` mobile / `py-24` desktop.
- Radios: cards 16px (`rounded-2xl`), sheets 24px arriba (`rounded-t-3xl`), botones y chips pill. Ese es el sistema completo: no mezclar otros radios.
- Tap targets ≥ 44px (`min-h-11` o más en todo lo tocable).

## Motion

- Easing global `--ease-out-expo: cubic-bezier(0.16,1,0.3,1)`; sheets con `--ease-drawer: cubic-bezier(0.32,0.72,0,1)`. En Tailwind: utilidades `ease-out-expo` / `ease-drawer`. En Motion (JS): importar de `src/lib/motion.ts` (única fuente, no repetir arrays).
- Micro-interacciones 150-300ms; sheets 450ms. Transform/opacity + blur chico puntual.
- `.pressable` = scale(0.97) en :active, en todo lo presionable. `touch-action: manipulation` global en a/button.
- Todo animado degrada con `prefers-reduced-motion` (crossfade o nada), incluido `scroll-behavior: smooth`.
- Piezas: stagger del hero y logo por partes (CSS puro), scroll reveal con IntersectionObserver, shared element card→sheet (`layoutId`) + stagger interno `.sheet-in`, barras de acordes con clip-path, badge del carrito con spring, carrito con salida FLIP de ítems + transición direccional carrito↔confirmación + tick del subtotal, morph con blur del botón Agregar, zoom 1.04 de foto en hover (solo desktop).

## Accesibilidad de los sheets

`Sheet.tsx` es el único primitivo de modal: foco al panel al abrir, Tab contenido (trap), Escape y swipe-down para cerrar, foco devuelto al trigger al cerrar, `aria-modal` + `aria-label`. No crear otros modales por fuera.
