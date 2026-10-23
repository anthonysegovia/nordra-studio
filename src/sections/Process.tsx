import { sectionHref } from "../navigation";
import { useLanguage } from "../language";
import { useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import "../styles/process.css";

const stageNames = ["idea", "draft", "publish"] as const;

function IdeaTakingShape({ english, active, inviting }: { english: boolean; active: number | null; inviting: boolean }) {
  const descriptions = english
    ? ["A spark lights the beginning of your idea.", "The sketch unfolds to give your project shape.", "The finished website rises, ready to share."]
    : ["Una chispa ilumina el comienzo de tu idea.", "El boceto se despliega para darle forma a tu proyecto.", "La página terminada se eleva, lista para compartir."];
  const description = inviting
    ? (english ? "A thread of light connects your idea with the website. Let's bring it to life." : "Un hilo de luz conecta tu idea con la página. Empecemos a darle vida.")
    : active === null ? (english ? "An idea becoming a website." : "Una idea que toma forma hasta convertirse en una página.") : descriptions[active];
  return <div className="process-art" id="process-illustration" role="img" aria-label={description}>
    <svg className="process-illustration" viewBox="0 0 540 390" preserveAspectRatio="xMidYMid slice" fill="none" focusable="false" aria-hidden="true">
      <defs>
        <linearGradient id="process-paper" x1="178" y1="82" x2="428" y2="304" gradientUnits="userSpaceOnUse"><stop stopColor="var(--process-paper-light)" /><stop offset="1" stopColor="var(--process-paper)" /></linearGradient>
        <linearGradient id="process-spectrum" x1="68" y1="266" x2="467" y2="122" gradientUnits="userSpaceOnUse"><stop stopColor="#48c6cc" /><stop offset=".5" stopColor="#72aee5" /><stop offset="1" stopColor="#b39ae7" /></linearGradient>
        <linearGradient id="process-edge" x1="176" y1="93" x2="416" y2="308" gradientUnits="userSpaceOnUse"><stop stopColor="var(--process-cyan)" stopOpacity=".65" /><stop offset=".6" stopColor="var(--process-lilac)" stopOpacity=".25" /><stop offset="1" stopColor="var(--process-lilac)" stopOpacity=".7" /></linearGradient>
        <radialGradient id="process-halo"><stop stopColor="var(--process-cyan)" stopOpacity=".13" /><stop offset="1" stopColor="var(--process-cyan)" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse className="process-halo" cx="290" cy="221" rx="240" ry="158" fill="url(#process-halo)" />
      <g className="process-orbits" stroke="var(--process-cyan)">
        <ellipse cx="278" cy="227" rx="238" ry="92" transform="rotate(-21 278 227)" opacity=".13" />
        <path d="M69 312C129 363 375 330 481 200" opacity=".13" />
        <path d="M92 325H462M422 56V332" strokeDasharray="2 8" opacity=".15" />
        <circle cx="459" cy="149" r="3" fill="var(--process-lilac)" stroke="none" />
        <circle cx="146" cy="336" r="2" fill="currentColor" stroke="none" />
      </g>
      <path className="process-thread" d="M69 260C89 174 176 176 143 251S72 295 143 209S306 189 348 115" stroke="url(#process-spectrum)" strokeWidth="1.2" strokeLinecap="round" />
      <path className="process-quote-thread" d="M69 260C89 174 176 176 143 251S72 295 143 209S306 189 348 115" pathLength="1" stroke="url(#process-spectrum)" strokeWidth="1.8" strokeLinecap="round" />
      <path className="process-travelling-light" d="M69 260C89 174 176 176 143 251S72 295 143 209S306 189 348 115" pathLength="100" stroke="var(--process-cyan)" strokeWidth="2" strokeLinecap="round" strokeDasharray="3 97" />
      <g className="process-draft-response"><g className="process-draft-float">
        <g transform="rotate(-13 263 196)" stroke="var(--process-cyan)">
          <rect x="133" y="89" width="239" height="196" rx="7" strokeOpacity=".22" />
          <path d="M133 114H372M155 138H223M155 153H207M155 204H245M155 216H228M155 247H199" strokeOpacity=".24" />
          <rect x="257" y="135" width="94" height="127" rx="3" strokeDasharray="3 5" strokeOpacity=".28" />
          <path d="M128 89H119M133 84V75M372 84V75M377 89H386M128 285H119M133 290V299" strokeOpacity=".45" />
        </g>
      </g></g>
      <g className="process-page-response"><g className="process-page-float">
        <g transform="rotate(5 305 195)">
          <rect className="process-page-shadow" x="183" y="88" width="247" height="211" rx="9" fill="url(#process-paper)" stroke="url(#process-edge)" />
          <path d="M183 113H430" stroke="var(--process-cyan)" strokeOpacity=".2" />
          <g fill="var(--process-cyan)"><circle cx="199" cy="101" r="2" opacity=".8" /><circle cx="207" cy="101" r="2" opacity=".5" /><circle cx="215" cy="101" r="2" opacity=".25" /></g>
          <rect x="274" y="98" width="67" height="5" rx="2.5" fill="currentColor" opacity=".12" />
          <text x="202" y="142" className="process-art-label">{english ? "YOUR IDEA, IN THE WORLD" : "TU IDEA, EN EL MUNDO"}</text>
          <path d="M203 161H304M203 174H270" stroke="currentColor" strokeWidth="5" strokeLinecap="round" opacity=".85" />
          <path d="M202 191H265M202 199H248" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity=".24" />
          <path d="M283 241L322 193Q325 189 329 193L343 208L368 171Q372 165 376 171L412 241" stroke="url(#process-spectrum)" strokeWidth="2" strokeLinejoin="round" />
          <path d="M283 241L322 193Q325 189 329 193L343 208L368 171Q372 165 376 171L412 241Z" fill="url(#process-spectrum)" opacity=".09" />
          <path d="M303 241L336 213L354 228L376 203L399 241" stroke="url(#process-spectrum)" strokeOpacity=".5" />
          <circle cx="306" cy="190" r="7" fill="url(#process-spectrum)" opacity=".65" />
          <rect x="202" y="225" width="53" height="18" rx="9" fill="var(--process-cyan)" fillOpacity=".14" stroke="var(--process-cyan)" strokeOpacity=".25" />
          <path className="process-page-arrow" d="M229 234H242M238 230L242 234L238 238" stroke="var(--process-cyan)" />
          <path d="M202 262H411" stroke="currentColor" strokeOpacity=".12" />
          <path d="M202 278H249M273 278H326M351 278H411" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".16" />
        </g>
      </g></g>
      <g className="process-idea-response"><g className="process-spark" transform="translate(69 260)">
        <circle r="23" stroke="var(--process-cyan)" strokeOpacity=".2" /><circle r="34" stroke="var(--process-cyan)" strokeOpacity=".08" />
        <path d="M0-16C2-4 4-2 16 0C4 2 2 4 0 16C-2 4-4 2-16 0C-4-2-2-4 0-16Z" fill="var(--process-cyan)" />
      </g></g>
      <g className="process-finish-star" transform="translate(445 91)" stroke="var(--process-lilac)"><path d="M0-12V12M-12 0H12M-5-5L5 5M-5 5L5-5" /><circle r="23" strokeOpacity=".17" /></g>
      <g className="process-ready-response"><g transform="translate(445 91)"><circle r="19" fill="var(--process-paper)" stroke="var(--process-lilac)" strokeOpacity=".6" /><path className="process-ready-check" d="M-8 0L-2 6L9-7" pathLength="1" stroke="var(--process-lilac)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></g></g>
      <text x="46" y="317" className="process-art-note">{english ? "AN IDEA" : "UNA IDEA"}</text>
      <text x="303" y="345" className="process-art-note">{english ? "SOMETHING UNIQUELY YOURS" : "ALGO QUE SE SIENTE TUYO"}</text>
    </svg>
  </div>;
}

function ProcessMark({ stage }: { stage: number }) {
  return <svg viewBox="0 0 32 32" fill="none" aria-hidden="true" focusable="false">
    {stage === 0 ? <><path d="M16 4C17.5 12 20 14.5 28 16C20 17.5 17.5 20 16 28C14.5 20 12 17.5 4 16C12 14.5 14.5 12 16 4Z" /><circle cx="16" cy="16" r="3" /></> : stage === 1 ? <><path d="M8 7L25 10L22 27L5 24Z" opacity=".4" /><rect x="10" y="4" width="16" height="19" rx="2" /><path d="M14 10H22M14 14H22M14 18H18" /></> : <><rect x="4" y="8" width="24" height="19" rx="3" /><path d="M4 14H28M17 20L20 23L26 17M7 5L10 2L13 5" /><path d="M10 2V10" /></>}
  </svg>;
}

export function Process() {
  const english = useLanguage() === "en";
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const [selectedStep, setSelectedStep] = useState<number | null>(null);
  const [hoveredStep, setHoveredStep] = useState<number | null>(null);
  const [focusedStep, setFocusedStep] = useState<number | null>(null);
  const [quoteHovered, setQuoteHovered] = useState(false);
  const [quoteFocused, setQuoteFocused] = useState(false);
  const [quotePulsing, setQuotePulsing] = useState(false);
  const quoteTimer = useRef<number | undefined>(undefined);
  const quoteActive = quoteHovered || quoteFocused || quotePulsing;
  const activeStep = hoveredStep ?? focusedStep ?? selectedStep;
  // Start on contact, and let the response finish during the native anchor
  // scroll. A tap never waits for the artwork before opening contact details.
  const pulseQuote = () => {
    window.clearTimeout(quoteTimer.current);
    setQuotePulsing(true);
    quoteTimer.current = window.setTimeout(() => setQuotePulsing(false), 1200);
  };
  const cancelQuote = () => {
    window.clearTimeout(quoteTimer.current);
    setQuotePulsing(false);
  };
  useLayoutEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => { section.dataset.inView = String(entry.isIntersecting); }, { threshold: .1 });
    observer.observe(section);
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    const clearHover = () => { setHoveredStep(null); setQuoteHovered(false); };
    pointer.addEventListener("change", clearHover);
    const visibility = () => { section.dataset.hidden = String(document.hidden); if (document.hidden) { clearHover(); cancelQuote(); } };
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); window.clearTimeout(quoteTimer.current); pointer.removeEventListener("change", clearHover); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const steps = english ? [
    ["Tell us your idea", "Share your business or event, what you need and your preferred date on WhatsApp."],
    ["Review your quote", "We agree on scope, materials, price and dates. An accepted proposal, materials and a 50% deposit are required to begin."],
    ["Approve, then publish", "Review the final preview. The remaining 50% is due after your approval and before publication or final access delivery."],
  ] : [
    ["Cuéntanos tu idea", "Comparte por WhatsApp tu negocio o evento, qué necesitas y la fecha que tienes en mente."],
    ["Revisa tu cotización", "Acordamos alcance, materiales, precio y fechas. Para iniciar se requieren propuesta aceptada, materiales y anticipo del 50%."],
    ["Aprueba y publicamos", "Revisa la vista previa final. El 50% restante se paga después de tu aprobación y antes de publicar o entregar los accesos finales."],
  ];
  const motionLabel = english ? (paused ? "Resume motion" : "Pause motion") : (paused ? "Activar movimiento" : "Pausar movimiento");
  return <section ref={root} className="section process-section process-studio" id="proceso" lang={english ? "en" : "es"} aria-labelledby="process-title" data-paused={paused} data-active-stage={activeStep === null ? "rest" : stageNames[activeStep]} data-quote-active={quoteActive}><div className="site-shell">
    <div className="process-composition">
      <div className="process-vision">
        <div className="process-heading">
          <div className="process-eyebrow"><p className="eyebrow">{english ? "YOUR NEXT STEP" : "TU SIGUIENTE PASO"}</p><button className="process-motion" type="button" onClick={() => setPaused(value => !value)} aria-pressed={paused} aria-label={motionLabel} title={motionLabel}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button></div>
          <h2 id="process-title">{english ? "From your idea" : "De tu idea"}<br /><span>{english ? "to your website." : "a tu página."}</span></h2>
        </div>
        <IdeaTakingShape english={english} active={activeStep} inviting={quoteActive} />
      </div>
      <ol className="process-steps">{steps.map(([title, copy], index) => <li key={stageNames[index]} className={`process-stage process-stage-${index}`} data-active={activeStep === index || undefined}
        onPointerEnter={event => { if (event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) setHoveredStep(index); }}
        onPointerLeave={() => setHoveredStep(null)} onPointerCancel={() => setHoveredStep(null)}>
        <span className="process-mark"><ProcessMark stage={index} /></span><div><h3><button className="process-step-trigger" type="button" aria-pressed={selectedStep === index} aria-controls="process-illustration" aria-describedby={`process-copy-${stageNames[index]}`}
          onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setFocusedStep(index); }} onBlur={() => setFocusedStep(null)}
          onClick={() => setSelectedStep(index)}>{title}</button></h3><p id={`process-copy-${stageNames[index]}`}>{copy}</p></div>
      </li>)}</ol>
    </div>
    <div className="process-invitation"><a className="process-start" href={sectionHref("contacto")} aria-controls="process-illustration"
      onPointerEnter={event => { if (event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) setQuoteHovered(true); }}
      onPointerLeave={() => setQuoteHovered(false)} onPointerCancel={() => { setQuoteHovered(false); cancelQuote(); }}
      onPointerDown={event => { if (event.button === 0) pulseQuote(); }}
      onFocus={event => { if (event.currentTarget.matches(":focus-visible")) setQuoteFocused(true); }} onBlur={() => setQuoteFocused(false)}
      onClick={pulseQuote}><span className="process-start-orbit" aria-hidden="true"><ArrowUpRight size={24} /></span><span className="process-start-label">{english ? "Request a quote" : "Solicitar una cotización"}</span></a><a className="process-terms" href="/terminos-del-servicio.html" hrefLang="es">{english ? "Read terms (Spanish)" : "Consultar condiciones del servicio"}<ArrowUpRight size={15} aria-hidden="true" /></a></div>
  </div></section>;
}
