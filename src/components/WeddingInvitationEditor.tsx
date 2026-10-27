import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { Check, Heart, Trash2, UserRound, X } from "lucide-react";
import { invitationLabel, type WeddingAttendance, type WeddingInvitation, type WeddingInvitationKind, type WeddingPerson } from "../lib/weddingInvitations";

export type WeddingInvitationAction = { mode: "add" } | { mode: "edit" | "delete" | "reply" | "attendance"; invitation: WeddingInvitation; personId?: string; confirm?: boolean };

export function WeddingInvitationEditor({ action, english, realEvent = false, onSave, onDelete, onClose, fallbackFocus }: {
  action: WeddingInvitationAction; english: boolean; realEvent?: boolean; onSave: (invitation: WeddingInvitation, mode: "add" | "edit") => Promise<void>;
  onDelete: (invitation: WeddingInvitation) => Promise<void>; onClose: () => void; fallbackFocus: RefObject<HTMLDivElement | null>;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const firstField = useRef<HTMLInputElement | HTMLSelectElement | null>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const [invitationId] = useState(() => action.mode === "add" ? `wedding-invitation-${crypto.randomUUID()}` : action.invitation.id);
  const [kind, setKind] = useState<WeddingInvitationKind>(action.mode === "add" ? "individual" : action.invitation.kind);
  const [people, setPeople] = useState<WeddingPerson[]>(() => {
    const members = action.mode === "add" ? [] : action.invitation.people.map(person => ({ ...person, attendance: action.confirm && person.id === action.personId ? "yes" as const : person.attendance }));
    while (members.length < 2) members.push({ id: `wedding-person-${crypto.randomUUID()}`, name: "", attendance: "pending" });
    return members;
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const deleting = action.mode === "delete";
  const replying = action.mode === "reply";
  const correcting = action.mode === "attendance";
  const displayed = people.slice(0, kind === "individual" ? 1 : 2);
  const focusId = action.mode !== "add" && action.personId ? action.personId : displayed[0].id;
  const title = correcting ? (english ? "Correct RSVP" : "Corregir asistencia") : deleting ? (english ? "Remove invitation" : "Eliminar invitación") : replying ? (english ? "Will you join us?" : displayed.length === 1 ? "¿Nos acompañas?" : "¿Nos acompañan?") : action.mode === "add" ? (english ? "An invitation to share" : "Una invitación para compartir") : (english ? "Every person matters" : "Cada persona cuenta");

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const modal = dialog.current;
    modal?.showModal();
    (firstField.current ?? cancelButton.current)?.focus();
    return () => { modal?.close(); if (trigger?.isConnected) trigger.focus(); else fallbackFocus.current?.focus({ preventScroll: true }); };
  }, [fallbackFocus]);

  function updatePerson(personId: string, patch: Partial<WeddingPerson>) {
    setPeople(current => current.map(person => person.id === personId ? { ...person, ...patch } : person)); setError("");
  }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (busy) return; setError(""); setBusy(true);
    try {
      if (action.mode === "delete") await onDelete(action.invitation);
      else await onSave({ id: invitationId, kind, people: displayed, updated_at: action.mode === "add" ? new Date().toISOString() : action.invitation.updated_at }, action.mode === "add" ? "add" : "edit");
      onClose();
    } catch (reason) { setError((reason as Error).message); setBusy(false); }
  }
  const errorText = error === "duplicate_name" ? (english ? "One of these names is already in the list" : "Uno de estos nombres ya está en la lista")
    : error === "companion_name_required" ? (english ? "Add the companion's name before confirming" : "Agrega el nombre del acompañante antes de confirmar")
    : error === "guest_limit" ? (english ? "This panel supports up to 300 places" : "Este panel admite hasta 300 lugares")
    : error === "response_changed" ? (english ? "A reply changed while you were editing. Close and reopen this invitation to see the latest reply." : "La respuesta cambió mientras editabas. Cierra y vuelve a abrir esta invitación para ver la más reciente.")
    : ["unavailable", "session_unavailable", "limited", "TimeoutError", "Failed to fetch"].includes(error) ? (english ? "We could not save the change. Check your connection and try again." : "No pudimos guardar el cambio. Revisa tu conexión e intenta nuevamente.")
    : error === "guest_missing" ? (english ? "This invitation is no longer in the list" : "Esta invitación ya no está en la lista")
    : (english ? "Use names with 2 to 100 characters" : "Usa nombres de 2 a 100 caracteres");

  return <dialog ref={dialog} className="workspace-dialog workspace-guest-editor wedding-party-editor" aria-labelledby={id + "-title"} aria-busy={busy} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (!busy && event.target === dialog.current) onClose(); }}>
    <div className="workspace-dialog-inner">
      <button className="workspace-dialog-close" type="button" disabled={busy} onClick={onClose} aria-label={english ? "Close" : "Cerrar"}><X size={20} aria-hidden="true" /></button>
      <span className={`workspace-editor-icon${deleting ? " is-removing" : ""}`}>{deleting ? <Trash2 size={22} strokeWidth={1.3} aria-hidden="true" /> : replying ? <Heart size={22} strokeWidth={1.3} aria-hidden="true" /> : <UserRound size={22} strokeWidth={1.3} aria-hidden="true" />}</span>
      <p className="workspace-eyebrow">{english ? "YOUR FAVORITE PEOPLE" : "SUS PERSONAS FAVORITAS"}</p><h2 id={id + "-title"}>{title}</h2>
      <form onSubmit={submit}>
        {action.mode === "delete" ? <p className="workspace-delete-description">{english ? "Remove the invitation for " : "Se eliminará la invitación de "}<strong>{invitationLabel(action.invitation)}</strong>{english ? ` and its ${action.invitation.people.length} assigned place(s) from this list` : ` y ${action.invitation.people.length === 1 ? "su lugar asignado" : "sus 2 lugares asignados"} de esta lista`}</p> : <>
          {!replying && !correcting && <fieldset className="wedding-kind-picker"><legend>{english ? "Invitation type" : "Tipo de invitación"}</legend>{(["individual", "couple", "plusOne"] as const).map(value => <label key={value}><input type="radio" name={id + "-kind"} value={value} checked={kind === value} onChange={() => { setKind(value); setError(""); }} /><span>{value === "individual" ? "Individual" : value === "couple" ? (english ? "Couple" : "Pareja") : "+1"}</span></label>)}</fieldset>}
          {correcting && <p className="workspace-editor-note">{english ? 'Use this only to correct a reply on behalf of a guest' : 'Usa esta opción para corregir una respuesta por indicación del invitado'}</p>}
          {replying && <p className="wedding-reply-context">{invitationLabel(action.invitation)}<span>{displayed.length} {english ? "assigned place(s) · Reply for each person" : `${displayed.length === 1 ? "lugar asignado" : "lugares asignados"} · Respuesta por persona`}</span></p>}
          <div className="wedding-editor-people">{displayed.map((person, index) => {
            const knownInReply = (replying || correcting) && !!action.invitation.people[index]?.name;
            const optionalName = kind === "plusOne" && index === 1 && person.attendance !== "yes";
            return <fieldset className="wedding-editor-person" key={person.id}><legend>{index === 0 ? (english ? "Main guest" : "Invitado principal") : kind === "couple" ? (english ? "Partner" : "Pareja") : (english ? "Companion" : "Acompañante")}</legend><div>
              <label htmlFor={`${id}-name-${index}`}>{english ? "Name" : "Nombre"}{optionalName && <span> · {english ? "optional" : "opcional"}</span>}</label><input id={`${id}-name-${index}`} name={`guestName${index}`} ref={node => { if (person.id === focusId && !knownInReply) firstField.current = node; }} value={person.name} readOnly={knownInReply} autoComplete="off" required={!optionalName} minLength={2} maxLength={100} placeholder={optionalName ? (english ? "To be named" : "Por definir") : (english ? "Full name" : "Nombre completo")} onChange={event => updatePerson(person.id, { name: event.target.value })} aria-describedby={error ? id + "-error" : undefined} />
              <label className="workspace-editor-attendance" htmlFor={`${id}-attendance-${index}`}>{english ? "Attendance" : "Asistencia"}</label><select id={`${id}-attendance-${index}`} ref={node => { if (person.id === focusId && knownInReply) firstField.current = node; }} value={person.attendance} onChange={event => updatePerson(person.id, { attendance: event.target.value as WeddingAttendance })}><option value="pending">{english ? "Pending" : "Pendiente"}</option><option value="yes">{english ? "Confirmed" : "Confirmado"}</option><option value="no">{english ? "Not attending" : "No asistirá"}</option></select>
            </div></fieldset>;
          })}</div>
          {kind === "plusOne" && !replying && <p className="workspace-editor-note">{english ? "You can add the companion's name when they confirm" : "El nombre del acompañante puede completarse al confirmar"}</p>}
          {action.mode === "edit" && action.invitation.people.length === 2 && kind === "individual" && <p className="wedding-place-warning">{english ? "Saving will remove the second person and their assigned place" : "Al guardar se quitarán la segunda persona y su lugar asignado"}</p>}
        </>}
        {error && <p className="workspace-editor-error" role="alert" id={id + "-error"}>{errorText}</p>}
        <div className="workspace-editor-actions"><button ref={cancelButton} disabled={busy} className="workspace-editor-cancel" type="button" onClick={onClose}>{english ? "Cancel" : "Cancelar"}</button><button disabled={busy} className={`workspace-button${deleting ? " workspace-remove-button" : ""}`} type="submit">{deleting ? <Trash2 size={15} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{busy ? (english ? "Saving…" : "Guardando…") : deleting ? (english ? "Delete" : "Eliminar") : replying ? (english ? "Confirm replies" : "Confirmar respuestas") : action.mode === "add" ? (english ? "Add invitation" : "Agregar invitación") : (english ? "Save changes" : "Guardar cambios")}</button></div>
      </form>
      <p className="workspace-editor-note">{deleting ? (english ? "Its personal link will stop working" : "Su enlace quedará inactivo. Puedes recuperar la invitación desde Historial durante la vigencia de la boda") : realEvent ? (english ? "Saved in your private wedding panel" : "Se guarda en el panel privado de su boda") : (english ? "Connected sample · Available for 24 hours · Use fictional names" : "Muestra conectada · Disponible por 24 horas · Usa nombres ficticios")}</p>
    </div>
  </dialog>;
}
