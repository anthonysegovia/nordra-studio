import { ArrowUpRight, Sparkles, LayoutDashboard, MessageCircle, Palette, Send } from "lucide-react";
import { useLanguage } from "../language";
import { getOccasions, invitationQuote, type Occasion } from "../data/invitationOccasions";
import { invitationMoney, invitationOffers } from "../data/invitationPricing";
import { InvitationPlans } from "../components/InvitationPlans";
import { InvitationArtwork } from "../components/InvitationArtwork";
import { WeddingContent, WeddingClosing } from "./WeddingJourney";
import { BirthdayContent, BirthdayClosing } from "./BirthdayJourney";
import { EventContent, EventClosing } from "./EventJourney";

export function OccasionNavigation({ english, current }: { english: boolean; current?: Occasion | "seasonal" }) {
  return <nav className="occasion-navigation site-shell" aria-label={english ? "Invitation occasion" : "Tipo de invitación"}>
    <a href="/invitaciones.html" aria-current={!current ? "page" : undefined}>{english ? "All invitations" : "Invitaciones"}</a>
    <span aria-hidden="true">/</span>
    {getOccasions(english).map(item => <a key={item.id} href={item.path} aria-current={current === item.id ? "page" : undefined}>{item.label}</a>)}
    <a className="occasion-season-nav" href="/temporada.html" aria-current={current === "seasonal" ? "page" : undefined}>{english ? "Seasonal" : "Temporada"}<Sparkles size={15} aria-hidden="true" /></a>
  </nav>;
}

export function InvitationHub() {
  const english = useLanguage() === "en";
  return <div className="invitation-hub" id="eventos">
    <OccasionNavigation english={english} />
    <section className="occasion-hub-hero site-shell" aria-labelledby="invitation-hub-title">
      <p className="occasion-eyebrow">{english ? "NORDRA · DIGITAL INVITATIONS" : "NORDRA · INVITACIONES DIGITALES"}</p>
      <h1 id="invitation-hub-title">{english ? "What are we celebrating?" : "¿Qué vamos a celebrar?"}</h1>
      <p>{english ? "Choose your celebration. The magic starts here." : "Elige tu celebración. La magia empieza aquí."}</p>
    </section>
    <section className="site-shell occasion-choices" id="tipos-invitacion" aria-label={english ? "Choose an occasion" : "Elige una ocasión"}>
      <span id="event-experience" className="occasion-anchor" /><span id="planes-eventos" className="occasion-anchor" /><span id="comparar-paquetes" className="occasion-anchor" />
      {getOccasions(english).map(item => <a className={`occasion-choice occasion-${item.id}`} href={item.path} key={item.id}>
        <div className="occasion-choice-copy"><h2>{item.label}<ArrowUpRight aria-hidden="true" /></h2><p>{item.intro}</p></div>
        <InvitationArtwork kind={item.id} english={english} decorative />
      </a>)}
      <a className="occasion-choice occasion-seasonal" href="/temporada.html"><div className="occasion-choice-copy"><h2>{english ? "Seasonal" : "Temporada"}<ArrowUpRight aria-hidden="true" /></h2><p>{english ? "Halloween, Christmas and New Year." : "Halloween, Navidad y fin de año."}</p></div><InvitationArtwork kind="seasonal" english={english} decorative /></a>
    </section>
    <div className="site-shell occasion-hub-note"><LayoutDashboard size={25} aria-hidden="true" /><p>{english ? "Guest panel included in Aurora and Boreal" : "Panel de invitados en Aurora y Boreal"}</p><span>{english ? `Opening offer from ${invitationMoney(invitationOffers[0].cents)} MXN · VAT included` : `Por apertura desde ${invitationMoney(invitationOffers[0].cents)} MXN · IVA incluido`}</span></div>
  </div>;
}

export function OccasionPage({ occasion }: { occasion: Occasion }) {
  const english = useLanguage() === "en";
  const content = getOccasions(english).find(item => item.id === occasion)!;
  return <div className={`occasion-page occasion-${occasion}`} id="eventos">
    <OccasionNavigation english={english} current={occasion} />
    {occasion === "wedding" ? <WeddingContent english={english} /> : occasion === "birthday" ? <BirthdayContent english={english} /> : <EventContent english={english} />}
    <InvitationPlans english={english} occasion={occasion} label={content.label} />
  </div>;
}

export function InvitationClosing({ occasion }: { occasion?: Occasion }) {
  const english = useLanguage() === "en";
  if (occasion === "wedding") return <WeddingClosing english={english} />;
  if (occasion === "birthday") return <BirthdayClosing english={english} />;
  if (occasion === "gathering") return <EventClosing english={english} />;
  const steps = (english ? ["Choose your occasion", "Review your proposal", "Share your invitation"] : ["Elige tu ocasión", "Revisa tu propuesta", "Comparte tu invitación"]);
  return <>
    <section id="proceso" className="occasion-process site-shell" aria-labelledby="occasion-process-title"><div className="occasion-section-heading"><p className="occasion-eyebrow">{english ? "LET'S MAKE IT HAPPEN" : "HAGÁMOSLO REALIDAD"}</p><h2 id="occasion-process-title">{english ? "From your idea to their hands" : "De tu idea a sus manos"}</h2></div><ol>{steps.map((step, index) => { const StepIcon = [MessageCircle, Palette, Send][index]; return <li key={step}><StepIcon size={28} aria-hidden="true" /><h3>{step}</h3></li>; })}</ol><p>{english ? "We agree on scope and dates. Start with a 50% deposit; the balance is due after approval, before publishing." : "Acordamos alcance y fechas. Iniciamos con 50% de anticipo; el resto, al aprobar y antes de publicar."}</p></section>
    <footer id="contacto" className="occasion-footer"><div className="site-shell"><p className="occasion-eyebrow">NORDRA STUDIO</p><h2>{english ? "Every celebration starts with an idea" : "Cada celebración empieza con una idea"}</h2><a className="occasion-button" href={invitationQuote(english)} target="_blank" rel="noopener noreferrer">{english ? "Let's talk on WhatsApp" : "Platiquemos por WhatsApp"}<ArrowUpRight size={20} aria-hidden="true" /></a><p>{english ? "Monterrey, Mexico · Digital invitations with your personality." : "Monterrey, México · Invitaciones digitales con tu personalidad."}</p><nav aria-label={english ? "More invitations" : "Más invitaciones"}>{getOccasions(english).map(item => <a href={item.path} key={item.id}>{item.label}</a>)}<a href="/temporada.html">{english ? "Seasonal" : "Temporada"}</a></nav><div className="occasion-footer-legal"><span>© {new Date().getFullYear()} Nordra Studio</span><a href="/aviso-de-privacidad.html">{english ? "Privacy (Spanish)" : "Aviso de privacidad"}</a><a href="/terminos-del-servicio.html">{english ? "Terms (Spanish)" : "Términos del servicio"}</a><a href="#page-top">{english ? "Back to top ↑" : "Volver arriba ↑"}</a></div></div></footer>
  </>;
}



