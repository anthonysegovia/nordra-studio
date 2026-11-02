import { commercialLocales } from './build/commercial-locales.mjs';
import { commercialTypeFloor } from './build/commercial-type.mjs';
import { occasionContentPlugin } from './build/occasion-content.mjs';
import { businessContentPlugin } from "./build/business-content.mjs";
import { businessOffersPlugin } from "./build/business-offers.mjs";
import { mobileWhatsApp } from "./build/mobile-whatsapp.mjs";
import { invitationOffersPlugin } from "./build/invitation-offers.mjs";
import { renderHomeClientHighlights } from "./build/client-cases.mjs";
import { seasonalPagePlugin } from "./build/seasonal-page.mjs";
import { defineConfig } from "vite";
import { commercialPreview } from "./build/commercial-preview.mjs";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { siteScripts } from "./build/site-scripts.mjs";
import { siteStyles } from "./build/site-styles.mjs";

export default defineConfig({
  css: { postcss: { plugins: [commercialTypeFloor()] } },
  build: { rollupOptions: { output: { manualChunks: id => id.includes("/node_modules/three/") ? "three" : undefined }, input: { home: "index.html", englishHome: "en/index.html", management: "gestion.html", studio: "estudio.html", business: "negocios.html", invitations: "invitaciones.html", weddings: "bodas.html", weddingPanel: "panel-boda.html", weddingClient: "mi-boda.html", weddingInvitation: "invitacion-boda.html", birthdayInvitation: "invitaciones/sofia-25/index.html", eventInvitation: "invitaciones/conexion-27/index.html", weddingIvory: "invitaciones/valentina-y-sebastian/index.html", weddingPass: "pase-boda.html", weddingReception: "recepcion-boda.html", birthdays: "cumpleanos.html", events: "eventos.html", seasonal: "temporada.html" } } },
  plugins: [
    commercialLocales(),
    { name: "nordra-home-client-highlights", transformIndexHtml: { order: "pre", handler: html => renderHomeClientHighlights(html) } },
    occasionContentPlugin(), seasonalPagePlugin(), businessContentPlugin(), businessOffersPlugin(), invitationOffersPlugin(), {name:"mobile-whatsapp",transformIndexHtml:{order:"pre",handler:html=>mobileWhatsApp(html)}}, commercialPreview(), siteScripts(), siteStyles(), react(), tailwindcss()
  ],
});
