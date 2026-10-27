import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowUpRight, Check, Clock3, Copy, MessageCircle, Minus, MoreHorizontal, Pencil, QrCode, Share2, Trash2, X } from 'lucide-react';
import { invitationKindLabel, invitationLabel, type WeddingAttendance, type WeddingInvitation } from '../lib/weddingInvitations';
import { arrivalTime, type BorealState } from '../lib/weddingBoreal';
import { invitationProgress } from '../lib/weddingDashboard';
import { activityDate, type WeddingManagement, type ManagementAction } from '../lib/weddingManagement';
import { weddingError } from '../lib/weddingClient';
import { ActivityList } from './WeddingHistory';

export function AttendanceBadge({ status, english, children }: { status: WeddingAttendance; english: boolean; children?: React.ReactNode }) {
  const Icon = status === 'yes' ? Check : status === 'no' ? Minus : Clock3;
  return <span className={`ledger-badge is-${status}`}><Icon size={14} aria-hidden="true" />{children ?? (status === 'yes' ? (english ? 'Confirmed' : 'Confirmado') : status === 'no' ? (english ? 'Not attending' : 'No asistirá') : (english ? 'Pending' : 'Pendiente'))}</span>;
}

export type RecordActions = { disabled?: boolean; readOnly?: boolean; onEdit: (invitation: WeddingInvitation, personId?: string) => void; onCorrect: (invitation: WeddingInvitation, personId: string) => void; onDelete: (invitation: WeddingInvitation) => void };

