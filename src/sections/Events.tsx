import { InvitationComparison } from "../components/InvitationComparison";
import { getInvitationPlans } from "../data/invitationPlans";
import { InvitationPrice } from "../components/InvitationPrice";
import { ServiceNext } from "../components/ServiceRoute";
import { ServiceIntro } from "../components/ServiceIntro";
import { PackageAurora } from "../components/PackageAurora";
import { InvitationAurora } from "../components/InvitationAurora";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { t, useLanguage } from "../language";
import { ArrowDown, ArrowUpRight, Heart, Sparkles, Users, MapPin, CalendarDays, Check, X, ChevronDown, MessageCircle, Globe, SlidersHorizontal, Pause, Play } from "lucide-react";

const celebrations = [
  { title: "Bodas", subtitle: "El comienzo de una historia juntos.", description: "Un espacio para compartir la ilusión de ese día y reunir los detalles que quieres contar a tus invitados.", image: "/demo-wedding-v2.jpg", Icon: Heart, message: "una página para mi boda", englishMessage: "a wedding website", theme: "wedding", kicker: "NOS CASAMOS", name: "Valeria & Mateo", date: "18 · 09 · 2027", place: "Jardín Magnolia", time: "17:00", greeting: "Una nueva historia juntos.", englishGreeting: "A new story together." },
  { title: "Cumpleaños y celebraciones", subtitle: "Hay momentos que merecen algo especial.", description: "Una invitación con tu personalidad, para que la emoción de celebrar empiece desde el primer vistazo.", image: "/demo-birthday-v2.jpg", Icon: Sparkles, message: "una página para mi celebración", englishMessage: "a celebration website", theme: "birthday", kicker: "ESTÁS INVITADO", name: "Sofía · 25", date: "24 · 07 · 2027", place: "Terraza Aurora", time: "19:00", greeting: "Hoy toca celebrar.", englishGreeting: "It's time to celebrate." },
  { title: "Eventos y encuentros", subtitle: "Buenas ideas. Personas que conectan.", description: "Dale a tu encuentro un lugar propio en la web para presentar su esencia y compartir la información del evento.", image: "/demo-creative-v2.jpg", Icon: Users, message: "una página para mi evento", englishMessage: "an event website", theme: "gathering", kicker: "ENCUENTRO CREATIVO", name: "Conexión / 27", date: "12 · 06 · 2027", place: "Espacio Nodo", time: "10:00", greeting: "Ideas que nos conectan.", englishGreeting: "Ideas that connect us." },
];

