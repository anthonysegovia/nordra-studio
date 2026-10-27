import { useLayoutEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

export function WeddingOperationsDialog({ title, english, busy = false, onClose, children, wide = false }: { title: string; english: boolean; busy?: boolean; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useLayoutEffect(() => {
    const node = dialog.current, previous = document.activeElement as HTMLElement | null, overflow = document.body.style.overflow;
    node?.showModal(); document.body.style.overflow = 'hidden';
    return () => { node?.close(); document.body.style.overflow = overflow; if (previous?.isConnected) previous.focus({preventScroll:true}); };
  }, []);
  return createPortal(<dialog ref={dialog} className={`wedding-operations-dialog${wide ? ' is-wide' : ''}`} aria-label={title} onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><header><h2>{title}</h2><button autoFocus disabled={busy} onClick={onClose} aria-label={english?'Close':'Cerrar'}><X size={20}/></button></header>{children}</dialog>,document.body);
}
