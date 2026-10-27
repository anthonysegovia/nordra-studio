import { invitationMoney } from "../data/invitationPricing";

type PricePlan = { cents: number; regularCents: number; startingAt: boolean };

export function InvitationPrice({ plan, english, className }: { plan: PricePlan; english: boolean; className: string }) {
  const from = plan.startingAt ? (english ? "From " : "Desde ") : "";
  return <span className="invitation-price">
    <span className="invitation-opening-label">{english ? "Opening offer" : "Precio de apertura"}</span>
    <span className={className}>{from && <small>{from}</small>}{invitationMoney(plan.cents)}</span>
    <span className="invitation-regular-price">{english ? "Regular price: " : "Precio regular: "}{from}<s>{invitationMoney(plan.regularCents)}</s></span>
    <span className="invitation-price-note">MXN · {english ? "VAT included · One-time payment" : "IVA incluido · Pago único"}</span>
  </span>;
}
