import { ClipboardList, TicketCheck, Link, UserCheck, LayoutDashboard, CircleDot, QrCode } from "lucide-react";
import { invitationOffers, invitationPlanFeatures } from "./invitationPricing";

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
        ? ["Personalized invitation", "Private panel and personal links", "No guest limit · couples and +1s"]
        : ["Invitación personalizada", "Panel privado y enlaces personales", "Sin límite de invitados · parejas y +1"],
      features: english ? [
        "Personalized design from our collection", "Memory gallery with up to 30 photos",
        "Your own account and private guest panel", "Personal links for individuals, couples and +1s",
        "RSVP per person, automatically reflected in your panel", "No guest limit, companions included",
        "Search, filters, pending replies and list download", "Copy links and share via WhatsApp",
        "Date, locations and directions", "Dress code and schedule", "Your event link on Nordra",
        "3 revision rounds", "Hosting: up to 12 months before + 90 days after the event",
        "WhatsApp support from delivery through 30 days after the event",
      ] : invitationPlanFeatures.aurora,
      responseTitle: english ? "Your guests, in one place" : "Tus invitados, en un solo lugar",
      responseDescription: english ? "Personal links, replies per person and your private panel. No guest limit, companions included." : "Enlaces personales, respuestas por persona y tu panel privado. Sin límite de invitados, incluidos acompañantes",
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
      ] : invitationPlanFeatures.boreal,
      responseTitle: english ? "From seating to check-in" : "De las mesas a la bienvenida",
      responseDescription: english ? "Everything in Aurora, plus seating, personal QR passes and check-in per person." : "Todo Aurora, más mesas, pases QR personales y registro de entradas por persona",
    },
  ];
}
