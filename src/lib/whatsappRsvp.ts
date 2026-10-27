export type AttendanceReply = "yes" | "no";

export function whatsappRsvpMessage(eventTitle: string, response: AttendanceReply, english = false): string {
  const event = eventTitle.trim();
  if (!event) throw new Error("An event title is required for an RSVP.");
  if (response !== "yes" && response !== "no") throw new Error("Invalid attendance reply.");
  if (english) return response === "yes"
    ? `Hi! I will attend ${event}. My name is: `
    : `Hi! I won't be able to attend ${event}. My name is: `;
  return response === "yes"
    ? `¡Hola! Confirmo que asistiré a ${event}. Mi nombre es: `
    : `¡Hola! No podré asistir a ${event}. Mi nombre es: `;
}

// Use the host's verified number, never Nordra's sales number as a fallback.
// https://faq.whatsapp.com/5913398998672934
export function whatsappRsvpUrl(phone: string, eventTitle: string, response: AttendanceReply, english = false): string {
  const digits = phone.trim().replace(/[\s()+-]/g, "");
  if (!/^[1-9]\d{7,14}$/.test(digits)) throw new Error("The host's international WhatsApp number is required.");
  return `https://wa.me/${digits}?text=${encodeURIComponent(whatsappRsvpMessage(eventTitle, response, english))}`;
}
