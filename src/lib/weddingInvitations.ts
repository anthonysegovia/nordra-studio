import { guestNameKey, normalizeGuestName } from "./guestResponses";
import { decodeWeddingPreview as decodeLegacy, weddingSampleResponses as legacySamples } from "./weddingGuests";

export type WeddingAttendance = "yes" | "no" | "pending";
export type WeddingInvitationKind = "individual" | "couple" | "plusOne";
export type WeddingPerson = { id: string; name: string; attendance: WeddingAttendance };
export type WeddingInvitation = { id: string; kind: WeddingInvitationKind; people: WeddingPerson[]; updated_at: string; link?: string; passLink?: string };
export const weddingInvitationKey = "nordra-wedding-preview-v3";
const lifetime = 2 * 60 * 60 * 1000;
const maxPeople = 300;
const sample = (index: number, kind: WeddingInvitationKind, names: string[], statuses: WeddingAttendance[]): WeddingInvitation => ({
  id: `wedding-invitation-${index}`, kind, updated_at: "2026-10-25T18:00:00Z",
  people: names.map((name, person) => ({ id: `wedding-person-${index}-${person}`, name, attendance: statuses[person] })),
});
export const weddingInvitationSamples: WeddingInvitation[] = [
  sample(1, "individual", ["Mariana López"], ["yes"]),
  sample(2, "couple", ["Daniel Moreno", "Isabel García"], ["yes", "pending"]),
  sample(3, "plusOne", ["Lucía Herrera", ""], ["yes", "pending"]),
  sample(4, "couple", ["Alejandro Ruiz", "Sofía Martínez"], ["yes", "yes"]),
  sample(5, "individual", ["Diego Navarro"], ["no"]),
  sample(6, "plusOne", ["Valeria Castro", "Fernando Ortiz"], ["yes", "no"]),
  sample(7, "individual", ["Renata Flores"], ["pending"]),
  sample(8, "couple", ["Gabriel Santos", "Paula Méndez"], ["yes", "no"]),
  sample(9, "plusOne", ["Emiliano Vega", ""], ["pending", "pending"]),
  sample(10, "individual", ["Regina Salazar"], ["yes"]),
  sample(11, "couple", ["Mateo Aguilar", "Elena Ríos"], ["yes", "yes"]),
  sample(12, "plusOne", ["Nicolás Cabrera", "Julia Mendoza"], ["yes", "yes"]),
  sample(13, "individual", ["Sebastián Luna"], ["no"]),
  sample(14, "individual", ["Natalia Fuentes"], ["yes"]),
  sample(15, "individual", ["Rodrigo Medina"], ["pending"]),
  sample(16, "individual", ["Clara Ponce"], ["yes"]),
];

export function invitationLabel(invitation: WeddingInvitation) {
  return invitation.kind === "couple" ? invitation.people.map(person => person.name).join(" & ") : invitation.people[0].name + (invitation.kind === "plusOne" ? " +1" : "");
}
export function invitationKindLabel(kind: WeddingInvitationKind, english = false) {
  return kind === "individual" ? (english ? "Individual" : "Individual") : kind === "couple" ? (english ? "Couple" : "Pareja") : (english ? "With +1" : "Con +1");
}
export function summarizeInvitations(invitations: WeddingInvitation[]) {
  const people = invitations.flatMap(invitation => invitation.people);
  return { invitations: invitations.length, total: people.length, yes: people.filter(person => person.attendance === "yes").length, no: people.filter(person => person.attendance === "no").length, pending: people.filter(person => person.attendance === "pending").length };
}

