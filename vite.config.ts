import { defineConfig } from "vite";
import { commercialPreview } from "./build/commercial-preview.mjs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { invitationMoney, invitationOffers } from "./src/data/invitationPricing";
import { siteScripts } from "./build/site-scripts.mjs";

export default defineConfig({
  build: { rollupOptions: { output: { manualChunks: id => id.includes("/node_modules/three/") ? "three" : undefined }, input: { home: "index.html", management: "gestion.html", studio: "estudio.html", business: "negocios.html", invitations: "invitaciones.html", weddings: "bodas.html", weddingPanel: "panel-boda.html", weddingClient: "mi-boda.html", weddingInvitation: "invitacion-boda.html", weddingIvory: "invitaciones/valentina-y-sebastian/index.html", weddingPass: "pase-boda.html", weddingReception: "recepcion-boda.html", birthdays: "cumpleanos.html", events: "eventos.html", seasonal: "temporada.html" } } },
  plugins: [commercialPreview(), siteScripts(), react(), tailwindcss(), {
    name: "nordra-marketing-pricing",
    transformIndexHtml(html) {
      return html.replace(/\{\{offer:(aurora|boreal):(opening|regular)\}\}/g, (_, id, kind) => {
        const offer = invitationOffers.find(item => item.id === id)!;
        return (offer.startingAt ? "Desde " : "") + invitationMoney(kind === "regular" ? offer.regularCents : offer.cents);
      });
    },
  }],
});
