import type { WeddingInvitation } from './weddingInvitations';
import type { WeddingManagement } from './weddingManagement';
import type { BorealState } from './weddingBoreal';

export type GuestFilter = 'all' | 'yes' | 'pending' | 'no' | 'partial' | 'unnamed' | 'unseated' | 'unsent' | 'followup';
export type GuestOrder = 'name' | 'recent';
const nameKey = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim();

export function invitationProgress(invitation: WeddingInvitation) {
  const yes = invitation.people.filter(person => person.attendance === 'yes').length;
  const no = invitation.people.filter(person => person.attendance === 'no').length;
  const pending = invitation.people.length - yes - no;
  return { yes, no, pending, complete: pending === 0, partial: pending > 0 && yes + no > 0,
    unnamed: invitation.kind === 'plusOne' && invitation.people.some(person => !person.name.trim() && person.attendance !== 'no') };
}

export function selectDashboardInvitations(invitations: WeddingInvitation[], query: string, filter: GuestFilter, order: GuestOrder, boreal?: BorealState, management?: WeddingManagement) {
  const search = nameKey(query);
  return invitations.filter(invitation => {
    if (!invitation.people.some(person => nameKey(person.name).includes(search))) return false;
    const progress = invitationProgress(invitation);
    if (filter === 'unsent') return !management?.delivery[invitation.id]?.sentAt;
    if (filter === 'followup') return !!management?.delivery[invitation.id]?.sentAt && progress.pending > 0;
    if (filter === 'partial') return progress.partial;
    if (filter === 'unnamed') return progress.unnamed;
    if (filter === 'unseated') return !!boreal && invitation.people.some(person => person.attendance === 'yes' && !boreal.tables.some(table => table.id === boreal.seats[person.id]));
    return filter === 'all' || invitation.people.some(person => person.attendance === filter);
  }).sort((a, b) => (order === 'recent' ? Date.parse(b.updated_at) - Date.parse(a.updated_at) : 0) || a.people[0].name.localeCompare(b.people[0].name, 'es', { sensitivity: 'base' }) || a.id.localeCompare(b.id));
}

export function receptionSummary(invitations: WeddingInvitation[], state: BorealState) {
  const people = invitations.flatMap(invitation => invitation.people);
  return { confirmed: people.filter(person => person.attendance === 'yes').length,
    arrived: people.filter(person => !!state.arrivals[person.id]).length,
    waiting: people.filter(person => person.attendance === 'yes' && !state.arrivals[person.id]).length };
}

export function selectReceptionInvitations(invitations: WeddingInvitation[], query: string, filter: string, state: BorealState) {
  return invitations.filter(invitation => invitation.people.some(person => nameKey(person.name).includes(nameKey(query))) && (filter === 'all' || invitation.people.some(person => filter === 'arrived' ? !!state.arrivals[person.id] : person.attendance === 'yes' && !state.arrivals[person.id])));
}
