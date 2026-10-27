import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { whatsappRsvpMessage, whatsappRsvpUrl, type AttendanceReply } from "../lib/whatsappRsvp";

type Props = { eventTitle: string; english?: boolean } & (
  { preview: true; organizerPhone?: never } |
  { preview?: false; organizerPhone: string }
);

export function WhatsAppRsvp(props: Props) {
  const { english = false, eventTitle } = props;
  const [response, setResponse] = useState<AttendanceReply>("yes");
  const message = whatsappRsvpMessage(eventTitle, response, english);
  const href = props.preview ? null : whatsappRsvpUrl(props.organizerPhone, eventTitle, response, english);

  return <div className="whatsapp-rsvp">
    <p className="whatsapp-rsvp-label">{english ? "Your reply to the host" : "Tu respuesta al anfitrión"}</p>
    <div className="whatsapp-rsvp-choices" role="group" aria-label={english ? "Attendance reply" : "Respuesta de asistencia"}>
      <button type="button" aria-pressed={response === "yes"} onClick={() => setResponse("yes")}>{english ? "I'll attend" : "Sí asistiré"}</button>
      <button type="button" aria-pressed={response === "no"} onClick={() => setResponse("no")}>{english ? "I can't attend" : "No podré asistir"}</button>
    </div>
    <p className="whatsapp-rsvp-message" aria-live="polite" aria-atomic="true">{message}<span>{english ? "[your name]" : "[tu nombre]"}</span></p>
    {href && <a className="whatsapp-rsvp-link" href={href} target="_blank" rel="noopener noreferrer">{english ? "Continue in WhatsApp" : "Continuar en WhatsApp"}<ArrowUpRight size={15} aria-hidden="true" /></a>}
    <p className="whatsapp-rsvp-note">{props.preview
      ? (english ? "Example only, no message is sent. On your invitation, guests open WhatsApp, add their name and send the message to you." : "Ejemplo sin envío. En tu invitación, el invitado abre WhatsApp, añade su nombre y te envía el mensaje.")
      : (english ? "Add your name and send the message in WhatsApp. Opening the chat does not send your reply." : "Añade tu nombre y envía el mensaje en WhatsApp. Abrir el chat todavía no envía tu respuesta.")}</p>
  </div>;
}
