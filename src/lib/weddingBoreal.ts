import type { WeddingInvitation } from './weddingInvitations';
export type WeddingTable = { id: string; name: string; capacity: number };
export type BorealState = { tables: WeddingTable[]; seats: Record<string, string>; arrivals: Record<string, { at: string }>; receptionExpiresAt: string | null };
export type BorealResult = { scanned?: string; invitations?: WeddingInvitation[]; result?: { added: string[]; already: string[] }; receptionLink?: string };
export type BorealAction = (body: Record<string, unknown>) => Promise<BorealResult>;
export const emptyBoreal: BorealState = { tables: [], seats: {}, arrivals: {}, receptionExpiresAt: null };
export const arrivalTime = (value: string) => new Intl.DateTimeFormat('es-MX', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Mexico_City' }).format(new Date(value));
export function downloadBoreal(invitations: WeddingInvitation[], state: BorealState, english: boolean) {
  const cell = (value: string) => '"' + (/^[\s\uFEFF]*[=+\-@\t\r\n]/u.test(value) ? "'" + value : value).replaceAll('"', '""') + '"';
  const rows = invitations.flatMap(invitation => invitation.people.map(person => [person.name || (english ? 'Companion to be named' : 'Acompañante por definir'), invitation.people[0].name, person.attendance === 'yes' ? (english ? 'Confirmed' : 'Confirmado') : person.attendance === 'no' ? (english ? 'Not attending' : 'No asistirá') : (english ? 'Pending' : 'Pendiente'), state.tables.find(table => table.id === state.seats[person.id])?.name || '', state.arrivals[person.id]?.at || '']));
  const header = english ? ['Person', 'Invitation', 'RSVP', 'Table', 'Arrival (UTC)'] : ['Persona', 'Invitación', 'Confirmación', 'Mesa', 'Llegada (UTC)'];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + [header, ...rows].map(row => row.map(cell).join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }));
  const link = document.createElement('a'); link.href = url; link.download = 'boda-mesas-y-entradas.csv'; link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
