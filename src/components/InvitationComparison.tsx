import { useState } from "react";
import { ArrowUpRight, LayoutDashboard, TicketCheck } from "lucide-react";
import { getInvitationPlans } from "../data/invitationPlans";
import { BrumaPanelDemo } from "./BrumaPanelDemo";

export function InvitationComparison({ english }: { english: boolean }) {
  const [showDemo, setShowDemo] = useState(false);
  const icons = [LayoutDashboard, TicketCheck];

  return (
    <section id="comparar-paquetes" className="invitation-comparison" aria-labelledby="comparison-title">
      <div className="comparison-intro">
        <p className="eyebrow">{english ? "A PANEL FROM THE FIRST PLAN" : "PANEL DESDE EL PRIMER PAQUETE"}</p>
        <h3 id="comparison-title">{english ? "Choose how you organize" : "Elige cómo organizarte"}</h3>
      </div>
      <div className="response-options">
        {getInvitationPlans(english).map((plan, index) => {
          const Icon = icons[index];
          return (
            <article key={plan.name} className={`response-option invitation-tone-${plan.tone}`} aria-labelledby={`response-plan-${index}`}>
              <div className="response-option-label"><Icon size={18} aria-hidden="true" /><span>{plan.name}</span></div>
              <h4 id={`response-plan-${index}`}>{plan.responseTitle}</h4>
              <p>{plan.responseDescription}</p>
              {index === 0 && <button type="button" className="bruma-panel-preview" aria-haspopup="dialog" onClick={() => setShowDemo(true)}>{english ? "Try the guest panel" : "Prueba el panel de invitados"}<ArrowUpRight size={14} aria-hidden="true" /></button>}
            </article>
          );
        })}
      </div>
      {showDemo && <BrumaPanelDemo english={english} onClose={() => setShowDemo(false)} />}
    </section>
  );
}
