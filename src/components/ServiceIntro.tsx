import { useEffect, useId, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play } from "lucide-react";
import { useLanguage } from "../language";
import { sectionHref } from "../navigation";
import { useServiceJourney } from "../hooks/useServiceJourney";
import { BusinessScene, InvitationScene } from "./ServiceScenes";
import "../styles/service-intro.css";
import "../styles/business-intro.css";

export function ServiceIntro({ event = false }: { event?: boolean }) {
  const english = useLanguage() === "en";
  const id = useId().replace(/:/g, "");
  const root = useRef<HTMLDivElement>(null);
  const pressTimer = useRef<number | undefined>(undefined);
  const [pressed, setPressed] = useState(false);
  const [paused, setPaused] = useState(false);
  const startJourney = useServiceJourney(root, paused);
  const explore = sectionHref(event ? "tipos-invitacion" : "universos");
  const exploreLabel = english ? (event ? "Explore invitations" : "Explore websites") : (event ? "Explorar invitaciones" : "Explorar ejemplos");
  const motionLabel = english ? (paused ? "Resume illustration" : "Pause illustration") : (paused ? "Activar ilustración" : "Pausar ilustración");
  const respond = () => {
    window.clearTimeout(pressTimer.current);
    setPressed(true);
    pressTimer.current = window.setTimeout(() => setPressed(false), 1000);
  };
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { element.dataset.inView = String(entry.isIntersecting); }, { threshold: .08 });
    observer.observe(element);
    const visibility = () => { element.dataset.hidden = String(document.hidden); if (document.hidden) setPressed(false); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); window.clearTimeout(pressTimer.current); };
  }, []);
  return <div ref={root} className={`service-intro service-intro-${event ? "invitation" : "business"}`} data-pressed={pressed} data-paused={paused}>
    <div className="service-intro-composition">
      <div className="service-intro-message">
      <div className="service-intro-heading">
        <p className="service-intro-eyebrow"><span aria-hidden="true"/>{english ? (event ? "DIGITAL INVITATIONS · NORDRA STUDIO" : "WEBSITES FOR BUSINESSES · NORDRA STUDIO") : (event ? "INVITACIONES DIGITALES · NORDRA STUDIO" : "PÁGINAS PARA NEGOCIOS · NORDRA STUDIO")}</p>
        <h1 id={event ? "celebrations-title" : "packages-title"}>
          <span>{english ? (event ? "The first detail" : "Your business,") : (event ? "El primer detalle" : "Tu negocio,")}</span>{" "}
          <em>{english ? (event ? "of your event." : "your own way.") : (event ? "de tu evento." : "a tu manera.")}</em>
        </h1>
      </div>
      <div className="service-intro-copy">
        <p className="service-intro-description">{english ? (event ? "Before the day, before the first photo: an invitation that feels like you. Designed to bring your people together." : "A website that feels like your brand. We bring design, content and interaction together so people can discover what makes your business yours.") : (event ? "Antes del gran día, antes de la primera foto: una invitación que ya se siente tuya. Diseñada para reunir a tu gente." : "Una página que se siente como tu marca. Unimos diseño, contenido e interacción para que las personas descubran lo que hace único a tu negocio.")}</p>
        <div className="service-intro-actions">
          <a className="service-intro-primary service-intro-explore" data-service-journey="examples" href={explore} onPointerDown={respond} onPointerCancel={() => setPressed(false)} onClick={startJourney}><span>{exploreLabel}</span><ArrowUpRight size={18} strokeWidth={1.5} aria-hidden="true"/></a>
          <a className="service-intro-secondary service-intro-explore" data-service-journey="packages" href={sectionHref(event ? "planes-eventos" : "opciones-negocio")} onPointerDown={respond} onPointerCancel={() => setPressed(false)} onClick={startJourney}><span>{english ? "View packages" : "Ver paquetes"}</span><ArrowDown size={16} strokeWidth={1.5} aria-hidden="true"/></a>
        </div>
      </div>
      </div>
      <figure className="service-intro-figure">
        <a className="service-intro-art service-intro-explore" data-service-journey="examples" href={explore} aria-label={exploreLabel} onPointerDown={respond} onPointerCancel={() => setPressed(false)} onClick={startJourney}>
          {event ? <InvitationScene id={id} english={english}/> : <BusinessScene id={id} english={english}/>}
        </a>
        <figcaption><span>{english ? (event ? "A GLIMPSE OF OUR WEDDING DEMO" : "FROM YOUR IDENTITY TO YOUR WEBSITE") : (event ? "UN FRAGMENTO DE NUESTRA DEMO DE BODA" : "DE TU IDENTIDAD A TU PÁGINA")}</span><button type="button" className="service-intro-motion" aria-label={motionLabel} title={motionLabel} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={12} aria-hidden="true"/> : <Pause size={12} aria-hidden="true"/>}</button></figcaption>
      </figure>
    </div>
    <div className="service-intro-foot"><p>{english ? (event ? "Weddings · Celebrations · Gatherings" : "Your identity. On every screen.") : (event ? "Bodas · Celebraciones · Encuentros" : "Tu esencia. En cada pantalla.")}</p><a href={sectionHref(event ? "temporada" : "alojamiento-negocios")}><span>{english ? (event ? "Seasonal invitations" : "Hosting & support") : (event ? "Invitaciones de temporada" : "Alojamiento y soporte")}</span><ArrowUpRight size={15} strokeWidth={1.4} aria-hidden="true"/></a></div>
  </div>;
}
