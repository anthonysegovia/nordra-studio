import { t, useLanguage } from "../language";
import { ArrowUpRight, Check, ChevronDown, Code2, ShoppingBag, Sprout, PanelsTopLeft, Building2 } from "lucide-react";
import { useState } from "react";

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

const packageIcons = [Sprout, PanelsTopLeft, Building2];
const priceRanges = ["$1,799–$2,999", "$2,999–$5,999", "$4,999–$9,999", "$7,999–$14,999+", "$11,999–$29,999+"];

const customPackages = [
  { name: "Web a medida", tagline: "Funcionalidades que acompañan tu negocio.", audience: "Para un proyecto que necesita algo más que una página informativa.", features: ["Diseño personalizado y adaptable", "Formularios avanzados", "Catálogo de productos o servicios", "Integraciones según el alcance", "WhatsApp, mapa y redes sociales", "SEO y 2 rondas de cambios"], details: "Reservas, pagos y otras integraciones se definen en la propuesta. El alcance y los servicios externos necesarios se cotizan según tu proyecto." },
  { name: "Tienda en línea", tagline: "Un espacio para vender lo que haces.", audience: "Para organizar tus productos y recibir pedidos en internet.", features: ["Diseño personalizado y adaptable", "Catálogo según el plan", "Integración de pagos", "Opciones de envío", "Panel de administración", "Capacitación básica", "SEO y 2 a 3 rondas de cambios"], details: "La cantidad de productos, cobertura de envíos, pagos y funcionalidades se acuerdan en la cotización. Las comisiones y servicios externos se especifican por separado." },
];

function PackageCard({ pack, index, expanded, onToggle }: { pack: (typeof packages)[number]; index: number; expanded: boolean; onToggle: () => void }) {
  const language = useLanguage();
  const icons = [...packageIcons, Code2, ShoppingBag];
  const Icon = icons[index];
  const comingSoon = index === 4;
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
    <div className={`package-card package-accordion package-tone-${index % 3}${expanded ? " is-open" : ""}${comingSoon ? " is-unavailable" : ""}`}>
      <button type="button" className="package-trigger" disabled={comingSoon} aria-expanded={expanded && !comingSoon} aria-controls={`package-panel-${index}`} onClick={onToggle}>
        <span className="package-emblem"><Icon size={26} aria-hidden="true" /></span>
        <span className="package-summary-copy"><span className="package-summary-title">{t(pack.name)}{comingSoon && <span className="package-coming-soon">{language === "en" ? "Coming soon" : "Disponible pronto"}</span>}</span><span className="package-summary-tagline">{t(pack.tagline)}</span></span>
        <span className="package-summary-action"><span>{comingSoon ? (language === "en" ? "In preparation" : "En preparación") : t("Explorar paquete")}</span>{!comingSoon && <ChevronDown size={20} aria-hidden="true" />}</span>
      </button>
      <div id={`package-panel-${index}`} className="package-panel" inert={!expanded || comingSoon}><div className="package-panel-clip"><div className="package-expanded">
        <div className="package-expanded-intro">
          <h3>{t(pack.name)}</h3>
          <p className="package-audience">{t(pack.audience)}</p>
          <p className="package-audience">{t(pack.details)}</p>
          <p className="package-price">{priceRanges[index]} <span>{t("MXN")} · {t("IVA incluido")}</span></p>
          <p className="package-options-note">{t("Rango de referencia. La inversión final depende del diseño, contenido y funcionalidades acordadas.")}</p>
          <p className="package-options-note">{t("Incluye el primer mes de alojamiento y soporte desde la publicación. Después, el alojamiento se paga por separado según el plan acordado.")} <a href="#alojamiento-negocios">{t("Ver continuidad y costos")}</a></p>
        </div>
        <div>
          <div className="package-options"><h4>{t("Incluido en tu paquete")}</h4><ul>{pack.features.map(feature => <li key={feature}><Check size={17} aria-hidden="true" /><span>{t(feature)}</span></li>)}</ul></div>
          <p className="package-options-note">{t("¿Necesitas algo más? Los extras y las funciones a medida se cotizan por separado según el alcance de tu proyecto.")}</p>
          <div className="package-action"><a href={quoteUrl} target="_blank" rel="noopener noreferrer" aria-label={language === "en" ? `Request a quote for ${t(pack.name)} on WhatsApp` : `Solicitar cotización de ${pack.name} por WhatsApp`}>{t("Cotizar este paquete")}<ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </div>
      </div>
    </div></div></div>
  );
}
export function Packages() {
  useLanguage();
  const [activePackage, setActivePackage] = useState<number | null>(null);
  const togglePackage = (index: number) => setActivePackage(current => current === index ? null : index);
  return (
    <section id="paquetes" className="section packages-section" aria-labelledby="packages-title">
      <div className="site-shell">
        <div className="packages-heading">
          <p className="eyebrow">{t("UNA OPCIÓN PARA CADA IDEA")}</p>
          <h2 id="packages-title">{t("Paquetes para tu negocio")}</h2>
          <p>{t("Empieza con lo que necesitas hoy. Encontramos contigo la opción que mejor se adapta a tu proyecto.")}</p>
        </div>
        <div className="packages-grid">
          {packages.map((pack, index) => <PackageCard key={t(pack.name)} pack={pack} index={index} expanded={activePackage === index} onToggle={() => togglePackage(index)} />)}
        </div>
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
      </div>
    </section>
  );
}
