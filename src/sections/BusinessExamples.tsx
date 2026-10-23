import { sectionHref } from "../navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Pause, Play, Sparkles } from "lucide-react";
import { useLanguage } from "../language";
import "../styles/universes.css";

export function BusinessExamples() {
  const language = useLanguage();
  const english = language === "en";
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle("universe-visible", entry.isIntersecting);
    }), { threshold: 0.1 });
    section.querySelectorAll(".universe-scene").forEach(scene => observer.observe(scene));
    const visibility = () => { section.dataset.hidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const quote = `https://wa.me/528129022231?text=${encodeURIComponent(english
    ? "Hi Nordra Studio! I explored Bruma and Lumina and would like a website quote for my business."
    : "¡Hola, Nordra Studio! Vi los universos de Bruma y Lúmina y me gustaría cotizar una página para mi negocio.")}`;
  const demos = [
    { id: "bruma", name: "BRUMA", category: english ? "COFFEE & SLOW MOMENTS" : "CAFÉ & PAUSA", type: english ? "Coffee shop" : "Cafetería",
      title: english ? "A pause you can feel." : "Una pausa que se siente.",
      copy: english ? "Warm light, coffee with character and a menu made to explore at your own pace." : "Luz cálida, café con carácter y una carta para explorar a tu ritmo.",
      features: english ? ["Interactive menu", "Build your selection"] : ["Carta interactiva", "Arma tu selección"],
      href: `/demos/cafe-nordra/index.html?lang=${language}`,
      note: english ? "Fictional café. No real orders or payments." : "Cafetería ficticia. Sin pedidos ni cobros reales." },
    { id: "lumina", name: "lúmina", category: english ? "SPACE TO CARE" : "ESPACIO PARA CUIDAR", type: english ? "Medical practice" : "Consultorio médico",
      title: english ? "Clarity from the first click." : "Claridad desde el primer clic.",
      copy: english ? "An open, luminous experience to explore specialties and try a sample schedule." : "Una experiencia abierta y luminosa para conocer especialidades y probar una agenda de muestra.",
      features: english ? ["Explore specialties", "Sample schedule"] : ["Explora especialidades", "Agenda de muestra"],
      href: `/demos/lumina/index.html?lang=${language}`,
      note: english ? "Fictional clinic. No medical care or real appointments." : "Clínica ficticia. Sin atención médica ni citas reales." },
  ];
  return <section id="universos" className="nordra-universes" ref={root} data-paused={paused} aria-labelledby="universes-title">
    <div className="universes-heading">
      <div><p className="eyebrow">{english ? "DESIGN YOU CAN EXPLORE" : "DISEÑO QUE PUEDES RECORRER"}</p>
      <h2 id="universes-title" tabIndex={-1} data-service-focus>{english ? "Every brand," : "Cada marca,"}<br /><span>{english ? "a world of its own." : "un mundo propio."}</span></h2></div>
      <div className="universes-intro"><p>{english ? "Discover two websites designed by Nordra. Explore their details, try their features and imagine what we could create for your business." : "Conoce dos páginas diseñadas por Nordra. Recorre sus detalles, prueba sus funciones e imagina lo que podemos crear para tu negocio."}</p>
      <button type="button" className="universes-motion" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}{english ? (paused ? "Resume atmosphere" : "Pause atmosphere") : (paused ? "Activar ambiente" : "Pausar ambiente")}</button></div>
    </div>
    <div className="universes-collection">{demos.map(demo => <article key={demo.id} className={`universe-scene universe-${demo.id}`} aria-labelledby={`universe-${demo.id}-title`}>
      <p className="universe-index"><span><i aria-hidden="true"/>{demo.type}</span><span>{english ? "CONCEPT DEMO" : "DEMO CONCEPTUAL"}</span></p>
      <figure className="universe-visual">
        <span className="universe-orbit" aria-hidden="true" />
        <a className="universe-window" href={demo.href} aria-label={english ? `Open the ${demo.name} demo` : `Abrir la demo de ${demo.name}`}>
          <span className="universe-window-bar" aria-hidden="true"><i /><i /><i /><span>{demo.id === "bruma" ? "bruma / café & pausa" : "lúmina / centro médico"}</span><ArrowUpRight size={14} /></span>
          <img src={`/demos/previews/${demo.id}-${language}.webp`} alt={english ? `Homepage preview of ${demo.name}` : `Vista previa de la portada de ${demo.name}`} width={1100} height={619} loading="lazy" decoding="async" />
          <span className="universe-window-invitation" aria-hidden="true"><ArrowUpRight size={22} /></span>
        </a>
      </figure>
      <div className="universe-heading">
        <div><h3 id={`universe-${demo.id}-title`} className="universe-wordmark">{demo.id === "lumina" && <span aria-hidden="true">✳ </span>}{demo.name}</h3>
        <p className="universe-category">{demo.category}</p></div>
        <a className="universe-enter" href={demo.href} aria-label={english ? `Explore the ${demo.name} demo` : `Explorar demo de ${demo.name}`}><span>{english ? "Explore demo" : "Explorar demo"}</span><ArrowUpRight size={18} aria-hidden="true" /></a>
      </div>
      <div className="universe-details"><p className="universe-title">{demo.title}</p><p className="universe-copy">{demo.copy}</p>
        <ul className="universe-features">{demo.features.map(feature => <li key={feature}>{feature}</li>)}</ul>
      </div>
        <p className="universe-disclaimer">{demo.note}</p>
    </article>)}</div>
    <div className="universes-next"><div><p className="eyebrow"><Sparkles size={16} aria-hidden="true" />{english ? "THE NEXT UNIVERSE" : "EL SIGUIENTE UNIVERSO"}</p><h4>{english ? "It could be your business." : "Podría ser tu negocio."}</h4><p>{english ? "Tell us what you want your customers to feel and do. We’ll define your project’s scope together." : "Cuéntanos qué quieres que tus clientes sientan y puedan hacer. Definimos contigo el alcance de tu proyecto."}</p></div><div className="universes-next-actions"><a className="universes-quote" href={quote} target="_blank" rel="noopener noreferrer">{english ? "Create my website with Nordra" : "Crear mi página con Nordra"}<ArrowUpRight size={20} aria-hidden="true" /></a><small>{english ? "WhatsApp · Opens a new tab" : "WhatsApp · Abre otra pestaña"}</small><a className="universes-compare" href={sectionHref("opciones-negocio")}>{english ? "Compare packages" : "Comparar paquetes"}<ArrowDown size={16} aria-hidden="true" /></a></div></div>
  </section>;
}
