import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { WeddingError } from './wedding-errors.js';

const fail = (code, status = 400) => { throw new WeddingError(code, status); };
const digest = value => createHash('sha256').update(value).digest('hex');
const equal = (a, b) => typeof a === 'string' && typeof b === 'string' && /^[a-f0-9]{64}$/.test(a) && /^[a-f0-9]{64}$/.test(b) && timingSafeEqual(Buffer.from(a), Buffer.from(b));
const key = value => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
export const borealActions = ['table-save', 'table-delete', 'seat-assign', 'check-in', 'undo-entry', 'pass-scan', 'reception-issue', 'reception-revoke'];
export const publicBorealActions = ['public-pass', 'reception-load', 'reception-scan', 'reception-check-in'];
export const borealState = row => ({ tables: [], seats: {}, arrivals: {}, arrivalLog: [], reception: null, ...row.boreal });
export function borealView(row) {
  const state = borealState(row);
  return { tables: state.tables, seats: state.seats, arrivals: Object.fromEntries(Object.entries(state.arrivals).map(([id, entry]) => [id, { at: entry.at }])), receptionExpiresAt: state.reception?.expiresAt || null };
}
export function assertBoreal(row, mode) { if (mode !== 'sample' && row.plan !== 'Boreal') fail('boreal_required', 403); }
export function passToken(row, id, secret, mode) { return createHmac('sha256', secret).update(`nordra-entry:${mode}:${row.id}:${id}`).digest('hex'); }
export function passLink(row, invitation, site, secret, mode) {
  const url = new URL('/pase-boda.html', site);
  url.hash = `pase=${mode}~${row.id}~${invitation.id}~${passToken(row, invitation.id, secret, mode)}`;
  return url.href;
}
export function passInvitation(row, body, site, secret, mode) {
  let id = body.id, token = body.token;
  if (typeof body.pass === 'string') {
    if (body.pass.length > 1000) fail('invalid_pass');
    let url;
    try { url = new URL(body.pass); } catch { fail('invalid_pass'); }
    if (url.origin !== new URL(site).origin || url.pathname !== '/pase-boda.html') fail('invalid_pass');
    const [kind, eventId, invitationId, signature, ...extra] = (new URLSearchParams(url.hash.slice(1)).get('pase') || '').split('~');
    if (extra.length || kind !== mode || eventId !== row.id) fail('wrong_wedding');
    id = invitationId; token = signature;
  }
  if (typeof id !== 'string' || !equal(token, passToken(row, id, secret, mode))) fail('invalid_pass', 404);
  const invitation = row.invitations.find(item => item.id === id);
  if (!invitation) fail('invalid_pass', 404);
  return invitation;
}
export function passView(row, invitation, site, secret, mode) {
  const state = borealState(row);
  return {
    couple: mode === 'sample' ? 'Valentina & Sebastián' : row.couple,
    eventDate: mode === 'sample' ? '2027-06-19' : row.event_date,
    city: mode === 'sample' ? 'Ciudad de México' : row.city,
    sample: mode === 'sample', expiresAt: row.expires_at,
    invitation: { id: invitation.id, kind: invitation.kind, people: invitation.people.map(person => ({ ...person, table: state.tables.find(table => table.id === state.seats[person.id])?.name || '', enteredAt: state.arrivals[person.id]?.at || null })) },
    link: passLink(row, invitation, site, secret, mode),
  };
}
export function receptionView(row, mode) {
  return { workspaceId: row.id, version: row.version, couple: mode === 'sample' ? 'Valentina & Sebastián' : row.couple, expiresAt: row.expires_at, invitations: row.invitations.map(({ id, kind, people }) => ({ id, kind, people })), boreal: borealView(row) };
}
export function authorizeReception(row, token, now) {
  const reception = borealState(row).reception;
  if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token) || !reception || Date.parse(reception.expiresAt) <= now || !equal(digest(token), reception.hash)) fail('reception_expired', 401);
}
// RSVP and guest editing cannot silently erase a recorded arrival or leave seats on deleted/declined guests.
export function reconcileBoreal(row, invitations) {
  const state = borealState(row), people = invitations.flatMap(item => item.people);
  const previous = row.invitations.flatMap(item => item.people);
  for (const id of Object.keys(state.arrivals)) {
    const person = people.find(item => item.id === id), old = previous.find(item => item.id === id);
    if (!person || person.attendance !== 'yes' || person.name !== old?.name) fail('arrival_locked', 409);
  }
  return { ...state, seats: Object.fromEntries(Object.entries(state.seats).filter(([id]) => people.some(person => person.id === id && person.attendance !== 'no'))) };
}
export function sampleBoreal(invitations) {
  const tables = [{ id: 'table-jazmin', name: 'Jazmín', capacity: 8 }, { id: 'table-olivo', name: 'Olivo', capacity: 8 }, { id: 'table-azahar', name: 'Azahar', capacity: 6 }];
  const seats = {};
  for (const invitation of invitations) {
    const people = invitation.people.filter(person => person.attendance !== 'no');
    if (Object.keys(seats).length + people.length > 12) break;
    const table = tables.find(item => item.capacity - Object.values(seats).filter(id => id === item.id).length >= people.length);
    if (table) for (const person of people) seats[person.id] = table.id;
  }
  return { tables, seats, arrivals: {}, arrivalLog: [], reception: null };
}
export function changeBoreal(row, body, { site, mode, now = Date.now(), actor = 'owner' }) {
  const state = structuredClone(borealState(row));
  const people = row.invitations.flatMap(item => item.people);
  const action = body.action.replace(/^reception-check-in$/, 'check-in');
  if (['table-save', 'table-delete', 'seat-assign'].includes(action) && body.version !== row.version) fail('response_changed', 409);
  if (action === 'table-save') {
    const table = body.table;
    if (!table || typeof table.id !== 'string' || !/^table-[\w-]{1,80}$/.test(table.id) || typeof table.name !== 'string' || !Number.isInteger(table.capacity) || table.capacity < 1 || table.capacity > 30) fail('invalid_table');
    const name = table.name.trim().normalize('NFC').replace(/\s+/gu, ' ');
    if (name.length < 2 || name.length > 50 || /[\p{Cc}\p{Cf}<>]/u.test(name)) fail('invalid_table');
    const old = state.tables.find(item => item.id === table.id);
    if (body.edit === true && !old) fail('table_missing', 404);
    if (body.edit !== true && old) fail('response_changed', 409);
    if (old && (body.previous?.name !== old.name || body.previous?.capacity !== old.capacity)) fail('response_changed', 409);
    if (state.tables.some(item => item.id !== table.id && key(item.name) === key(name))) fail('duplicate_table');
    if (Object.values(state.seats).filter(id => id === table.id).length > table.capacity) fail('table_full', 409);
    if (!old && state.tables.length >= 50) fail('table_limit');
    const next = { id: table.id, name, capacity: table.capacity };
    state.tables = old ? state.tables.map(item => item.id === table.id ? next : item) : [...state.tables, next];
  } else if (action === 'table-delete') {
    if (!state.tables.some(table => table.id === body.id)) fail('table_missing', 404);
    state.tables = state.tables.filter(table => table.id !== body.id);
    state.seats = Object.fromEntries(Object.entries(state.seats).filter(([, id]) => id !== body.id));
  } else if (action === 'seat-assign') {
    if (!Array.isArray(body.personIds) || !body.personIds.length || body.personIds.length > 2 || new Set(body.personIds).size !== body.personIds.length || body.personIds.some(id => !people.some(person => person.id === id && person.attendance !== 'no'))) fail('invalid_people');
    const table = state.tables.find(item => item.id === body.tableId);
    if (body.tableId !== null && !table) fail('table_missing', 404);
    if (table && Object.entries(state.seats).filter(([id, tableId]) => tableId === table.id && !body.personIds.includes(id)).length + body.personIds.length > table.capacity) fail('table_full', 409);
    for (const id of body.personIds) { if (table) state.seats[id] = table.id; else delete state.seats[id]; }
  } else if (action === 'check-in') {
    const invitation = row.invitations.find(item => item.id === body.id);
    if (!invitation || !Array.isArray(body.personIds) || !body.personIds.length || body.personIds.length > 2 || new Set(body.personIds).size !== body.personIds.length || body.personIds.some(id => !invitation.people.some(person => person.id === id && person.name && person.attendance === 'yes'))) fail('not_confirmed', 409);
    const added = [], already = [];
    for (const id of body.personIds) {
      if (state.arrivals[id]) { already.push(id); continue; }
      state.arrivals[id] = { at: new Date(now).toISOString(), by: actor };
      state.arrivalLog.push({ personId: id, action: 'entry', ...state.arrivals[id] });
      added.push(id);
    }
    state.arrivalLog = state.arrivalLog.slice(-1000);
    return { state, result: { added, already }, unchanged: !added.length };
  } else if (action === 'undo-entry') {
    const entry = state.arrivals[body.personId];
    if (!entry || entry.at !== body.enteredAt) fail('response_changed', 409);
    delete state.arrivals[body.personId];
    state.arrivalLog.push({ personId: body.personId, action: 'undo', at: new Date(now).toISOString(), by: actor });
    state.arrivalLog = state.arrivalLog.slice(-1000);
  } else if (action === 'reception-issue') {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Math.min(now + 48 * 3600000, Date.parse(row.expires_at))).toISOString();
    state.reception = { hash: digest(token), expiresAt };
    const url = new URL('/recepcion-boda.html', site); url.hash = `acceso=${mode}~${row.id}~${token}`;
    return { state, receptionLink: url.href };
  } else if (action === 'reception-revoke') { state.reception = null; }
  else fail('invalid_action');
  return { state };
}
