import { ArrowUpRight, Check, Code2, ShoppingBag, Sprout, PanelsTopLeft, Building2 } from "lucide-react";
import { useRef, useState } from "react";

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
const priceRanges = ["$1,500–$3,000", "$3,000–$6,000", "$5,000–$10,000", "$8,000–$15,000+", "$12,000–$30,000+"];

const customPackages = [
  { name: "Web a medida", tagline: "Funcionalidades que acompañan tu negocio.", audience: "Para un proyecto que necesita algo más que una página informativa.", features: ["Diseño personalizado y adaptable", "Formularios avanzados", "Catálogo de productos o servicios", "Integraciones según el alcance", "WhatsApp, mapa y redes sociales", "SEO y 2 rondas de cambios"], details: "Reservas, pagos y otras integraciones se definen en la propuesta. El alcance y los servicios externos necesarios se cotizan según tu proyecto." },
  { name: "Tienda en línea", tagline: "Un espacio para vender lo que haces.", audience: "Para organizar tus productos y recibir pedidos en internet.", features: ["Diseño personalizado y adaptable", "Catálogo según el plan", "Integración de pagos", "Opciones de envío", "Panel de administración", "Capacitación básica", "SEO y 2 a 3 rondas de cambios"], details: "La cantidad de productos, cobertura de envíos, pagos y funcionalidades se acuerdan en la cotización. Las comisiones y servicios externos se especifican por separado." },
];

function PackageCard({ pack, index }: { pack: (typeof packages)[number]; index: number }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(pack.features);
  const frontButton = useRef<HTMLButtonElement>(null);
  const backButton = useRef<HTMLButtonElement>(null);
  const icons = [...packageIcons, Code2, ShoppingBag];
  const Icon = icons[index];
  const switchFace = (next: boolean) => {
    setFlipped(next);
    window.requestAnimationFrame(() => (next ? backButton : frontButton).current?.focus({ preventScroll: true }));
  };
  const message = `¡Hola! Me interesa ${pack.name} de Nordra Studio. El rango de referencia es ${priceRanges[index]} MXN. Me gustaría incluir: ${selected.length ? selected.join(", ") : "prefiero definirlo contigo"}. Quisiera una cotización para mi proyecto.`;
  return (
    <article className={`package-flip package-tone-${index % 3}${flipped ? " is-flipped" : ""}`} aria-label={pack.name}>
      <div className="package-flip-inner">
        <div
          className={`package-card package-face package-front package-tone-${index % 3}`}
          inert={flipped}
          aria-hidden={flipped}
          onClick={event => {
            if ((event.target as HTMLElement).closest("button, a, input, label")) return;
            switchFace(true);
          }}
        >
          <div className="package-card-top"><span className="package-emblem"><Icon size={26} aria-hidden="true" /></span></div>
          <h3>{pack.name}</h3><p className="package-tagline">{pack.tagline}</p><p className="package-audience">{pack.audience}</p>
          <ul>{pack.features.map(feature => <li key={feature}><Check size={16} aria-hidden="true" /><span>{feature}</span></li>)}</ul>
          <div className="package-action"><p>Conoce la inversión y elige tus opciones</p><button type="button" ref={frontButton} onClick={() => switchFace(true)} aria-label={`Ver inversión de ${pack.name}`}>Ver inversión <ArrowUpRight size={17} aria-hidden="true" /></button></div>
        </div>
        <div className={`package-card package-face package-back package-tone-${index % 3}`} inert={!flipped} aria-hidden={!flipped}>
          <div className="package-card-top"><span className="package-emblem"><Icon size={26} aria-hidden="true" /></span><button ref={backButton} type="button" className="package-return" onClick={() => switchFace(false)} aria-label={`Volver a ${pack.name}`}>← Volver</button></div>
          <h3>{pack.name}</h3><p className="package-price">{priceRanges[index]} <span>MXN</span></p>
          <p className="package-audience">Rango de referencia. La inversión final depende del diseño, contenido y funcionalidades acordadas.</p>
          <fieldset className="package-options"><legend>¿Qué te gustaría incluir?</legend>{pack.features.map(feature => <label key={feature}><input type="checkbox" checked={selected.includes(feature)} onChange={() => setSelected(current => current.includes(feature) ? current.filter(item => item !== feature) : [...current, feature])} /><span>{feature}</span><small>Incluido</small></label>)}</fieldset>
          <p className="package-options-note">Estas opciones están contempladas en el paquete. Tu selección nos ayuda a preparar la propuesta; desmarcarlas no aplica un descuento automático.</p>
          <div className="package-action"><p>Personalizamos tu cotización por WhatsApp</p><a href={`https://wa.me/528111197607?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer" aria-label={`Solicitar cotización de ${pack.name} por WhatsApp`}>Cotizar mi selección <ArrowUpRight size={17} aria-hidden="true" /></a></div>
        </div>
      </div>
    </article>
  );
}

function inquiry(name: string) {
  return `https://wa.me/528111197607?text=${encodeURIComponent(`¡Hola! Me interesa ${name} de Nordra Studio. Quisiera platicar sobre mi proyecto.`)}`;
}

export function Packages() {
  return (
    <section id="paquetes" className="section packages-section" aria-labelledby="packages-title">
      <div className="site-shell">
        <div className="packages-heading">
          <p className="eyebrow">UNA OPCIÓN PARA CADA IDEA</p>
          <h2 id="packages-title">Paquetes para tu negocio</h2>
          <p>Empieza con lo que necesitas hoy. Encontramos contigo la opción que mejor se adapta a tu proyecto.</p>
        </div>
        <div className="packages-grid">
          {packages.map((pack, index) => <PackageCard key={pack.name} pack={pack} index={index} />)}
        </div>
        <div className="custom-packages">
          {customPackages.map((pack, index) => <PackageCard key={pack.name} pack={pack} index={index + 3} />)}
        </div>
        <p className="package-note">Cada propuesta detalla el alcance y la inversión. Dominio, alojamiento y costos de servicios externos se especifican por separado en la cotización.</p>
      </div>
    </section>
  );
}
