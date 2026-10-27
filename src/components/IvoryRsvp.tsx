import { useEffect, useRef, useState, type FormEvent } from "react";
import { ArrowUpRight, Check, ChevronDown, RefreshCw } from "lucide-react";
import type { WeddingInvitation, WeddingPerson } from "../lib/weddingInvitations";
import { sampleGuestAccess, sampleGuestError, sampleGuestRequest } from "../lib/weddingSampleGuest";

export function IvoryRsvp({ hash }: { hash: string }) {
  const access = sampleGuestAccess(hash);
  const personal = access !== null;
  const [invitation, setInvitation] = useState<WeddingInvitation | null>(null);
  const [people, setPeople] = useState<WeddingPerson[]>([{ id: "preview-person", name: "", attendance: "pending" }]);
  const [loading, setLoading] = useState(personal);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [reloadRequired, setReloadRequired] = useState(false);
  const [revision, setRevision] = useState(0);
  const [saved, setSaved] = useState(false);
  const request = useRef<AbortController | null>(null);
  const busy = useRef(false);

  useEffect(() => {
    const capability = sampleGuestAccess(hash);
    if (!capability) return;
    if (capability === "invalid") {
      setLoading(false); setError("El enlace personal está incompleto. Abre el enlace original que recibiste"); setReloadRequired(true); return;
    }
    let active = true;
    const controller = new AbortController();
    request.current = controller;
    setLoading(true); setError(""); setSaved(false);
    sampleGuestRequest(capability, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]))
      .then(next => { if (active) { setInvitation(next); setPeople(next.people); setReloadRequired(false); } })
      .catch(cause => { if (active) { setError(sampleGuestError(cause).text); setReloadRequired(true); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; controller.abort(); request.current?.abort(); };
  }, [hash, revision]);

  function changePerson(id: string, change: Partial<WeddingPerson>) {
    setPeople(current => current.map(person => person.id === id ? { ...person, ...change } : person));
    setSaved(false); setError("");
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy.current || reloadRequired) return;
    if (people.every(person => person.attendance === "pending")) { setError("Elige una respuesta para al menos una persona"); return; }
    if (!personal) { setSaved(true); return; }
    if (!access || access === "invalid" || !invitation) return;
    busy.current = true; setSending(true); setError(""); setSaved(false);
    const controller = new AbortController(); request.current = controller;
    try {
      const next = await sampleGuestRequest(access, AbortSignal.any([controller.signal, AbortSignal.timeout(15000)]), { people, updatedAt: invitation.updated_at });
      if (!controller.signal.aborted) { setInvitation(next); setPeople(next.people); setSaved(true); }
    } catch (cause) {
      if (!controller.signal.aborted) { const issue = sampleGuestError(cause); setError(issue.text); setReloadRequired(issue.reload); }
    } finally { busy.current = false; if (!controller.signal.aborted) setSending(false); }
  }

  const confirmed = invitation?.people.some(person => person.attendance === "yes");
  return <div className="iv-rsvp-paper" aria-busy={loading || sending}>
    <span className="iv-seal" aria-hidden="true">V<em>&</em>S</span>
    <p className="iv-kicker">UN LUGAR PARA TI</p>
    <h2 id="iv-rsvp-title">¿Nos acompañas?</h2>
    <p className="iv-rsvp-intro">Queremos verte entre las miradas<br />que buscaremos ese día</p>
    {loading && <p className="iv-loading" role="status">Preparando tu invitación</p>}
    {!loading && (!personal || invitation) && <form onSubmit={submit}>
      {personal && <p className="iv-places">{invitation?.kind === "couple" ? "Una invitación para ustedes dos" : invitation?.kind === "plusOne" ? "Tu invitación incluye un acompañante" : "Esta invitación es solo para ti"}</p>}
      <fieldset className="iv-reply-fields" disabled={sending || reloadRequired}>
        <legend className="iv-sr-only">Confirmación de asistencia por persona</legend>
        {people.map((person, index) => {
          const editable = !personal || (invitation?.kind === "plusOne" && index === 1);
          return <div className="iv-person" key={person.id}>
            {editable ? <label htmlFor={`iv-name-${index}`}>{personal ? "Nombre de tu acompañante" : "Tu nombre"}<input id={`iv-name-${index}`} name={`name-${index}`} autoComplete={personal ? "off" : "name"} value={person.name} minLength={2} maxLength={100} required={!personal || person.attendance === "yes"} placeholder={personal ? "¿Quién vendrá contigo?" : "Escribe tu nombre"} onChange={event => changePerson(person.id, { name: event.target.value })} /></label> : <p className="iv-guest-name">{person.name}</p>}
            <label htmlFor={`iv-attendance-${index}`}>Asistencia{personal && <span className="iv-sr-only"> de {person.name || "tu acompañante"}</span>}<span className="iv-select"><select id={`iv-attendance-${index}`} name={`attendance-${index}`} value={person.attendance} onChange={event => changePerson(person.id, { attendance: event.target.value as WeddingPerson["attendance"] })}><option value="pending">Aún por confirmar</option><option value="yes">Sí, los acompañaré</option><option value="no">No podré acompañarlos</option></select><ChevronDown size={16} aria-hidden="true" /></span></label>
          </div>;
        })}
        <button className="iv-button iv-submit" type="submit">{sending ? "Guardando respuesta" : personal ? "Guardar mi respuesta" : "Ver mi respuesta"}{!sending && <ArrowUpRight size={18} aria-hidden="true" />}</button>
      </fieldset>
    </form>}
    {error && <p className="iv-form-message iv-error" role="alert">{error}</p>}
    {reloadRequired && access !== "invalid" && <button className="iv-text-button" type="button" disabled={loading} onClick={() => setRevision(current => current + 1)}><RefreshCw size={15} aria-hidden="true" />Volver a cargar respuesta</button>}
    {saved && <div className="iv-form-message iv-success" role="status"><Check size={18} aria-hidden="true" /><p>{personal ? "Tu respuesta ya está en el panel" : "Así se verá tu respuesta"}<small>{personal ? "Puedes volver a este enlace si tus planes cambian" : "Esta vista no envía ni guarda confirmaciones"}</small></p></div>}
    {!saved && personal && confirmed && !loading && <p className="iv-saved-note">Tu asistencia guardada aparecerá en el panel</p>}
    {confirmed && invitation?.passLink && !reloadRequired && <a className="iv-text-button" href={invitation.passLink} target="_blank" rel="noopener noreferrer">Ver mi pase QR<ArrowUpRight size={16} aria-hidden="true" /></a>}
    <p className="iv-form-note">{personal ? "Datos de muestra · Tus respuestas se reflejan en el panel de prueba durante 24 horas" : "Un diseño de Nordra · Esta vista no envía confirmaciones"}</p>
    {!personal && <a className="iv-small-link" href="/panel-boda.html" target="_blank" rel="noopener noreferrer">Probar un enlace personal desde el panel<ArrowUpRight size={14} aria-hidden="true" /></a>}
  </div>;
}
