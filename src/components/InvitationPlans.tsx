import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Check, ChevronDown } from "lucide-react";
import { getInvitationPlans } from "../data/invitationPlans";
import { invitationQuote, type Occasion } from "../data/invitationOccasions";
import { InvitationPrice } from "./InvitationPrice";
import "../styles/invitation-plans.css";

export function InvitationPlans({ english, occasion, label }: { english: boolean; occasion: Occasion; label: string }) {
  const root = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);
  const wedding = occasion === "wedding";

  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setRevealed(true);
        observer.disconnect();
      }
    }, { threshold: .12 });
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return <section id="planes-eventos" ref={root} className="occasion-plans invitation-plans-clear site-shell" aria-labelledby="occasion-plans-title" data-revealed={revealed} onFocusCapture={() => setRevealed(true)}>
    <span id="comparar-paquetes" className="occasion-anchor" />
    <div className="occasion-section-heading">
      <p className="occasion-eyebrow">{english ? "TWO WAYS TO CELEBRATE" : "DOS FORMAS DE CELEBRAR"}</p>
      <h2 id="occasion-plans-title">{english ? "From invitation to welcome" : "De la invitación a la bienvenida"}</h2>
      <p>{english ? "A personalized invitation and private guest panel in both plans" : "Invitación personalizada y panel privado en ambos paquetes"}</p>
    </div>
    <div className="occasion-plan-grid">{getInvitationPlans(english).map(plan => {
      const boreal = plan.id === "boreal";
      return <article key={plan.id} className={`occasion-plan plan-${plan.id}`} aria-labelledby={`plan-title-${plan.id}`}>
        <div className="plan-purpose"><span>{plan.purpose}</span>{boreal && <span className="plan-inheritance"><Check size={14} aria-hidden="true" />{english ? "Everything in Aurora" : "Todo Aurora incluido"}</span>}</div>
        <h3 id={`plan-title-${plan.id}`}>{plan.name}</h3>
        <InvitationPrice plan={plan} english={english} className="occasion-plan-price" />
        <ul className="plan-benefits">{plan.benefits.map(benefit => <li key={benefit.title}>
          <span className="plan-benefit-icon" aria-hidden="true"><benefit.Icon size={23} strokeWidth={1.4} /></span>
          <span><strong>{benefit.title}</strong><span>{benefit.description}</span></span>
        </li>)}</ul>
        <a className="occasion-button" href={invitationQuote(english, label, plan.name)} target="_blank" rel="noopener noreferrer">{english ? `Choose ${plan.name}` : `Me interesa ${plan.name}`}<ArrowUpRight size={18} aria-hidden="true" /></a>
        {wedding && <div className="plan-explore" aria-label={english ? `Explore ${plan.name}` : `Explorar ${plan.name}`}>
          {boreal ? <>
            <a href="/panel-boda.html#mesas" target="_blank" rel="noopener noreferrer">{english ? "Try tables" : "Probar mesas"}<ArrowUpRight size={15} aria-hidden="true" /></a>
            <a href="/panel-boda.html#recepcion" target="_blank" rel="noopener noreferrer">{english ? "Explore QR passes" : "Ver pases QR"}<ArrowUpRight size={15} aria-hidden="true" /></a>
          </> : <a href="/panel-boda.html#confirmaciones" target="_blank" rel="noopener noreferrer">{english ? "Try the guest panel" : "Probar el panel de invitados"}<ArrowUpRight size={15} aria-hidden="true" /></a>}
        </div>}
        <details>
          <summary>{english ? "Everything included" : "Todo lo que incluye"}<ChevronDown size={18} aria-hidden="true" /></summary>
          <ul className="plan-feature-list" role="list">{plan.features.map(feature => <li key={feature}>
            <span className="plan-feature-marker" aria-hidden="true"><Check size={12} strokeWidth={1.6} /></span>
            <span>{feature}</span>
          </li>)}</ul>
          {boreal && <p className="plan-reception-note">{english ? "Check-in requires internet. Live event-day assistance is quoted separately." : "El registro requiere internet. La asistencia en vivo el día del evento se cotiza aparte"}</p>}
        </details>
      </article>;
    })}</div>
    <p className="occasion-plans-note">{english ? "Up to 300 people · Invitation and panel available until 90 days after the event" : "Hasta 300 personas · Invitación y panel disponibles hasta 90 días después del evento"}<br />{english ? "Final scope, dates and price confirmed in your quote" : "Alcance, fechas y precio final confirmados en tu cotización"} <a href="/terminos-del-servicio.html">{english ? "View terms (Spanish) ↗" : "Ver condiciones ↗"}</a></p>
  </section>;
}
