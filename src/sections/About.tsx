import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { sectionHref } from "../navigation";
import { t, useLanguage } from "../language";
import "../styles/about.css";

const intentions = ["listen", "shape", "connect"] as const;
const ridge = "M26 218C173 239 325 239 422 176L536 85Q546 77 555 87L608 138L666 64Q674 53 683 66L798 177C916 253 1054 248 1174 204";

function StorySignature() {
  return <svg className="story-signature" viewBox="0 0 1200 300" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="story-spectrum" x1="150" y1="210" x2="1050" y2="160" gradientUnits="userSpaceOnUse"><stop stopColor="var(--story-cyan)" stopOpacity=".1" /><stop offset=".27" stopColor="var(--story-cyan)" /><stop offset=".54" stopColor="var(--story-blue)" /><stop offset=".73" stopColor="var(--story-lilac)" /><stop offset="1" stopColor="var(--story-lilac)" stopOpacity=".08" /></linearGradient>
      <linearGradient id="story-silk" x1="350" y1="80" x2="850" y2="245" gradientUnits="userSpaceOnUse"><stop stopColor="var(--story-cyan)" stopOpacity=".03" /><stop offset=".42" stopColor="var(--story-cyan)" stopOpacity=".18" /><stop offset=".64" stopColor="var(--story-blue)" stopOpacity=".3" /><stop offset="1" stopColor="var(--story-lilac)" stopOpacity=".02" /></linearGradient>
      <radialGradient id="story-aura"><stop stopColor="var(--story-blue)" stopOpacity=".13" /><stop offset="1" stopColor="var(--story-blue)" stopOpacity="0" /></radialGradient>
    </defs>
    <ellipse className="story-aura" cx="614" cy="153" rx="400" ry="148" fill="url(#story-aura)" />
    <g className="story-silk-response"><g className="story-silk-drift">
      <path d="M26 218C173 239 325 239 422 176L536 85Q546 77 555 87L608 138L666 64Q674 53 683 66L798 177C916 253 1054 248 1174 204C1042 278 908 270 790 200L681 95Q673 86 666 97L611 164L551 113Q544 106 534 114L427 197C322 263 169 251 26 218Z" fill="url(#story-silk)" />
      <path d={ridge} stroke="url(#story-spectrum)" strokeWidth="1.7" />
      <path d="M68 231C218 256 332 245 430 189L539 103Q546 97 553 104L610 153L667 82Q674 73 681 83L793 189C905 261 1047 270 1134 225" stroke="url(#story-spectrum)" strokeOpacity=".38" />
      <path d="M119 240C242 260 345 253 437 204L538 123Q546 116 553 123L612 172L667 103Q674 95 681 105L788 207C897 273 1021 278 1091 244" stroke="url(#story-spectrum)" strokeOpacity=".17" />
      <path className="story-ridge-light" d={ridge} pathLength="100" stroke="url(#story-spectrum)" strokeWidth="2.4" strokeLinecap="round" strokeDasharray="7 93" />
    </g></g>
    <g className="story-strand story-strand-listen" stroke="var(--story-cyan)">
      <path d="M114 207C244 220 344 206 433 151L531 70Q546 57 560 72L590 101" strokeOpacity=".55" /><path d="M152 195C263 202 352 185 425 142L518 66" strokeOpacity=".2" />
      <path className="story-connection" d="M330 224C296 256 198 230 198 290" /><circle className="story-endpoint" cx="198" cy="290" r="3" fill="var(--story-cyan)" stroke="none" />
    </g>
    <g className="story-strand story-strand-shape" stroke="var(--story-blue)">
      <path d="M456 164L538 95Q546 88 554 96L610 146L667 74Q674 65 682 76L760 152" strokeOpacity=".55" /><path d="M477 157L540 110Q546 105 553 112L611 161L667 92Q674 84 681 94L742 152" strokeOpacity=".2" />
      <path className="story-connection" d="M610 187C642 233 600 244 600 290" /><circle className="story-endpoint" cx="600" cy="290" r="3" fill="var(--story-blue)" stroke="none" />
    </g>
    <g className="story-strand story-strand-connect" stroke="var(--story-lilac)">
      <path d="M705 103L793 160C887 224 997 228 1101 195" strokeOpacity=".55" /><path d="M741 115L800 150C887 204 979 211 1058 183" strokeOpacity=".2" />
      <path className="story-connection" d="M879 224C910 263 1002 230 1002 290" /><circle className="story-endpoint" cx="1002" cy="290" r="3" fill="var(--story-lilac)" stroke="none" />
    </g>
    <g className="story-summit" transform="translate(674 38)"><path d="M0-9C1-2 2-1 9 0C2 1 1 2 0 9C-1 2-2 1-9 0C-2-1-1-2 0-9Z" fill="var(--story-blue)" /><circle r="18" stroke="var(--story-blue)" strokeOpacity=".13" /></g>
    <g className="story-dust" fill="var(--story-cyan)"><circle cx="350" cy="146" r="1.4" /><circle cx="476" cy="50" r="1" /><circle cx="845" cy="110" r="1.6" /><circle cx="929" cy="177" r="1" /></g>
  </svg>;
}

