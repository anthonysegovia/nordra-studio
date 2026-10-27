import { useEffect, useRef, useState, type FormEvent } from "react";
import { RotateCcw, X } from "lucide-react";
import { GuestResponsePanel } from "./GuestResponsePanel";
import { updateDemoResponse, type GuestResponse } from "../lib/guestResponses";

const initialReplies: GuestResponse[] = [
  { id: "sample-1", guest_name: "Ana Torres", attendance: "yes", updated_at: "2026-10-25T12:00:00.000Z" },
  { id: "sample-2", guest_name: "Diego Ruiz", attendance: "yes", updated_at: "2026-10-25T12:10:00.000Z" },
  { id: "sample-3", guest_name: "Lucía Reyes", attendance: "no", updated_at: "2026-10-25T12:20:00.000Z" },
];

export function BrumaPanelDemo({ english, onClose }: { english: boolean; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [rows, setRows] = useState(initialReplies);
  const [name, setName] = useState("");
  const [attendance, setAttendance] = useState<"yes" | "no">("yes");
  const [saved, setSaved] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = "hidden";
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, []);
  function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setNotice("");
    try {
      setRows(updateDemoResponse(rows, { id: "your-demo-reply", guest_name: name, attendance, updated_at: new Date().toISOString() }));
      setSaved(true);
      setNotice(english ? "Your sample reply is now in the panel. You can change it and submit again." : "Tu respuesta de ejemplo ya aparece en el panel. Puedes cambiarla y enviarla de nuevo.");
    } catch (reason) {
      setError((reason as Error).message === "duplicate_name"
        ? (english ? "That name already appears in the sample. Try a different name." : "Ese nombre ya aparece en el ejemplo. Prueba con otro nombre.")
        : (english ? "Enter a name with 2 to 100 characters." : "Escribe un nombre de 2 a 100 caracteres."));
    }
  }
  function reset() { setRows(initialReplies); setName(""); setAttendance("yes"); setSaved(false); setError(""); setNotice(""); setResetKey(value => value + 1); }

  return <dialog className="bruma-panel-demo" ref={dialog} aria-labelledby="bruma-demo-title" aria-describedby="bruma-demo-note" onClose={event => { if (!event.currentTarget.open) onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="bruma-demo-content">
      <header className="bruma-demo-heading"><div><p className="eyebrow">{english ? "INCLUDED IN BOTH PLANS" : "INCLUIDO EN AMBOS PAQUETES"}</p><h3 id="bruma-demo-title">{english ? "A reply in your panel" : "Una respuesta en tu panel"}</h3></div><button className="bruma-demo-close" type="button" onClick={onClose} aria-label={english ? "Close panel example" : "Cerrar ejemplo del panel"}><X size={20} aria-hidden="true" /></button></header>
      <p id="bruma-demo-note">{english ? "Interactive example with fictional data. Changes stay in this window and reset when you close it." : "Ejemplo interactivo con datos ficticios. Los cambios viven en esta ventana y se reinician al cerrarla."}</p>
      <div className="bruma-demo-grid">
        <section className="bruma-demo-invitation" aria-labelledby="bruma-demo-form-title"><p className="eyebrow">{english ? "ON THE INVITATION" : "EN LA INVITACIÓN"}</p><h4 id="bruma-demo-form-title">{english ? "Will you join us?" : "¿Nos acompañas?"}</h4><p>{english ? "Try a sample name and choose your reply." : "Prueba con un nombre de ejemplo y elige tu respuesta."}</p>
          <form onSubmit={submit}>
            <label htmlFor="bruma-demo-name">{english ? "Sample name" : "Nombre de ejemplo"}<input id="bruma-demo-name" name="sampleName" value={name} onChange={event => setName(event.target.value)} minLength={2} maxLength={100} required autoComplete="off" placeholder={english ? "e.g. Sample Guest" : "Ej. Invitado de prueba"} /></label>
            <fieldset><legend>{english ? "Attendance" : "Asistencia"}</legend><label><input type="radio" name="demoAttendance" value="yes" checked={attendance === "yes"} onChange={() => setAttendance("yes")} />{english ? "I'll attend" : "Sí asistiré"}</label><label><input type="radio" name="demoAttendance" value="no" checked={attendance === "no"} onChange={() => setAttendance("no")} />{english ? "I can't attend" : "No podré asistir"}</label></fieldset>
            <button className="bruma-demo-submit" type="submit">{saved ? (english ? "Update sample reply" : "Actualizar respuesta de ejemplo") : (english ? "Try confirming" : "Probar confirmación")}</button>
            {error && <p className="bruma-demo-error" role="alert">{error}</p>}
            <p className="bruma-demo-status" role="status">{notice}</p>
          </form>
        </section>
        <div className="bruma-demo-organizer"><p className="eyebrow">{english ? "THE ORGANIZER'S VIEW" : "VISTA DEL ORGANIZADOR"}</p><GuestResponsePanel key={resetKey} rows={rows} english={english} downloadName="nordra-invitados-ejemplo.csv" /></div>
      </div>
      <footer className="bruma-demo-footer"><p>{english ? "Your event includes a private panel with received replies, search, filters and list download." : "Tu evento incluye un panel privado con respuestas recibidas, búsqueda, filtros y descarga de lista."}</p><button type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true" />{english ? "Reset example" : "Reiniciar ejemplo"}</button></footer>
    </div>
  </dialog>;
}

