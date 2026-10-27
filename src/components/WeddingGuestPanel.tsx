import { useId, useState, type FormEvent } from "react";
import { ArrowUpRight, Check } from "lucide-react";

export function WeddingRsvpPreview({ english, onReply, inWorkspace = false }: { english: boolean; onReply: (name: string, attendance: "yes" | "no") => Promise<void>; inWorkspace?: boolean }) {
  const id = useId();
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"yes" | "no">("yes");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setError(""); setBusy(true);
    try { await onReply(name, attendance); setSaved(true); }
    catch (reason) {
      setError((reason as Error).message === "preview_unavailable"
        ? (english ? "Enable session storage in your browser to try this reply" : "Habilita el almacenamiento de sesión del navegador para probar esta respuesta")
        : (reason as Error).message === "duplicate_name"
        ? (english ? "That name is already in the sample list" : "Ese nombre ya está en la lista de muestra")
        : (reason as Error).message === "invalid_name" ? (english ? "Enter a name with 2 to 100 characters" : "Escribe un nombre de 2 a 100 caracteres") : (english ? "We could not save your reply. Please try again." : "No pudimos guardar tu respuesta. Intenta nuevamente."));
    }
    finally { setBusy(false); }
  }
  return <div className="wedding-rsvp-preview">
    <span className="wedding-paper-monogram" aria-hidden="true">V<em>&</em>S</span>
    <p className="occasion-eyebrow">{english ? "WITH OUR FAVORITE PEOPLE" : "CON NUESTRAS PERSONAS FAVORITAS"}</p>
    <h3>{english ? "Will you join us?" : "¿Nos acompañas?"}</h3>
    <form onSubmit={submit}>
      <label htmlFor={id + "-name"}>{english ? "Sample name" : "Nombre de ejemplo"}</label>
      <input id={id + "-name"} name="weddingSampleName" value={name} onChange={event => { setName(event.target.value); setSaved(false); setError(""); }} autoComplete="off" required minLength={2} maxLength={100} placeholder={english ? "e.g. Andrea López" : "Ej. Andrea López"} aria-invalid={!!error} aria-describedby={error ? id + "-error" : undefined} />
      <fieldset><legend>{english ? "Your reply" : "Tu respuesta"}</legend>
        <label><input type="radio" name={id + "-attendance"} value="yes" checked={attendance === "yes"} onChange={() => { setAttendance("yes"); setSaved(false); }} /><span>{english ? "I'll be there" : "Sí asistiré"}</span></label>
        <label><input type="radio" name={id + "-attendance"} value="no" checked={attendance === "no"} onChange={() => { setAttendance("no"); setSaved(false); }} /><span>{english ? "I can't attend" : "No podré asistir"}</span></label>
      </fieldset>
      <button className="occasion-button" type="submit" disabled={busy}>{busy ? (english ? "Saving…" : "Guardando…") : (english ? "Preview my reply" : "Ver mi respuesta")}<ArrowUpRight size={17} aria-hidden="true" /></button>
      {error && <p className="wedding-rsvp-error" role="alert" id={id + "-error"}>{error}</p>}
      <div className="wedding-rsvp-result" role="status">{saved && <><span><Check size={16} aria-hidden="true" />{english ? "Your trial reply is now in the panel" : "Tu respuesta de prueba ya está en el panel"}</span>{!inWorkspace && <a href="/panel-boda.html">{english ? "See it in the panel" : "Verla en el panel"}<ArrowUpRight size={15} aria-hidden="true" /></a>}</>}</div>
    </form>
    <p className="wedding-preview-note">{english ? "Saved in your sample panel for 24 hours · Use a fictional name" : "Se guarda en tu panel de muestra por 24 horas · Usa un nombre ficticio"}</p>
  </div>;
}

export function WeddingGuestPanel({ english }: { english: boolean }) {
  return <section className="wedding-panel-invitation" id="panel-boda" aria-labelledby="wedding-guests-title"><div className="wedding-guests site-shell">
    <div className="wedding-guests-copy">
      <p className="occasion-eyebrow">{english ? "THE SAME CARE, IN EVERY DETAIL" : "EL MISMO CUIDADO EN CADA DETALLE"}</p>
      <h2 id="wedding-guests-title">{english ? "Your people," : "Su gente,"}<em>{english ? " a little closer" : " más cerca"}</em></h2>
      <p>{english ? "A space for your wedding. Your guests and their replies, beautifully organized." : "Un espacio para su boda. Sus invitados y sus respuestas, organizados con el mismo cuidado."}</p>
      <a className="occasion-button" href="/panel-boda.html">{english ? "Explore the wedding panel" : "Explorar el panel de boda"}<ArrowUpRight size={18} aria-hidden="true" /></a>
      <p className="wedding-guests-note">{english ? "Private guest panel included in both plans" : "Panel privado de invitados incluido en ambos paquetes"}</p>
    </div>
    <figure className="wedding-dashboard-preview">
      <a href="/panel-boda.html" aria-label={english ? "Open the wedding dashboard shown in this preview" : "Abrir el dashboard de boda de esta vista previa"}>
        <div className="wedding-dashboard-frame"><span>NORDRA <em>WEDDINGS</em></span><span>{english ? "Explore your space" : "Explorar su espacio"}<ArrowUpRight size={16} aria-hidden="true" /></span></div>
        <div className="wedding-dashboard-screen"><img src={`/artwork/wedding-dashboard-preview/dashboard-v3-${english ? "en" : "es"}-1280.webp`} srcSet={`/artwork/wedding-dashboard-preview/dashboard-v3-${english ? "en" : "es"}-760.webp 760w, /artwork/wedding-dashboard-preview/dashboard-v3-${english ? "en" : "es"}-1280.webp 1265w`} sizes="(max-width:760px) calc(100vw - 40px), (max-width:1200px) 60vw, 700px" width={1265} height={988} loading="lazy" decoding="async" alt={english ? "Nordra wedding dashboard with the couple’s photo, guest confirmations, invitation list, tables and reception navigation" : "Dashboard de boda de Nordra con la foto de la pareja, confirmaciones, lista de invitados y navegación a mesas y recepción"} /></div>
      </a>
      <figcaption>{english ? "A look inside your panel · Sample data" : "Una mirada a su panel · Datos de muestra"}</figcaption>
    </figure></div>
  </section>;
}
