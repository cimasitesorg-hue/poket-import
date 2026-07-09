# PRODUCT.md — Poket Import

**Qué es:** catálogo showcase de perfumería árabe importada. El objetivo es una sola conversión: que la persona vea el catálogo, se enamore de un perfume y cierre el pedido por WhatsApp. No hay pasarela de pago ni backend.

**Audiencia:** compradores argentinos que llegan casi 100% desde Instagram/WhatsApp en un celular gama media con 3G/4G. Diseño mobile-first a 375px.

**Register:** brand (el diseño ES el producto: la web tiene que vender la sensación de perfume importado premium).

**Conversión:** carrito persistente → paso de confirmación → `wa.me/5491124678706` con pedido prearmado.

**Datos:** `src/data/products.json`, enriquecido desde Fragrantica con `npm run enrich`. Nunca inventar datos olfativos: producto sin ficha = `enriched: false` y la UI lo dice.

**Restricciones:** español rioplatense, contraste AA, `prefers-reduced-motion` respetado sin excepción, LCP < 2.5s, CLS < 0.1, animaciones solo transform/opacity.
