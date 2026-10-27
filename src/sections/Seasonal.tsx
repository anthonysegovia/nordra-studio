import { ArrowLeft, ArrowUpRight, ChevronDown, Pause, Play } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { PackageAurora } from "../components/PackageAurora";
import { useLanguage } from "../language";

export function Seasonal() {
  const english = useLanguage() === "en";
  const [flipped, setFlipped] = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [resizingCard, setResizingCard] = useState<number | null>(null);
  const [aurorasPaused, setAurorasPaused] = useState(false);
  const [respondingCards, setRespondingCards] = useState<number[]>([]);
  const sectionRef = useRef<HTMLElement>(null);
  const focusFrame = useRef(0);
  const responseTimers = useRef(new Map<number, number>());
  const respondToCard = useCallback((index: number) => {
    if (responseTimers.current.has(index)) return;
    setRespondingCards(current => [...current, index]);
    responseTimers.current.set(index, window.setTimeout(() => {
      setRespondingCards(current => current.filter(value => value !== index));
      responseTimers.current.delete(index);
    }, 1400));
  }, []);
  const frontButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const backButtons = useRef<(HTMLDivElement | null)[]>([]);
  const backContents = useRef<(HTMLDivElement | null)[]>([]);
  const reveals = useRef<(HTMLDivElement | null)[]>([]);
  const [cardHeights, setCardHeights] = useState<number[]>([]);
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      (entry.target as HTMLElement).dataset.auroraVisible = String(entry.isIntersecting);
    }), { threshold: .05 });
    section.querySelectorAll(".seasonal-flip").forEach(card => observer.observe(card));
    const visibility = () => { section.dataset.aurorasHidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    const timers = responseTimers.current;
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.cancelAnimationFrame(focusFrame.current);
      timers.forEach(timer => window.clearTimeout(timer));
      timers.clear();
    };
  }, []);
  useLayoutEffect(() => {
    const contents = frontButtons.current.map((front, index) => flipped === index ? backContents.current[index] : front);
    const measure = () => {
      // Layout height stays stable while the face rotates in perspective.
      const heights = contents.map((content, index) => {
        if (!content) return 0;
        if (flipped !== index) return content.offsetHeight + 2;
        const reveal = reveals.current[index];
        const target = expanded.includes(index) ? (reveal?.firstElementChild?.scrollHeight ?? 0) : 0;
        // Use the final disclosure height once, rather than chasing its animated frames.
        return content.offsetHeight - (reveal?.offsetHeight ?? 0) + target + 2;
      });
      setCardHeights(current => heights.every((height, index) => Math.abs(height - (current[index] ?? 0)) <= 1) ? current : heights);
    };
    measure();
    const observer = new ResizeObserver(measure);
    contents.forEach(content => { if (content) observer.observe(content); });
    return () => observer.disconnect();
  }, [flipped, expanded]);
  const flip = (index: number, open: boolean, keyboard = false) => {
    window.cancelAnimationFrame(focusFrame.current);
    respondToCard(index);
    if (flipped !== null && flipped !== index) respondToCard(flipped);
    setResizingCard(null);
    setFlipped(open ? index : null);
    focusFrame.current = window.requestAnimationFrame(() => {
      const face = open ? backButtons.current[index] : frontButtons.current[index];
      if (!face) return;
      face.dataset.keyboardFocus = String(keyboard);
      face.focus({ preventScroll: true });
    });
  };
  const includes = english
    ? ["Personalized design to match your celebration", "Your event's date, time and location", "A digital invitation to share with your guests"]
    : ["Diseño personalizado con el estilo de tu celebración", "Fecha, horario y lugar de tu evento", "Invitación digital para compartir con tus invitados"];
  const occasions = english
    ? ["Halloween", "Posadas & Christmas", "New Year's Eve"]
    : ["Halloween", "Posadas y Navidad", "Fin de año"];
  const invitationContact = (occasion?: string) => {
    const message = english
      ? occasion
        ? `Hi Nordra Studio! I'd like to ask about a digital invitation for ${occasion}. I'm interested in the $599 MXN seasonal invitation. I'd like to discuss my event's date and details.`
        : "Hi Nordra Studio! I'd like a personalized digital invitation for a seasonal celebration. Could you help me choose an option for my event?"
      : occasion
        ? `¡Hola, Nordra Studio! Me gustaría consultar una invitación digital para ${occasion}. Me interesa la invitación de temporada de $599 MXN. Quisiera platicar sobre la fecha y los detalles de mi evento.`
        : "¡Hola, Nordra Studio! Me gustaría una invitación digital personalizada para una celebración de temporada. ¿Me ayudan a elegir una opción para mi evento?";
    return `https://wa.me/528129022231?text=${encodeURIComponent(message)}`;
  };
  const captions = english ? ["A little mystery. A lot of fun.", "Gather, share and celebrate.", "A toast to new beginnings."] : ["Un poco de misterio. Mucha diversión.", "Reunirnos, compartir y celebrar.", "Un brindis por nuevos comienzos."];
  const cardLabels = english
    ? ["THE MYSTERY STARTS HERE", "THE MAGIC OF COMING TOGETHER", "A TOAST TO WHAT'S NEXT"]
    : ["EL MISTERIO EMPIEZA AQUÍ", "LA MAGIA DE REUNIRNOS", "UN BRINDIS POR LO QUE VIENE"];
  const demos = [
    [
      { title: "Spooky Party", description: english ? "Playful, bold and full of mystery." : "Divertida, vibrante y con misterio.", href: "/demos/halloween/index.html", image: "/demos/previews/halloween-minimal-v2.svg" },
      { title: "La Mansión de Medianoche", description: english ? "An elegant night of suspense." : "Una noche elegante de suspenso.", href: "/demos/halloween-mansion/index.html", image: "/demos/previews/halloween-mansion-minimal-v2.svg" },
    ],
    [
      { title: "Se viene la posada", description: english ? "A piñata, warm light and tradition." : "Piñata, luces cálidas y tradición.", href: "/demos/posada-pinata/index.html", image: "/demos/previews/posada-pinata-minimal-v2.svg" },
      { title: "Una noche para reunirnos", description: english ? "An intimate, festive gathering." : "Un encuentro íntimo y festivo.", href: "/demos/posada/index.html", image: "/demos/previews/posada-minimal-v2.svg" },
    ],
    [
      { title: "Por todo lo que viene", description: english ? "Gold accents and a new beginning." : "Destellos dorados y nuevos comienzos.", href: "/demos/celebra-2027/index.html", image: "/demos/previews/celebra-2027-minimal-v2.svg" },
      { title: "Del otro lado de las doce", description: english ? "A crystal portal and a night above the city." : "Un portal de cristal y una noche sobre la ciudad.", href: "/demos/del-otro-lado/index.html", image: "/demos/previews/del-otro-lado-minimal.svg" },
    ],
  ];

  return (
    <section id="temporada" className="section seasonal-section" ref={sectionRef} data-auroras-paused={aurorasPaused} aria-labelledby="seasonal-title">
      <div className="site-shell">
        <div className="seasonal-panel">
          <div className="seasonal-lights" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
          <div className="seasonal-copy">
            <p className="eyebrow">{english ? "A SEASON TO CELEBRATE" : "UNA TEMPORADA PARA CELEBRAR"}</p>
            <h2 id="seasonal-title">{english ? "Let the celebration begin" : "Que la celebración empiece"}<br /><span>{english ? "with the invitation." : "desde la invitación."}</span></h2>
            <p>{english ? "Personalized digital invitations with your event's style and all the details your guests need. Let's create something special for your next celebration." : "Invitaciones digitales personalizadas con el estilo de tu evento y los detalles que tus invitados necesitan. Hagamos algo especial para tu próxima celebración."}</p>
            <a className="seasonal-cta" href={invitationContact()} target="_blank" rel="noopener noreferrer">{english ? "Create my invitation" : "Quiero mi invitación"}<ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="seasonal-gallery-toolbar">
            <p>{english ? "Find the design for your celebration" : "Encuentra el diseño para tu celebración"}</p>
            <button type="button" className="package-aurora-toggle" aria-pressed={aurorasPaused} onClick={() => setAurorasPaused(value => !value)}>{aurorasPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{english ? (aurorasPaused ? "Resume animations" : "Pause animations") : (aurorasPaused ? "Activar animaciones" : "Pausar animaciones")}</button>
          </div>
          <div className="seasonal-occasions">
            {occasions.map((occasion, index) => {
              const art = index === 0 ? <svg viewBox="0 0 160 110"><path d="M137 9a16 16 0 1 0 12 25 16 16 0 0 1-12-25" fill="#ffe0a2"/><path d="m18 25 8-3 7 4 7-4 8 3-7 3-7-1-8 1z" fill="#a991c5"/><path d="M80 33q-8-20 9-26" fill="none" stroke="#8aba75" strokeWidth="8" strokeLinecap="round"/><ellipse cx="48" cy="69" rx="29" ry="34" fill="#e57e25"/><ellipse cx="111" cy="69" rx="29" ry="34" fill="#e57e25"/><ellipse cx="80" cy="68" rx="39" ry="39" fill="#ffa643"/><path d="m48 60 19-12 1 17zm45 5 1-17 19 12zM56 77l13 6 10-5 11 5 15-6q-22 29-49 0" fill="#422049"/><path d="M29 12h8m-4-4v8m95 42h12m-6-6v12" stroke="#eecaff" strokeWidth="2"/></svg> : index === 1 ? <svg viewBox="0 0 160 110"><path d="M76 14 50 47h12L40 73h22l-17 18h63L91 73h22L91 47h12z" fill="#429f83"/><path d="M76 17v70M61 48h29M54 72h45" stroke="#a2e1bd" strokeWidth="1.5" opacity=".65"/><path d="m76 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f8d37d"/><path d="M71 90h11v13H71" fill="#ac8154"/><path d="M108 77h32v28h-32z" fill="#be647b"/><path d="M122 77v28m-14-18h32" stroke="#f6d791" strokeWidth="3"/><path d="M123 77q-20-18-18-4 2 6 18 4 20-18 19-4-3 6-19 4" fill="none" stroke="#f6d791" strokeWidth="2"/><circle cx="67" cy="53" r="3" fill="#f8d37d"/><circle cx="83" cy="65" r="3" fill="#eab0bd"/><circle cx="63" cy="78" r="3" fill="#f8d37d"/><path d="M29 19h8m-4-4v8m94 1h12m-6-6v12" stroke="#f9e5b2" strokeWidth="2"/></svg> : <svg viewBox="0 0 160 110"><g stroke="#c895ef" strokeWidth="2" strokeLinecap="round"><path d="M42 9v10m0 27v10M18 33h10m28 0h10M25 16l7 7m20 20 7 7m0-34-7 7M32 43l-7 7"/><path d="M122 5v10m0 20v10M102 25h9m22 0h9m-34-14 6 6m16 16 6 6m0-28-6 6m-16 16-6 6" stroke="#f6d590"/></g><g stroke="#f6d590" strokeWidth="2" fill="#f6d59020"><path d="m51 44 27-8 9 29q2 13-10 16-11 4-17-8z"/><path d="m64 59 18-5M77 81l7 23m-19 3 25-7"/><path d="m83 37 27 7-8 30q-4 11-16 8-11-3-8-17z"/><path d="m80 57 26 7M86 82l-6 22m-10-3 22 6"/></g></svg>;
              const designs = demos[index];
              const isExpanded = expanded.includes(index);
              return <div className={`seasonal-flip aurora-card seasonal-occasion-${index}${flipped === index ? " is-flipped" : ""}${resizingCard === index ? " is-resizing-content" : ""}${respondingCards.includes(index) ? " is-responding" : ""}`} key={index} style={{ height: cardHeights[index] || undefined }} onPointerDown={() => respondToCard(index)} onClickCapture={event => { if (event.detail === 0) respondToCard(index); }} onKeyDown={event => { if (event.key === "Escape" && flipped === index) { event.preventDefault(); flip(index, false, true); } }}>
                <div className="seasonal-flip-inner">
                <div className="seasonal-flip-face" inert={flipped === index} aria-hidden={flipped === index}>
                <PackageAurora scope="seasonal" index={index} face="front" />
                <button type="button" ref={element => { frontButtons.current[index] = element; }} className={`seasonal-occasion seasonal-occasion-${index}`} onClick={event => flip(index, true, event.detail === 0)} aria-expanded={flipped === index} aria-controls={`seasonal-designs-${index}`} aria-label={english ? `Explore ${designs.length} invitation ${designs.length === 1 ? "design" : "designs"} for ${occasion}` : `Explorar ${designs.length} ${designs.length === 1 ? "diseño" : "diseños"} de invitación para ${occasion}`}>
                <span className="seasonal-card-label">{cardLabels[index]}</span>
                <div className="seasonal-art" aria-hidden="true">
                  {art}
                </div>
                <strong>{occasion}</strong><span className="seasonal-caption">{captions[index]}</span>
                <span className="seasonal-design-count">{english ? `${designs.length} ${designs.length === 1 ? "design" : "designs"} to explore` : `${designs.length} ${designs.length === 1 ? "diseño" : "diseños"} para explorar`}</span>
                <span className="seasonal-summary-price">$599 MXN · {english ? "VAT included" : "IVA incluido"}</span><span className="seasonal-card-action">{english ? "View designs and details" : "Ver diseños y detalles"}<ArrowUpRight size={15} aria-hidden="true" /></span>
                </button>
                </div>
                <div id={`seasonal-designs-${index}`} className={`seasonal-flip-face seasonal-flip-back seasonal-occasion-${index}`} ref={element => { backButtons.current[index] = element; }} role="region" tabIndex={-1} aria-label={english ? `${occasion} designs and details` : `Diseños y detalles de ${occasion}`} onClick={event => { if (!(event.target as Element).closest("a, button, input, select, textarea, summary") && !window.getSelection()?.toString()) flip(index, false); }} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); flip(index, false, true); } }} inert={flipped !== index} aria-hidden={flipped !== index}>
                <PackageAurora scope="seasonal" index={index} face="back" />
                <div className="seasonal-back-content" ref={element => { backContents.current[index] = element; }}>
                  <button type="button" className="seasonal-return" onClick={event => flip(index, false, event.detail === 0)}><ArrowLeft size={14} aria-hidden="true" />{english ? "Back" : "Volver"}</button>
                  <h3>{occasion}</h3>
                  <p className="seasonal-price">$599 <span>MXN · {english ? "VAT included" : "IVA incluido"}</span></p><p className="seasonal-scope-note">{english ? "Personalized seasonal design. Features, revisions and hosting period are confirmed in your quote." : "Diseño de temporada personalizado. Confirmamos funciones, cambios y vigencia en tu cotización."}</p><a className="seasonal-compare-link" href="#comparar-paquetes">{english ? "See the main plans" : "Ver paquetes principales"}<ArrowUpRight size={13} aria-hidden="true" /></a>
                  <div className="seasonal-list-heading"><h4 id={`seasonal-list-title-${index}`}>{english ? "Explore the designs" : "Explora los diseños"}</h4></div>
                  <ul className="seasonal-demo-list" aria-labelledby={`seasonal-list-title-${index}`}>
                    {designs.map(demo => <li key={demo.href}>
                      <a className="seasonal-demo-row" href={demo.href} hrefLang="es">
                        <span className="seasonal-demo-cover" aria-hidden="true">
                          <img src={demo.image} alt="" width="260" height="360" loading="lazy" decoding="async" />
                        </span>
                        <span className="seasonal-demo-copy"><strong lang="es">{demo.title}</strong><span>{demo.description}</span><span className="seasonal-demo-action">{english ? "Open demo (Spanish)" : "Abrir demo"}</span></span>
                        <ArrowUpRight className="seasonal-demo-arrow" size={17} aria-hidden="true" />
                      </a>
                    </li>)}
                  </ul>
                  <div className={`seasonal-includes${isExpanded ? " is-expanded" : ""}`}>
                    <button type="button" className="seasonal-includes-toggle" aria-expanded={isExpanded} aria-controls={`seasonal-includes-${index}`} onClick={() => { setResizingCard(index); setExpanded(current => current.includes(index) ? current.filter(value => value !== index) : [...current, index]); }}>{english ? "What does my invitation include?" : "¿Qué incluye mi invitación?"}<ChevronDown size={16} aria-hidden="true" /></button>
                    <div id={`seasonal-includes-${index}`} ref={element => { reveals.current[index] = element; }} className="seasonal-includes-reveal" inert={!isExpanded} aria-hidden={!isExpanded}><div><ul>{includes.map(item => <li key={item}>{item}</li>)}</ul></div></div>
                  </div>
                  <a className="seasonal-back-cta" href={invitationContact(occasion)} target="_blank" rel="noopener noreferrer">{english ? "Ask about my invitation" : "Consultar mi invitación"}<ArrowUpRight size={16} aria-hidden="true" /></a>
                </div>
                </div>
                </div>
              </div>;
            })}
            <p>{english ? "Your celebration. Your style. Your invitation." : "Tu celebración. Tu estilo. Tu invitación."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
