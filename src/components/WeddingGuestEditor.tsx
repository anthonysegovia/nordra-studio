import { useEffect, useId, useRef, useState, type FormEvent, type RefObject } from "react";
import { Check, Trash2, UserRound, X } from "lucide-react";
import type { GuestResponse } from "../lib/guestResponses";

export type WeddingGuestAction = { mode: "add" } | { mode: "edit" | "delete"; guest: GuestResponse };

export function WeddingGuestEditor({ action, english, onSave, onDelete, onClose, fallbackFocus }: {
  action: WeddingGuestAction; english: boolean;
  onSave: (name: string, attendance: "yes" | "no", id?: string) => void;
  onDelete: (guest: GuestResponse) => void;
  onClose: () => void; fallbackFocus: RefObject<HTMLDivElement | null>;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const nameField = useRef<HTMLInputElement>(null);
  const cancelButton = useRef<HTMLButtonElement>(null);
  const [name, setName] = useState(action.mode === "add" ? "" : action.guest.guest_name);
  const [attendance, setAttendance] = useState<"" | "yes" | "no">(action.mode === "add" ? "" : action.guest.attendance);
  const [error, setError] = useState("");
  const deleting = action.mode === "delete";
  const title = deleting ? (english ? "Remove a guest" : "Eliminar invitado") : action.mode === "add" ? (english ? "One more person to celebrate" : "Una persona más para celebrar") : (english ? "A little update" : "Un pequeño cambio");

  useEffect(() => {
    const trigger = document.activeElement as HTMLElement | null;
    const modal = dialog.current;
    modal?.showModal();
    (nameField.current ?? cancelButton.current)?.focus();
    return () => {
      modal?.close();
      if (trigger?.isConnected) trigger.focus();
      else fallbackFocus.current?.focus({ preventScroll: true });
    };
  }, [fallbackFocus]);

  function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      if (action.mode === "delete") onDelete(action.guest);
      else {
        if (!attendance) return;
        onSave(name, attendance, action.mode === "edit" ? action.guest.id : undefined);
      }
      onClose();
    } catch (reason) {
      const code = (reason as Error).message;
      setError(code);
      if (code === "invalid_name" || code === "duplicate_name") nameField.current?.focus();
    }
  }
  const errorText = error === "duplicate_name" ? (english ? "That name is already in the list" : "Ese nombre ya está en la lista")
    : error === "guest_limit" ? (english ? "This preview supports up to 200 sample guests" : "Esta vista admite hasta 200 invitados de muestra")
    : error === "preview_unavailable" ? (english ? "The browser could not save this change. Enable session storage and try again." : "El navegador no pudo guardar el cambio. Habilita el almacenamiento de sesión e intenta de nuevo.")
    : error === "guest_missing" ? (english ? "This guest is no longer in the list" : "Este invitado ya no está en la lista")
    : (english ? "Enter a name with 2 to 100 characters" : "Escribe un nombre de 2 a 100 caracteres");

  return <dialog ref={dialog} className="workspace-dialog workspace-guest-editor" aria-labelledby={id + "-title"} aria-describedby={deleting ? id + "-description" : undefined} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="workspace-dialog-inner">
      <button className="workspace-dialog-close" type="button" onClick={onClose} aria-label={english ? "Close" : "Cerrar"}><X size={20} aria-hidden="true" /></button>
      <span className={`workspace-editor-icon${deleting ? " is-removing" : ""}`}>{deleting ? <Trash2 size={22} strokeWidth={1.3} aria-hidden="true" /> : <UserRound size={22} strokeWidth={1.3} aria-hidden="true" />}</span>
      <p className="workspace-eyebrow">{english ? "YOUR FAVORITE PEOPLE" : "SUS PERSONAS FAVORITAS"}</p>
      <h2 id={id + "-title"}>{title}</h2>
      <form onSubmit={submit}>
        {action.mode === "delete" ? <p className="workspace-delete-description" id={id + "-description"}>{english ? "Remove " : "Se quitará a "}<strong>{action.guest.guest_name}</strong>{english ? " from this sample list?" : " de esta lista de muestra"}</p> : <>
          <label htmlFor={id + "-name"}>{english ? "Guest name" : "Nombre del invitado"}</label>
          <input ref={nameField} id={id + "-name"} autoFocus name="guestName" autoComplete="off" required minLength={2} maxLength={100} value={name} onChange={event => { setName(event.target.value); setError(""); }} placeholder={english ? "e.g. Ana Torres" : "Ej. Ana Torres"} aria-invalid={error === "invalid_name" || error === "duplicate_name"} aria-describedby={error ? id + "-error" : undefined} />
          <label className="workspace-editor-attendance" htmlFor={id + "-attendance"}>{english ? "Attendance" : "Asistencia"}</label>
          <select id={id + "-attendance"} required value={attendance} onChange={event => { setAttendance(event.target.value as "yes" | "no"); setError(""); }}><option value="" disabled>{english ? "Select a reply" : "Selecciona una respuesta"}</option><option value="yes">{english ? "Attending" : "Sí asistirá"}</option><option value="no">{english ? "Not attending" : "No podrá ir"}</option></select>
        </>}
        {error && <p className="workspace-editor-error" role="alert" id={id + "-error"}>{errorText}</p>}
        <div className="workspace-editor-actions"><button ref={cancelButton} className="workspace-editor-cancel" type="button" autoFocus={deleting} onClick={onClose}>{english ? "Cancel" : "Cancelar"}</button><button className={`workspace-button${deleting ? " workspace-remove-button" : ""}`} type="submit">{deleting ? <Trash2 size={15} aria-hidden="true" /> : <Check size={16} aria-hidden="true" />}{deleting ? (english ? "Remove guest" : "Eliminar invitado") : action.mode === "add" ? (english ? "Add guest" : "Agregar invitado") : (english ? "Save changes" : "Guardar cambios")}</button></div>
      </form>
      {!deleting && <p className="workspace-editor-note">{english ? "Sample data · Changes stay in this tab for up to 2 hours" : "Datos de muestra · Cambios en esta pestaña, hasta por 2 horas"}</p>}
    </div>
  </dialog>;
}
