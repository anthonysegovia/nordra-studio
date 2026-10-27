import type { WeddingInvitation } from './weddingInvitations';

export type Delivery = { sentAt?: string | null; reminderAt?: string; updatedAt?: string };
export type WeddingActivity = { id: string; at: string; actor: string; action: string; invitationId?: string; label: string; count?: number; changes?: { name: string; field: string; before: string; after: string }[] };
export type WeddingManagement = { delivery: Record<string, Delivery>; history: WeddingActivity[]; trash: { invitation: WeddingInvitation; deletedAt: string }[] };
export const emptyManagement: WeddingManagement = { delivery: {}, history: [], trash: [] };
export type ManagementAction = (body: Record<string, unknown>) => Promise<unknown>;
export const activityDate = (value: string, english = false) => new Intl.DateTimeFormat(english ? 'en-US' : 'es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' }).format(new Date(value));
export function activityLabel(action: string, english: boolean) {
  const labels: Record<string, string[]> = { add: ['Invitación agregada', 'Invitation added'], edit: ['Datos o respuesta corregidos', 'Details or RSVP corrected'], reply: ['Respuesta desde la invitación', 'Reply from the invitation'], delete: ['Invitación eliminada', 'Invitation removed'], restore: ['Invitación recuperada', 'Invitation restored'], import: ['Invitaciones importadas', 'Invitations imported'], sent: ['Envío marcado por el organizador', 'Marked as sent by organizer'], unsent: ['Envío marcado como pendiente', 'Marked as not sent'], reminder: ['Recordatorio marcado como enviado', 'Reminder marked as sent'] };
  return (labels[action] || [action, action])[english ? 1 : 0];
}
export function actorLabel(actor: string, english: boolean) {
  return actor === 'guest' ? (english ? 'Guest' : 'Invitado') : actor === 'nordra' ? 'Nordra' : actor === 'sample-owner' ? (english ? 'Sample organizer' : 'Organizador de muestra') : (english ? 'Client' : 'Cliente');
}
