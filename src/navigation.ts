import type { Occasion } from "./data/invitationOccasions";
const occasionRoutes: Record<string, Occasion> = { "/bodas.html": "wedding", "/cumpleanos.html": "birthday", "/eventos.html": "gathering" };
export const invitationOccasion = occasionRoutes[window.location.pathname];
export const isSeasonalPage = window.location.pathname.endsWith("temporada.html");
export const page = window.location.pathname.endsWith("negocios.html") ? "business" : (window.location.pathname.endsWith("invitaciones.html") || invitationOccasion || isSeasonalPage) ? "events" : "home";
export function sectionHref(id: string) {
  const occasionLinks: Record<string, string> = { bodas: "/bodas.html", cumpleanos: "/cumpleanos.html", encuentros: "/eventos.html" };
  if (id === "temporada") return isSeasonalPage ? "#temporada" : "/temporada.html";
  if (occasionLinks[id]) return occasionLinks[id];
  if ((invitationOccasion && id === "tipos-invitacion") || (isSeasonalPage && ["eventos", "tipos-invitacion", "event-experience", "planes-eventos", "comparar-paquetes"].includes(id))) return `/invitaciones.html#${id}`;
  const business = ["paquetes", "universos", "opciones-negocio", "alojamiento-negocios"];
  const events = ["eventos", "tipos-invitacion", "event-experience", "planes-eventos", "comparar-paquetes", "temporada"];
  const target = business.includes(id) ? "business" : events.includes(id) ? "events" : ["inicio", "nosotros"].includes(id) ? "home" : page;
  const path = target === "business" ? "/negocios.html" : target === "events" ? "/invitaciones.html" : "/";
  return target === page ? `#${id}` : `${path}#${id}`;
}
