import { businessOffers, businessHosting, businessMoney } from "./businessOffers";
import { invitationMoney, invitationOffers } from "./invitationPricing";

export type ChargeMode = "full" | "deposit" | "balance";
export type CatalogService = { id: string; label: string; group: string; cents: number | null; note?: string };
export const chargeModes: { id: ChargeMode; label: string }[] = [
  { id: "full", label: "Pago completo" }, { id: "deposit", label: "Anticipo del 50%" }, { id: "balance", label: "Saldo del 50%" },
];
export const paymentCatalog: CatalogService[] = [
  ...businessOffers.map(offer => ({ id: offer.id, group: "Páginas de negocios", label: offer.name, cents: offer.cents, note: `Rango de referencia: ${businessMoney(offer.cents)}–${businessMoney(offer.maxCents)}${offer.openEnded ? "+" : ""}. IVA incluido. Ajusta según la cotización.` })),
  ...[ { id: "wedding", label: "Boda" }, { id: "celebration", label: "Cumpleaños y celebración" }, { id: "gathering", label: "Evento y encuentro" } ].flatMap(event => invitationOffers.map(plan => ({
    id: `${event.id}-${plan.id}`, group: "Eventos y celebraciones", label: `${event.label} · ${plan.name}`, cents: plan.cents,
    note: `Precio de apertura: ${plan.startingAt ? "desde " : ""}${invitationMoney(plan.cents)} MXN. Precio regular: ${plan.startingAt ? "desde " : ""}${invitationMoney(plan.regularCents)} MXN. IVA incluido.${plan.startingAt ? " Confirma el precio final de la propuesta." : ""}`,
  }))),
  { id: "halloween", group: "Invitaciones de temporada", label: "Invitación de Halloween", cents: 59900 },
  { id: "christmas", group: "Invitaciones de temporada", label: "Invitación de Posadas y Navidad", cents: 59900 },
  { id: "new-year", group: "Invitaciones de temporada", label: "Invitación de Fin de año", cents: 59900 },
  ...businessHosting.flatMap(host => host.terms.map(term => ({ id: `hosting-${host.id}-${term.id}`, group: "Alojamiento y soporte", label: `${host.catalogName} · Alojamiento ${term.label}`, cents: term.cents, note: `${host.startingAt ? "Desde " : ""}${businessMoney(term.cents)} MXN, IVA incluido. Confirma los límites y el importe contratado.` }))),
  ...[
    ["domain", "Dominio propio y configuración"], ["event-extension", "Extensión de alojamiento de evento"],
    ["content", "Cambios de contenido"], ["features", "Funciones e integraciones adicionales"],
    ["event-live", "Acompañamiento en vivo el día del evento"], ["migration", "Migración a otro proveedor"],
    ["sources", "Entrega de código fuente por acuerdo"], ["other", "Otro servicio cotizado"],
  ].map(([id, label]) => ({ id, group: "Extras y servicios a cotizar", label, cents: null, note: "Sin tarifa fija. Introduce el importe final de la cotización aceptada." })),
];
export function suggestedAmount(service: CatalogService | undefined, mode: ChargeMode) {
  if (service?.cents == null) return "";
  const cents = mode === "full" ? service.cents : Math.round(service.cents / 2);
  return (cents / 100).toFixed(2);
}
