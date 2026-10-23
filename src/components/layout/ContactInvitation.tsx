import { useEffect, useRef, useState, type FocusEvent, type PointerEvent } from "react";
import { ArrowUpRight, Mail, Phone, Pause, Play } from "lucide-react";
import { useLanguage } from "../../language";
import "../../styles/contact.css";

type Channel = "whatsapp" | "phone" | "email" | null;

function WhatsAppMark() {
  return <svg className="contact-whatsapp-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.18-3.47-8.42ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.87 9.87 0 0 1-1.52-5.26c0-5.46 4.44-9.9 9.9-9.9a9.84 9.84 0 0 1 7 2.9 9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z"/></svg>;
}

function ConversationDrawing({ english }: { english: boolean }) {
  return <svg className="contact-drawing" viewBox="0 0 540 310" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id="contact-thread-color" x1="24" y1="250" x2="502" y2="60" gradientUnits="userSpaceOnUse"><stop stopColor="var(--contact-teal)" stopOpacity="0"/><stop offset=".32" stopColor="var(--contact-teal)"/><stop offset=".72" stopColor="var(--contact-lilac)"/><stop offset="1" stopColor="var(--contact-lilac)" stopOpacity="0"/></linearGradient>
      <linearGradient id="contact-paper" x1="100" y1="50" x2="380" y2="250" gradientUnits="userSpaceOnUse"><stop stopColor="var(--contact-paper)"/><stop offset="1" stopColor="var(--contact-paper-deep)"/></linearGradient>
    </defs>
    <path d="M10 224C110 271 435 280 500 132C553 13 243 29 163 123C91 207 223 304 370 264" stroke="url(#contact-thread-color)" strokeOpacity=".22"/>
    <path className="contact-traveller" pathLength="100" d="M10 224C110 271 435 280 500 132C553 13 243 29 163 123C91 207 223 304 370 264" stroke="url(#contact-thread-color)" strokeWidth="1.6" strokeLinecap="round" strokeDasharray="4 96"/>
    <g className="contact-message-response"><g className="contact-message-float">
      <path d="M111 68L332 49Q354 47 356 69L363 153Q365 175 343 177L164 193L132 220L135 195L122 196Q100 198 98 176L91 94Q89 70 111 68Z" fill="url(#contact-paper)" stroke="var(--contact-teal)" strokeOpacity=".42"/>
      <g transform="rotate(-5 220 125)">
        <text x="121" y="105" className="contact-drawing-caption">{english ? "YOUR NEXT IDEA" : "TU PRÓXIMA IDEA"}</text>
        <text x="119" y="146" className="contact-drawing-greeting">{english ? "Hi, Nordra." : "Hola, Nordra."}</text>
        <path d="M121 165H187" stroke="var(--contact-teal)" strokeOpacity=".38" strokeLinecap="round"/>
      </g>
    </g></g>
    <g className="contact-reply-response"><g className="contact-reply-float">
      <path d="M295 156L442 172Q462 174 460 194L455 239Q453 259 433 257L420 256L419 277L392 253L287 242Q267 240 269 220L274 174Q276 154 295 156Z" fill="url(#contact-paper)" stroke="var(--contact-lilac)" strokeOpacity=".5"/>
      <g transform="rotate(6 363 206)">
        <path d="M297 217L311 201Q314 197 317 201L322 205L335 185Q338 181 341 185L355 203L359 201Q362 198 365 202L377 217M309 217L334 199Q338 195 342 199L365 217" stroke="url(#contact-thread-color)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <g className="contact-reply-points" fill="var(--contact-lilac)"><circle cx="397" cy="206" r="2.5"/><circle cx="407" cy="206" r="2.5"/><circle cx="417" cy="206" r="2.5"/></g>
      </g>
    </g></g>
    <g className="contact-spark" transform="translate(428 83)" stroke="var(--contact-teal)"><path d="M0-12C1-3 3-1 12 0C3 1 1 3 0 12C-1 3-3 1-12 0C-3-1-1-3 0-12Z" strokeWidth=".8"/><circle r="23" strokeOpacity=".15"/></g>
    <circle cx="83" cy="235" r="2" fill="var(--contact-teal)" opacity=".6"/>
  </svg>;
}

