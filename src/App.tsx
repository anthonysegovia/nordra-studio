import { useEffect, useLayoutEffect } from "react";
import { page, invitationOccasion, isSeasonalPage } from "./navigation";
import { getOccasions } from "./data/invitationOccasions";
import { HomePreview } from "./sections/HomePreview";
import { sectionHref } from "./navigation";
import { Header } from "./components/layout/Header";
import { Hero } from "./sections/Hero";
import { Seasonal } from "./sections/Seasonal";
import { About } from "./sections/About";
import { Packages } from "./sections/Packages";
import { InvitationHub, OccasionPage, InvitationClosing, OccasionNavigation } from "./sections/InvitationJourney";
import { Footer } from "./components/layout/Footer";
import { ScrollAurora } from "./components/layout/ScrollAurora";
import { Payment } from "./sections/Payment";
import { AdminPayments } from "./sections/AdminPayments";
import { AdminPosada } from "./sections/AdminPosada";
import { MobileNavigation } from "./components/layout/MobileNavigation";
import { useLanguage } from "./language";
import { Process } from "./sections/Process";

export default function App() {
  const language = useLanguage();
  const panel = new URLSearchParams(window.location.search).get("panel");
  useEffect(() => {
    if (panel !== null || new URLSearchParams(window.location.search).has("pago")) return;
    const id = window.location.hash.slice(1);
    const href = id && sectionHref(id);
    if (href && !href.startsWith("#")) { window.location.replace(href); return; }
    document.title = language === "en" ? (page === "business" ? "Business websites | Nordra Studio" : page === "events" ? "Digital invitations | Nordra Studio" : "Nordra Studio | Websites & invitations") : (page === "business" ? "Páginas para negocios | Nordra Studio" : page === "events" ? "Invitaciones digitales | Nordra Studio" : "Nordra Studio | Páginas web e invitaciones");
    if (isSeasonalPage) document.title = `${language === "en" ? "Seasonal digital invitations" : "Invitaciones de temporada"} | Nordra Studio`;
    if (invitationOccasion) {
      const occasion = getOccasions(language === "en").find(item => item.id === invitationOccasion)!;
      document.title = `${language === "en" ? `Digital invitations for ${occasion.label.toLowerCase()}` : `Invitaciones para ${occasion.label.toLowerCase()}`} | Nordra Studio`;
    }
  }, [language, panel]);
  useLayoutEffect(() => {
    if (panel !== null || new URLSearchParams(window.location.search).has("pago")) return;
    // Preserve the browser's saved position on Back/Forward; only new visits
    // and reloads need an anchor positioned after React has mounted it.
    const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    if (navigation?.type === "back_forward") return;
    const id = window.location.hash.slice(1);
    if (id) document.getElementById(id)?.scrollIntoView({ behavior: "instant" });
  }, []);
  if (panel === "posada") return <AdminPosada />;
  if (panel !== null) return <AdminPayments demoMode={panel === "demo"} />;
  const paymentToken = new URLSearchParams(window.location.search).get("pago");
  if (paymentToken !== null) return <Payment token={paymentToken} />;
  return (
    <div id="page-top" className={`min-h-screen text-foreground aurora-page journey-${page}${page === "events" ? ` invitation-journey journey-${invitationOccasion ?? (isSeasonalPage ? "seasonal" : "hub")}` : ""}`}>
      {page !== "events" && <ScrollAurora />}
      <a className="skip-link" href={sectionHref("contenido")}>{language === "en" ? "Skip to content" : "Saltar al contenido"}</a>
      <Header />
      <main id="contenido" tabIndex={-1}>
        {page === "business" && <nav className="site-shell journey-switch" aria-label={language === "en" ? "Service navigation" : "Navegación de servicios"}><a href="/">{language === "en" ? "← Home" : "← Inicio"}</a><a href={page === "business" ? "/invitaciones.html" : "/negocios.html"}>{language === "en" ? (page === "business" ? "Looking for invitations? ↗" : "Looking for a business website? ↗") : (page === "business" ? "¿Buscas invitaciones? ↗" : "¿Buscas una página para tu negocio? ↗")}</a></nav>}
        {page === "home" && <><Hero /><HomePreview /><About /></>}
        {page === "business" && <Packages />}
        {page === "events" && (invitationOccasion ? <OccasionPage occasion={invitationOccasion} /> : isSeasonalPage ? <><OccasionNavigation english={language === "en"} current="seasonal" /><Seasonal /></> : <InvitationHub />)}
        {page !== "events" && <Process />}
      </main>
      {page === "events" ? <InvitationClosing occasion={invitationOccasion} /> : <Footer />}
      <MobileNavigation />
    </div>
  );
}
