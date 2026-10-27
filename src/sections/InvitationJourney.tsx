import { useState } from "react";
import { ArrowDown, ArrowUpRight, Check, Heart, MapPin, Sparkles, Users, CalendarDays, LayoutDashboard, MessageCircle, Palette, Send } from "lucide-react";
import { useLanguage } from "../language";
import { getOccasions, invitationQuote, type Occasion } from "../data/invitationOccasions";
import { invitationMoney, invitationOffers } from "../data/invitationPricing";
import { InvitationPlans } from "../components/InvitationPlans";
import { BrumaPanelDemo } from "../components/BrumaPanelDemo";
import { InvitationArtwork } from "../components/InvitationArtwork";
import { WeddingContent, WeddingClosing } from "./WeddingJourney";

const occasionIcons = { wedding: Heart, birthday: Sparkles, gathering: Users };
type OccasionContent = ReturnType<typeof getOccasions>[number];

function OccasionNavigation({ english, current }: { english: boolean; current?: Occasion }) {
  if (current === "wedding") return <nav className="occasion-navigation site-shell" aria-label={english ? "Invitation occasion" : "Tipo de invitación"}>
    <a href="/invitaciones.html">{english ? "Invitations" : "Invitaciones"}</a>
    <span aria-hidden="true">/</span>
    <span className="occasion-current" aria-current="page">{english ? "Weddings" : "Bodas"}</span>
  </nav>;
  return <nav className="occasion-navigation site-shell" aria-label={english ? "Invitation occasion" : "Tipo de invitación"}>
    <a href="/invitaciones.html" aria-current={!current ? "page" : undefined}>{english ? "All invitations" : "Invitaciones"}</a>
    <span aria-hidden="true">/</span>
    {getOccasions(english).map(item => <a key={item.id} href={item.path} aria-current={current === item.id ? "page" : undefined}>{item.label}</a>)}
    <a className="occasion-season-nav" href="/invitaciones.html#temporada">{english ? "Seasonal" : "Temporada"}<Sparkles size={15} aria-hidden="true" /></a>
  </nav>;
}

export function InvitationHub() {
  const english = useLanguage() === "en";
  return <div className="invitation-hub" id="eventos">
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
      <a className="occasion-choice occasion-seasonal" href="#temporada"><div className="occasion-choice-copy"><h2>{english ? "Seasonal" : "Temporada"}<ArrowDown aria-hidden="true" /></h2><p>{english ? "Halloween, Christmas and New Year." : "Halloween, Navidad y fin de año."}</p></div><InvitationArtwork kind="seasonal" english={english} decorative /></a>
    </section>
    <div className="site-shell occasion-hub-note"><LayoutDashboard size={25} aria-hidden="true" /><p>{english ? "Guest panel included in Aurora and Boreal" : "Panel de invitados en Aurora y Boreal"}</p><span>{english ? `Opening offer from ${invitationMoney(invitationOffers[0].cents)} MXN · VAT included` : `Por apertura desde ${invitationMoney(invitationOffers[0].cents)} MXN · IVA incluido`}</span></div>
  </div>;
}

function InvitationSample({ content, english, onConfirm }: { content: OccasionContent; english: boolean; onConfirm: () => void }) {
  const Icon = occasionIcons[content.id];
  return <div className={`occasion-sample sample-${content.id}`}>
    <div className="sample-topline"><span>NORDRA</span><Icon size={23} aria-hidden="true" /></div>
    <div className="sample-ornament" aria-hidden="true">{content.id === "wedding" ? "V & M" : content.id === "birthday" ? "25" : "27"}</div>
    <p className="sample-greeting">{content.sampleLine}</p>
    <h3>{content.sampleName}</h3>
    <p className="sample-date">{content.sampleDate}</p>
    <div className="sample-divider" />
    <p className="sample-place"><MapPin size={18} aria-hidden="true" />{content.samplePlace}<span>{content.sampleTime}</span></p>
    <button type="button" onClick={onConfirm}>{english ? "Try RSVP" : "Probar confirmación"}<ArrowUpRight size={18} aria-hidden="true" /></button>
    <p className="sample-note">{english ? "Visual example · fictional event" : "Ejemplo visual · evento ficticio"}</p>
  </div>;
}

