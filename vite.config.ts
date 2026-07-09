import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  // Rutas relativas: el mismo build funciona en la URL de GitHub Pages
  // (usuario.github.io/poket-import/) y en el dominio propio servido desde
  // la raíz. Al conectar el dominio no hace falta reconstruir.
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // accesible desde el celular en la misma red Wi-Fi
  },
});