function IntentionMark({ intention }: { intention: typeof intentions[number] }) {
  return <svg className={`story-intention-mark story-mark-${intention}`} viewBox="0 0 64 40" fill="none" aria-hidden="true" focusable="false">
    {intention === "listen" ? <><path d="M4 23C15 23 14 11 25 11S35 29 46 29S55 17 60 17" /><path d="M4 29C15 29 14 17 25 17S35 35 46 35S55 23 60 23" opacity=".3" /><circle cx="25" cy="11" r="2.5" /></> : intention === "shape" ? <><path d="M5 29L24 10L34 22L44 5L60 29" /><path d="M5 35L24 16L34 28L44 11L60 35" opacity=".3" /><circle cx="44" cy="5" r="2.5" /></> : <><path d="M4 24C18 6 46 6 60 24M4 24C18 39 46 39 60 24" /><path d="M4 24H60" opacity=".3" /><circle cx="32" cy="24" r="2.5" /></>}
  </svg>;
}

export function About() {
  const english = useLanguage() === "en";
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const [inviting, setInviting] = useState(false);
  const active = hovered ?? focused ?? selected;
  const motionLabel = english ? (paused ? "Resume the threads of light" : "Pause the threads of light") : (paused ? "Activar los hilos de luz" : "Pausar los hilos de luz");
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => { section.dataset.inView = String(entry.isIntersecting); }, { threshold: .08 });
    observer.observe(section);
    const clearHover = () => { setHovered(null); setInviting(false); };
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    pointer.addEventListener("change", clearHover);
    const visibility = () => { section.dataset.hidden = String(document.hidden); if (document.hidden) clearHover(); };
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); pointer.removeEventListener("change", clearHover); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const principles = [
    ["Empezamos escuchándote", "Queremos conocer tu idea y lo que la hace especial para encontrar juntos cómo contarla."],
    ["Cuidamos lo que te representa", "Los colores, las palabras y cada detalle deben sentirse como parte de tu historia."],
    ["Lo hacemos fácil de disfrutar", "Un sitio bonito y sencillo de recorrer, para que las personas conecten con lo que haces."],
  ];
  return <section ref={root} id="nosotros" className="section about-section about-story" lang={english ? "en" : "es"} aria-labelledby="about-title" data-active-intention={active === null ? "rest" : intentions[active]} data-paused={paused} data-inviting={inviting}>
    <div className="site-shell story-shell">
      <div className="story-topline"><p className="eyebrow">{t("QUIÉNES SOMOS")}</p><div className="story-origin"><span aria-hidden="true" />{english ? "MONTERREY, MEXICO" : "MONTERREY, MÉXICO"}</div></div>
      <div className="story-intro">
        <div className="story-heading"><h2 id="about-title">{t("Tu idea tiene")}<br /><span>{t("una historia.")}</span></h2><p className="story-note">{t("Nos gustaría conocerla.")}</p></div>
        <div className="story-copy"><p>{english ? "From Monterrey, Nuevo León, we create websites and digital invitations for businesses and celebrations in Mexico." : "Desde Monterrey, Nuevo León, creamos páginas web e invitaciones digitales para negocios y celebraciones en México."}</p><p>{english ? "We listen to your idea and work with you on the design, content and features that make it yours." : "Escuchamos tu idea y construimos contigo el diseño, el contenido y las funciones que la hacen tuya."}</p></div>
      </div>
      <div className="story-weave" id="story-weave" role="img" aria-label={english ? "Three threads of light weave Nordra's mountain: listening, shaping your identity and connecting." : "Tres hilos de luz tejen la montaña de Nordra: escuchar, dar forma a tu identidad y conectar."}><StorySignature /></div>
      <div className="story-values-heading"><p>{t("LO QUE GUÍA NUESTRO TRABAJO")}</p><button className="story-motion" type="button" aria-label={motionLabel} title={motionLabel} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button></div>
      <div className="story-values">{principles.map(([title, copy], index) => <div key={intentions[index]} className={`story-value story-value-${intentions[index]}`} data-active={active === index || undefined}
        onPointerEnter={event => { if (event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) { setFocused(null); setHovered(index); } }} onPointerLeave={() => setHovered(null)} onPointerCancel={() => setHovered(null)}>
        <IntentionMark intention={intentions[index]} /><div><h3><button className="story-value-trigger" type="button" aria-pressed={selected === index} aria-controls="story-weave" aria-describedby={`story-copy-${intentions[index]}`} onClick={() => setSelected(index)} onFocus={event => { if (event.currentTarget.matches(":focus-visible")) { setHovered(null); setFocused(index); } }} onBlur={() => setFocused(null)}>{t(title)}</button></h3><p id={`story-copy-${intentions[index]}`}>{t(copy)}</p></div>
      </div>)}</div>
      <div className="story-signoff"><p>{english ? "Your essence. Our way of creating." : "Tu esencia. Nuestra forma de crear."}</p><a className="story-invitation" href={sectionHref("contacto")} onPointerEnter={event => { if (event.pointerType !== "touch") setInviting(true); }} onPointerLeave={() => setInviting(false)} onPointerDown={() => setInviting(true)} onPointerCancel={() => setInviting(false)} onFocus={() => setInviting(true)} onBlur={() => setInviting(false)}><span>{t("Platiquemos de tu idea")}</span><ArrowUpRight size={20} strokeWidth={1.5} aria-hidden="true" /></a></div>
    </div>
  </section>;
}