export function ContactInvitation() {
  const english = useLanguage() === "en";
  const root = useRef<HTMLElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [hovered, setHovered] = useState<Channel>(null);
  const [focused, setFocused] = useState<Channel>(null);
  const [pressed, setPressed] = useState<Channel>(null);
  const [paused, setPaused] = useState(false);
  const active = pressed ?? focused ?? hovered;
  const motionLabel = english ? (paused ? "Resume the conversation light" : "Pause the conversation light") : (paused ? "Activar la luz de la conversación" : "Pausar la luz de la conversación");
  const interaction = (channel: Channel) => ({
    onPointerEnter: (event: PointerEvent<HTMLAnchorElement>) => { if (event.pointerType !== "touch" && window.matchMedia("(hover: hover) and (pointer: fine)").matches) { setFocused(null); setHovered(channel); } },
    onPointerLeave: () => setHovered(null),
    onFocus: (event: FocusEvent<HTMLAnchorElement>) => { if (event.currentTarget.matches(":focus-visible")) { setHovered(null); setFocused(channel); } },
    onBlur: () => setFocused(null),
    onPointerDown: (event: PointerEvent<HTMLAnchorElement>) => { if (event.button !== 0) return; window.clearTimeout(timer.current); setPressed(channel); timer.current = window.setTimeout(() => setPressed(null), 1100); },
    onPointerCancel: () => { window.clearTimeout(timer.current); setPressed(null); setHovered(null); },
  });
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    const observer = new IntersectionObserver(([entry]) => { section.dataset.inView = String(entry.isIntersecting); }, { threshold: .08 });
    observer.observe(section);
    const clearHover = () => setHovered(null);
    const pointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    pointer.addEventListener("change", clearHover);
    const visibility = () => { section.dataset.hidden = String(document.hidden); if (document.hidden) { setHovered(null); setPressed(null); } };
    visibility(); document.addEventListener("visibilitychange", visibility);
    return () => { observer.disconnect(); window.clearTimeout(timer.current); pointer.removeEventListener("change", clearHover); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  return <section ref={root} className="site-shell contact-invitation" aria-labelledby="contact-title" data-active={active ?? "rest"} data-paused={paused}>
    <div className="contact-topline"><p>{english ? "LET’S CREATE SOMETHING EXTRAORDINARY" : "HAGAMOS ALGO EXTRAORDINARIO"}</p><button className="contact-motion" type="button" aria-label={motionLabel} title={motionLabel} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={12} aria-hidden="true"/> : <Pause size={12} aria-hidden="true"/>}</button></div>
    <div className="contact-composition">
      <div className="contact-intro">
        <h2 id="contact-title"><span>{english ? "Your next great idea" : "Tu próxima gran idea"}</span>{" "}<em>{english ? "starts here." : "empieza aquí."}</em></h2>
        <p>{english ? "Tell us about your business or celebration. Together, we’ll find the right way to bring it to the web." : "Cuéntanos de tu negocio o celebración. Juntos encontramos la forma de llevar tu idea a la web."}</p>
        <a className="contact-whatsapp" href="https://wa.me/message/NRMRZZWEXWZ6C1" target="_blank" rel="noopener noreferrer" {...interaction("whatsapp")}>
          <WhatsAppMark/><span>{english ? "Let’s chat on WhatsApp" : "Platiquemos por WhatsApp"}</span><ArrowUpRight className="contact-whatsapp-arrow" size={18} strokeWidth={1.6} aria-hidden="true"/>
        </a>
        <span className="contact-signature"><span aria-hidden="true"/>{english ? "Direct contact. From the very first idea." : "Trato directo. Desde la primera idea."}</span>
      </div>
      <div className="contact-conversation" aria-hidden="true">
        <ConversationDrawing english={english}/>
      </div>
    </div>
    <div className="contact-alternatives">
      <p>{english ? "Another way to say hello" : "Otras formas de decir hola"}</p>
      <a href="tel:+528129022231" className="contact-channel" {...interaction("phone")}><Phone size={19} strokeWidth={1.35} aria-hidden="true"/><span><small>{english ? "CALL US" : "LLÁMANOS"}</small><strong>+52 81 2902 2231</strong></span><ArrowUpRight size={17} strokeWidth={1.3} aria-hidden="true"/></a>
      <a href="mailto:hola@nordrastudio.mx" className="contact-channel" {...interaction("email")}><Mail size={19} strokeWidth={1.35} aria-hidden="true"/><span><small>{english ? "WRITE TO US" : "ESCRÍBENOS"}</small><strong>hola@nordrastudio.mx</strong></span><ArrowUpRight size={17} strokeWidth={1.3} aria-hidden="true"/></a>
    </div>
  </section>;
}
