export type ChargeMode = "full" | "deposit" | "balance";
export type CatalogService = { id: string; label: string; group: string; cents: number | null; note?: string };
export const chargeModes: { id: ChargeMode; label: string }[] = [
  { id: "full", label: "Pago completo" }, { id: "deposit", label: "Anticipo del 50%" }, { id: "balance", label: "Saldo del 50%" },
];
export const paymentCatalog: CatalogService[] = [
  { id: "landing-essential", group: "Páginas de negocios", label: "Landing Esencial", cents: 149900, note: "Rango de referencia: $1,499–$2,999. Precargamos el importe inicial; ajusta según la cotización." },
  { id: "landing-professional", group: "Páginas de negocios", label: "Landing Profesional", cents: 299900, note: "Rango de referencia: $2,999–$5,999. Ajusta según la cotización." },
  { id: "business-site", group: "Páginas de negocios", label: "Sitio de Negocio", cents: 499900, note: "Rango de referencia: $4,999–$9,999. Ajusta según la cotización." },
  { id: "custom-web", group: "Páginas de negocios", label: "Web a medida", cents: 799900, note: "Rango de referencia: $7,999–$14,999+. Ajusta según el alcance acordado." },
  { id: "shop", group: "Páginas de negocios", label: "Tienda en línea", cents: 1199900, note: "Rango de referencia: $11,999–$29,999+. Ajusta según el alcance acordado." },
  ...[ { id: "wedding", label: "Boda" }, { id: "celebration", label: "Cumpleaños y celebración" }, { id: "gathering", label: "Evento y encuentro" } ].flatMap(event => [
    { id: `${event.id}-bruma`, group: "Eventos y celebraciones", label: `${event.label} · Bruma`, cents: 149900 },
    { id: `${event.id}-aurora`, group: "Eventos y celebraciones", label: `${event.label} · Aurora`, cents: 299900 },
    { id: `${event.id}-boreal`, group: "Eventos y celebraciones", label: `${event.label} · Boreal`, cents: 499900, note: "Desde $4,999. Confirma el precio final de la propuesta." },
  ]),
  { id: "halloween", group: "Invitaciones de temporada", label: "Invitación de Halloween", cents: 49900 },
  { id: "christmas", group: "Invitaciones de temporada", label: "Invitación de Posadas y Navidad", cents: 49900 },
  { id: "new-year", group: "Invitaciones de temporada", label: "Invitación de Fin de año", cents: 49900 },
  { id: "hosting-info-month", group: "Alojamiento y soporte", label: "Informativa · Alojamiento mensual", cents: 29900 },
  { id: "hosting-info-six", group: "Alojamiento y soporte", label: "Informativa · Alojamiento por 6 meses", cents: 149500 },
  { id: "hosting-info-year", group: "Alojamiento y soporte", label: "Informativa · Alojamiento anual", cents: 299000 },
  { id: "hosting-panel-month", group: "Alojamiento y soporte", label: "Panel o registros · Alojamiento mensual", cents: 59900, note: "Desde $599. Confirma los límites y el importe contratado." },
  { id: "hosting-panel-six", group: "Alojamiento y soporte", label: "Panel o registros · Alojamiento por 6 meses", cents: 299500, note: "Desde $2,995. Confirma los límites y el importe contratado." },
  { id: "hosting-panel-year", group: "Alojamiento y soporte", label: "Panel o registros · Alojamiento anual", cents: 599000, note: "Desde $5,990. Confirma los límites y el importe contratado." },
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