export function WeddingRecordDetail({ invitation, english, boreal, sharing, management, managementAction, onClose, disabled, readOnly, onEdit, onCorrect, onDelete }: RecordActions & { invitation: WeddingInvitation; english: boolean; boreal?: BorealState; sharing: boolean; management: WeddingManagement; managementAction: ManagementAction; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [copied, setCopied] = useState(false), [fallback, setFallback] = useState(false);
  const progress = invitationProgress(invitation);
  const [tracking,setTracking]=useState(false),[trackingError,setTrackingError]=useState('');
  const delivery=management.delivery[invitation.id];
  const activity=management.history.filter(entry=>entry.invitationId===invitation.id).slice(0,5);
  async function mark(kind:string) {
    setTracking(true);setTrackingError('');
    try {await managementAction({action:'delivery',id:invitation.id,kind,previous:delivery?.updatedAt ?? null});}
    catch(reason){setTrackingError(weddingError(reason));}finally{setTracking(false);}
  }
  const reminder=`${english?'Hello':'Hola'}, ${invitationLabel(invitation)}. ${english?'We would love to know whether you can join us. Please complete the pending replies in your invitation':'Nos encantará saber si podrán acompañarnos. Completen las respuestas pendientes en su invitación'}: ${invitation.link || ''}`;
  useLayoutEffect(() => {
    const element = dialog.current;
    const trigger = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; if (trigger?.isConnected) trigger.focus({ preventScroll: true }); else document.getElementById('ledger-title')?.focus({ preventScroll: true }); };
  }, []);
  async function copy() {
    if (!invitation.link) return;
    try { await navigator.clipboard.writeText(invitation.link); setCopied(true); setFallback(false); }
    catch { setFallback(true); }
  }
  const message = `${english ? 'We would love to celebrate with you' : 'Nos encantará celebrar contigo'}, ${invitationLabel(invitation)}. ${english ? "Open your invitation and confirm each person's attendance" : 'Abre tu invitación y confirma la asistencia de cada persona'}: ${invitation.link || ''}`;
  return <dialog ref={dialog} className="wedding-record-drawer" aria-labelledby="record-detail-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === dialog.current) onClose(); }}>
    <div className="record-detail-inner">
      <header className="record-detail-header"><span>{english ? 'Invitation details' : 'Detalle de invitación'}</span><button autoFocus onClick={onClose} aria-label={english ? 'Close details' : 'Cerrar detalle'}><X size={20} aria-hidden="true" /></button></header>
      <p className="record-kind">{invitationKindLabel(invitation.kind, english)} · {invitation.people.length} {english ? (invitation.people.length === 1 ? 'place' : 'places') : invitation.people.length === 1 ? 'lugar' : 'lugares'}</p>
      <h2 id="record-detail-title">{invitationLabel(invitation)}</h2>
      <p className="record-completion">{progress.complete ? <Check size={15} aria-hidden="true" /> : <Clock3 size={15} aria-hidden="true" />}{progress.complete ? (english ? 'All replies received' : 'Respuestas completas') : (english ? `${progress.pending} ${progress.pending === 1 ? 'reply' : 'replies'} pending` : `${progress.pending} ${progress.pending === 1 ? 'respuesta pendiente' : 'respuestas pendientes'}`)}</p>
      {!readOnly && invitation.link && <details className="record-share" open={sharing || undefined}><summary><Share2 size={16} aria-hidden="true" />{english ? 'Share invitation' : 'Compartir invitación'}</summary><div><button onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}{copied ? (english ? 'Copied' : 'Copiado') : (english ? 'Copy link' : 'Copiar enlace')}</button><a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer"><MessageCircle size={17} aria-hidden="true" />WhatsApp</a></div><span role="status" className="ledger-sr-only">{copied ? (english ? 'Personal link copied' : 'Enlace personal copiado') : ''}</span>{fallback && <label>{english ? 'Copy this link' : 'Copia este enlace'}<input readOnly value={invitation.link} onFocus={event => event.currentTarget.select()} /></label>}</details>}
      {!readOnly && <details className="record-delivery" open={sharing || undefined}><summary>{english?'Sending and reminders':'Envío y recordatorios'}</summary><p>{delivery?.sentAt ? `${english?'Send recorded':'Envío registrado'} · ${activityDate(delivery.sentAt,english)}` : (english?'No send recorded':'Sin envío registrado')}</p><p className="operations-note">{english?'Mark this only after you have sent the message. Opening WhatsApp does not confirm delivery.':'Márcalo después de enviar el mensaje. Abrir WhatsApp no confirma la entrega.'}</p><button disabled={disabled||tracking} onClick={()=>void mark(delivery?.sentAt?'unsent':'sent')}>{delivery?.sentAt?(english?'Mark as not sent':'Marcar sin envío'):(english?'I sent the invitation':'Ya envié la invitación')}</button>{progress.pending>0&&invitation.link&&<div className="record-reminder"><a href={`https://wa.me/?text=${encodeURIComponent(reminder)}`} target="_blank" rel="noopener noreferrer">{english?'Prepare reminder':'Preparar recordatorio'}<MessageCircle size={16}/></a><button disabled={disabled||tracking} onClick={()=>void mark('reminder')}>{english?'I sent the reminder':'Ya envié el recordatorio'}</button>{delivery?.reminderAt&&<small>{english?'Last reminder':'Último recordatorio'} · {activityDate(delivery.reminderAt,english)}</small>}</div>}{trackingError&&<p role="alert" className="boreal-error">{trackingError}</p>}</details>}
      <div className="record-people">{invitation.people.map((person, index) => {
        const table = boreal?.tables.find(item => item.id === boreal.seats[person.id]);
        const arrival = boreal?.arrivals[person.id];
        return <section className="record-person" key={person.id} aria-label={person.name || (english ? 'Companion' : 'Acompañante')}>
          <p className="record-person-role">{index === 0 ? (english ? 'Main guest' : 'Invitado principal') : invitation.kind === 'couple' ? (english ? 'Partner' : 'Pareja') : (english ? 'Companion' : 'Acompañante')}</p>
          <h3>{person.name || (english ? 'Name to be confirmed' : 'Nombre por definir')}</h3><AttendanceBadge status={person.attendance} english={english} />
          {boreal && <dl className="record-person-facts"><div><dt>{english ? 'Table' : 'Mesa'}</dt><dd>{person.attendance === 'no' ? (english ? 'Not required' : 'No requiere') : table?.name || (english ? 'Not assigned' : 'Sin asignar')}</dd></div><div><dt>{english ? 'Arrival' : 'Entrada'}</dt><dd>{arrival ? `${english ? 'Arrived' : 'Ingresó'} · ${arrivalTime(arrival.at)}` : person.attendance === 'yes' ? (english ? 'Yet to arrive' : 'Por llegar') : person.attendance === 'no' ? (english ? 'Not attending' : 'No asistirá') : (english ? 'Awaiting RSVP' : 'Sin confirmar')}</dd></div></dl>}
          {!readOnly && <div className="record-person-actions">{!person.name && <button disabled={disabled} onClick={() => onEdit(invitation, person.id)}><Pencil size={14} />{english ? 'Add name' : 'Agregar nombre'}</button>}<button disabled={disabled} onClick={() => onCorrect(invitation, person.id)}>{english ? 'Correct RSVP' : 'Corregir asistencia'}</button></div>}
        </section>;
      })}</div>
      <div className="record-links">{invitation.link && <a href={invitation.link} target="_blank" rel="noopener noreferrer">{english ? 'Open invitation' : 'Abrir invitación'}<ArrowUpRight size={15} aria-hidden="true" /></a>}{boreal && invitation.passLink && progress.yes > 0 && <a href={invitation.passLink} target="_blank" rel="noopener noreferrer"><QrCode size={16} aria-hidden="true" />{english ? 'View QR pass' : 'Ver pase QR'}</a>}</div>
      <details className="record-activity"><summary>{english?'Recent activity':'Actividad reciente'}</summary><ActivityList entries={activity} english={english}/></details>
      <footer className="record-detail-footer"><p>{english ? 'Last updated' : 'Última actualización'}<time dateTime={invitation.updated_at}>{activityDate(invitation.updated_at,english)}</time></p>{!readOnly && <details className="record-more"><summary><MoreHorizontal size={20} aria-hidden="true" /><span>{english ? 'More options' : 'Más opciones'}</span></summary><div><button disabled={disabled||tracking} onClick={() => onEdit(invitation)}><Pencil size={15} />{english ? 'Edit invitation' : 'Editar invitación'}</button><button disabled={disabled||tracking} className="record-delete" onClick={() => onDelete(invitation)}><Trash2 size={15} />{english ? 'Delete invitation' : 'Eliminar invitación'}</button></div></details>}</footer>
    </div>
  </dialog>;
}