export function OccasionPage({ occasion }: { occasion: Occasion }) {
  const english = useLanguage() === "en";
  const content = getOccasions(english).find(item => item.id === occasion)!;
  const [panelOpen, setPanelOpen] = useState(false);
  const Icon = occasionIcons[occasion];
  return <div className={`occasion-page occasion-${occasion}`} id="eventos">
    <OccasionNavigation english={english} current={occasion} />
    {occasion === "wedding" ? <WeddingContent english={english} /> : <><section className="occasion-hero site-shell" aria-labelledby="occasion-title">
      <div className="occasion-hero-copy"><p className="occasion-eyebrow"><Icon size={18} aria-hidden="true" />{english ? "INVITATIONS FOR " : "INVITACIONES PARA "}{content.label.toUpperCase()}</p><h1 id="occasion-title">{content.title}{content.titleAccent && <em>{content.titleAccent}</em>}</h1><p className="occasion-lead">{content.copy}</p><div className="occasion-hero-actions"><a className="occasion-button" href="#event-experience">{english ? "Explore an example" : "Explorar un ejemplo"}<ArrowDown size={18} aria-hidden="true" /></a><a className="occasion-text-link" href="#planes-eventos">{english ? "See packages" : "Ver paquetes"}<ArrowUpRight size={18} aria-hidden="true" /></a></div><p className="occasion-hero-note"><LayoutDashboard size={18} aria-hidden="true" />{english ? "Guest panel included in both plans" : "Panel de invitados incluido en ambos paquetes"}</p></div>
      <figure className="occasion-hero-art"><InvitationArtwork kind={occasion} english={english} /><figcaption><span>{content.mood}</span><span>{english ? "Visual inspiration" : "Inspiración visual"}</span></figcaption></figure>
    </section>
    <section id="event-experience" className="occasion-experience site-shell" aria-labelledby="occasion-experience-title">
      <div className="occasion-sample-stage"><InvitationSample content={content} english={english} onConfirm={() => setPanelOpen(true)} /></div>
      <div className="occasion-experience-copy"><p className="occasion-eyebrow">{english ? "A LITTLE INSPIRATION" : "UN POCO DE INSPIRACIÓN"}</p><h2 id="occasion-experience-title">{content.experienceTitle}</h2><p>{content.experienceCopy}</p><ul>{content.features.map((feature, index) => { const FeatureIcon = [Icon, CalendarDays, LayoutDashboard][index]; return <li key={feature}><FeatureIcon size={24} aria-hidden="true" /><span>{feature}</span></li>; })}</ul></div>
    </section>
    <section className="occasion-panel site-shell" aria-labelledby="occasion-panel-title">
      <div className="occasion-panel-visual" aria-hidden="true"><div className="panel-preview-head"><LayoutDashboard size={24} /><span>{english ? "Your guest panel" : "Tu panel de invitados"}</span></div><div className="panel-preview-stats"><span><b>24</b>{english ? "Attending" : "Asistirán"}</span><span><b>3</b>{english ? "Not attending" : "No asistirán"}</span></div><div className="panel-preview-person"><span>AT</span><b>Ana Torres</b><Check size={20} /></div><div className="panel-preview-person"><span>DR</span><b>Diego Ruiz</b><Check size={20} /></div><p>{english ? "Illustrative data" : "Datos ilustrativos"}</p></div>
      <div><p className="occasion-eyebrow">{english ? "INCLUDED IN BOTH PLANS" : "INCLUIDO EN AMBOS PAQUETES"}</p><h2 id="occasion-panel-title">{english ? "Every reply in one place" : "Cada respuesta en un solo lugar"}</h2><p>{english ? "See who's attending, search by name and download your list. Try it with a sample reply." : "Consulta quién asistirá, busca por nombre y descarga tu lista. Pruébalo con una respuesta de ejemplo."}</p><button className="occasion-button" type="button" onClick={() => setPanelOpen(true)}>{english ? "Try the guest panel" : "Probar el panel de invitados"}<ArrowUpRight size={18} aria-hidden="true" /></button><p className="occasion-panel-note">{english ? "Aurora and Boreal include your guest list, companions and pending reply tracking." : "Aurora y Boreal incluyen lista previa, acompañantes y seguimiento de pendientes"}</p></div>
    </section>
    </>}
    <InvitationPlans english={english} occasion={occasion} label={content.label} />
    {panelOpen && <BrumaPanelDemo english={english} onClose={() => setPanelOpen(false)} />}
  </div>;
}

export function InvitationClosing({ occasion }: { occasion?: Occasion }) {
  const english = useLanguage() === "en";
  if (occasion === "wedding") return <WeddingClosing english={english} />;
  const content = getOccasions(english).find(item => item.id === occasion);
  const steps = content?.steps ?? (english ? ["Choose your occasion", "Review your proposal", "Share your invitation"] : ["Elige tu ocasión", "Revisa tu propuesta", "Comparte tu invitación"]);
  return <>
    <section id="proceso" className="occasion-process site-shell" aria-labelledby="occasion-process-title"><div className="occasion-section-heading"><p className="occasion-eyebrow">{english ? "LET'S MAKE IT HAPPEN" : "HAGÁMOSLO REALIDAD"}</p><h2 id="occasion-process-title">{english ? "From your idea to their hands" : "De tu idea a sus manos"}</h2></div><ol>{steps.map((step, index) => { const StepIcon = [MessageCircle, Palette, Send][index]; return <li key={step}><StepIcon size={28} aria-hidden="true" /><h3>{step}</h3></li>; })}</ol><p>{english ? "We agree on scope and dates. Start with a 50% deposit; the balance is due after approval, before publishing." : "Acordamos alcance y fechas. Iniciamos con 50% de anticipo; el resto, al aprobar y antes de publicar."}</p></section>
    <footer id="contacto" className="occasion-footer"><div className="site-shell"><p className="occasion-eyebrow">NORDRA STUDIO</p><h2>{content?.contact ?? (english ? "Every celebration starts with an idea" : "Cada celebración empieza con una idea")}</h2><a className="occasion-button" href={invitationQuote(english, content?.label)} target="_blank" rel="noopener noreferrer">{english ? "Let's talk on WhatsApp" : "Platiquemos por WhatsApp"}<ArrowUpRight size={20} aria-hidden="true" /></a><p>{english ? "Monterrey, Mexico · Digital invitations with your personality." : "Monterrey, México · Invitaciones digitales con tu personalidad."}</p><nav aria-label={english ? "More invitations" : "Más invitaciones"}>{getOccasions(english).map(item => <a href={item.path} key={item.id}>{item.label}</a>)}<a href="/invitaciones.html#temporada">{english ? "Seasonal" : "Temporada"}</a></nav><div className="occasion-footer-legal"><span>© {new Date().getFullYear()} Nordra Studio</span><a href="/aviso-de-privacidad.html">{english ? "Privacy (Spanish)" : "Aviso de privacidad"}</a><a href="/terminos-del-servicio.html">{english ? "Terms (Spanish)" : "Términos del servicio"}</a><a href="#page-top">{english ? "Back to top ↑" : "Volver arriba ↑"}</a></div></div></footer>
  </>;
}



