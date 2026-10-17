import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Home, Compass, MessageCircle, Sparkles, Globe, Heart, Users, X } from "lucide-react";
import { useLanguage } from "../../language";

const sections = [
  { id: "temporada", es: "Temporada", en: "Seasonal", description: "Invitaciones para celebrar", english: "Invitations to celebrate", Icon: Sparkles, color: "#cf915b" },
  { id: "paquetes", es: "Páginas web", en: "Websites", description: "Dale un lugar a tu negocio", english: "A home for your business", Icon: Globe, color: "#a68bde" },
  { id: "eventos", es: "Eventos", en: "Events", description: "Momentos que merecen brillar", english: "Moments worth celebrating", Icon: Heart, color: "#ce8ea5" },
  { id: "nosotros", es: "Conoce Nordra", en: "Meet Nordra", description: "Las personas detrás de la magia", english: "The people behind the magic", Icon: Users, color: "#73b8a4" },
];

export function MobileNavigation() {
  const english = useLanguage() === "en";
  const dialog = useRef<HTMLDialogElement>(null);
  const explore = useRef<HTMLButtonElement>(null);
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("inicio");
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.getElementById("inicio");
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      // Separate thresholds avoid flicker near the edge of the hero.
      setVisible(wasVisible => heroBottom < window.innerHeight * (wasVisible ? .85 : .65));
      let current = "inicio";
      for (const id of ["temporada", "paquetes", "eventos", "nosotros", "contacto"]) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < window.innerHeight * .4) current = id;
      }
      setActive(current);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => { cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); };
  }, []);
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const media = window.matchMedia("(min-width: 641px)");
    const closeOnDesktop = () => { if (media.matches) dialog.current?.close(); };
    media.addEventListener("change", closeOnDesktop);
    return () => { document.body.style.overflow = overflow; media.removeEventListener("change", closeOnDesktop); };
  }, [open]);
  const close = () => dialog.current?.close();
  return <>
    <nav className={`mobile-dock${visible || open ? " is-visible" : ""}`} aria-label={english ? "Quick navigation" : "Navegación rápida"} inert={!visible && !open}>
      <a href="#inicio"><Home size={19} /><span>{english ? "Home" : "Inicio"}</span></a>
      <button ref={explore} type="button" className="mobile-dock-explore" aria-haspopup="dialog" aria-expanded={open} aria-controls="mobile-explore" onClick={() => { dialog.current?.showModal(); setOpen(true); }}><Compass size={21} /><span>{english ? "Explore" : "Explorar"}</span></button>
      <a href="https://wa.me/message/NRMRZZWEXWZ6C1" target="_blank" rel="noopener noreferrer"><MessageCircle size={19} /><span>{english ? "Let's talk" : "Hablemos"}</span></a>
    </nav>
    <dialog ref={dialog} id="mobile-explore" className="mobile-explore" aria-labelledby="mobile-explore-title" onClose={() => { setOpen(false); explore.current?.focus({ preventScroll: true }); }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="mobile-explore-content">
        <div className="mobile-explore-top"><span>{english ? "FIND YOUR NEXT IDEA" : "ENCUENTRA TU PRÓXIMA IDEA"}</span><button type="button" onClick={close} aria-label={english ? "Close" : "Cerrar"} autoFocus><X size={22} /></button></div>
        <h2 id="mobile-explore-title">{english ? "Where shall we go?" : "¿A dónde vamos?"}</h2>
        <p>{english ? "Choose a section and discover it at your pace." : "Elige una sección y descúbrela a tu ritmo."}</p>
        <div className="mobile-explore-grid">{sections.map(({ id, es, en, description, english: descriptionEn, Icon, color }) => <a key={id} href={`#${id}`} style={{ "--destination": color } as React.CSSProperties} aria-current={active === id ? "location" : undefined} onClick={close}><Icon size={25} /><strong>{english ? en : es}</strong><span>{english ? descriptionEn : description}</span><ArrowUpRight className="mobile-explore-arrow" size={17} />{active === id && <small>{english ? "You are here" : "Estás aquí"}</small>}</a>)}</div>
        <a className="mobile-explore-contact" href="#contacto" onClick={close}>{english ? "Have something in mind? Let's talk" : "¿Ya tienes algo en mente? Platiquemos"}<ArrowUpRight size={17} /></a>
      </div>
    </dialog>
  </>;
}
