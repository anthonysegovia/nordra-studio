import { guestNameKey, normalizeGuestName, updateDemoResponse, type GuestResponse } from "./guestResponses";

const sampleNames = [
  "Mariana López", "Daniel Moreno", "Isabel García", "Lucía Herrera", "Alejandro Ruiz", "Sofía Martínez",
  "Diego Navarro", "Valeria Castro", "Fernando Ortiz", "Renata Flores", "Gabriel Santos", "Paula Méndez",
  "Emiliano Vega", "Regina Salazar", "Mateo Aguilar", "Elena Ríos", "Nicolás Cabrera", "Julia Mendoza",
  "Sebastián Luna", "Natalia Fuentes", "Rodrigo Medina", "Clara Ponce", "Andrés Silva", "Jimena Duarte",
];
export const weddingSampleResponses: GuestResponse[] = sampleNames.map((guest_name, index) => ({
  id: `wedding-sample-${index + 1}`, guest_name, attendance: [2, 6, 10, 14, 18, 22].includes(index) ? "no" : "yes", updated_at: "2026-10-25T18:00:00Z",
}));
export const weddingPreviewKey = "nordra-wedding-preview-v2";
export const legacyWeddingPreviewKey = "nordra-wedding-preview-v1";
const maxGuests = 200;
const previewLifetime = 2 * 60 * 60 * 1000;

export function saveWeddingGuest(rows: GuestResponse[], input: GuestResponse, mode: "add" | "edit") {
  const exists = rows.some(row => row.id === input.id);
  if (mode === "edit" && !exists) throw new Error("guest_missing");
  if (mode === "add" && exists) throw new Error("duplicate_id");
  if (mode === "add" && rows.length >= maxGuests) throw new Error("guest_limit");
  const updated = updateDemoResponse(rows, input);
  // Keep an edited guest in place so the list does not jump around.
  return mode === "edit" ? rows.map(row => row.id === input.id ? updated[0] : row) : updated;
}

export function removeWeddingGuest(rows: GuestResponse[], id: string) {
  if (!rows.some(row => row.id === id)) throw new Error("guest_missing");
  return rows.filter(row => row.id !== id);
}

export function encodeWeddingPreview(rows: GuestResponse[], now = Date.now()) {
  return JSON.stringify({ version: 2, expires: now + previewLifetime, rows });
}

// Treat browser storage as untrusted input. Never restore partial or invalid lists.
export function decodeWeddingPreview(raw: string | null, now = Date.now()): GuestResponse[] | null {
  if (!raw || raw.length > 150000) return null;
  try {
    const value = JSON.parse(raw);
    if (![1, 2].includes(value.version) || !Number.isFinite(value.expires) || value.expires <= now || value.expires > now + previewLifetime) return null;
    const incoming = value.version === 1 ? [value.reply] : value.rows;
    if (!Array.isArray(incoming) || incoming.length > maxGuests) return null;
    const ids = new Set<string>();
    const names = new Set<string>();
    const rows: GuestResponse[] = incoming.map(row => {
      if (!row || typeof row.guest_name !== "string" || !["yes", "no"].includes(row.attendance) || typeof row.updated_at !== "string" || row.updated_at.length > 40 || !Number.isFinite(Date.parse(row.updated_at))) throw new Error("invalid_preview");
      const id = value.version === 1 ? "wedding-preview-reply" : row.id;
      if (typeof id !== "string" || !/^wedding-[\w-]{1,90}$/.test(id) || ids.has(id)) throw new Error("invalid_preview");
      const guest_name = normalizeGuestName(row.guest_name);
      if (names.has(guestNameKey(guest_name))) throw new Error("invalid_preview");
      ids.add(id); names.add(guestNameKey(guest_name));
      return { id, guest_name, attendance: row.attendance, updated_at: row.updated_at };
    });
    return value.version === 1 ? updateDemoResponse(weddingSampleResponses, rows[0]) : rows;
  } catch { return null; }
}
