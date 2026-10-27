import { useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown, ArrowUpRight, Heart, Pause, Play } from "lucide-react";
import { InvitationArtwork } from "../components/InvitationArtwork";
import { WeddingGuestPanel, WeddingRsvpPreview } from "../components/WeddingGuestPanel";
import { useWeddingCloud } from "../lib/weddingCloud";
import { invitationQuote } from "../data/invitationOccasions";
import { WeddingEditorialPhoto } from "../components/WeddingEditorialPhoto";

type PreviewTab = "story" | "day" | "reply";
const tabIds: PreviewTab[] = ["story", "day", "reply"];

function WeddingPreview({ english, onReply, resetKey }: { english: boolean; onReply: (name: string, attendance: "yes" | "no") => Promise<void>; resetKey: number }) {
  const [selected, setSelected] = useState<PreviewTab>("story");
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);
  const labels = english ? ["Their story", "The big day", "RSVP"] : ["Su historia", "El gran día", "Asistencia"];
  const captions = english
    ? ["A glance, a smile, a story together", "Hand in hand, into a new beginning", "A simple reply, reflected in your guest panel"]
    : ["Una mirada, una sonrisa, una historia juntos", "De la mano, hacia un nuevo comienzo", "Una respuesta sencilla, reflejada en su panel"];
  const moveTab = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const next = ["ArrowRight", "ArrowDown"].includes(event.key) ? (index + 1) % 3 : ["ArrowLeft", "ArrowUp"].includes(event.key) ? (index + 2) % 3 : event.key === "Home" ? 0 : event.key === "End" ? 2 : undefined;
    if (next === undefined) return;
    event.preventDefault();
    setSelected(tabIds[next]);
    buttons.current[next]?.focus();
  };
  return <section className="wedding-atelier site-shell" id="event-experience" aria-labelledby="wedding-atelier-title">
    <div className="wedding-atelier-heading">
      <p className="occasion-eyebrow">{english ? "A NORDRA DESIGN" : "UN DISEÑO DE NORDRA"}</p>
      <h2 id="wedding-atelier-title">{english ? "It feels like you" : "Se siente como ustedes"}</h2>
      <p>{english ? "Ivory light, quiet moments and a story together" : "Luz marfil, momentos íntimos y una historia juntos"}</p>
    </div>
    <div className="wedding-atelier-layout">
      <div className="wedding-atelier-selection">
        <p className="wedding-project-name">Valentina <em>&</em> Sebastián</p>
        <p className="wedding-project-meta">{english ? "An intimate celebration in ivory" : "Una celebración íntima en tonos marfil"}</p>
        <div className="wedding-preview-tabs" role="tablist" aria-label={english ? "Explore the invitation" : "Explorar la invitación"}>
          {tabIds.map((id, index) => <button key={id} type="button" role="tab" id={`wedding-tab-${id}`} aria-controls={`wedding-preview-${id}`} aria-selected={selected === id} tabIndex={selected === id ? 0 : -1} ref={node => { buttons.current[index] = node; }} onClick={() => setSelected(id)} onKeyDown={event => moveTab(event, index)}><span>{labels[index]}</span><ArrowUpRight size={19} aria-hidden="true" /></button>)}
        </div>
        <p className="wedding-preview-caption" key={selected}>{captions[tabIds.indexOf(selected)]}</p>
        <a className="occasion-text-link" href="/invitaciones/valentina-y-sebastian/" target="_blank" rel="noopener noreferrer">{english ? "Open the full invitation" : "Abrir la invitación completa"}<ArrowUpRight size={17} aria-hidden="true" /></a>
      </div>
      <div className="wedding-open-preview">
        <div className="wedding-preview-content wedding-story-preview" id="wedding-preview-story" role="tabpanel" aria-labelledby="wedding-tab-story" hidden={selected !== "story"} tabIndex={0}>
          <figure><WeddingEditorialPhoto shot="story" english={english} /><figcaption>{english ? "Some of our favorite moments" : "De nuestros momentos favoritos"}</figcaption></figure>
          <p className="wedding-preview-dedication">{english ? "With love," : "Con amor,"}<span>Valentina <em>&</em> Sebastián</span></p>
        </div>
        <div className="wedding-preview-content wedding-day-preview" id="wedding-preview-day" role="tabpanel" aria-labelledby="wedding-tab-day" hidden={selected !== "day"} tabIndex={0}>
          <p className="wedding-preview-date">{english ? "SATURDAY, JUNE 19 · 2027" : "SÁBADO 19 DE JUNIO · 2027"}</p>
          <WeddingEditorialPhoto shot="day" english={english} />
          <div className="wedding-day-times"><p><span>17:00</span>{english ? "The ceremony" : "La ceremonia"}</p><p><span>19:00</span>{english ? "The reception" : "La recepción"}</p></div>
          <p className="wedding-preview-note">{english ? "Sample schedule · Every celebration has its own rhythm" : "Horarios de muestra · Cada celebración tiene su propio ritmo"}</p>
        </div>
        <div className="wedding-preview-content" id="wedding-preview-reply" role="tabpanel" aria-labelledby="wedding-tab-reply" hidden={selected !== "reply"} tabIndex={0}>
          <WeddingRsvpPreview key={resetKey} english={english} onReply={onReply} />
        </div>
      </div>
    </div>
  </section>;
}

