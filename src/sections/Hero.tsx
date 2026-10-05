import { t, useLanguage } from "../language";
import { BarChart3, Box, Zap } from "lucide-react";
import { useEffect, useState } from "react";

const demos = [
  { name: "Café", brand: "BRUMA", subtitle: "CAFÉ DE ESPECIALIDAD", kicker: "DEL ORIGEN A TU TAZA", title: "Buen café.", accent: "Buenos días.", description: "Haz de cada mañana un ritual.", detail: "Descubre tu próximo café favorito.", button: "Explorar el café", footer: "Un café para cada momento." },
  { name: "Interiores", brand: "FORMA", subtitle: "ESTUDIO DE INTERIORES", kicker: "DISEÑO PARA HABITAR", title: "Tu espacio.", accent: "Tu esencia.", description: "Espacios que se sienten como tú.", detail: "Diseño pensado para tu día a día.", button: "Conocer el estudio", footer: "Cada detalle tiene un propósito." },
  { name: "Consultoría", brand: "NEXO", subtitle: "CONSULTORÍA DE NEGOCIOS", kicker: "IDEAS QUE AVANZAN", title: "Tu siguiente", accent: "gran paso.", description: "Claridad para tomar decisiones.", detail: "Estrategia para mover tu negocio.", button: "Conocer soluciones", footer: "Una visión clara. Nuevas posibilidades." },
];

const businessPhotos = ["/demo-coffee-v2.jpg", "/demo-interiors-v2.jpg", "/demo-consulting-v2.jpg"];
const eventPhotos = ["/demo-wedding-v2.jpg", "/demo-birthday-v2.jpg", "/demo-creative-v2.jpg"];