export function Events() {
  const language = useLanguage();
  const english = language === "en";
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState(0);
  const [changing, setChanging] = useState(false);
  const [previewPaused, setPreviewPaused] = useState(false);
  const explorer = useRef<HTMLDivElement>(null);
  const categoryButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const changeTimer = useRef(0);
  const detailTimer = useRef(0);
  const detailTrigger = useRef<HTMLButtonElement | null>(null);
  const detailClose = useRef<HTMLButtonElement>(null);
  const [detailClosing, setDetailClosing] = useState(false);
  const [flippedPlan, setFlippedPlan] = useState<number | null>(null);
  const plansRoot = useRef<HTMLDivElement>(null);
  const [aurorasPaused, setAurorasPaused] = useState(false);
  const [respondingPlans, setRespondingPlans] = useState<number[]>([]);
  const responseTimers = useRef(new Map<number, number>());
  const respondToPlan = useCallback((index: number) => {
    // Repeated touches join the current wave without restarting the drift.
    if (responseTimers.current.has(index)) return;
    setRespondingPlans(current => [...current, index]);
    responseTimers.current.set(index, window.setTimeout(() => {
      setRespondingPlans(current => current.filter(value => value !== index));
      responseTimers.current.delete(index);
    }, 1400));
  }, []);
  const planFronts = useRef<(HTMLButtonElement | null)[]>([]);
  const planFrontContents = useRef<(HTMLDivElement | null)[]>([]);
  const planBacks = useRef<(HTMLDivElement | null)[]>([]);
  const planContents = useRef<(HTMLDivElement | null)[]>([]);
  const planFocusFrame = useRef(0);
  const [planHeights, setPlanHeights] = useState<number[]>([]);
  useEffect(() => {
    const plans = plansRoot.current;
    if (!plans) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      (entry.target as HTMLElement).dataset.auroraVisible = String(entry.isIntersecting);
    }), { threshold: .05 });
    plans.querySelectorAll(".event-plan-flip").forEach(card => observer.observe(card));
    const visibility = () => { plans.dataset.aurorasHidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.cancelAnimationFrame(planFocusFrame.current);
      responseTimers.current.forEach(timer => window.clearTimeout(timer));
      responseTimers.current.clear();
    };
  }, []);
  useLayoutEffect(() => {
    const contents = planFrontContents.current.map((front, index) => flippedPlan === index ? planContents.current[index] : front);
    const measure = () => {
      // Measure layout, not the perspective-distorted bounds of a face mid-turn.
      const measured = contents.map(content => content ? content.offsetHeight + 2 : 0);
      const tallestFront = Math.max(0, ...measured.filter((_, index) => index !== flippedPlan));
      const heights = measured.map((height, index) => index === flippedPlan ? height : tallestFront);
      setPlanHeights(current => heights.every((height, index) => height === current[index]) ? current : heights);
    };
    measure();
    const observer = new ResizeObserver(measure);
    contents.forEach(content => { if (content) observer.observe(content); });
    return () => observer.disconnect();
  }, [flippedPlan, language]);
  const flipPlan = (index: number, open: boolean, keyboard = false) => {
    window.cancelAnimationFrame(planFocusFrame.current);
    respondToPlan(index);
    if (flippedPlan !== null && flippedPlan !== index) respondToPlan(flippedPlan);
    setFlippedPlan(open ? index : null);
    planFocusFrame.current = window.requestAnimationFrame(() => {
      const face = open ? planBacks.current[index] : planFronts.current[index];
      if (!face) return;
      face.dataset.keyboardFocus = String(keyboard);
      face.focus({ preventScroll: true });
    });
  };
  const [detail, setDetail] = useState<"location" | "agenda" | "rsvp" | null>(null);
  const chooseOccasion = (index: number) => {
    if (index === selected) return;
    window.clearTimeout(changeTimer.current);
    window.clearTimeout(detailTimer.current);
    setSelected(index);
    const change = () => {
      setActive(index);
      setDetail(null);
      setDetailClosing(false);
      setChanging(false);
    };
    if (previewPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) change();
    else { setChanging(true); changeTimer.current = window.setTimeout(change, 180); }
  };
  const showDetail = (value: "location" | "agenda" | "rsvp", trigger: HTMLButtonElement) => {
    window.clearTimeout(detailTimer.current);
    detailTrigger.current = trigger;
    setDetailClosing(false);
    setDetail(value);
  };
  const closeDetail = () => {
    if (detailClosing) return;
    setDetailClosing(true);
    const finish = () => {
      setDetail(null);
      setDetailClosing(false);
      detailTrigger.current?.focus({ preventScroll: true });
    };
    if (previewPaused || window.matchMedia("(prefers-reduced-motion: reduce)").matches) finish();
    else detailTimer.current = window.setTimeout(finish, 220);
  };
  useEffect(() => { if (detail) detailClose.current?.focus({ preventScroll: true }); }, [detail]);
  useEffect(() => {
    const element = explorer.current;
    if (!element) return;
    const observer = new IntersectionObserver(([entry]) => { element.dataset.inView = String(entry.isIntersecting); }, { threshold: .04 });
    observer.observe(element);
    const visibility = () => { element.dataset.hidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", visibility);
      window.clearTimeout(changeTimer.current);
      window.clearTimeout(detailTimer.current);
    };
  }, []);
  const event = celebrations[active];
  const Icon = event.Icon;
  const experience = active === 1 ? {
    guestTitle: english ? "The celebration starts before the party." : "La celebración empieza antes de la fiesta.",
    guestCopy: english ? "Share the birthday person's story, the party theme and everything guests need to join the celebration." : "Comparte la historia del festejado, la temática y todo lo que tus invitados necesitan para sumarse a la celebración.",
    features: english ? [["Photos & memories", "A gallery with the birthday person's personality."], ["Theme & dress code", "Colors, costumes or the style of the party."], ["Date & party schedule", "Arrival, activities and the big moments."], ["Location & useful details", "Directions, gifts and recommendations."]] : [["Fotos y recuerdos", "Una galería con la personalidad del festejado."], ["Temática y vestimenta", "Colores, disfraces o el estilo de la fiesta."], ["Fecha y programa", "Llegada, actividades y momentos especiales."], ["Ubicación y detalles", "Cómo llegar, regalos y recomendaciones."]],
    owner: english ? "FOR THE HOST" : "PARA QUIEN ORGANIZA",
    ownerTitle: english ? "More celebrating. Clearer planning." : "Más emoción. Mejor organización.",
    ownerCopy: english ? "We can include a private dashboard with guests, RSVPs and companions so you can plan your celebration." : "Podemos incluir un panel privado con invitados, confirmaciones y acompañantes para ayudarte a preparar la celebración.",
    list: english ? "Party guests" : "Invitados a la fiesta", total: 60, confirmed: 42, pending: 18, percent: 70,
    progress: english ? "The party is coming together" : "La fiesta ya toma forma",
  } : {
    guestTitle: english ? "Connect before you arrive." : "Conecta desde antes de llegar.",
    guestCopy: english ? "A home for your gathering: discover its purpose, meet the speakers and explore the program from one link." : "Un espacio para tu encuentro: conoce su propósito, descubre a los ponentes y consulta el programa desde un solo enlace.",
    features: english ? [["Speakers & participants", "Profiles, topics and people to discover."], ["Program & sessions", "Times, activities and rooms in one place."], ["Venue & directions", "Location, access and recommendations."], ["Resources & updates", "Useful links and news about the gathering."]] : [["Ponentes y participantes", "Perfiles, temas y personas por descubrir."], ["Programa y sesiones", "Horarios, actividades y salas en un lugar."], ["Sede y cómo llegar", "Ubicación, accesos y recomendaciones."], ["Recursos y novedades", "Enlaces útiles y noticias del encuentro."]],
    owner: english ? "FOR YOUR TEAM" : "PARA TU EQUIPO",
    ownerTitle: english ? "Your gathering, with a clear overview." : "Tu encuentro, con una visión clara.",
    ownerCopy: english ? "We can include a private dashboard to consult registrations, available capacity and attendance. Features depend on your event's scope." : "Podemos incluir un dashboard privado para consultar registros, cupos disponibles y asistencia. Las funciones se definen según el alcance de tu evento.",
    list: english ? "Event registrations" : "Registros al encuentro", total: 150, confirmed: 108, pending: 42, percent: 72,
    progress: english ? "Your community is growing" : "Tu comunidad crece",
  };
  const labels = english ? ["Weddings", "Celebrations", "Gatherings"] : ["Bodas", "Celebraciones", "Encuentros"];
  const contact = "https://wa.me/message/NRMRZZWEXWZ6C1";
  return (
    <section id="eventos" className={`section celebrations-section celebration-mood-${event.theme}`} aria-labelledby="celebrations-title">
      <div className="site-shell">
        <ServiceIntro event />
        <div id="tipos-invitacion" className="invitation-explorer service-invitation-destination" ref={explorer} data-changing={changing} data-paused={previewPaused} data-occasion={celebrations[selected].theme} aria-labelledby="invitation-explorer-title">
        <InvitationAurora occasion={celebrations[selected].theme} />
        <div className="event-explorer-heading" data-service-arrival-anchor>
          <div><p className="eyebrow">{english ? "MADE FOR YOUR OCCASION" : "INVITACIONES CON TU ESTILO"}</p><h2 id="invitation-explorer-title" tabIndex={-1} data-service-focus>{english ? "What are you celebrating?" : "¿Qué vas a celebrar?"}</h2></div>
          <div className="event-explorer-intro"><p>{english ? "Choose an occasion and try the sample. Each invitation is personalized with your story, your style and your event’s details." : "Elige una ocasión y prueba la muestra. Cada invitación se personaliza con tu historia, tu estilo y los detalles de tu evento."}</p><button type="button" className="event-explorer-motion" aria-pressed={previewPaused} onClick={() => setPreviewPaused(value => !value)}>{previewPaused ? <Play size={12} aria-hidden="true"/> : <Pause size={12} aria-hidden="true"/>}{english ? (previewPaused ? "Resume atmosphere" : "Pause atmosphere") : (previewPaused ? "Activar ambiente" : "Pausar ambiente")}</button></div>
        </div>
        <div className="event-category-selector" role="tablist" aria-label={english ? "Choose a celebration" : "Elige una celebración"}>
          {celebrations.map((item, index) => <button type="button" role="tab" id={`occasion-${item.theme}`} className={`event-category event-category-${item.theme}`} key={item.theme} ref={element => { categoryButtons.current[index] = element; }} aria-selected={selected === index} tabIndex={selected === index ? 0 : -1} aria-controls="event-experience" onClick={() => chooseOccasion(index)} onKeyDown={input => {
            const next = input.key === "ArrowRight" ? (index + 1) % celebrations.length : input.key === "ArrowLeft" ? (index + celebrations.length - 1) % celebrations.length : input.key === "Home" ? 0 : input.key === "End" ? celebrations.length - 1 : null;
            if (next !== null) { input.preventDefault(); chooseOccasion(next); categoryButtons.current[next]?.focus({ preventScroll: true }); }
          }}><item.Icon size={18} aria-hidden="true" /><span>{labels[index]}</span></button>)}
        </div>
        <div id="event-experience" className="event-experience is-expanded" role="tabpanel" aria-labelledby={`occasion-${celebrations[selected].theme}`} aria-busy={changing} tabIndex={0}><div className="event-experience-clip"><div className="event-experience-content">
        <div id="event-showcase" className={`event-showcase event-theme-${event.theme}`}>
          <div className="event-story" key={`story-${active}`}>
            <span className="event-chapter"><Icon size={16} aria-hidden="true"/>{labels[active]}</span>
            <h3>{active === 0 ? (english ? "Your story, in every detail." : "Su historia, en cada detalle.") : active === 1 ? (english ? "An invitation with your personality." : "Una invitación con tu personalidad.") : (english ? "A place to bring people together." : "Un lugar para reunir a tu comunidad.")}</h3><p>{active === 0 ? (english ? "Share your story, photos and everything your guests need for the big day. Together in one link, always at hand." : "Compartan su historia, sus fotos y lo que sus invitados necesitan para el gran día. Todo en un enlace, siempre a la mano.") : active === 1 ? (english ? "Bring the date, venue and party details together in an invitation your guests can explore from their phones." : "Reúne la fecha, el lugar y los detalles de la fiesta en una invitación que tus invitados pueden explorar desde su celular.") : t(event.description)}</p>
            <div className="event-possibilities"><span><Check size={15} />{english ? "A design that feels like you" : "Un diseño que se siente como tú"}</span><span><Check size={15} />{english ? "All the details in one place" : "Todos los detalles en un lugar"}</span><span><Check size={15} />{english ? "Made to share from your phone" : "Lista para compartir desde tu celular"}</span></div>
          </div>
          <div className="event-stage">
            <span className="event-stage-caption">{english ? "TRY A SAMPLE INVITATION" : "EXPLORA UNA MUESTRA"}</span>
            <span className="event-orbit event-orbit-one" aria-hidden="true" /><span className="event-orbit event-orbit-two" aria-hidden="true" />
            <div className="invitation-phone">
              <div className="invitation-screen" key={active}>
                <div className="invitation-cover"><img src={event.image} alt="" loading="lazy" width={1024} height={1536} /><div className="invitation-cover-copy"><span>{t(event.kicker)}</span><h4>{event.name}</h4><p>{english ? event.englishGreeting : event.greeting}</p></div></div>
                <div className="invitation-body"><span className="invitation-date">{event.date}</span><div className="invitation-flourish" aria-hidden="true"><span /><Icon size={16} /><span /></div><p>{english ? "Save a place in your calendar" : "Guarda un lugar en tu calendario"}</p>
                  <div className="invitation-tools"><button type="button" aria-haspopup="dialog" onClick={input => showDetail("location", input.currentTarget)}><MapPin size={16} />{english ? "Location" : "Ubicación"}</button><button type="button" aria-haspopup="dialog" onClick={input => showDetail("agenda", input.currentTarget)}><CalendarDays size={16} />{english ? "Schedule" : "Agenda"}</button></div>
                  <button type="button" className="invitation-rsvp" aria-haspopup="dialog" onClick={input => showDetail("rsvp", input.currentTarget)}>{t("Confirma tu asistencia")}<Heart size={14} aria-hidden="true" /></button>
                  <span className="invitation-example">{english ? "SAMPLE INVITATION" : "INVITACIÓN DE EJEMPLO"}</span>
                </div>
                {detail && <div className="invitation-detail" data-closing={detailClosing} role="dialog" aria-labelledby="invitation-detail-title" onKeyDown={input => { if (input.key === "Escape") { input.preventDefault(); input.stopPropagation(); closeDetail(); } }}><button ref={detailClose} type="button" className="invitation-detail-close" aria-label={english ? "Close detail" : "Cerrar detalle"} onClick={closeDetail}><X size={18} /></button><Icon size={24} /><h5 id="invitation-detail-title">{detail === "location" ? event.place : detail === "agenda" ? (english ? "Our meeting" : "Nuestra cita") : (english ? "We'll save you a place" : "Te guardamos un lugar")}</h5><p>{detail === "location" ? (english ? "Your invitation can show the address and directions to your celebration." : "Tu invitación puede mostrar la dirección y cómo llegar a tu celebración.") : detail === "agenda" ? `${event.date} · ${event.time}` : (english ? "Your guests can confirm their attendance here. This is a sample; no information is sent." : "Aquí tus invitados pueden confirmar su asistencia. Esta es una muestra; no se envían datos.")}</p><small>{english ? "Interactive sample · fictional details" : "Muestra interactiva · datos ficticios"}</small></div>}
              </div>
            </div>
            <span className="event-stage-footnote">{english ? "Try the invitation's buttons" : "Prueba los botones de la invitación"}</span>
          </div>
          <div className="event-explorer-actions" key={`actions-${active}`}>
            <div className="event-explorer-actions-row">
              {active === 0 && <a className="event-explorer-primary" href="/demos/boda-jardin/index.html" hrefLang="es"><span>{english ? "Open full wedding demo" : "Ver demo completa"}</span><ArrowUpRight size={18} aria-hidden="true"/></a>}
              <a className={active === 0 ? "event-explorer-packages" : "event-explorer-primary"} href="#planes-eventos"><span>{english ? "View packages" : "Ver paquetes"}</span><ArrowDown size={16} aria-hidden="true"/></a>
            </div>
            <p className="event-explorer-note">{active === 0 ? (english ? "A complete wedding invitation in Spanish, ready to explore." : "Una invitación de boda completa, lista para recorrer.") : (english ? "This interactive sample is a starting point. Your invitation is designed around your event." : "Esta muestra interactiva es un punto de partida. Diseñamos tu invitación alrededor de tu evento.")}</p>
            <a className="event-explorer-contact" href={contact} target="_blank" rel="noopener noreferrer"><MessageCircle size={15} aria-hidden="true"/>{english ? "Talk to us on WhatsApp" : "Platicar por WhatsApp"}<ArrowUpRight size={14} aria-hidden="true"/></a>
          </div>
        </div>
        <details className="event-extra-details" key={active}>
          <summary><span className="event-experience-mark" aria-hidden="true"><Sparkles size={22} /></span><span className="event-experience-label"><strong>{english ? "What could your invitation include?" : "¿Qué puede incluir tu invitación?"}</strong><small>{english ? "Details for your guests and tools to organize · according to your plan" : "Detalles para tus invitados y herramientas para organizar · según tu paquete"}</small></span><ChevronDown size={19} aria-hidden="true" /></summary>
        {active === 0 && <div className="wedding-hub">
          <div className="wedding-guest-info"><div className="event-hub-copy"><p className="eyebrow">{english ? "FOR YOUR GUESTS" : "PARA SUS INVITADOS"}</p><h3>{english ? "Every detail, always at hand." : "Cada detalle, siempre a la mano."}</h3><p>{english ? "One link to discover your story, plan the day and check the latest details without searching through messages." : "Un solo enlace para conocer su historia, organizarse para el gran día y consultar los detalles actualizados sin buscar entre mensajes."}</p></div><div className="wedding-memory"><img src="/demo-wedding-v2.jpg" alt="" loading="lazy" width={1024} height={1536} /><div><span>{english ? "OUR STORY" : "NUESTRA HISTORIA"}</span><strong>Valeria & Mateo</strong><small>18 · 09 · 2027</small></div><span className="wedding-memory-seal"><Heart size={17} aria-hidden="true" />{english ? "A day to remember" : "Un día para recordar"}</span></div><div className="wedding-feature-grid">
            <span><Heart size={18} aria-hidden="true" /><strong>{english ? "Your story & photos" : "Su historia y sus fotos"}</strong><small>{english ? "Meet the couple and explore their gallery." : "Conozcan a los novios y recorran su galería."}</small></span>
            <span><Sparkles size={18} aria-hidden="true" /><strong>{english ? "Dress code" : "Código de vestimenta"}</strong><small>{english ? "Style, colors and recommendations." : "Estilo, colores y recomendaciones."}</small></span>
            <span><CalendarDays size={18} aria-hidden="true" /><strong>{english ? "Date & schedule" : "Fecha y horarios"}</strong><small>{english ? "Ceremony, reception and the day's agenda." : "Ceremonia, recepción y agenda del día."}</small></span>
            <span><MapPin size={18} aria-hidden="true" /><strong>{english ? "Locations & more" : "Ubicaciones y más"}</strong><small>{english ? "Directions, gift registry and useful details." : "Cómo llegar, mesa de regalos y detalles útiles."}</small></span>
          </div></div>
          <div className="wedding-couple-info"><div className="event-hub-copy"><p className="eyebrow">{english ? "FOR THE COUPLE" : "PARA LOS NOVIOS"}</p><h3>{english ? "Your guest list, under control." : "Su lista de invitados, bajo control."}</h3><p>{english ? "We can include a private dashboard to consult your guest list, confirmations and pending replies, and organize the celebration with clarity." : "Podemos incluir un dashboard privado para consultar su lista de invitados, ver quién confirmó y quién está pendiente, y organizar la celebración con claridad."}</p>
            </div><div className="wedding-dashboard" aria-label={english ? "Illustrative guest dashboard" : "Ejemplo ilustrativo del panel de invitados"}><div className="wedding-dashboard-heading"><span><Users size={17} aria-hidden="true" />{english ? "Guest list" : "Lista de invitados"}</span><small>{english ? "SAMPLE" : "EJEMPLO"}</small></div><div className="wedding-dashboard-stats"><span><strong>120</strong>{english ? "Guests" : "Invitados"}</span><span><strong>86</strong>{english ? "Confirmed" : "Confirmados"}</span><span><strong>34</strong>{english ? "Pending" : "Pendientes"}</span></div><div className="wedding-progress"><div className="wedding-progress-ring"><strong>72<small>%</small></strong></div><div><strong>{english ? "The celebration is taking shape" : "La celebración toma forma"}</strong><span>{english ? "86 of 120 guests have confirmed" : "86 de 120 invitados confirmaron"}</span><small>{english ? "Rounded percentage · sample data" : "Porcentaje redondeado · datos de ejemplo"}</small></div></div><div className="wedding-dashboard-row"><span><i>AM</i>Ana Martínez</span><span className="wedding-status-confirmed">{english ? "Confirmed" : "Confirmado"}</span></div><div className="wedding-dashboard-row"><span><i>DL</i>Diego López</span><span>{english ? "Pending" : "Pendiente"}</span></div><div className="wedding-dashboard-row"><span><i>SR</i>Sofía Ruiz</span><span className="wedding-status-confirmed">{english ? "Confirmed" : "Confirmado"}</span></div><p>{english ? "Fictional data · Dashboard design sample" : "Datos ficticios · Muestra de diseño del panel"}</p></div>
          </div>
        </div>}
        {active !== 0 && <div className={`wedding-hub event-hub-${event.theme}`} key={`hub-${active}`}>
          <div className="wedding-guest-info"><div className="event-hub-copy"><p className="eyebrow">{english ? "FOR YOUR ATTENDEES" : active === 1 ? "PARA TUS INVITADOS" : "PARA LOS ASISTENTES"}</p><h3>{experience.guestTitle}</h3><p>{experience.guestCopy}</p>
            </div><div className="wedding-memory"><img src={event.image} alt="" loading="lazy" width={1024} height={1536} /><div><span>{t(event.kicker)}</span><strong>{event.name}</strong><small>{event.date}</small></div><span className="wedding-memory-seal"><Icon size={17} aria-hidden="true" />{english ? "Your next memory" : active === 1 ? "Celebra a tu manera" : "Ideas que conectan"}</span></div>
            <div className="wedding-feature-grid">{experience.features.map(([title, copy], index) => { const FeatureIcon = [Icon, CalendarDays, MapPin, Sparkles][index]; return <span key={title}><FeatureIcon size={18} aria-hidden="true" /><strong>{title}</strong><small>{copy}</small></span>; })}</div>
          </div>
          <div className="wedding-couple-info"><div className="event-hub-copy"><p className="eyebrow">{experience.owner}</p><h3>{experience.ownerTitle}</h3><p>{experience.ownerCopy}</p>
            </div><div className="wedding-dashboard" aria-label={english ? "Illustrative organizer dashboard" : "Ejemplo ilustrativo del panel de organización"}><div className="wedding-dashboard-heading"><span><Users size={17} aria-hidden="true" />{experience.list}</span><small>{english ? "SAMPLE" : "EJEMPLO"}</small></div>
              <div className="wedding-dashboard-stats"><span><strong>{experience.total}</strong>{active === 1 ? (english ? "Invited" : "Invitados") : (english ? "Capacity" : "Cupo total")}</span><span><strong>{experience.confirmed}</strong>{active === 1 ? (english ? "Confirmed" : "Confirmados") : (english ? "Registered" : "Registrados")}</span><span><strong>{experience.pending}</strong>{active === 1 ? (english ? "Pending" : "Pendientes") : (english ? "Available" : "Disponibles")}</span></div>
              <div className="wedding-progress"><div className="wedding-progress-ring" style={{ background: `conic-gradient(var(--hub-chart, #8b6cb9) 0% ${experience.percent}%, #ded5ec ${experience.percent}% 100%)` }}><strong>{experience.percent}<small>%</small></strong></div><div><strong>{experience.progress}</strong><span>{active === 1 ? (english ? "42 guests have confirmed" : "42 invitados confirmaron") : (english ? "108 of 150 places reserved" : "108 de 150 lugares reservados")}</span><small>{english ? "Sample data" : "Datos de ejemplo"}</small></div></div>
              {["Ana Martínez", "Diego López", "Sofía Ruiz"].map((name, index) => <div className="wedding-dashboard-row" key={name}><span><i>{name.split(" ").map(part => part[0]).join("")}</i>{name}</span><span className={active === 2 || index !== 1 ? "wedding-status-confirmed" : undefined}>{active === 2 ? (english ? "Registered" : "Registrado") : index === 1 ? (english ? "Pending" : "Pendiente") : (english ? "Confirmed" : "Confirmado")}</span></div>)}
              <p>{english ? "Fictional data · Dashboard design sample" : "Datos ficticios · Muestra de diseño del panel"}</p>
            </div>
          </div>
        </div>}
        </details>
        </div></div></div>
        </div>
        <div id="planes-eventos" className="event-plans event-plans-clear" ref={plansRoot} data-auroras-paused={aurorasPaused} aria-labelledby="event-plans-title">
          <div className="event-plans-intro">
            <div className="event-plans-heading" data-service-arrival-anchor><p className="eyebrow">{english ? "A PLAN FOR YOUR CELEBRATION" : "UN PLAN PARA TU CELEBRACIÓN"}</p><h3 id="event-plans-title" tabIndex={-1} data-service-focus>{english ? "An invitation with the right plan for you" : "Tu celebración, con el plan que necesitas"}</h3><p>{english ? "Both plans include online RSVPs and a private guest panel. Opening prices in MXN, VAT included." : "Ambos incluyen confirmaciones en línea y un panel privado de invitados. Precios de apertura en MXN, IVA incluido."}</p></div>
            <button type="button" className="package-aurora-toggle" aria-pressed={aurorasPaused} onClick={() => setAurorasPaused(value => !value)}>{aurorasPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{english ? (aurorasPaused ? "Resume auroras" : "Pause auroras") : (aurorasPaused ? "Activar auroras" : "Pausar auroras")}</button>
          </div>
          <a className="plans-compare-link" href="#comparar-paquetes">{english ? "Compare the essentials" : "Compara lo esencial"}<ArrowDown size={15} aria-hidden="true" /></a>
          <div className="event-plans-grid">{getInvitationPlans(english).map((plan, index) => <div className={`event-plan-flip aurora-card invitation-tone-${plan.tone}${flippedPlan === index ? " is-flipped" : ""}${respondingPlans.includes(index) ? " is-responding" : ""}`} key={plan.name} style={{ height: planHeights[index] || undefined }} onPointerDown={() => respondToPlan(index)} onClickCapture={event => { if (event.detail === 0) respondToPlan(index); }} onKeyDown={e => { if (e.key === "Escape" && flippedPlan === index) { e.preventDefault(); flipPlan(index, false, true); } }}>
            <div className="event-plan-flip-inner">
              <div className={`event-plan event-plan-${plan.tone} event-plan-face event-plan-front`} inert={flippedPlan === index} aria-hidden={flippedPlan === index}>
                <PackageAurora scope="invitation" index={plan.tone} face="front" />
                <div className="plan-front-content" ref={el => { planFrontContents.current[index] = el; }}>
                <button type="button" className="event-plan-summary" ref={el => { planFronts.current[index] = el; }} onClick={event => flipPlan(index, true, event.detail === 0)} aria-expanded={flippedPlan === index} aria-controls={`event-plan-back-${index}`} aria-label={english ? `View ${plan.name} details` : `Ver detalles de ${plan.name}`}>
                  <div className="event-plan-top"><span className="event-plan-emblem"><plan.Icon size={24} aria-hidden="true" /></span>{plan.name === "Aurora" && <span>{english ? "GUEST TRACKING" : "CON SEGUIMIENTO"}</span>}</div>
                  <span className="event-plan-kicker">{english ? "PLAN" : "PAQUETE"}</span><h4>{plan.name}</h4><span className="event-plan-level">{plan.level}</span><p className="event-plan-subtitle">{plan.audience}</p>

                  <InvitationPrice plan={plan} english={english} className="event-plan-price" /><span className="plan-highlights">{plan.highlights.map(feature => <span key={feature}><Check size={14} aria-hidden="true" /><span>{feature}</span></span>)}</span><span className="event-plan-explore">{english ? "Turn to see everything included" : "Gira para ver todo lo incluido"}<ArrowUpRight size={18} aria-hidden="true" /></span>
                </button>
                <a className="plan-front-cta" href={"https://wa.me/528129022231?text=" + encodeURIComponent((english ? "Hi Nordra! I would like a quote for " : "¡Hola, Nordra! Me gustaría cotizar ") + plan.name + (english ? " for " : " para ") + t(event.title).toLowerCase() + ".")} target="_blank" rel="noopener noreferrer">{(english ? "Ask about " : "Consultar ") + plan.name}<ArrowUpRight size={15} aria-hidden="true" /></a>
                </div>
              </div>
              <div id={"event-plan-back-" + index} className={`event-plan event-plan-${plan.tone} event-plan-face event-plan-back`} ref={el => { planBacks.current[index] = el; }} role="region" tabIndex={-1} aria-label={english ? `${plan.name} details` : `Detalles de ${plan.name}`} onClick={event => { if (!(event.target as HTMLElement).closest("a, button, summary, input, select, textarea") && !window.getSelection()?.toString()) flipPlan(index, false, event.detail === 0); }} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); flipPlan(index, false, true); } }} inert={flippedPlan !== index} aria-hidden={flippedPlan !== index}>
                <PackageAurora scope="invitation" index={plan.tone} face="back" />
                <div className="event-plan-back-content" ref={el => { planContents.current[index] = el; }}>
                <span className="flip-return-hint">{english ? "↶ Tap anywhere to turn back" : "↶ Toca la tarjeta para volver"}</span>
                <h4>{plan.name}</h4><InvitationPrice plan={plan} english={english} className="event-plan-price" />
                <p className="event-plan-includes">{english ? "Your plan includes" : "Tu paquete incluye"}</p>
                <ul>{plan.features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" />{feature}</li>)}</ul>
                <a href={`https://wa.me/528129022231?text=${encodeURIComponent(english ? `Hi Nordra! I would like a quote for ${plan.name} for ${t(event.title)}.` : `¡Hola, Nordra! Me gustaría cotizar ${plan.name} para ${event.title.toLowerCase()}.`)}`} target="_blank" rel="noopener noreferrer">{english ? "Discuss this plan" : "Platiquemos de tu evento"}<ArrowUpRight size={17} aria-hidden="true" /></a>
                </div>
              </div>
            </div>
          </div>)}</div>
          <InvitationComparison english={english} />
          <div className="event-care">
            <div className="event-care-heading"><Sparkles size={22} aria-hidden="true" /><div><span>{english ? "THE DETAILS ARE TAKEN CARE OF" : "TE ACOMPAÑAMOS EN LOS DETALLES"}</span><h4>{english ? "Enjoy the excitement" : "Disfruta la ilusión"}</h4><p className="event-care-intro">{english ? "We help with the details." : "Te acompañamos en los detalles."}</p></div></div>
            <div className="event-care-details">{[
              { title: english ? "Your space, your guests" : "Un lugar para tu historia y tu gente", text: english ? "Both plans include an event link, a memory gallery with up to 30 photos, your own account and a private panel. Personal links for individuals, couples and +1s keep replies organized for up to 300 people, including companions. Hosting includes up to 12 months before the event and 90 days after it; extensions are quoted separately." : "Ambos paquetes incluyen enlace del evento, una galería de recuerdos con hasta 30 fotos, cuenta propia y panel privado. Los enlaces personales para individuales, parejas y +1 reúnen las respuestas de hasta 300 personas, incluidos acompañantes. El alojamiento incluye hasta 12 meses antes y 90 días después del evento; las extensiones se cotizan aparte." },
              { title: english ? "We accompany you" : "Te acompañamos", text: english ? "WhatsApp support from delivery through 30 days after the event, Monday–Friday, 9:00–18:00, and Saturdays, 10:00–16:00, Mexico City time. Initial response within one business day. Includes help using contracted features and fixing malfunctions. Design and content adjustments use the 3 included revision rounds; new features are quoted separately. Boreal prioritizes malfunctions over general inquiries, with an initial response within 4 business hours during these service hours; resolution may take longer. Live event-day assistance is an optional add-on with an agreed schedule." : "Si tienes una duda, escríbenos por WhatsApp. Te acompañamos desde la entrega hasta 30 días después del evento, de lunes a viernes de 9:00 a 18:00 y sábados de 10:00 a 16:00, hora de Ciudad de México, con una primera respuesta en máximo un día hábil. Te ayudamos a usar las funciones de tu paquete y corregimos fallas de funcionamiento. Revisamos el diseño y el contenido contigo en 3 rondas de cambios; las funciones nuevas se cotizan aparte. Boreal da prioridad a sus incidencias frente a consultas generales, con primera respuesta en máximo 4 horas hábiles dentro de ese horario; la resolución puede requerir más tiempo. Si necesitas que estemos disponibles en vivo el día del evento, podemos acordar un horario y cotizar ese acompañamiento." },
              { title: english ? "Want your own domain?" : "¿Quieres tu propio dominio?", text: english ? "Optional and subject to availability. We quote one year of registration plus configuration and confirm the price before purchase. The domain belongs to the client, with administration assistance from Nordra. Domain renewal is independent of website hosting." : "Todos los paquetes ya incluyen un enlace de Nordra. Si prefieres una dirección propia, buscamos contigo una disponible y te compartimos el costo del registro por un año y su configuración antes de comprarla. El dominio queda a tu nombre y te ayudamos a administrarlo. Renovar esa dirección y mantener publicada tu página son servicios con vigencias independientes." },
              { title: english ? "Extra features, clear costs" : "Si tu idea necesita algo más", text: english ? "Contracted features are covered by the plan price, including photos, map links, the RSVP form and the guest panel. Sharing your link manually on WhatsApp has no additional charge from Nordra. Paid services such as automated WhatsApp or SMS messages, ticket sales or special integrations require explaining configuration costs and provider fees, and your approval before contracting or activation." : "Lo que acordamos en tu paquete está incluido: tus fotos, enlaces a mapas, el formulario y el panel de invitados. Puedes compartir tu enlace manualmente por WhatsApp sin un cargo adicional de Nordra. Si quieres sumar mensajes automáticos, venta de entradas o alguna integración de pago, primero te explicamos los costos de configuración y las comisiones del proveedor. Tú decides si seguimos adelante antes de contratar o activar algo." },
              { title: english ? "A gathering with more possibilities" : "¿Estás imaginando un encuentro más grande?", text: english ? "The plans also cover simple gatherings with information, schedule, location and RSVP collection. Aurora and Boreal include guest tracking for up to 300 attendees. Boreal also includes table organization, personal QR passes and check-in per person. Ticket sales, workshops with independent capacity, customized accreditation or live event operations need a tailored proposal." : "También podemos acompañar tu encuentro con su información, programa y ubicación. Aurora y Boreal incluyen seguimiento de hasta 300 asistentes; Boreal suma organización de mesas, pases QR personales y registro de entradas por persona. Si estás preparando venta de entradas, talleres con cupos propios, acreditaciones personalizadas o apoyo en vivo, cuéntanos tu idea y armamos una propuesta para lo que necesitas." },
            ].map((item, index) => { const DetailIcon = [Heart, MessageCircle, Globe, SlidersHorizontal, Users][index]; const teasers = english ? ["Your link, photos and guests", "Help before and after your event", "A web address that feels like you", "Choose what you want to add", "A proposal for your gathering"] : ["Tu enlace, tus fotos y tu gente", "Ayuda antes y después de tu evento", "Una dirección que se sienta tuya", "Tú decides qué quieres sumar", "Una propuesta para tu encuentro"]; return <details key={item.title} name="event-service-details"><summary><span className="event-detail-icon"><DetailIcon size={20} aria-hidden="true" /></span><span className="event-detail-label"><strong>{item.title}</strong><small>{teasers[index]}</small></span><span className="event-care-toggle" aria-hidden="true"><ChevronDown className="event-care-chevron" size={18} strokeWidth={1.6} /></span></summary><div className="event-care-body">{item.text.split(/(?<=\.)\s+(?=La página|¿Quieres|Te ayudamos|Revisamos|Premium|Si necesitas|El dominio|Renovar|Puedes|Si quieres|Tú decides|Los paquetes|Si estás)/).map(paragraph => <div className="event-care-point" key={paragraph}><span className="event-care-point-light" aria-hidden="true" /><p>{paragraph.split(/(30 fotos|300 invitados|12 meses|30 días|3 rondas de cambios|un día hábil|9:00 a 18:00|a tu nombre|atención prioritaria|sin un cargo adicional de Nordra)/g).map((part, partIndex) => partIndex % 2 ? <strong key={partIndex}>{part}</strong> : part)}</p></div>)}</div></details>; })}</div>
          </div>
        </div>
        <div className="celebrations-note"><p><strong>{t("Tu historia marca el diseño.")}</strong>{" "}{t("Platiquemos sobre el estilo, los detalles y las funciones que necesitas; con eso preparamos una propuesta para tu celebración.")}</p><span>{t("Fotografías de ejemplo · Cada proyecto se personaliza")}</span></div>
        <ServiceNext />
      </div>
    </section>
  );
}
