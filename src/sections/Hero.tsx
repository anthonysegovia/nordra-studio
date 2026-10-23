import { useEffect, useRef, useState } from "react";
import { sectionHref } from "../navigation";
import { useLanguage } from "../language";
import { ArrowDown, ArrowUpRight, Pause, Play, PanelsTopLeft, Mail } from "lucide-react";
import "../styles/hero.css";

type Destination = "business" | "invitation" | null;

export function Hero() {
  const language = useLanguage();
  const english = language === "en";
  const root = useRef<HTMLElement>(null);
  const pressTimer = useRef<number | undefined>(undefined);
  const [hovered, setHovered] = useState<Destination>(null);
  const [focused, setFocused] = useState<Destination>(null);
  const [pressed, setPressed] = useState<Destination>(null);
  const [paused, setPaused] = useState(false);
  const active = pressed ?? focused ?? hovered;
  const motionLabel = english ? (paused ? "Resume the opening light" : "Pause the opening light") : (paused ? "Activar la luz del inicio" : "Pausar la luz del inicio");
  const press = (destination: Destination) => {
    window.clearTimeout(pressTimer.current);
    setPressed(destination);
    pressTimer.current = window.setTimeout(() => setPressed(null), 1000);
  };
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => { section.dataset.inView = String(entry.isIntersecting); }, { threshold: .08 });
    observer.observe(section);
    const clearHover = () => setHovered(null);
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    pointer.addEventListener("change", clearHover);
    const visibility = () => { section.dataset.hidden = String(document.hidden); if (document.hidden) { setHovered(null); setPressed(null); } };
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); window.clearTimeout(pressTimer.current); pointer.removeEventListener("change", clearHover); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return (
    <section ref={root} id="inicio" className="hero-section hero-refinement hero-opening" aria-labelledby="hero-title" data-destination={active ?? "rest"} data-paused={paused}>
      <div className="opening-atmosphere" aria-hidden="true"><span className="opening-light-business"/><span className="opening-light-invitation"/></div>
      <div className="site-shell opening-stage">
        <div className="opening-topline">
          <p>{english ? "DIGITAL DESIGN STUDIO · MONTERREY, MEXICO" : "ESTUDIO DE DISEÑO DIGITAL · MONTERREY, MÉXICO"}</p>
          <button className="opening-motion" type="button" aria-label={motionLabel} title={motionLabel} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} aria-hidden="true"/> : <Pause size={13} aria-hidden="true"/>}</button>
        </div>
        <div className="opening-art" aria-hidden="true">
          <svg className="opening-horizon" viewBox="0 0 1200 400" fill="none" focusable="false">
            <defs><linearGradient id="opening-spectrum"><stop stopColor="var(--hero-teal)" stopOpacity="0"/><stop offset=".28" stopColor="var(--hero-teal)"/><stop offset=".7" stopColor="var(--hero-lilac)"/><stop offset="1" stopColor="var(--hero-lilac)" stopOpacity="0"/></linearGradient></defs>
            <g className="opening-contours" stroke="url(#opening-spectrum)">
              <path d="M-40 210C166 210 196 314 420 333C690 356 925 308 1235 170"/>
              <path d="M-40 228C166 228 196 332 420 351C690 374 925 326 1235 188"/>
              <path d="M-40 246C166 246 196 350 420 369C690 392 925 344 1235 206"/>
              <ellipse cx="600" cy="229" rx="444" ry="114" transform="rotate(-10 600 229)"/>
            </g>
            <path className="opening-trail opening-trail-business" pathLength="100" d="M42 227C228 228 289 310 460 329C522 336 565 333 600 328"/>
            <path className="opening-trail opening-trail-invitation" pathLength="100" d="M1158 198C996 271 799 340 600 328"/>
            <g className="opening-pin opening-pin-business"><circle cx="270" cy="171" r="3"/><path d="M270 152V158M270 184V190M251 171H257M283 171H289"/></g>
            <g className="opening-pin opening-pin-invitation"><circle cx="956" cy="219" r="2.5"/><path d="M956 202V207M956 231V236M939 219H944M968 219H973"/></g>
          </svg>
          <div className="opening-symbol-response"><div className="opening-symbol"><img src="/nordra-isotype-transparent.webp" alt="" width={1536} height={807} fetchPriority="high"/></div></div>
          <span className="opening-art-label opening-art-label-business">{english ? "YOUR BRAND" : "TU MARCA"}</span>
          <span className="opening-art-label opening-art-label-invitation">{english ? "YOUR MOMENT" : "TU MOMENTO"}</span>
        </div>
        <div className="opening-copy">
          <h1 id="hero-title"><span>{english ? "We create web experiences" : "Creamos experiencias web"}</span>{" "}<span>{english ? "for " : "para "}<span className="opening-title-accent">{english ? "businesses and events" : "negocios y eventos"}</span></span></h1>
          <p><span className="opening-offer"><span>{english ? "Websites for what you do." : "Páginas web para lo que haces."}</span>{" "}<span>{english ? "Invitations for what you celebrate." : "Invitaciones para lo que celebras."}</span></span><span>{english ? "Designed to feel like you, down to the last detail." : "Diseñadas para sentirse tuyas, hasta el último detalle."}</span></p>
        </div>
        <div className="opening-actions" role="group" aria-label={english ? "Choose your project" : "Elige tu proyecto"}>
            {(["business", "invitation"] as const).map(destination => <a key={destination} href={sectionHref(destination === "business" ? "paquetes" : "eventos")} className={destination === "business" ? "primary-cta" : "secondary-cta"} data-hero-destination={destination}
              onPointerEnter={event => { if (event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) { setFocused(null); setHovered(destination); } }} onPointerLeave={() => setHovered(null)}
              onPointerDown={event => { if (event.button === 0) press(destination); }} onPointerCancel={() => { setHovered(null); setPressed(null); }}
              onFocus={event => { if (event.currentTarget.matches(":focus-visible")) { setHovered(null); setFocused(destination); } }} onBlur={() => setFocused(null)} onClick={() => press(destination)}>
              <span className="opening-action-symbol" aria-hidden="true">{destination === "business" ? <PanelsTopLeft size={21} strokeWidth={1.3}/> : <Mail size={21} strokeWidth={1.3}/>}</span>
              <span className="opening-action-label"><small>{destination === "business" ? (english ? "FOR YOUR BUSINESS" : "PARA TU NEGOCIO") : (english ? "FOR YOUR EVENT" : "PARA TU EVENTO")}</small><strong>{destination === "business" ? (english ? "I want a website" : "Quiero una página\u00a0web") : (english ? "I want an invitation" : "Quiero una invitación")}</strong></span><ArrowUpRight className="opening-action-arrow" size={18} strokeWidth={1.5} aria-hidden="true" />
            </a>)}
        </div>
        <div className="opening-grounding">
          <p><span>{english ? "Designed with you" : "Diseñado contigo"}</span><i aria-hidden="true"/><span>{english ? "Made to measure" : "Hecho a medida"}</span><i aria-hidden="true"/><span>{english ? "Direct contact" : "Trato directo"}</span></p>
          <a href="#elige-tu-camino"><span>{english ? "Discover Nordra" : "Descubre Nordra"}</span><ArrowDown size={17} strokeWidth={1.4} aria-hidden="true"/></a>
        </div>
      </div>
    </section>
  );
}
