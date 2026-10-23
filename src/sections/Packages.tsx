import { sectionHref } from "../navigation";
import { ServiceNext } from "../components/ServiceRoute";
import { ServiceIntro } from "../components/ServiceIntro";
import { PackageAurora } from "../components/PackageAurora";
import { t, useLanguage } from "../language";
import { ArrowUpRight, Check, ChevronDown, Pause, Play } from "lucide-react";
import { BusinessExamples } from "./BusinessExamples";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

const packages = [
  {
    name: "Landing Esencial", tagline: "El primer paso para que te encuentren.",
    audience: "Para emprendedores y negocios que buscan empezar con una presencia sencilla y cuidada.",
    features: ["Una página personalizada", "Diseño para celular y computadora", "Botón de WhatsApp", "Mapa, horarios y redes sociales"],
    details: "Una landing reúne tu información en una sola página. El contenido y el alcance se acuerdan según lo que necesita tu negocio.",
  },
  {
    name: "Landing Profesional", tagline: "Dale a tu negocio espacio para contar más.",
    audience: "Para presentar tu oferta con más detalle y facilitar que tus visitantes te contacten.",
    features: ["Una página con hasta 3 secciones", "Diseño personalizado y adaptable", "Formulario de contacto y WhatsApp", "Optimización básica para buscadores", "2 rondas de cambios"],
    details: "Las secciones son bloques dentro de una misma página, por ejemplo: inicio, servicios y contacto. También contempla mapa, horarios y enlaces a tus redes sociales.",
  },
  {
    name: "Sitio de Negocio", tagline: "Una casa digital para todo lo que ofreces.",
    audience: "Para negocios que necesitan organizar más información, mostrar sus servicios y compartir su identidad.",
    features: ["De 4 a 6 apartados de contenido", "Diseño personalizado y adaptable", "Galería de fotos", "Formulario, WhatsApp y redes", "SEO básico y 2 rondas de cambios"],
    details: "Los apartados pueden incluir servicios, nosotros, galería y contacto. Definimos en la cotización si se organizan como secciones en una página o como páginas independientes. Incluye mapa y horarios.",
  },
];

const priceRanges = ["$1,799–$2,999", "$2,999–$5,999", "$4,999–$9,999", "$7,999–$14,999+", "$11,999–$29,999+"];

const customPackages = [
  { name: "Web a medida", tagline: "Funcionalidades que acompañan tu negocio.", audience: "Para un proyecto que necesita algo más que una página informativa.", features: ["Diseño personalizado y adaptable", "Formularios avanzados", "Catálogo de productos o servicios", "Integraciones según el alcance", "WhatsApp, mapa y redes sociales", "SEO y 2 rondas de cambios"], details: "Reservas, pagos y otras integraciones se definen en la propuesta. El alcance y los servicios externos necesarios se cotizan según tu proyecto." },
  { name: "Tienda en línea", tagline: "Un espacio para vender lo que haces.", audience: "Para organizar tus productos y recibir pedidos en internet.", features: ["Diseño personalizado y adaptable", "Catálogo según el plan", "Integración de pagos", "Opciones de envío", "Panel de administración", "Capacitación básica", "SEO y 2 a 3 rondas de cambios"], details: "La cantidad de productos, cobertura de envíos, pagos y funcionalidades se acuerdan en la cotización. Las comisiones y servicios externos se especifican por separado." },
];

