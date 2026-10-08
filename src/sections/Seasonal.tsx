import { ArrowUpRight } from "lucide-react";
import { useRef, useState } from "react";
import { useLanguage } from "../language";

export function Seasonal() {
  const english = useLanguage() === "en";
  const [flipped, setFlipped] = useState<number | null>(null);
  const frontButtons = useRef<(HTMLButtonElement | null)[]>([]);
  const backButtons = useRef<(HTMLDivElement | null)[]>([]);
  const flip = (index: number, open: boolean) => {
    setFlipped(open ? index : null);
    window.requestAnimationFrame(() => (open ? backButtons.current[index] : frontButtons.current[index])?.focus({ preventScroll: true }));
  };
  const includes = english
    ? ["Personalized design to match your celebration", "Your event's date, time and location", "A digital invitation to share with your guests"]
    : ["Diseño personalizado con el estilo de tu celebración", "Fecha, horario y lugar de tu evento", "Invitación digital para compartir con tus invitados"];
  const occasions = english
    ? ["Halloween", "Posadas & Christmas", "New Year's Eve"]
    : ["Halloween", "Posadas y Navidad", "Fin de año"];
  const captions = english ? ["A little mystery. A lot of fun.", "Gather, share and celebrate.", "A toast to new beginnings."] : ["Un poco de misterio. Mucha diversión.", "Reunirnos, compartir y celebrar.", "Un brindis por nuevos comienzos."];
  const message = english
    ? "Hi! I would like a personalized digital invitation for my holiday celebration. Can we talk about my event?"
    : "¡Hola! Quiero una invitación digital personalizada para mi celebración de temporada. ¿Platicamos sobre mi evento?";

  return (
    <section id="temporada" className="section seasonal-section" aria-labelledby="seasonal-title">
      <div className="site-shell">
        <div className="seasonal-panel">
          <div className="seasonal-lights" aria-hidden="true">{Array.from({ length: 12 }, (_, index) => <i key={index} />)}</div>
          <div className="seasonal-copy">
            <p className="eyebrow">{english ? "A SEASON TO CELEBRATE" : "UNA TEMPORADA PARA CELEBRAR"}</p>
            <h2 id="seasonal-title">{english ? "Let the celebration begin" : "Que la celebración empiece"}<br /><span>{english ? "with the invitation." : "desde la invitación."}</span></h2>
            <p>{english ? "Personalized digital invitations with your event's style and all the details your guests need. Let's create something special for your next celebration." : "Invitaciones digitales personalizadas con el estilo de tu evento y los detalles que tus invitados necesitan. Hagamos algo especial para tu próxima celebración."}</p>
            <a className="seasonal-cta" href={`https://wa.me/528129022231?text=${encodeURIComponent(message)}`} target="_blank" rel="noopener noreferrer">{english ? "Create my invitation" : "Quiero mi invitación"}<ArrowUpRight size={18} aria-hidden="true" /></a>
          </div>
          <div className="seasonal-occasions">
            {occasions.map((occasion, index) => {
              const inquiry = english ? `Hi! I would like a personalized digital invitation for ${occasion}. Can we talk about my event?` : `¡Hola! Quiero una invitación digital personalizada para ${occasion}. ¿Platicamos sobre mi evento?`;
              return <div className={`seasonal-flip seasonal-occasion-${index}${flipped === index ? " is-flipped" : ""}`} key={index}>
                <div className="seasonal-flip-inner">
                <div className="seasonal-flip-face" inert={flipped === index} aria-hidden={flipped === index}>
                <button type="button" ref={element => { frontButtons.current[index] = element; }} className={`seasonal-occasion seasonal-occasion-${index}`} onClick={() => flip(index, true)} aria-label={english ? `View invitation details for ${occasion}` : `Ver detalles de la invitación para ${occasion}`}>
                <span className="seasonal-card-label">{english ? "YOU'RE INVITED" : "ESTÁS INVITADO"}</span>
                <div className="seasonal-art" aria-hidden="true">
                  {index === 0 ? <svg viewBox="0 0 160 110"><path d="M137 9a16 16 0 1 0 12 25 16 16 0 0 1-12-25" fill="#ffe0a2"/><path d="m18 25 8-3 7 4 7-4 8 3-7 3-7-1-8 1z" fill="#a991c5"/><path d="M80 33q-8-20 9-26" fill="none" stroke="#8aba75" strokeWidth="8" strokeLinecap="round"/><ellipse cx="48" cy="69" rx="29" ry="34" fill="#e57e25"/><ellipse cx="111" cy="69" rx="29" ry="34" fill="#e57e25"/><ellipse cx="80" cy="68" rx="39" ry="39" fill="#ffa643"/><path d="m48 60 19-12 1 17zm45 5 1-17 19 12zM56 77l13 6 10-5 11 5 15-6q-22 29-49 0" fill="#422049"/><path d="M29 12h8m-4-4v8m95 42h12m-6-6v12" stroke="#eecaff" strokeWidth="2"/></svg> : index === 1 ? <svg viewBox="0 0 160 110"><path d="M76 14 50 47h12L40 73h22l-17 18h63L91 73h22L91 47h12z" fill="#429f83"/><path d="M76 17v70M61 48h29M54 72h45" stroke="#a2e1bd" strokeWidth="1.5" opacity=".65"/><path d="m76 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" fill="#f8d37d"/><path d="M71 90h11v13H71" fill="#ac8154"/><path d="M108 77h32v28h-32z" fill="#be647b"/><path d="M122 77v28m-14-18h32" stroke="#f6d791" strokeWidth="3"/><path d="M123 77q-20-18-18-4 2 6 18 4 20-18 19-4-3 6-19 4" fill="none" stroke="#f6d791" strokeWidth="2"/><circle cx="67" cy="53" r="3" fill="#f8d37d"/><circle cx="83" cy="65" r="3" fill="#eab0bd"/><circle cx="63" cy="78" r="3" fill="#f8d37d"/><path d="M29 19h8m-4-4v8m94 1h12m-6-6v12" stroke="#f9e5b2" strokeWidth="2"/></svg> : <svg viewBox="0 0 160 110"><g stroke="#c895ef" strokeWidth="2" strokeLinecap="round"><path d="M42 9v10m0 27v10M18 33h10m28 0h10M25 16l7 7m20 20 7 7m0-34-7 7M32 43l-7 7"/><path d="M122 5v10m0 20v10M102 25h9m22 0h9m-34-14 6 6m16 16 6 6m0-28-6 6m-16 16-6 6" stroke="#f6d590"/></g><g stroke="#f6d590" strokeWidth="2" fill="#f6d59020"><path d="m51 44 27-8 9 29q2 13-10 16-11 4-17-8z"/><path d="m64 59 18-5M77 81l7 23m-19 3 25-7"/><path d="m83 37 27 7-8 30q-4 11-16 8-11-3-8-17z"/><path d="m80 57 26 7M86 82l-6 22m-10-3 22 6"/></g></svg>}
                </div>
                <strong>{occasion}</strong><span className="seasonal-caption">{captions[index]}</span>
                <span className="seasonal-card-action">{english ? "View details and price" : "Ver detalles e inversión"}<ArrowUpRight size={15} aria-hidden="true" /></span>
                </button>
                </div>
                <div className={`seasonal-flip-face seasonal-flip-back seasonal-occasion-${index}`} ref={element => { backButtons.current[index] = element; }} role="button" tabIndex={flipped === index ? 0 : -1} aria-label={english ? `Turn ${occasion} back` : `Girar ${occasion} al frente`} onClick={e => { if (!(e.target as HTMLElement).closest("a")) flip(index, false); }} onKeyDown={e => { if (e.target === e.currentTarget && (e.key === "Enter" || e.key === " " || e.key === "Escape")) { e.preventDefault(); flip(index, false); } }} inert={flipped !== index} aria-hidden={flipped !== index}>

                  <h3>{occasion}</h3>
                  <p className="seasonal-price">$499 <span>MXN · {english ? "VAT included" : "IVA incluido"}</span></p>
                  <h4>{english ? "Your invitation includes" : "Tu invitación incluye"}</h4>
                  <ul>{includes.map(item => <li key={item}>{item}</li>)}</ul>
                  <a className="seasonal-back-cta" href={`https://wa.me/528129022231?text=${encodeURIComponent(inquiry)}`} target="_blank" rel="noopener noreferrer">{english ? "Ask about my invitation" : "Consultar mi invitación"}<ArrowUpRight size={16} aria-hidden="true" /></a>
                </div>
                </div>
              </div>;
            })}
            <p>{english ? "Your celebration. Your style. Your invitation." : "Tu celebración. Tu estilo. Tu invitación."}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
