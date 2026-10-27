import { createRoot } from "react-dom/client";
import { WhatsAppRsvp } from "../../src/components/WhatsAppRsvp";

// Fictional phone; inspect the generated link, never send a message.
createRoot(document.getElementById("rsvp-fixture")!).render(
  <WhatsAppRsvp eventTitle="la boda de Ana & José #2027" organizerPhone="+1 (202) 555-0100" />,
);
