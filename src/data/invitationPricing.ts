export const invitationOffers = [
  { id: "aurora", name: "Aurora", cents: 199900, regularCents: 299900, startingAt: false, tone: 1 },
  { id: "boreal", name: "Boreal", cents: 299900, regularCents: 599900, startingAt: true, tone: 2 },
] as const;

export function invitationMoney(cents: number) {
  return new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN", maximumFractionDigits: 0 }).format(cents / 100);
}
