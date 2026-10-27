import type { WeddingInvitation, WeddingPerson } from "./weddingInvitations";

export type SampleGuestAccess = { eventId: string; id: string; token: string };
export function sampleGuestAccess(hash: string): SampleGuestAccess | "invalid" | null {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (!params.has("invitacion")) return null;
  const parts = (params.get("invitacion") || "").split("~");
  if (params.getAll("invitacion").length !== 1 || parts.length !== 3) return "invalid";
  const [eventId, id, token] = parts;
  return /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(eventId) && /^wedding-[\w-]{1,120}$/.test(id) && /^[a-f0-9]{64}$/.test(token) ? { eventId, id, token } : "invalid";
}

export async function sampleGuestRequest(access: SampleGuestAccess, signal: AbortSignal, reply?: { people: WeddingPerson[]; updatedAt: string }): Promise<WeddingInvitation> {
  const response = await fetch("/api/wedding-links", {
    method: "POST", credentials: "omit", referrerPolicy: "no-referrer", signal,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: reply ? "guest-reply" : "guest-load", ...access, ...reply }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.code || "unavailable");
  if (!data.invitation || !Array.isArray(data.invitation.people)) throw new Error("unavailable");
  return data.invitation;
}

export function sampleGuestError(error: unknown) {
  const code = error instanceof Error ? error.message : "unavailable";
  const messages: Record<string, string> = {
    link_unavailable: "Este enlace ya no está disponible. Abre uno nuevo desde el panel de muestra",
    response_changed: "La invitación cambió mientras respondías. Carga la respuesta actual antes de continuar",
    companion_name_required: "Escribe el nombre de tu acompañante para confirmar su asistencia",
    reply_required: "Elige una respuesta para al menos una persona",
    duplicate_name: "Ese nombre ya está en la lista. Revisa el nombre de tu acompañante",
    invalid_name: "Escribe un nombre de entre 2 y 100 caracteres",
    limited: "Espera un momento antes de volver a intentarlo",
  };
  return { text: messages[code] || "No pudimos comprobar el estado de tu respuesta. Vuelve a cargarla antes de continuar", reload: !["companion_name_required", "reply_required", "duplicate_name", "invalid_name", "limited"].includes(code) };
}
