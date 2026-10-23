import { sectionHref } from "../navigation";
import { useLanguage } from "../language";

export function ServiceRoute({ event = false }: { event?: boolean }) {
  const english = useLanguage() === "en";
  const links = event
    ? [["event-experience", "Ver ejemplo", "See example"], ["planes-eventos", "Ver paquetes", "View packages"], ["temporada", "De temporada", "Seasonal"]]
    : [["universos", "Ver ejemplos", "See examples"], ["opciones-negocio", "Ver paquetes", "View packages"], ["alojamiento-negocios", "Alojamiento", "Hosting"]];
  return <nav className="service-route" aria-label={english ? (event ? "Explore invitations" : "Explore websites") : (event ? "Explora invitaciones" : "Explora páginas web")}>
    {links.map(([id, es, en]) => <a key={id} href={sectionHref(id)}>{english ? en : es}<span aria-hidden="true">↗</span></a>)}
  </nav>;
}

export function ServiceNext() {
  const english = useLanguage() === "en";
  return <div className="service-next"><p>{english ? "Found an option for your idea?" : "¿Encontraste una opción para tu idea?"}</p><a href={sectionHref("proceso")}>{english ? "How to get started" : "Cómo empezar"}<span aria-hidden="true">→</span></a><a href={sectionHref("contacto")}>{english ? "Talk to Nordra" : "Platicar con Nordra"}<span aria-hidden="true">↗</span></a></div>;
}