export function Hero() {
  const language = useLanguage();
const eventDemos = [
  { monogram: "A & M", message: <>{t("Una nueva")}<br />{t("historia juntos.")}</>, kicker: "NOS CASAMOS", title: "Ana & Mateo", description: "Una celebración para recordar.", button: "Confirma tu asistencia" },
  { monogram: "V", message: <>{t("Hoy toca")}<br />{t("celebrar.")}</>, kicker: "ESTÁS INVITADO", title: "Valeria · 30", description: "Un año más. Mil nuevos recuerdos.", button: "Quiero acompañarte" },
  { monogram: "EN", message: <>{t("Ideas que")}<br />{t("nos conectan.")}</>, kicker: "ENCUENTRO CREATIVO", title: "Entre Ideas", description: "Un espacio para compartir e inspirar.", button: "Quiero asistir" },
];


  const [activeDemo, setActiveDemo] = useState(0);
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  useEffect(() => {
    [...businessPhotos, ...eventPhotos].forEach(src => {
      const image = new Image();
      image.src = src;
    });
  }, []);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    if (paused || hovered || reducedMotion) return;
    const timer = window.setInterval(() => setActiveDemo(index => (index + 1) % demos.length), 6500);
    return () => window.clearInterval(timer);
  }, [paused, hovered, reducedMotion, activeDemo]);
  const demo = demos[activeDemo];
  const eventDemo = eventDemos[activeDemo];
  return (
    <section id="inicio" className="hero-section hero-section-v6">
      <div className="hero-backdrop hero-backdrop-v6" aria-hidden="true">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
        <div className="hero-stars" />
        <div className="mountain-silhouette mountain-back" />
        <div className="mountain-silhouette mountain-front" />
      </div>

      <div className="site-shell hero-grid hero-grid-v6">
        <div className="hero-copy hero-copy-v6">
          <p className="eyebrow">{t("IDEAS · DISEÑO · EXPERIENCIAS · RESULTADOS")}</p>

          <h1>{t("Creamos experiencias web")}<br />{t("para")}{" "}<span className="gradient-text">{t("negocios y eventos")}</span>
          </h1>

          <p className="hero-description">{t("Diseño, desarrollo y estrategia digital que conectan marcas con personas. En Nordra Studio creamos sitios modernos, experiencias memorables y soluciones digitales con propósito.")}</p>

          <div className="hero-actions">
            <a href="#paquetes" className="primary-cta">{t("Ver paquetes")}<span>→</span>
            </a>
            <a href="#contacto" className="secondary-cta">{t("Contáctanos")}</a>
          </div>

          <div className="hero-benefits">
            <div className="benefit-item">
              <Zap size={18} />
              <div>
                <strong>{t("Diseño moderno")}</strong>
                <span>{t("con propósito")}</span>
              </div>
            </div>

            <div className="benefit-item">
              <Box size={18} />
              <div>
                <strong>{t("Desarrollo a medida")}</strong>
                <span>{t("para tu proyecto")}</span>
              </div>
            </div>

            <div className="benefit-item">
              <BarChart3 size={18} />
              <div>
                <strong>{t("Resultados reales")}</strong>
                <span>{t("que generan valor")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual hero-showcase">
          <div className="web-showcase" role="region" aria-label={t("Diseños de ejemplo para negocios y eventos")} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)} onFocusCapture={() => setHovered(true)} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) setHovered(false); }}>
            <div className="showcase-aura" aria-hidden="true" />
            <div className="desktop-demo" aria-hidden="true">
              <div className="demo-browser"><span /><span /><span /><div>{t("vista previa · negocio")}</div></div>
              <div key={activeDemo} className={`outdoor-demo coffee-demo demo-variant-${activeDemo}`}>
                <div className={`business-photo business-photo-${activeDemo}`}><img src={businessPhotos[activeDemo]} alt="" width={1024} height={1536} /><span className="business-photo-label">{t(demo.subtitle)}</span></div>
                <div className="outdoor-navigation"><strong>{demo.brand}<span>{t(demo.subtitle)}</span></strong><span>{t("Nosotros")} &nbsp; {t("Soluciones")} &nbsp; {t("Contacto")}</span><span className="outdoor-menu">↗</span></div>
                <div className="outdoor-copy">
                  <span className="outdoor-kicker">{t(demo.kicker)}</span>
                  <h2>{t(demo.title)}<br /><em>{t(demo.accent)}</em></h2>
                  <p>{t(demo.description)}<br />{t(demo.detail)}</p>
                  <span className="outdoor-button">{t(demo.button)} <span>↗</span></span>
                </div>
                <div className="outdoor-footer"><span className="outdoor-coordinate">{t(demo.footer)}<br /><small>{t("DISEÑO CON PERSONALIDAD")}</small></span><span className="outdoor-next">0{activeDemo + 1} / 03 &nbsp; →</span></div>
              </div>
            </div>
            <div className="phone-demo" aria-hidden="true">
              <div className="phone-speaker" />
              <div key={activeDemo} className={`event-demo event-variant-${activeDemo}`}>
                <span className="event-monogram">{eventDemo.monogram}</span>
                <div className="event-arch"><img src={eventPhotos[activeDemo]} alt="" width={1024} height={1536} /><span>{eventDemo.message}</span></div>
                <span className="event-kicker">{t(eventDemo.kicker)}</span>
                <h3>{eventDemo.title}</h3>
                <p>{t(eventDemo.description)}</p>
                <span className="event-demo-button">{t(eventDemo.button)}</span>
              </div>
            </div>
            <div className="showcase-caption">{t("DISEÑOS DE EJEMPLO")}<span>{t(demo.name)} + {t("eventos")}</span></div>
            <div className="showcase-controls" aria-label={t("Elegir diseño de escritorio")}>
              {demos.map((item, index) => <button type="button" key={item.name} aria-label={`${language === "en" ? "View design:" : "Ver diseño de"} ${t(item.name)}`} aria-pressed={activeDemo === index} onClick={() => setActiveDemo(index)}>{index + 1}</button>)}
              {!reducedMotion && <button type="button" aria-label={t(paused ? "Reanudar diseños" : "Pausar diseños")} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? "▶" : "Ⅱ"}</button>}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
