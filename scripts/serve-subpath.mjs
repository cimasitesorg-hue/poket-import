// Sirve dist/ bajo el prefijo /poket-import/ para reproducir el entorno de
// GitHub Pages (proyecto en subpath) y verificar el build en el navegador.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { extname, join } from "node:path";

const DIST = fileURLToPath(new URL("../dist/", import.meta.url));
const PREFIX = "/poket-import/";
const TYPES = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".jpg":"image/jpeg", ".svg":"image/svg+xml", ".woff2":"font/woff2" };

createServer(async (req, res) => {
  let path = decodeURIComponent(new URL(req.url, "http://x").pathname);
  if (!path.startsWith(PREFIX)) { res.writeHead(302, { Location: PREFIX }); return res.end(); }
  let rel = path.slice(PREFIX.length) || "index.html";
  if (rel.endsWith("/")) rel += "index.html";
  try {
    const buf = await readFile(join(DIST, rel));
    res.writeHead(200, { "Content-Type": TYPES[extname(rel)] || "application/octet-stream" });
    res.end(buf);
  } catch {
    res.writeHead(404); res.end("404");
  }
}).listen(4178, () => console.log("subpath server en http://localhost:4178/poket-import/"));
