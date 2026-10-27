import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  build: { rollupOptions: { input: { home: "index.html", business: "negocios.html", invitations: "invitaciones.html", weddings: "bodas.html", weddingPanel: "panel-boda.html", weddingClient: "mi-boda.html", weddingInvitation: "invitacion-boda.html", weddingIvory: "invitaciones/valentina-y-sebastian/index.html", weddingPass: "pase-boda.html", weddingReception: "recepcion-boda.html", birthdays: "cumpleanos.html", events: "eventos.html" } } },
  plugins: [react(), tailwindcss()],
});