function normalizeInvitation(invitation: WeddingInvitation): WeddingInvitation {
  if (!invitation || typeof invitation.id !== "string" || !/^wedding-[\w-]{1,120}$/.test(invitation.id) || !["individual", "couple", "plusOne"].includes(invitation.kind) || !Array.isArray(invitation.people) || invitation.people.length !== (invitation.kind === "individual" ? 1 : 2) || typeof invitation.updated_at !== "string" || invitation.updated_at.length > 40 || !Number.isFinite(Date.parse(invitation.updated_at))) throw new Error("invalid_invitation");
  return { id: invitation.id, kind: invitation.kind, updated_at: invitation.updated_at, people: invitation.people.map((person, index) => {
    if (!person || typeof person.id !== "string" || !/^wedding-[\w-]{1,120}$/.test(person.id) || typeof person.name !== "string" || !["yes", "no", "pending"].includes(person.attendance)) throw new Error("invalid_person");
    const unnamedCompanion = invitation.kind === "plusOne" && index === 1 && !person.name.trim();
    if (unnamedCompanion && person.attendance === "yes") throw new Error("companion_name_required");
    return { id: person.id, name: unnamedCompanion ? "" : normalizeGuestName(person.name), attendance: person.attendance };
  }) };
}
function validateList(invitations: WeddingInvitation[]) {
  if (!Array.isArray(invitations) || invitations.length > maxPeople) throw new Error("guest_limit");
  const normalized = invitations.map(normalizeInvitation);
  if (summarizeInvitations(normalized).total > maxPeople) throw new Error("guest_limit");
  const ids = new Set<string>(); const names = new Set<string>();
  for (const invitation of normalized) {
    if (ids.has(invitation.id)) throw new Error("duplicate_id");
    ids.add(invitation.id);
    for (const person of invitation.people) {
      if (ids.has(person.id)) throw new Error("duplicate_id");
      ids.add(person.id);
      if (!person.name) continue;
      const key = guestNameKey(person.name);
      if (names.has(key)) throw new Error("duplicate_name");
      names.add(key);
    }
  }
  return normalized;
}
export function saveWeddingInvitation(invitations: WeddingInvitation[], input: WeddingInvitation, mode: "add" | "edit") {
  const exists = invitations.some(invitation => invitation.id === input.id);
  if (mode === "edit" && !exists) throw new Error("guest_missing");
  if (mode === "add" && exists) throw new Error("duplicate_id");
  return validateList(mode === "edit" ? invitations.map(invitation => invitation.id === input.id ? input : invitation) : [input, ...invitations]);
}
export function removeWeddingInvitation(invitations: WeddingInvitation[], id: string) {
  if (!invitations.some(invitation => invitation.id === id)) throw new Error("guest_missing");
  return invitations.filter(invitation => invitation.id !== id);
}
export function setWeddingAttendance(invitations: WeddingInvitation[], invitationId: string, personId: string, attendance: WeddingAttendance) {
  const invitation = invitations.find(item => item.id === invitationId);
  if (!invitation || !invitation.people.some(person => person.id === personId)) throw new Error("guest_missing");
  return saveWeddingInvitation(invitations, { ...invitation, updated_at: new Date().toISOString(), people: invitation.people.map(person => person.id === personId ? { ...person, attendance } : person) }, "edit");
}
export function filterInvitations(invitations: WeddingInvitation[], query: string, attendance: WeddingAttendance | "all") {
  const search = guestNameKey(query);
  // Match one person, keep their invitation together for context.
  return invitations.filter(invitation => invitation.people.some(person => guestNameKey(person.name).includes(search)) && (attendance === "all" || invitation.people.some(person => person.attendance === attendance)));
}
export function encodeInvitations(invitations: WeddingInvitation[], now = Date.now()) {
  return JSON.stringify({ version: 3, expires: now + lifetime, invitations });
}
export function decodeInvitations(raw: string | null, now = Date.now()): WeddingInvitation[] | null {
  if (!raw || raw.length > 250000) return null;
  try {
    const value = JSON.parse(raw);
    if (value.version === 3) {
      if (!Number.isFinite(value.expires) || value.expires <= now || value.expires > now + lifetime) return null;
      return validateList(value.invitations);
    }
    const legacy = decodeLegacy(raw, now);
    if (!legacy) return null;
    // Upgrade untouched samples, but preserve edited legacy data as individuals.
    if (legacy.length === legacySamples.length && legacy.every(row => legacySamples.some(old => old.id === row.id && old.guest_name === row.guest_name && old.attendance === row.attendance && old.updated_at === row.updated_at))) return weddingInvitationSamples;
    return validateList(legacy.map(row => ({ id: row.id, kind: "individual", updated_at: row.updated_at, people: [{ id: `${row.id}-person`, name: row.guest_name, attendance: row.attendance }] })));
  } catch { return null; }
}
export function invitationsCsv(invitations: WeddingInvitation[], english = false) {
  const cell = (value: string) => '"' + (/^[\s\uFEFF]*[=+\-@\t\r\n]/u.test(value) ? "'" + value : value).replaceAll('"', '""') + '"';
  const headers = english ? ["Invitation", "Type", "Places in invitations", "Person", "Attendance", "Last updated (UTC)"] : ["Invitación", "Tipo", "Lugares en invitaciones", "Persona", "Asistencia", "Última actualización (UTC)"];
  const rows = invitations.flatMap(invitation => invitation.people.map(person => [invitationLabel(invitation), invitationKindLabel(invitation.kind, english), String(invitation.people.length), person.name || (english ? "Companion to be named" : "Acompañante por definir"), person.attendance === "yes" ? (english ? "Confirmed" : "Confirmado") : person.attendance === "no" ? (english ? "Not attending" : "No asistirá") : (english ? "Pending" : "Pendiente"), invitation.updated_at]));
  return "\uFEFF" + [headers, ...rows].map(row => row.map(cell).join(",")).join("\r\n");
}
