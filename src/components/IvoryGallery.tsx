import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { WeddingEditorialPhoto } from './WeddingEditorialPhoto';

export const ivoryGallery = [
  { shot: 'nervous-groom', caption: 'Él jura que no estaba nervioso' },
  { shot: 'before-call', caption: 'Diez minutos antes de que nos llamaran' },
  { shot: 'heavy-veil', caption: 'El velo pesa más de lo que parece' },
  { shot: 'sore-smiles', caption: 'Aquí ya nos dolía la cara de sonreír' },
  { shot: 'both-camera', caption: 'La única en la que los dos miramos a cámara' },
  { shot: 'day', caption: 'Caminando como si supiéramos a dónde' },
] as const;

export function IvoryGallery() {
  const [active, setActive] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const grid = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const image = useRef<HTMLDivElement>(null);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const origin = useRef<DOMRect | null>(null);
  useEffect(() => {
    const root = grid.current;
    if (!root) return;
    const observer = new IntersectionObserver(entries => {
      for (const entry of entries) if (entry.intersectionRatio > .6) setActive(Number((entry.target as HTMLElement).dataset.index));
    }, { root, threshold: .6 });
    root.querySelectorAll('figure').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
  const isOpen = selected !== null;
  useEffect(() => {
    if (!isOpen || !dialog.current) return;
    const modal = dialog.current;
    const previous = document.body.style.overflow;
    modal.showModal();
    document.body.style.overflow = 'hidden';
    const frame = requestAnimationFrame(() => {
      const target = image.current;
      if (!target || !origin.current || modal.closest('.iv-paused') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const from = origin.current;
      const to = target.getBoundingClientRect();
      target.animate([{ transform: `translate(${from.x + from.width / 2 - to.x - to.width / 2}px, ${from.y + from.height / 2 - to.y - to.height / 2}px) scale(${from.width / to.width}, ${from.height / to.height})`, opacity: .5 }, { transform: 'none', opacity: 1 }], { duration: 420, easing: 'cubic-bezier(.2,.65,.25,1)' });
    });
    return () => { cancelAnimationFrame(frame); modal.close(); document.body.style.overflow = previous; opener.current?.focus({ preventScroll: true }); };
  }, [isOpen]);
  const move = (delta: number) => setSelected(index => index === null ? null : (index + delta + ivoryGallery.length) % ivoryGallery.length);
  return <section id="iv-gallery" className="iv-gallery iv-extra" tabIndex={-1} aria-labelledby="iv-gallery-title">
    <div className="iv-wrap"><p className="iv-kicker">LA SESIÓN DE FOTOS</p><h2 id="iv-gallery-title">De trescientas, nos <em>quedamos</em> con seis</h2></div>
    <div ref={grid} className="iv-gallery-grid iv-wrap">
      {ivoryGallery.map((photo, index) => <figure key={photo.shot} data-index={index} className="iv-gallery-item">
        <button aria-label={`Ampliar foto: ${photo.caption}`} onClick={event => { opener.current = event.currentTarget; origin.current = event.currentTarget.getBoundingClientRect(); setSelected(index); }}>
          <WeddingEditorialPhoto shot={photo.shot} english={false} sizes="(max-width:700px) 80vw, (max-width:1200px) 45vw, 600px" />
        </button><figcaption><em>{photo.caption}</em></figcaption>
      </figure>)}
    </div>
    <p className="iv-gallery-caption iv-wrap"><em key={active}>{ivoryGallery[active].caption}</em></p>
    <dialog ref={dialog} className="iv-gallery-dialog" aria-label="Galería de la sesión de fotos" onCancel={event => { event.preventDefault(); setSelected(null); }} onKeyDown={event => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); move(event.key === 'ArrowRight' ? 1 : -1); }
      if (event.key === 'Tab') {
        const buttons = Array.from(event.currentTarget.querySelectorAll('button'));
        const first = buttons[0], last = buttons[buttons.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    }}>
      <button className="iv-gallery-close" aria-label="Cerrar visor de fotos" onClick={() => setSelected(null)} autoFocus><X size={19} />Cerrar</button>
      {selected !== null && <>
        <div ref={image} className="iv-gallery-full" onTouchStart={event => { touch.current = { x: event.touches[0].clientX, y: event.touches[0].clientY }; }} onTouchEnd={event => {
          if (!touch.current) return;
          const dx = event.changedTouches[0].clientX - touch.current.x, dy = event.changedTouches[0].clientY - touch.current.y;
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) move(dx < 0 ? 1 : -1);
          touch.current = null;
        }}><WeddingEditorialPhoto key={selected} shot={ivoryGallery[selected].shot} english={false} sizes="100vw" eager /></div>
        <div className="iv-gallery-tools"><button aria-label="Foto anterior" onClick={() => move(-1)}><ChevronLeft /></button><p aria-live="polite"><em>{ivoryGallery[selected].caption}</em></p><button aria-label="Foto siguiente" onClick={() => move(1)}><ChevronRight /></button></div>
      </>}
    </dialog>
  </section>;
}
