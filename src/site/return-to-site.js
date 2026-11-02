/* Sample invitations opened from the site get a quiet way back on phones.
   The site sends no referrer, so the page that opened the sample notes itself in this tab
   (mobile-chrome.js); guests arriving from WhatsApp or a personal link have no such note. */
const sitePages = new Set(['/', '/estudio', '/negocios', '/invitaciones', '/bodas', '/cumpleanos', '/eventos', '/temporada']);

export const returnKey = 'nordra-return';

export function returnTarget(from, origin) {
  if (!from) return null;
  try {
    const url = new URL(from, origin);
    if (url.origin !== origin) return null;
    const path = url.pathname.replace(/\.html$/, '').replace(/(.)\/$/, '$1');
    return sitePages.has(path) ? url.origin + url.pathname + url.hash : null;
  } catch { return null; }
}

export function showReturnToSite(doc = document, win = window) {
  if (win.parent !== win) return;
  let from = null;
  try { from = win.sessionStorage.getItem(returnKey); } catch {}
  const href = returnTarget(from, win.location.origin);
  if (!href) return;
  const style = doc.createElement('style');
  style.textContent = '.nordra-return{display:none}@media(max-width:700px){.nordra-return{position:fixed;z-index:40;left:10px;bottom:calc(10px + env(safe-area-inset-bottom,0px));display:flex;align-items:center;min-height:40px;padding:0 13px;border-radius:999px;background:rgb(10 22 36/.78);color:#fff;font:500 13px/1 Manrope,Arial,sans-serif;text-decoration:none;-webkit-backdrop-filter:blur(8px);backdrop-filter:blur(8px)}.nordra-return:focus-visible{outline:2px solid #8ee0db;outline-offset:3px}}';
  const link = doc.createElement('a');
  link.className = 'nordra-return';
  link.href = href;
  link.textContent = '← Nordra';
  link.setAttribute('aria-label', 'Volver a Nordra Studio');
  doc.head.append(style);
  doc.body.append(link);
}