export function WeddingContent({ english }: { english: boolean }) {
  const [paused, setPaused] = useState(false);
  const { recordReply, resetKey } = useWeddingCloud();
  return <div className="wedding-content">
    <div className={`wedding-atmosphere${paused ? " is-paused" : ""}`} aria-hidden="true"><i /><i /><i /></div>
    <section className="wedding-cover site-shell" aria-labelledby="occasion-title">
      <div className="wedding-cover-kicker"><p className="occasion-eyebrow">{english ? "NORDRA · WEDDING INVITATIONS" : "NORDRA · INVITACIONES DE BODA"}</p><button className="wedding-motion-toggle" type="button" aria-label={paused ? (english ? "Resume ambient light" : "Reanudar movimiento de luz") : (english ? "Pause ambient light" : "Pausar movimiento de luz")} onClick={() => setPaused(value => !value)}>{paused ? <Play size={14} aria-hidden="true" /> : <Pause size={14} aria-hidden="true" />}<span>{paused ? (english ? "Resume light" : "Reanudar luz") : (english ? "Pause light" : "Pausar luz")}</span></button></div>
      <h1 id="occasion-title">{english ? "An invitation to" : "Una invitación al"} <em>{english ? "forever" : "para siempre"}</em></h1>
      <figure className="wedding-cover-image"><InvitationArtwork kind="wedding" english={english} /><figcaption>{english ? "Your love in every little detail" : "Su amor en cada pequeño detalle"}</figcaption></figure>
      <div className="wedding-cover-intro"><p>{english ? "There are stories you can feel before you read them. Let yours begin here." : "Hay historias que se sienten antes de leerse. Que la suya empiece aquí."}</p><a className="wedding-explore-link" href="#event-experience"><span className="wedding-arrow-circle"><ArrowDown size={22} strokeWidth={1.4} aria-hidden="true" /></span><span>{english ? "Discover your invitation" : "Descubran su invitación"}</span></a><a className="occasion-text-link" href="#planes-eventos">{english ? "See packages" : "Ver paquetes"}<ArrowUpRight size={16} aria-hidden="true" /></a></div>
      <div className="wedding-cover-foot"><span>{english ? "DESIGNED AROUND YOUR STORY" : "DISEÑADA ALREDEDOR DE SU HISTORIA"}</span><span>{english ? "Guest panel included in both plans" : "Panel de invitados en ambos paquetes"}</span></div>
    </section>
    <WeddingPreview english={english} onReply={recordReply} resetKey={resetKey} />
    <WeddingGuestPanel english={english} />
  </div>;
}

export function WeddingClosing({ english }: { english: boolean }) {
  const stages = english ? ["Tell us your story", "We design it together", "Send a little love"] : ["Nos cuentan su historia", "Le damos forma juntos", "Comparten la emoción"];
  return <>
    <section id="proceso" className="wedding-process site-shell" aria-labelledby="wedding-process-title"><p className="occasion-eyebrow">{english ? "WITH YOU, FROM THE BEGINNING" : "CON USTEDES, DESDE EL INICIO"}</p><h2 id="wedding-process-title">{english ? "Let's make something personal" : "Hagamos algo muy suyo"}</h2><ol>{stages.map(stage => <li key={stage}>{stage}</li>)}</ol><p>{english ? "We agree on the details and dates. Start with a 50% deposit; the balance is due after approval, before publishing." : "Acordamos detalles y fechas. Iniciamos con 50% de anticipo; el resto, al aprobar y antes de publicar."}</p></section>
    <footer id="contacto" className="wedding-footer"><div className="site-shell"><Heart className="wedding-footer-heart" size={30} strokeWidth={1} aria-hidden="true" /><p className="occasion-eyebrow">{english ? "EVERY LOVE HAS A STORY" : "CADA AMOR TIENE UNA HISTORIA"}</p><h2>{english ? "Tell us" : "¿Nos cuentan"}<em>{english ? " yours?" : " la suya?"}</em></h2><a className="occasion-button" href={invitationQuote(english, english ? "Weddings" : "Bodas")} target="_blank" rel="noopener noreferrer">{english ? "Let's talk about your wedding" : "Platiquemos de su boda"}<ArrowUpRight size={18} aria-hidden="true" /></a><p className="wedding-signature">{english ? "with love, Nordra" : "con amor, Nordra"}</p><div className="wedding-footer-bottom"><a href="/invitaciones.html">{english ? "All invitations" : "Todas las invitaciones"}<ArrowUpRight size={15} aria-hidden="true" /></a><span>© {new Date().getFullYear()} Nordra Studio · Monterrey, México</span><a href="/aviso-de-privacidad.html">{english ? "Privacy (Spanish)" : "Privacidad"}</a><a href="/terminos-del-servicio.html">{english ? "Terms (Spanish)" : "Términos"}</a><a href="#page-top">{english ? "Top ↑" : "Subir ↑"}</a></div></div></footer>
  </>;
}


