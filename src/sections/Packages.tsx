import { t, useLanguage } from "../language";
import { ArrowUpRight, ChevronDown, Code2, ShoppingBag, Sprout, PanelsTopLeft, Building2 } from "lucide-react";
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
const priceRanges = ["$1,499–$2,999", "$2,999–$5,999", "$4,999–$9,999", "$7,999–$14,999+", "$11,999–$29,999+"];

const customPackages = [
  { name: "Web a medida", tagline: "Funcionalidades que acompañan tu negocio.", audience: "Para un proyecto que necesita algo más que una página informativa.", features: ["Diseño personalizado y adaptable", "Formularios avanzados", "Catálogo de productos o servicios", "Integraciones según el alcance", "WhatsApp, mapa y redes sociales", "SEO y 2 rondas de cambios"], details: "Reservas, pagos y otras integraciones se definen en la propuesta. El alcance y los servicios externos necesarios se cotizan según tu proyecto." },
  { name: "Tienda en línea", tagline: "Un espacio para vender lo que haces.", audience: "Para organizar tus productos y recibir pedidos en internet.", features: ["Diseño personalizado y adaptable", "Catálogo según el plan", "Integración de pagos", "Opciones de envío", "Panel de administración", "Capacitación básica", "SEO y 2 a 3 rondas de cambios"], details: "La cantidad de productos, cobertura de envíos, pagos y funcionalidades se acuerdan en la cotización. Las comisiones y servicios externos se especifican por separado." },
];

function PackageCard({ pack, index, expanded, onToggle }: { pack: (typeof packages)[number]; index: number; expanded: boolean; onToggle: () => void }) {
  const language = useLanguage();
  const [selected, setSelected] = useState(pack.features);
  const icons = [...packageIcons, Code2, ShoppingBag];
  const Icon = icons[index];
  const message = language === "en" ? `Hi! I am interested in ${t(pack.name)} from Nordra Studio. The estimated range is ${priceRanges[index]} MXN. I would like to include: ${selected.length ? selected.map(t).join(", ") : "I would like to discuss the options with you"}. I would like a quote for my project.` : `¡Hola! Me interesa ${pack.name} de Nordra Studio. El rango de referencia es ${priceRanges[index]} MXN. Me gustaría incluir: ${selected.length ? selected.join(", ") : "prefiero definirlo contigo"}. Quisiera una cotización para mi proyecto.`;
  return (
    <div className={`package-card package-accordion package-tone-${index % 3}${expanded ? " is-open" : ""}`}>
      <button type="button" className="package-trigger" aria-expanded={expanded} aria-controls={`package-panel-${index}`} onClick={onToggle}>
        <span className="package-emblem"><Icon size={26} aria-hidden="true" /></span>
        <span className="package-summary-copy"><span className="package-summary-title">{t(pack.name)}</span><span className="package-summary-tagline">{t(pack.tagline)}</span></span>
        <span className="package-summary-action"><span>{t("Explorar paquete")}</span><ChevronDown size={20} aria-hidden="true" /></span>
      </button>
      <div id={`package-panel-${index}`} className="package-panel" inert={!expanded}><div className="package-panel-clip"><div className="package-expanded">
        <div className="package-expanded-intro">
          <h3>{t(pack.name)}</h3>
          <p className="package-audience">{t(pack.audience)}</p>
          <p className="package-audience">{t(pack.details)}</p>
          <p className="package-price">{priceRanges[index]} <span>{t("MXN")}</span></p>
          <p className="package-options-note">{t("Rango de referencia. La inversión final depende del diseño, contenido y funcionalidades acordadas.")}</p>
        </div>
        <div>
          <fieldset className="package-options"><legend>{t("¿Qué te gustaría incluir?")}</legend>{pack.features.map(feature => <label key={t(feature)}><input type="checkbox" checked={selected.includes(feature)} onChange={() => setSelected(current => current.includes(feature) ? current.filter(item => item !== feature) : [...current, feature])} /><span>{t(feature)}</span><small>{t("Incluido")}</small></label>)}</fieldset>
          <p className="package-options-note">{t("Estas opciones están contempladas en el paquete. Tu selección nos ayuda a preparar la propuesta; desmarcarlas no aplica un descuento automático.")}</p>
          <div className="package-action"><a href={`https://wa.me/528111197607?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label={language === "en" ? `Request a quote for ${t(pack.name)} on WhatsApp` : `Solicitar cotización de ${pack.name} por WhatsApp`}>{t("Cotizar mi selección")}<ArrowUpRight size={17} aria-hidden="true" /></a></div>
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
        <p className="package-note">{t("Cada propuesta detalla el alcance y la inversión. Dominio, alojamiento y costos de servicios externos se especifican por separado en la cotización.")}</p>
      </div>
    </section>
  );
}
