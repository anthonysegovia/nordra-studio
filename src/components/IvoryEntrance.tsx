import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ArrowUpRight } from "lucide-react";

const openedKey = "nordra.ivory.opened.v1";

export function shouldShowIvoryEntrance() {
  try { return sessionStorage.getItem(openedKey) !== "yes"; } catch { return true; }
}

export function IvoryLilies({ className = "", eager = false }: { className?: string; eager?: boolean }) {
  return <img className={`iv-lilies ${className}`} src="/artwork/wedding-lilies/lily-stem-v1-640.webp" srcSet="/artwork/wedding-lilies/lily-stem-v1-320.webp 320w, /artwork/wedding-lilies/lily-stem-v1-640.webp 640w, /artwork/wedding-lilies/lily-stem-v1-1024.webp 1024w" sizes="(max-width:700px) 220px, 420px" width={1024} height={1536} loading={eager ? "eager" : "lazy"} decoding="async" alt="" aria-hidden="true" />;
}

export function IvoryEntrance({ onEnter }: { onEnter: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [dissolving, setDissolving] = useState(false);
  const finish = () => {
    try { sessionStorage.setItem(openedKey, "yes"); } catch { /* The invitation also works with storage disabled. */ }
    onEnter();
  };
  const finishRef = useRef(finish);
  useLayoutEffect(() => { finishRef.current = finish; });
  useLayoutEffect(() => {
    const element = dialog.current;
    if (!element) return;
    const previousOverflow = document.body.style.overflow;
    element.showModal();
    document.body.style.overflow = "hidden";
    return () => { element.close(); document.body.style.overflow = previousOverflow; };
  }, []);
  useEffect(() => {
    if (!dissolving) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => finishRef.current(), reduced ? 0 : 1400);
    return () => window.clearTimeout(timer);
  }, [dissolving]);

  return <dialog ref={dialog} className={`iv-entrance${dissolving ? " iv-entrance-opening" : ""}`} aria-labelledby="iv-entrance-title" onCancel={event => { event.preventDefault(); finish(); }}>
    <div className="iv-entrance-veil" aria-hidden="true" />
    <div className="iv-entrance-frame" aria-hidden="true" />
    <IvoryLilies className="iv-entrance-flower-left" eager />
    <IvoryLilies className="iv-entrance-flower-right" eager />
    <div className="iv-entrance-copy">
      <p className="iv-kicker">NUESTRA BODA</p>
      <h2 id="iv-entrance-title"><span>Valentina</span><em>&</em><span>Sebastián</span></h2>
      <p className="iv-entrance-date">19 de junio de 2027<span>Ciudad de México</span></p>
      <button className="iv-entrance-open" autoFocus disabled={dissolving} onClick={() => setDissolving(true)}>Abrir invitación<ArrowUpRight size={18} strokeWidth={1.2} aria-hidden="true" /></button>
    </div>
    <button className="iv-entrance-skip" disabled={dissolving} onClick={finish}>Entrar sin animación</button>
  </dialog>;
}
