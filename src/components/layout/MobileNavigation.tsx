import { sectionHref } from "../../navigation";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import { ArrowUpRight, Layers, Compass, MessageCircle, Sparkles, Globe, Heart, X } from "lucide-react";
import { useLanguage } from "../../language";

const sections = [
  { id: "paquetes", es: "Negocios", en: "Business", description: "Páginas web para tu marca", english: "Websites for your brand", Icon: Globe, color: "#a68bde" },
  { id: "eventos", es: "Invitaciones", en: "Invitations", description: "Encuentra tu tipo de celebración", english: "Find your kind of celebration", Icon: Heart, color: "#ce8ea5" },
  { id: "temporada", es: "Temporada", en: "Seasonal", description: "Halloween, Navidad y fin de año", english: "Halloween, Christmas and New Year", Icon: Sparkles, color: "#cf915b" },
  { id: "proceso", es: "Cómo empezar", en: "How it works", description: "Cotización, aprobación y entrega", english: "Quote, approval and delivery", Icon: Compass, color: "#a68bde" },
];

export function MobileNavigation() {
  const english = useLanguage() === "en";
  const dialog = useRef<HTMLDialogElement>(null);
  const explore = useRef<HTMLButtonElement>(null);
  const opener = useRef<HTMLElement | null>(null);
  const navigating = useRef(false);
  const closing = useRef(false);
  const replayingLink = useRef(false);
  const pendingLink = useRef<HTMLAnchorElement | null>(null);
  const enterFrame = useRef(0);
  const navigationFrame = useRef(0);
  const closeTimer = useRef(0);
  const originalOverflow = useRef("");
  const dock = useRef<HTMLElement>(null);
  const [obscuresAction, setObscuresAction] = useState(false);
  const [open, setOpen] = useState(false);
  const [phase, setPhase] = useState<"entering" | "open" | "closing">("entering");
  const [selected, setSelected] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const [active, setActive] = useState("inicio");
  const openMenu = () => {
    if (!dialog.current || dialog.current.open) return;
    navigating.current = false;
    closing.current = false;
    pendingLink.current = null;
    setSelected(null); setPhase("entering");
    opener.current = document.activeElement as HTMLElement;
    dialog.current?.showModal(); setOpen(true);
    window.dispatchEvent(new CustomEvent("nordra:navigation-change", { detail: true }));
  };
  useEffect(() => {
    window.addEventListener("nordra:open-navigation", openMenu);
    return () => window.removeEventListener("nordra:open-navigation", openMenu);
  }, []);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const hero = document.getElementById("inicio");
      const heroBottom = hero?.getBoundingClientRect().bottom ?? 0;
      // Separate thresholds avoid flicker near the edge of the hero.
      setVisible(wasVisible => heroBottom < window.innerHeight * (wasVisible ? .85 : .65));
      let current = "inicio";
      for (const id of ["paquetes", "universos", "opciones-negocio", "eventos", "event-experience", "planes-eventos", "temporada", "nosotros", "proceso", "contacto"]) {
        if ((document.getElementById(id)?.getBoundingClientRect().top ?? Infinity) < window.innerHeight * .4) current = id;
      }
      setActive(current);
      // Use the resting dock position, even when it is translated off screen.
      // Retire it before an action reaches the overlay; never move the page.
      const navigation = dock.current;
      if (navigation && window.matchMedia("(max-width: 640px)").matches) {
        const bottom = parseFloat(getComputedStyle(navigation).bottom) || 0;
        const top = window.innerHeight - bottom - navigation.offsetHeight - 16;
        const actions = document.querySelectorAll<HTMLElement>("main a, main button, main summary, footer a, footer button");
        setObscuresAction(Array.from(actions).some(action => {
          if (action.closest('[inert], [aria-hidden="true"]')) return false;
          const rect = action.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.bottom > top && rect.top < window.innerHeight && getComputedStyle(action).visibility !== "hidden";
        }));
      } else setObscuresAction(false);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    document.addEventListener("focusin", schedule);
    // Card flips and disclosures can change geometry without a scroll event.
    const observer = new ResizeObserver(schedule);
    document.querySelectorAll("main, footer, .business-flip, .event-plan-flip, .seasonal-flip").forEach(element => observer.observe(element));
    return () => { observer.disconnect(); cancelAnimationFrame(frame); window.removeEventListener("scroll", schedule); window.removeEventListener("resize", schedule); document.removeEventListener("focusin", schedule); };
  }, []);
  useLayoutEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    originalOverflow.current = overflow;
    document.body.style.overflow = "hidden";
    // Give the panel and its backdrop the same initial frame. Transitions can
    // reverse smoothly if someone closes the menu before it finishes opening.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) setPhase("open");
    else enterFrame.current = requestAnimationFrame(() => {
      enterFrame.current = requestAnimationFrame(() => { if (!closing.current) setPhase("open"); });
    });
    const media = window.matchMedia("(min-width: 961px)");
    const closeOnDesktop = () => { if (media.matches) finishClose(); };
    media.addEventListener("change", closeOnDesktop);
    return () => { cancelAnimationFrame(enterFrame.current); document.body.style.overflow = overflow; media.removeEventListener("change", closeOnDesktop); };
  }, [open]);
  useEffect(() => () => {
    clearTimeout(closeTimer.current);
    cancelAnimationFrame(enterFrame.current);
    cancelAnimationFrame(navigationFrame.current);
  }, []);
  function finishClose() {
    clearTimeout(closeTimer.current);
    if (!dialog.current?.open) return;
    document.body.style.overflow = originalOverflow.current;
    dialog.current.close();
    const link = pendingLink.current;
    pendingLink.current = null;
    if (!link) return;
    // Follow the real anchor after the dialog leaves the top layer. The shared
    // document transition (including its fallback) then sees a settled page.
    navigationFrame.current = requestAnimationFrame(() => {
      if (!link.isConnected) return;
      const destination = new URL(link.href);
      const target = destination.pathname === location.pathname && destination.search === location.search && destination.hash
        ? document.getElementById(decodeURIComponent(destination.hash.slice(1))) : null;
      if (target && !target.hasAttribute("tabindex")) {
        target.setAttribute("tabindex", "-1");
        target.addEventListener("blur", () => target.removeAttribute("tabindex"), { once: true });
      }
      replayingLink.current = true;
      try { link.click(); } finally { replayingLink.current = false; }
      target?.focus({ preventScroll: true });
    });
  }
  function close() {
    if (!dialog.current?.open || closing.current) return;
    closing.current = true;
    cancelAnimationFrame(enterFrame.current);
    setPhase("closing");
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || getComputedStyle(dialog.current).opacity === "0") {
      finishClose(); return;
    }
    // A safety net for background tabs or interrupted CSS transitions.
    closeTimer.current = window.setTimeout(finishClose, 400);
  }
  const followLink = (event: MouseEvent<HTMLAnchorElement>) => {
    if (replayingLink.current) return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    if (closing.current) return;
    navigating.current = true;
    pendingLink.current = event.currentTarget;
    setSelected(event.currentTarget.getAttribute("href"));
    close();
  };
  return <>
    <nav ref={dock} className={`mobile-dock${visible ? " is-visible" : ""}${obscuresAction ? " is-obscured" : ""}`} aria-label={english ? "Quick navigation" : "Navegación rápida"} inert={!visible || obscuresAction}>
      <a href={sectionHref("inicio")} aria-current={active === "inicio" ? "location" : undefined}><Compass size={19} aria-hidden="true" /><span>{english ? "Home" : "Inicio"}</span></a>
      <button ref={explore} type="button" className="mobile-dock-explore" aria-haspopup="dialog" aria-expanded={open} aria-controls="mobile-explore" onClick={openMenu}><Layers size={21} aria-hidden="true" /><span>{english ? "Explore" : "Explorar"}</span></button>
      <a href={sectionHref("contacto")} aria-current={active === "contacto" ? "location" : undefined}><MessageCircle size={19} aria-hidden="true" /><span>{english ? "Contact" : "Contacto"}</span></a>
    </nav>
    <dialog ref={dialog} id="mobile-explore" className="mobile-explore" data-phase={phase} aria-labelledby="mobile-explore-title"
      onCancel={event => { event.preventDefault(); close(); }}
      onTransitionEnd={event => { if (event.target === event.currentTarget && event.propertyName === "opacity" && closing.current) finishClose(); }}
      onClose={() => {
        clearTimeout(closeTimer.current); cancelAnimationFrame(enterFrame.current);
        document.body.style.overflow = originalOverflow.current;
        closing.current = false; setOpen(false); setPhase("entering");
        window.dispatchEvent(new CustomEvent("nordra:navigation-change", { detail: false }));
        if (!navigating.current) opener.current?.focus({ preventScroll: true });
      }} onClick={event => { if (event.target === event.currentTarget) close(); }}>
      <div className="mobile-explore-content">
        <div className="mobile-explore-top"><span>{english ? "FIND YOUR NEXT IDEA" : "ENCUENTRA TU PRÓXIMA IDEA"}</span><button type="button" onClick={close} aria-label={english ? "Close" : "Cerrar"} autoFocus><X size={22} /></button></div>
        <h2 id="mobile-explore-title">{english ? "Find your next step." : "Encuentra tu siguiente paso."}</h2>
        <p>{english ? "Find the right space for your idea." : "Encuentra el espacio para tu idea."}</p>
        <div className="mobile-explore-grid">{sections.map(({ id, es, en, description, english: descriptionEn, Icon, color }) => <a key={id} href={(id === "eventos" ? "/invitaciones.html" : sectionHref(id))} data-selected={selected === (id === "eventos" ? "/invitaciones.html" : sectionHref(id)) || undefined} style={{ "--destination": color } as React.CSSProperties} aria-current={active === id ? "location" : undefined} onClick={followLink}><Icon size={25} /><strong>{english ? en : es}</strong><span>{english ? descriptionEn : description}</span><ArrowUpRight className="mobile-explore-arrow" size={17} />{active === id && <small>{english ? "You are here" : "Estás aquí"}</small>}</a>)}</div>
        <div className="mobile-menu-secondary"><a href={sectionHref("inicio")} onClick={followLink}>{english ? "Home" : "Inicio"}</a><a href={sectionHref("alojamiento-negocios")} onClick={followLink}>{english ? "Hosting" : "Alojamiento"}</a><a href={sectionHref("nosotros")} onClick={followLink}>{english ? "About Nordra" : "Conoce Nordra"}</a></div>
        <a className="mobile-explore-contact" href={sectionHref("contacto")} onClick={followLink}>{english ? "Have something in mind? Let's talk" : "¿Ya tienes algo en mente? Platiquemos"}<ArrowUpRight size={17} /></a>
      </div>
    </dialog>
  </>;
}
