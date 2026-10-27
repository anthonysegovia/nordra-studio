export type GuestResponse = {
  id: string;
  guest_name: string;
  attendance: "yes" | "no";
  updated_at: string;
};

export function normalizeGuestName(value: string): string {
  const name = value.normalize("NFC").trim().replace(/\s+/gu, " ");
  if (name.length < 2 || name.length > 100 || /[\p{Cc}\p{Cf}<>]/u.test(name)) throw new Error("invalid_name");
  return name;
}

export function guestNameKey(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().replace(/\s+/g, " ").toLocaleLowerCase("es-MX");
}

export function summarizeResponses(rows: GuestResponse[]) {
  return { yes: rows.filter(row => row.attendance === "yes").length, no: rows.filter(row => row.attendance === "no").length, total: rows.length };
}

export function filterResponses(rows: GuestResponse[], query: string, attendance: "all" | "yes" | "no") {
  const search = guestNameKey(query);
  return rows.filter(row => guestNameKey(row.guest_name).includes(search) && (attendance === "all" || row.attendance === attendance));
}

export function updateDemoResponse(rows: GuestResponse[], input: GuestResponse): GuestResponse[] {
  const name = normalizeGuestName(input.guest_name);
  if (input.attendance !== "yes" && input.attendance !== "no") throw new Error("invalid_attendance");
  if (rows.some(row => row.id !== input.id && guestNameKey(row.guest_name) === guestNameKey(name))) throw new Error("duplicate_name");
  // Updating the same reply must not inflate the totals.
  return [{ ...input, guest_name: name }, ...rows.filter(row => row.id !== input.id)];
}

export function responsesCsv(rows: GuestResponse[], english = false): string {
  const cell = (value: string) => {
    // Quoting alone doesn't stop spreadsheet formulas; handle leading whitespace too.
    const safe = /^[\s\uFEFF]*[=+\-@\t\r\n]/u.test(value) ? "'" + value : value;
    return '"' + safe.replaceAll('"', '""') + '"';
  };
  const heading = english ? ["Name", "Attendance", "Last updated (UTC)"] : ["Nombre", "Asistencia", "Última actualización (UTC)"];
  const data = rows.map(row => [row.guest_name, row.attendance === "yes" ? (english ? "Attending" : "Sí asistirá") : (english ? "Not attending" : "No podrá ir"), row.updated_at]);
  return "\uFEFF" + [heading, ...data].map(row => row.map(cell).join(",")).join("\r\n");
}
