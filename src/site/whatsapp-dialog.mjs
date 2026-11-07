const commercialPath = /^\/(?:en(?:\/|$))?(?:(?:index|estudio|negocios|invitaciones|bodas|cumpleanos|eventos|temporada)(?:\.html)?\/?)?$/;

export function shouldInterceptWhatsApp({ href, pathname, desktop, button = 0, ctrlKey = false, metaKey = false, shiftKey = false, altKey = false, download = false, bypass = false }) {
 if (!desktop || button !== 0 || ctrlKey || metaKey || shiftKey || altKey || download || bypass || !commercialPath.test(pathname)) return false;
 try { const url = new URL(href); return url.protocol === 'https:' && url.hostname === 'wa.me' && !url.username && !url.password && !url.port; }
 catch { return false; }
}

export function installWhatsAppDialog(doc = document, win = window, loadQR = () => import('qrcode')) {
 let dialog, opener, generation = 0;
 const en = doc.documentElement.lang.startsWith('en');
 const copy = en ? {
  title: 'Scan it with your phone', text: 'WhatsApp opens with your message ready.', open: 'Open WhatsApp Web ↗', close: 'Close', loading: 'Preparing QR code…', error: 'The QR code could not load. You can open WhatsApp Web.', qr: 'WhatsApp QR code'
 } : {
  title: 'Escanéalo con tu teléfono', text: 'Se abre WhatsApp con tu mensaje listo.', open: 'Abrir WhatsApp Web ↗', close: 'Cerrar', loading: 'Preparando código QR…', error: 'No se pudo cargar el código QR. Puedes abrir WhatsApp Web.', qr: 'Código QR de WhatsApp'
 };
 function createDialog() {
  dialog = doc.createElement('dialog');
  dialog.className = 'whatsapp-dialog';
  dialog.setAttribute('aria-labelledby', 'whatsapp-dialog-title');
  dialog.setAttribute('aria-describedby', 'whatsapp-dialog-description');
  dialog.innerHTML = '<button type="button" class="whatsapp-dialog-close" autofocus></button><h2 id="whatsapp-dialog-title"></h2><p id="whatsapp-dialog-description"></p><div class="whatsapp-qr"><canvas role="img"></canvas></div><p class="whatsapp-dialog-status" role="status"></p><a class="whatsapp-dialog-open" target="_blank" rel="noopener noreferrer" data-whatsapp-dialog-bypass></a>';
  dialog.querySelector('button').textContent = copy.close + ' ×';
  dialog.querySelector('h2').textContent = copy.title;
  dialog.querySelector('#whatsapp-dialog-description').textContent = copy.text;
  dialog.querySelector('canvas').setAttribute('aria-label', copy.qr);
  dialog.querySelector('a').textContent = copy.open;
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => { generation++; opener?.focus({ preventScroll: true }); });
  // Native showModal makes the rest of the document inert and supports Escape.
  // Explicit wrapping also keeps keyboard focus inside the two controls.
  dialog.addEventListener('keydown', event => {
   if (event.key !== 'Tab') return;
   const first = dialog.querySelector('button'), last = dialog.querySelector('a');
   if (event.shiftKey && doc.activeElement === first) { event.preventDefault(); last.focus(); }
   else if (!event.shiftKey && doc.activeElement === last) { event.preventDefault(); first.focus(); }
  });
  (doc.querySelector('.scene') || doc.body).append(dialog);
 }
 async function show(link) {
  if (!dialog) createDialog();
  opener = link;
  const href = link.href, current = ++generation;
  const canvas = dialog.querySelector('canvas'), status = dialog.querySelector('[role="status"]');
  canvas.hidden = true;
  status.textContent = copy.loading;
  dialog.querySelector('a').href = href;
  dialog.showModal();
  try {
   const module = await loadQR();
   if (current !== generation || !dialog.open) return;
   const qr = module.default || module;
   await qr.toCanvas(canvas, href, { width: 280, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#14212fff', light: '#ffffffff' } });
   if (current !== generation || !dialog.open) return;
   canvas.hidden = false;
   status.textContent = '';
  } catch { if (current === generation && dialog.open) status.textContent = copy.error; }
 }
 function click(event) {
  const link = event.target.closest?.('a[href]');
  if (!link || event.defaultPrevented) return;
  if (!shouldInterceptWhatsApp({ href: link.href, pathname: win.location.pathname, desktop: win.matchMedia('(min-width: 1024px) and (pointer: fine)').matches, button: event.button, ctrlKey: event.ctrlKey, metaKey: event.metaKey, shiftKey: event.shiftKey, altKey: event.altKey, download: link.hasAttribute('download'), bypass: link.hasAttribute('data-whatsapp-dialog-bypass') })) return;
  event.preventDefault();
  // Do not stop propagation: existing analytics continue receiving the original click.
  void show(link);
 }
 doc.addEventListener('click', click);
 return () => { doc.removeEventListener('click', click); dialog?.remove(); };
}
if (typeof document !== 'undefined') installWhatsAppDialog();