function PackageCard({ pack, index, expanded, onToggle }: { pack: (typeof packages)[number]; index: number; expanded: boolean; onToggle: () => void }) {
  const language = useLanguage();
  const front = useRef<HTMLButtonElement>(null);
  const back = useRef<HTMLDivElement>(null);
  const frontContent = useRef<HTMLDivElement>(null);
  const backContent = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  const [scopeOpen, setScopeOpen] = useState(false);
  const [auroraResponding, setAuroraResponding] = useState(false);
  const responseTimer = useRef(0);
  const previousExpanded = useRef(expanded);
  const focusFrame = useRef(0);
  const respondToAurora = useCallback(() => {
    // Rapid taps join the same gentle wave instead of restarting it.
    if (responseTimer.current) return;
    setAuroraResponding(true);
    responseTimer.current = window.setTimeout(() => {
      setAuroraResponding(false);
      responseTimer.current = 0;
    }, 1400);
  }, []);
  useEffect(() => {
    if (previousExpanded.current !== expanded) respondToAurora();
    previousExpanded.current = expanded;
  }, [expanded, respondToAurora]);
  useEffect(() => () => {
    window.cancelAnimationFrame(focusFrame.current);
    window.clearTimeout(responseTimer.current);
  }, []);
  useLayoutEffect(() => {
    const content = expanded ? backContent.current : frontContent.current;
    if (!content) return;
    // Perspective changes visual bounds during the turn, never layout height.
    const measure = () => {
      const nextHeight = content.offsetHeight + 2;
      setHeight(current => current === nextHeight ? current : nextHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(content);
    return () => observer.disconnect();
  }, [expanded, language]);
  const flip = (keyboard = false) => {
    window.cancelAnimationFrame(focusFrame.current);
    onToggle();
    focusFrame.current = window.requestAnimationFrame(() => {
      const face = expanded ? front.current : back.current;
      if (!face) return;
      face.dataset.keyboardFocus = String(keyboard);
      face.focus({ preventScroll: true });
    });
  };
  const quoteMessage = [
    language === "en"
      ? `Hi Nordra Studio! I'd like a quote for the ${t(pack.name)} package.`
      : `¡Hola, Nordra Studio! Me gustaría cotizar el paquete ${t(pack.name)}.`,
    "",
    language === "en" ? "Included in this package:" : "Este paquete incluye:",
    ...pack.features.map(feature => `• ${t(feature)}`),
    "",
    language === "en" ? "I'd like to discuss my project and confirm the scope and final price." : "Me gustaría platicar de mi proyecto y confirmar el alcance y el precio final.",
  ].join("\n");
  const quoteUrl = `https://wa.me/528129022231?text=${encodeURIComponent(quoteMessage)}`;
  return (
    <div className={`package-card package-accordion business-flip aurora-card package-tone-${index}${expanded ? " is-open" : ""}${auroraResponding ? " is-responding" : ""}`} style={{ height }} onPointerDown={respondToAurora} onClickCapture={event => { if (event.detail === 0) respondToAurora(); }} onClick={event => {
      if (!(event.target as HTMLElement).closest("a, button, .package-scope, input, select, textarea") && !window.getSelection()?.toString()) flip(event.detail === 0);
    }} onKeyDown={event => { if (event.key === "Escape" && expanded) { event.preventDefault(); flip(true); } }}>
      <div className="business-flip-inner">
      <div className="business-flip-front" inert={expanded} aria-hidden={expanded}>
      <PackageAurora scope="business" index={index} face="front"/>
      <div className="business-front-content" ref={frontContent}>
      <button type="button" className="package-trigger" ref={front} aria-expanded={expanded} aria-controls={`package-panel-${index}`} onClick={event => flip(event.detail === 0)}>
        <span className="package-summary-copy"><span className="package-summary-title">{t(pack.name)}</span><span className="package-compare-audience">{t(pack.audience)}</span><span className="package-compare-price">{priceRanges[index]} <small>MXN · {t("IVA incluido")}</small></span></span>
        <span className="package-summary-action"><span>{language === "en" ? "Tap to turn" : "Toca para girar"}</span><ChevronDown size={20} aria-hidden="true" /></span>
      </button>
      <a className="package-quick-quote" href={quoteUrl} target="_blank" rel="noopener noreferrer" aria-label={language === "en" ? `Quote ${t(pack.name)} on WhatsApp` : `Cotizar ${pack.name} por WhatsApp`}>{language === "en" ? "Request a quote" : "Solicitar cotización"}<ArrowUpRight size={16} aria-hidden="true" /></a>
      </div></div>
      <div id={`package-panel-${index}`} className="package-panel" ref={back} role="region" tabIndex={-1} aria-label={language === "en" ? `${t(pack.name)} details. Press Enter to turn back.` : `Detalles de ${pack.name}. Presiona Enter para volver.`} aria-hidden={!expanded} onKeyDown={event => {
        if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); flip(true); }
      }} inert={!expanded}><PackageAurora scope="business" index={index} face="back"/><div className="package-panel-clip" ref={backContent}><div className="package-expanded">
        <div className="package-expanded-intro">
          <button type="button" className="flip-return-hint business-return" onClick={event => flip(event.detail === 0)}>{language === "en" ? "↶ Back to package" : "↶ Volver al paquete"}</button>
          <h3>{t(pack.name)}</h3>
          <p className="package-price">{priceRanges[index]} <span>MXN · {t("IVA incluido")}</span></p>
        </div>
        <div className="package-options"><h4>{t("Incluido en tu paquete")}</h4><ul>{pack.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true" /><span>{t(feature)}</span></li>)}</ul></div>
        <div className="package-action"><a href={quoteUrl} target="_blank" rel="noopener noreferrer" aria-label={language === "en" ? `Request a quote for ${t(pack.name)} on WhatsApp` : `Solicitar cotización de ${pack.name} por WhatsApp`}>{t("Cotizar este paquete")}<ArrowUpRight size={17} aria-hidden="true" /></a></div>
        <div className={`package-scope${scopeOpen ? " is-expanded" : ""}`}>
          <button type="button" className="package-scope-toggle" aria-expanded={scopeOpen} aria-controls={`package-scope-${index}`} onClick={() => setScopeOpen(value => !value)}>{language === "en" ? "Scope and conditions" : "Alcance y condiciones"}<ChevronDown size={16} aria-hidden="true" /></button>
          <div id={`package-scope-${index}`} className="package-scope-reveal" inert={!scopeOpen} aria-hidden={!scopeOpen}><div>
          <p>{t(pack.details)}</p>
          <p>{t("Rango de referencia. La inversión final depende del diseño, contenido y funcionalidades acordadas.")}</p>
          <p>{t("Incluye el primer mes de alojamiento y soporte desde la publicación. Después, el alojamiento se paga por separado según el plan acordado.")} <a href={sectionHref("alojamiento-negocios")}>{t("Ver continuidad y costos")}</a></p>
          <p>{t("¿Necesitas algo más? Los extras y las funciones a medida se cotizan por separado según el alcance de tu proyecto.")}</p>
          </div></div>
        </div>
      </div>
    </div></div></div></div>
  );
}
export function Packages() {
  const language = useLanguage();
  const root = useRef<HTMLElement>(null);
  const [aurorasPaused, setAurorasPaused] = useState(false);
  const [activePackage, setActivePackage] = useState<number | null>(null);
  const togglePackage = (index: number) => setActivePackage(current => current === index ? null : index);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      (entry.target as HTMLElement).dataset.auroraVisible = String(entry.isIntersecting);
    }), { threshold: .05 });
    section.querySelectorAll(".business-flip").forEach(card => observer.observe(card));
    const visibility = () => { section.dataset.aurorasHidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, [language]);
  return (
    <section id="paquetes" className="section packages-section" ref={root} data-auroras-paused={aurorasPaused} aria-labelledby="packages-title">
      <div className="site-shell">
        <ServiceIntro />
        <BusinessExamples />
        <div className="service-packages-heading" data-service-arrival-anchor>
        <div className="package-heading-row">
          <h2 id="opciones-negocio" className="comparison-heading" tabIndex={-1} data-service-focus>{language === "en" ? "Compare your options" : "Compara tus opciones"}</h2>
          <button type="button" className="package-aurora-toggle" aria-pressed={aurorasPaused} onClick={() => setAurorasPaused(value => !value)}>{aurorasPaused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}{language === "en" ? (aurorasPaused ? "Resume auroras" : "Pause auroras") : (aurorasPaused ? "Activar auroras" : "Pausar auroras")}</button>
        </div>
        <p className="comparison-note">{language === "en" ? "Reference ranges in MXN, VAT included. Final scope and price are confirmed in your quote. Hosting after the first month is billed separately; see plans below." : "Rangos orientativos en MXN, IVA incluido. Confirmamos alcance y precio final en tu cotización. El alojamiento después del primer mes se cobra aparte; consulta los planes abajo."}</p>
        </div>
        <div className="packages-grid">
          {packages.map((pack, index) => <PackageCard key={t(pack.name)} pack={pack} index={index} expanded={activePackage === index} onToggle={() => togglePackage(index)} />)}
        </div>
        <p className="custom-packages-label">{language === "en" ? "For projects with specific needs" : "Para proyectos con necesidades específicas"}</p>
        <div className="custom-packages">
          {customPackages.map((pack, index) => <PackageCard key={t(pack.name)} pack={pack} index={index + 3} expanded={activePackage === index + 3} onToggle={() => togglePackage(index + 3)} />)}
        </div>
        <aside id="alojamiento-negocios" className="hosting-info" aria-labelledby="hosting-info-title">
          <p className="eyebrow">{t("SEGUIMOS CONTIGO")}</p>
          <h3 id="hosting-info-title">{t("Elige tu paquete. Nosotros lo mantenemos en línea.")}</h3>
          <p>{t("Todos los paquetes de negocio incluyen el primer mes de alojamiento y soporte técnico desde la publicación. Después, elige la continuidad que prefieras; se paga por separado del desarrollo.")}</p>
          <div className="hosting-options">
            <div><h4>{t("Página informativa sencilla")}</h4><p><strong>$299</strong> {t("MXN al mes")}</p><p>{t("O $1,495 por 6 meses · $2,990 por 12 meses")}</p></div>
            <div><h4>{t("Aplicación con panel o registros")}</h4><p><strong>$599</strong> {t("MXN al mes")}</p><p>{t("O $2,995 por 6 meses · $5,990 por 12 meses")}</p></div>
          </div>
          <p className="hosting-summary">{t("Todos los precios incluyen IVA. El primer mes va por nuestra cuenta; tu plan de pago comienza después, sin cargos automáticos.")}</p>
          <details className="hosting-details"><summary>{t("Qué incluye y cómo funciona")}<ChevronDown size={17} aria-hidden="true" /></summary><div>
          <p>{t("IVA incluido. Los planes semestrales y anuales se pagan por adelantado; empiezan al terminar el mes incluido. La cotización fija el precio final, la capacidad y las fechas de tu proyecto.")}</p>
          <p>{t("Incluye subdominio de Nordra sujeto a disponibilidad, revisión preventiva mensual y mantenimiento de las funciones contratadas. Dominio propio, cambios de contenido, funciones nuevas y servicios externos se cotizan por separado.")}</p>
          <p>{t("Renovación con tu aceptación y pago, sin cargos automáticos. Estos planes corresponden a negocios; los eventos tienen su propia vigencia.")}</p>
          <a href="/terminos-del-servicio.html#7-dominios-alojamiento-y-vigencia" hrefLang="es">{t("Consultar alojamiento, cancelaciones y reembolsos")}</a>
          </div></details>
        </aside>
        <p className="package-note">{t("Cada propuesta detalla el alcance y la inversión. Dominio, alojamiento y costos de servicios externos se especifican por separado en la cotización.")}</p>
        <ServiceNext />
      </div>
    </section>
  );
}
