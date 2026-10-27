import { ClipboardList, TicketCheck, Link, UserCheck, LayoutDashboard, CircleDot, QrCode } from "lucide-react";
import { invitationOffers } from "./invitationPricing";

export function getInvitationPlans(english: boolean) {
  return [
    {
      ...invitationOffers[0], Icon: ClipboardList,
      level: english ? "Invitation + private guest panel" : "Invitación + panel privado de invitados",
      audience: english ? "Invite and collect every reply in one place" : "Invita y reúne cada respuesta en un solo lugar",
      purpose: english ? "Invite and confirm" : "Invita y confirma",
      benefits: [
        { Icon: Link, title: english ? "Personal links" : "Enlaces personales", description: english ? "Individuals, couples and +1s" : "Individuales, parejas y +1" },
        { Icon: UserCheck, title: english ? "RSVP per person" : "Confirmación por persona", description: english ? "Replies arrive directly in your panel" : "Las respuestas llegan a tu panel" },
        { Icon: LayoutDashboard, title: english ? "Your private guest panel" : "Tu panel privado de invitados", description: english ? "Confirmed, pending and your list" : "Confirmados, pendientes y tu lista" },
      ],
      highlights: english
        ? ["Personalized invitation", "Private panel and personal links", "Up to 300 people · couples and +1s"]
        : ["Invitación personalizada", "Panel privado y enlaces personales", "Hasta 300 personas · parejas y +1"],
      features: english ? [
        "Personalized design from our collection", "Up to 30 optimized photos",
        "Your own account and private guest panel", "Personal links for individuals, couples and +1s",
        "RSVP per person, automatically reflected in your panel", "Up to 300 people, including companions",
        "Search, filters, pending replies and list download", "Copy links and share via WhatsApp",
        "Date, locations and directions", "Dress code and schedule", "Your event link on Nordra",
        "3 revision rounds", "Hosting: up to 12 months before + 90 days after the event",
        "WhatsApp support from delivery through 30 days after the event",
      ] : [
        "Diseño de catálogo personalizado", "Hasta 30 fotos optimizadas",
        "Cuenta propia y panel privado de invitados", "Enlaces personales para individuales, parejas y +1",
        "Confirmación por persona que se refleja automáticamente en tu panel", "Hasta 300 personas, incluidos acompañantes",
        "Búsqueda, filtros, pendientes y descarga de lista", "Copiar enlaces y compartir por WhatsApp",
        "Fecha, ubicaciones y cómo llegar", "Código de vestimenta y agenda", "Enlace de tu evento en Nordra",
        "3 rondas de cambios", "Alojamiento: hasta 12 meses antes y 90 días después del evento",
        "Soporte por WhatsApp desde la entrega hasta 30 días después del evento",
      ],
      responseTitle: english ? "Your guests, in one place" : "Tus invitados, en un solo lugar",
      responseDescription: english ? "Personal links, replies per person and your private panel. Up to 300 people, including companions." : "Enlaces personales, respuestas por persona y tu panel privado. Hasta 300 personas, incluidos acompañantes",
    },
    {
      ...invitationOffers[1], Icon: TicketCheck,
      level: english ? "Everything in Aurora + tables and QR passes" : "Todo Aurora + mesas y pases QR",
      audience: english ? "A place for everyone, a smoother welcome" : "Un lugar para cada persona, una bienvenida más ágil",
      purpose: english ? "Seat and welcome" : "Organiza y recibe",
      benefits: [
        { Icon: CircleDot, title: english ? "Table organization" : "Organización de mesas", description: english ? "Seat guests together and manage capacity" : "Asigna lugares y reúne a las parejas" },
        { Icon: QrCode, title: english ? "Personal QR passes" : "Pases QR personales", description: english ? "Each invitation has its own pass" : "Cada invitación tiene su propio pase" },
        { Icon: TicketCheck, title: english ? "Check-in per person" : "Registro de entradas", description: english ? "Per person, without duplicate entries" : "Por persona, sin entradas duplicadas" },
      ],
      highlights: english
        ? ["Everything in Aurora", "Table organization", "Personal QR passes and check-in"]
        : ["Todo lo de Aurora", "Organización de mesas", "Pases QR y registro de entradas"],
      features: english ? [
        "Everything in Aurora, including your invitation and private panel", "Tables with names, capacity and guest assignments",
        "Seat individuals, couples and +1s together or separately", "Personal QR passes accessible from the invitation",
        "Check-in per person, duplicate detection and arrival list download", "Separate reception access, valid for 48 hours and revocable",
        "More personalized visual design and priority support", "Additional custom features quoted separately",
      ] : [
        "Todo Aurora, incluida la invitación y el panel privado", "Mesas con nombre, capacidad y asignación de invitados",
        "Individuales, parejas y +1 juntos o por separado", "Pases QR personales accesibles desde la invitación",
        "Registro por persona, detección de duplicados y descarga de entradas", "Acceso separado para recepción, revocable y válido por 48 horas",
        "Diseño visual más personalizado y atención prioritaria", "Funciones adicionales a medida cotizadas por separado",
      ],
      responseTitle: english ? "From seating to check-in" : "De las mesas a la bienvenida",
      responseDescription: english ? "Everything in Aurora, plus seating, personal QR passes and check-in per person." : "Todo Aurora, más mesas, pases QR personales y registro de entradas por persona",
    },
  ];
}
