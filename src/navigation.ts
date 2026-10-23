export const page = window.location.pathname.endsWith("negocios.html") ? "business" : window.location.pathname.endsWith("invitaciones.html") ? "events" : "home";
export function sectionHref(id: string) {
  const business = ["paquetes", "universos", "opciones-negocio", "alojamiento-negocios"];
  const events = ["eventos", "tipos-invitacion", "event-experience", "planes-eventos", "temporada"];
  const target = business.includes(id) ? "business" : events.includes(id) ? "events" : ["inicio", "nosotros"].includes(id) ? "home" : page;
  const path = target === "business" ? "/negocios.html" : target === "events" ? "/invitaciones.html" : "/";
  return target === page ? `#${id}` : `${path}#${id}`;
}
