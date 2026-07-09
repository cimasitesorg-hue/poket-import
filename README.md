# Poket Import

Catálogo showcase mobile-first de perfumería importada. Sin backend: el sitio es 100% estático, el carrito vive en `localStorage` y la compra se cierra por WhatsApp con un mensaje prearmado.

**En vivo:** https://cimasitesorg-hue.github.io/poket-import/

**Stack:** Vite + React + TypeScript + Tailwind CSS v4 + Motion. Fuentes autohosteadas (Bodoni Moda + Jost vía Fontsource).

## Correr en local

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # build de producción en dist/
npm run preview    # servir el build localmente
```

## Cómo correr el scraper de Fragrantica

El scraper enriquece `src/data/products.json` con acordes, pirámide olfativa, género, año y perfumista desde fragantica.es.

```bash
npx playwright install chromium   # solo la primera vez
npm run enrich
```

Detalles importantes:

- Corre en **modo headed** (abre una ventana de Chromium): Fragrantica está detrás de Cloudflare y bloquea headless. No cierres la ventana mientras corre.
- Espera 3-5 segundos entre productos. Los 34 productos tardan unos 5-8 minutos.
- **Guardado incremental:** el JSON se escribe después de cada producto. Si se corta, re-corré `npm run enrich`: saltea los que ya tienen `"enriched": true`.
- Si un perfume no se encuentra o el match no es confiable, queda con `"enriched": false` y el sitio muestra "ficha en preparación". Nunca inventa datos.
- Para forzar el re-scrape de un producto, ponele `"enriched": false` (y `"fragranticaUrl": null` si querés que vuelva a buscar).

## Cómo agregar un producto nuevo

1. Abrí `src/data/products.json` y agregá una entrada al final con esta forma mínima:

```json
{
  "id": "marca-nombre-en-kebab",
  "brand": "Lattafa",
  "name": "Nombre del perfume",
  "ml": 100,
  "price": 45000,
  "searchQuery": "Lattafa Nombre del perfume",
  "enriched": false,
  "gender": null,
  "family": null,
  "year": null,
  "perfumer": null,
  "description": null,
  "accords": [],
  "notes": { "top": [], "heart": [], "base": [], "flat": [] },
  "fragranticaUrl": null,
  "image": null
}
```

2. Corré `npm run enrich` para completar la ficha desde Fragrantica.
3. Corré `npm run images` para bajar la foto de stock del frasco a `public/img/` (usa el ID de la URL de Fragrantica ya scrapeada; son fotos de terceros para el showcase). Correrlo siempre DESPUÉS de enrich, nunca a la vez.
4. Foto propia (recomendado a futuro): poné el archivo en `public/img/` y completá `"image": "/img/archivo.webp"`. Sin foto se muestra el placeholder con la inicial de la marca.

Los precios van en pesos, sin puntos: `62000` se muestra como `$62.000`. El género sale del scraping; la familia olfativa del filtro se deriva de los acordes en `src/lib/accords.ts`.

## Cómo cambiar el número de WhatsApp

Un solo lugar: `src/lib/whatsapp.ts`

```ts
export const WHATSAPP_NUMBER = "5491124678706";
```

Formato internacional, sin `+`, espacios ni guiones (así lo espera `wa.me`).

## Cómo deployar

Ya está en **GitHub Pages** con deploy automático: cada push a `main` dispara el workflow `.github/workflows/deploy.yml`, que construye y publica. No hay que hacer nada manual; en 1-2 min queda online en https://cimasitesorg-hue.github.io/poket-import/

`base: "./"` en `vite.config.ts` hace que el mismo build funcione tanto en esa URL de proyecto (subpath) como en un dominio propio servido desde la raíz.

**Conectar el dominio propio** (cuando lo compres): Settings → Pages → Custom domain, escribí el dominio y guardá. En tu proveedor de DNS: un registro `CNAME` de `www` → `cimasitesorg-hue.github.io`, y para el dominio raíz los 4 registros `A` de GitHub Pages (`185.199.108.153`, `.109.153`, `.110.153`, `.111.153`). GitHub crea el certificado HTTPS solo. No hace falta reconstruir: las rutas relativas ya funcionan desde la raíz.

**Verificar el build de Pages en local** (opcional): `npm run build && npm run serve:pages`, abrí http://localhost:4178/poket-import/ — reproduce el subpath de GitHub Pages.

Alternativa (Vercel/Netlify): importá el repo, preset Vite, build `npm run build`, output `dist`. No hay variables de entorno ni backend; el JSON de productos viaja dentro del build (cambiaste el stock → push y redeploya solo).

## Estructura

```
scripts/
  seed.mjs          # regenera el products.json base desde la lista de stock (¡pisa los datos enriquecidos!)
  enrich.ts         # scraper de Fragrantica (Playwright headed, guardado por merge)
  images.mjs        # baja las fotos de frasco a public/img/ (correr después de enrich)
  restore-urls.mjs  # re-fija las URLs de Fragrantica verificadas a mano
src/
  data/products.json   # la única fuente de datos del sitio
  lib/                 # carrito, formato ARS, colores de acordes, WhatsApp
  components/          # Hero, Catálogo, fichas (bottom sheets), carrito
```
