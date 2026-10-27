import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, CalendarPlus, Pause, Play, Plus } from "lucide-react";
import { WeddingEditorialPhoto } from "../components/WeddingEditorialPhoto";
import { IvoryRsvp } from "../components/IvoryRsvp";
import { IvoryDressCode } from "../components/IvoryDressCode";
import { IvoryEntrance, IvoryLilies, shouldShowIvoryEntrance } from "../components/IvoryEntrance";

function initialSection() {
  const section = window.location.hash.slice(1);
  return ["iv-cover", "iv-letter", "iv-day", "iv-style", "iv-rsvp"].includes(section) ? section : "iv-cover";
}

function goTo(id: string) {
  const section = document.getElementById(id);
  section?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth", block: "start" });
  // Keep the personal capability in the fragment while navigating the invitation.
  section?.focus({ preventScroll: true });
}

export function WeddingIvoryInvitation() {
  const [paused, setPaused] = useState(false);
  const [entrance, setEntrance] = useState(shouldShowIvoryEntrance);
  const [hash, setHash] = useState(() => window.location.hash);
  const page = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    if (!entrance && initialSection() !== "iv-cover") document.getElementById(initialSection())?.scrollIntoView({ behavior: "instant" });
  }, [entrance]);
  useEffect(() => {
    const changed = () => setHash(window.location.hash);
    window.addEventListener("hashchange", changed);
    return () => window.removeEventListener("hashchange", changed);
  }, []);
  useEffect(() => {
    const root = page.current;
    if (!root || !window.IntersectionObserver) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.isIntersecting) { entry.target.classList.add("iv-seen"); observer.unobserve(entry.target); }
    }, { threshold: .08, rootMargin: "0px 0px -20px 0px" });
    const observe = () => root.querySelectorAll("h1,h2,h3,h4,p,figcaption,legend,label,summary,.iv-seal,.iv-time").forEach(element => {
      element.setAttribute("data-iv-reveal", "");
      if (!element.classList.contains("iv-seen")) observer.observe(element);
    });
    observe();
    const changes = new MutationObserver(observe); changes.observe(root, { childList: true, subtree: true });
    return () => { observer.disconnect(); changes.disconnect(); };
  }, []);

  const enter = () => {
    setEntrance(false);
    requestAnimationFrame(() => document.getElementById(initialSection())?.focus({ preventScroll: true }));
  };

  return <><div ref={page} className={`iv-page${paused ? " iv-paused" : ""}`}>
    <a className="iv-skip" href="#iv-rsvp" onClick={event => { event.preventDefault(); goTo("iv-rsvp"); }}>Ir a confirmación</a>
    <header className={`iv-header ${entrance ? "iv-header-awaiting" : "iv-header-open"}`} inert={entrance} aria-hidden={entrance}>
      <button className="iv-monogram" aria-label="Volver a la portada" onClick={() => goTo("iv-cover")}>V<em>&</em>S</button>
      <nav aria-label="Recorre nuestra invitación"><button onClick={() => goTo("iv-letter")}>Nosotros</button><button onClick={() => goTo("iv-day")}>El día</button><button className="iv-nav-rsvp" onClick={() => goTo("iv-rsvp")}>Asistencia<ArrowUpRight size={14} aria-hidden="true" /></button></nav>
      <button className="iv-motion" aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}<span>{paused ? "Reanudar luz" : "Pausar luz"}</span></button>
    </header>
    <main>
      <section className="iv-cover" id="iv-cover" tabIndex={-1} aria-labelledby="iv-title">
        <div className="iv-cover-image"><img src="/artwork/invitation-editorial/wedding-v2-1200.webp" srcSet="/artwork/invitation-editorial/wedding-v2-640.webp 640w, /artwork/invitation-editorial/wedding-v2-1200.webp 1200w" sizes="(max-width:700px) 100vw, 72vw" width={1200} height={1200} fetchPriority="high" alt="Valentina y Sebastián, frente a frente bajo un velo de luz marfil" /></div>
        <div className="iv-light" aria-hidden="true" />
        <div className="iv-cover-copy">
          <p className="iv-kicker">CON NUESTRAS PERSONAS FAVORITAS</p>
          <h1 id="iv-title"><span>Valentina</span><em>&</em><span>Sebastián</span></h1>
          <p className="iv-cover-vow">Elegimos la vida juntos</p>
          <div className="iv-cover-date"><p>SÁBADO <strong>19</strong> JUNIO</p><span>2027</span><span className="iv-date-line" aria-hidden="true" /><span>Ciudad de México</span></div>
          <button className="iv-discover" onClick={() => goTo("iv-letter")}><span className="iv-arrow-circle"><ArrowDown size={18} strokeWidth={1.2} aria-hidden="true" /></span>Una carta para ti</button>
        </div>
        <p className="iv-cover-foot">EL COMIENZO DE NUESTRA FAMILIA</p>
      </section>

      <section className="iv-letter iv-wrap" id="iv-letter" tabIndex={-1} aria-labelledby="iv-letter-title">
        <IvoryLilies className="iv-letter-lilies" />
        <div className="iv-letter-heading"><p className="iv-kicker">ANTES DEL SÍ</p><h2 id="iv-letter-title">Lo nuestro<br />vive en lo <em>pequeño</em></h2><span className="iv-letter-rule" aria-hidden="true" /></div>
        <div className="iv-letter-body"><p>En una mirada que nos encuentra. En la risa que llega cuando ya no hace falta decir nada. En esa calma de estar en casa, aunque estemos lejos de todo.</p><p>Queremos casarnos así: siendo nosotros. Y tener cerca a quienes han hecho más bonita nuestra vida.</p><p className="iv-letter-invite">Por eso, esta carta también<br />lleva un poco de ti</p><p className="iv-signature">Con cariño,<span>Valentina <em>&</em> Sebastián</span></p></div>
        <figure className="iv-letter-photo"><WeddingEditorialPhoto shot="story" english={false} sizes="(max-width:700px) 90vw, 55vw" /><figcaption>La risa también es una forma de decir sí</figcaption></figure>
      </section>

      <section className="iv-day" id="iv-day" tabIndex={-1} aria-labelledby="iv-day-title">
        <div className="iv-wrap">
          <div className="iv-day-heading"><div><p className="iv-kicker">19 DE JUNIO DE 2027</p><h2 id="iv-day-title">Una tarde que<br />se convierte en <em>recuerdo</em></h2></div><p>Sin prisa para abrazarnos<br />Con toda la noche por delante</p></div>
          <ol className="iv-timeline">
            <li><time className="iv-time" dateTime="2027-06-19T17:00:00-06:00">17:00</time><span className="iv-timeline-dot" aria-hidden="true" /><h3>La ceremonia</h3><p>Nos encontramos para compartir<br />las palabras más nuestras</p></li>
            <li><time className="iv-time" dateTime="2027-06-19T18:00:00-06:00">18:00</time><span className="iv-timeline-dot" aria-hidden="true" /><h3>El primer brindis</h3><p>Abrazos, fotografías y una copa<br />por todo lo que viene</p></li>
            <li><time className="iv-time" dateTime="2027-06-19T19:00:00-06:00">19:00</time><span className="iv-timeline-dot" aria-hidden="true" /><h3>La celebración</h3><p>La mesa está puesta<br />La pista nos espera</p></li>
          </ol>
          <div className="iv-location" aria-labelledby="iv-location-title">
            <div className="iv-location-copy"><p className="iv-kicker">EL LUGAR DE NUESTRO SÍ</p><h3 id="iv-location-title">Ciudad de<br /><em>México</em></h3><p className="iv-location-note">Vista general de la ciudad<br />Sede por confirmar</p><a className="iv-location-link" href="https://www.google.com/maps/search/?api=1&query=Ciudad%20de%20M%C3%A9xico" target="_blank" rel="noopener noreferrer">Abrir en Google Maps<ArrowUpRight size={17} strokeWidth={1.3} aria-hidden="true" /><span className="iv-sr-only"> (abre en otra pestaña)</span></a></div>
            <div className="iv-map"><iframe title="Mapa general de Ciudad de México, sede por confirmar" src="https://www.google.com/maps?q=Ciudad%20de%20M%C3%A9xico&z=11&hl=es&output=embed" loading="lazy" referrerPolicy="no-referrer" allowFullScreen /><span className="iv-map-edge" aria-hidden="true" /></div>
          </div>
          <div className="iv-day-bottom"><p>Una fecha para guardar<span>19 de junio de 2027 · Horarios de muestra</span></p><a className="iv-outline-button" href="/invitaciones/valentina-y-sebastian/fecha.ics" download="valentina-y-sebastian.ics"><CalendarPlus size={17} strokeWidth={1.4} aria-hidden="true" />Guardar la fecha</a></div>
        </div>
      </section>

      <section className="iv-details iv-wrap" id="iv-style" tabIndex={-1} aria-labelledby="iv-details-title">
        <div className="iv-style-heading"><div><p className="iv-kicker">PARA DISFRUTAR EL DÍA</p><h2 id="iv-details-title">Vestir el <em>momento</em></h2></div><p>Imagina tu look para nuestra boda<br />Cambia el atuendo, el tono y el largo</p></div>
        <IvoryDressCode />
        <div className="iv-invite-notes">
          <details><summary>Tu invitación<Plus size={17} aria-hidden="true" /></summary><div><p>En tu enlace personal encontrarás los lugares reservados para ti. Si incluye acompañante, podrás escribir su nombre y confirmar a cada persona por separado.</p></div></details>
          <details><summary>Si cambian tus planes<Plus size={17} aria-hidden="true" /></summary><div><p>Vuelve al mismo enlace para actualizar tu respuesta. Así podremos preparar cada lugar con cuidado.</p></div></details>
        </div>
      </section>

      <section className="iv-rsvp" id="iv-rsvp" tabIndex={-1} aria-labelledby="iv-rsvp-title">
        <IvoryLilies className="iv-rsvp-lilies" />
        <div className="iv-rsvp-layout iv-wrap"><div className="iv-rsvp-photo"><WeddingEditorialPhoto shot="portrait" english={false} sizes="(max-width:700px) 90vw, 43vw" /><p>El día será nuestro<br /><em>El recuerdo, de todos</em></p></div><IvoryRsvp key={hash} hash={hash} /></div>
      </section>
    </main>
    <footer className="iv-footer"><p className="iv-footer-names">Valentina <em>&</em> Sebastián</p><p className="iv-kicker">19 JUNIO 2027 · CIUDAD DE MÉXICO</p><div><a href="/bodas.html">Diseñado con intención por <strong>Nordra</strong><ArrowUpRight size={13} aria-hidden="true" /></a><button onClick={() => { document.getElementById("iv-cover")?.scrollIntoView({ behavior: "instant" }); setEntrance(true); }}>Ver la apertura</button><button onClick={() => goTo("iv-cover")}>Volver al inicio ↑</button></div></footer>
  </div>{entrance && <IvoryEntrance onEnter={enter} />}</>;
}
