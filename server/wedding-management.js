import { randomUUID } from 'node:crypto';
import { applyOwnerChange, normalizeInvitation, validateList } from './wedding-links.js';
import { WeddingError } from './wedding-errors.js';
import { jsonBody } from './admin-access.js';

export function weddingBody(req) {
  const body = jsonBody(req, 262144);
  if (body.action !== 'import' && Buffer.byteLength(JSON.stringify(body), 'utf8') > 8192) throw new Error('Invalid body');
  return body;
}

export const managementActions = ['import', 'restore', 'delivery'];
const fail = (code, status = 400) => { throw new WeddingError(code, status); };
const label = item => item.people.map(p => p.name || '+1').join(' & ');
export const managementState = row => structuredClone({ delivery: {}, history: [], trash: [], imports: [], ...row.management });
export function managementView(row) {
  const state = managementState(row);
  return { delivery: state.delivery, history: state.history, trash: state.trash.map(({ invitation, deletedAt }) => ({ invitation, deletedAt })) };
}
function append(state, event) {
  state.history = [{ id: randomUUID(), ...event }, ...state.history].slice(0, 1000);
  return state;
}
export function logGuestChange(row, next, actor = 'guest', now = new Date().toISOString()) {
  return logListChange(row, row.invitations.map(item => item.id === next.id ? next : item), { action: 'reply' }, actor, now);
}
export function logListChange(row, list, body, actor, now = new Date().toISOString()) {
  const state = managementState(row);
  for (const item of list) {
    const old = row.invitations.find(previous => previous.id === item.id);
    if (old && JSON.stringify(old.people) === JSON.stringify(item.people) && old.kind === item.kind) continue;
    const changes = [];
    for (const person of item.people) {
      const before = old?.people.find(p => p.id === person.id);
      if (before && before.attendance !== person.attendance) changes.push({ name: person.name || '+1', field: 'attendance', before: before.attendance, after: person.attendance });
      if (before && before.name !== person.name) changes.push({ name: person.name || '+1', field: 'name', before: before.name, after: person.name });
    }
    append(state, { at: now, actor, action: old ? body.action === 'reply' ? 'reply' : 'edit' : 'add', invitationId: item.id, label: label(item), changes });
  }
  return state;
}
export function changeManagement(row, body, actor, now = new Date().toISOString()) {
  let state = managementState(row), list = row.invitations;
  const invitation = list.find(item => item.id === body.id);
  if (body.action === 'import') {
    if (typeof body.requestId !== 'string' || !/^[a-f0-9-]{36}$/i.test(body.requestId)) fail('invalid_import');
    if (state.imports.includes(body.requestId)) return { list, management: state, unchanged: true };
    if (!Array.isArray(body.invitations) || !body.invitations.length || body.invitations.length > 300) fail('invalid_import');
    const added = body.invitations.map(input => normalizeInvitation({ ...input, updated_at: now, people: input?.people?.map(p => ({ ...p, attendance: 'pending' })) }));
    list = validateList([...list, ...added]);
    if (added.some(item => state.trash.some(entry => entry.invitation.id === item.id))) fail('duplicate_id', 409);
    state.imports = [...state.imports, body.requestId].slice(-1000);
    append(state, { at: now, actor, action: 'import', label: '', count: added.length });
  } else if (body.action === 'delivery') {
    if (!invitation) fail('guest_missing', 404);
    if (!['sent', 'reminder', 'unsent'].includes(body.kind)) fail('invalid_action');
    const old = state.delivery[invitation.id] || {};
    if ((body.previous ?? null) !== (old.updatedAt ?? null)) fail('response_changed', 409);
    if (body.kind === 'reminder' && !invitation.people.some(p => p.attendance === 'pending')) fail('no_pending_replies');
    state.delivery[invitation.id] = { ...old, sentAt: body.kind === 'unsent' ? null : old.sentAt || now, ...(body.kind === 'reminder' ? { reminderAt: now } : {}), updatedAt: new Date(Math.max(Date.parse(now), (Date.parse(old.updatedAt || '') || 0) + 1)).toISOString() };
    append(state, { at: now, actor, action: body.kind, invitationId: invitation.id, label: label(invitation) });
  } else if (body.action === 'restore') {
    const removed = state.trash.find(entry => entry.invitation.id === body.id);
    if (!removed) fail('guest_missing', 404);
    const restored = normalizeInvitation({ ...removed.invitation, updated_at: new Date(Math.max(Date.parse(now),Date.parse(removed.invitation.updated_at)+1)).toISOString() });
    list = validateList([...list, restored]);
    state.trash = state.trash.filter(entry => entry.invitation.id !== body.id);
    if (removed.delivery) state.delivery[body.id] = removed.delivery;
    append(state, { at: now, actor, action: 'restore', invitationId: body.id, label: label(restored) });
  } else if (body.action === 'delete') {
    if (!invitation) fail('guest_missing', 404);
    if (body.updatedAt && body.updatedAt !== invitation.updated_at) fail('response_changed', 409);
    if (state.trash.length >= 300) fail('trash_limit', 409);
    list = applyOwnerChange(list, body, now);
    state.trash.push({ invitation: normalizeInvitation(invitation), deletedAt: now, delivery: state.delivery[body.id] });
    delete state.delivery[body.id];
    append(state, { at: now, actor, action: 'delete', invitationId: body.id, label: label(invitation) });
  } else {
    list = applyOwnerChange(list, body, now);
    state = body.action === 'reset' ? managementState({}) : logListChange(row, list, body, actor, now);
  }
  return { list, management: state };
}
