import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: { rollupOptions: { input: { home: "index.html", business: "negocios.html", invitations: "invitaciones.html" } } },
  plugins: [react(), tailwindcss()],
});
