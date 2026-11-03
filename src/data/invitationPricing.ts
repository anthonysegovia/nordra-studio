export const invitationOffers = [
  { id: "aurora", name: "Aurora", cents: 199900, regularCents: 299900, startingAt: false, tone: 1, delivery: "3–5 días hábiles",
    audience: "Para invitar con estilo y saber quién viene.",
    points: ["Invitación personalizada", "Confirmación de asistencia por persona", "Panel de invitados y confirmaciones", "Enlaces personales para cada invitado"] },
  { id: "boreal", name: "Boreal", cents: 299900, regularCents: 599900, startingAt: true, tone: 2, delivery: "5–7 días hábiles",
    audience: "Para organizar cada detalle, de la mesa a la puerta.",
    points: ["Todo lo de Aurora", "Organización de mesas", "Pases QR para tus invitados", "Registro de llegadas el día del evento"] },
] as const;

// Seasonal invitations share one price. `order` is the window to ask for one, so the page can point to the next season.
export const seasonalOffer = { id: "temporada", name: "Temporada", cents: 59900, delivery: "1–2 días hábiles",
  audience: "Para celebrar la temporada con un diseño listo para compartir.",
  points: ["Diseño de temporada personalizado", "Fecha, lugar y tus datos", "Lista para compartir por WhatsApp"] } as const;
export const seasons = [
  { id: "halloween", catalogId: "halloween", name: "Halloween", label: "Invitación de Halloween", demo: "/demos/halloween/index.html", image: "inv-season-halloween", order: { from: [9, 1], to: [10, 24] } },
  { id: "posadas", catalogId: "christmas", name: "Posadas y Navidad", label: "Invitación de Posadas y Navidad", demo: "/demos/posada-pinata/index.html", image: "inv-season-posada", order: { from: [10, 25], to: [12, 15] } },
  { id: "fin-de-ano", catalogId: "new-year", name: "Fin de año", label: "Invitación de Fin de año", demo: "/demos/celebra-2027/index.html", image: "inv-season-celebra", order: { from: [12, 16], to: [12, 28] } },
] as const;

// The season to promote on a given date: the one whose ordering window contains it, else the next to open.
export function upcomingSeason(date = new Date()) {
  const day = (date.getMonth() + 1) * 100 + date.getDate();
  const start = (s: typeof seasons[number]) => s.order.from[0] * 100 + s.order.from[1];
  const current = seasons.find(s => day >= start(s) && day <= s.order.to[0] * 100 + s.order.to[1]);
  return current ?? seasons.find(s => start(s) > day) ?? seasons[0];
}

// Keep in step with the system limit (server/wedding-links.js, server/wedding-management.js) and the plan pages.
export const invitationFacts = {
  guests: "Sin límite de invitados, incluidos acompañantes, en Aurora y Boreal.",
  afterEvent: "La invitación y el panel siguen en línea hasta 90 días después del evento, y el soporte por WhatsApp hasta 30 días después.",
} as const;

export function invitationMoney(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(cents / 100);
}

export const invitationPlanFeatures = {
  aurora: [
        "Diseño de catálogo personalizado", "Galería de recuerdos con hasta 30 fotos",
        "Cuenta propia y panel privado de invitados", "Enlaces personales para individuales, parejas y +1",
        "Confirmación por persona que se refleja automáticamente en tu panel", "Sin límite de invitados, incluidos acompañantes",
        "Búsqueda, filtros, pendientes y descarga de lista", "Copiar enlaces y compartir por WhatsApp",
        "Fecha, ubicaciones y cómo llegar", "Código de vestimenta y agenda", "Enlace de tu evento en Nordra",
        "3 rondas de cambios", "Alojamiento: hasta 12 meses antes y 90 días después del evento",
        "Soporte por WhatsApp desde la entrega hasta 30 días después del evento",
      ],
  boreal: [
        "Todo Aurora, incluida la invitación y el panel privado", "Mesas con nombre, capacidad y asignación de invitados",
        "Individuales, parejas y +1 juntos o por separado", "Pases QR personales accesibles desde la invitación",
        "Registro por persona, detección de duplicados y descarga de entradas", "Acceso separado para recepción, revocable y válido por 48 horas",
        "Diseño visual más personalizado y atención prioritaria", "Funciones adicionales a medida cotizadas por separado",
      ],
};
