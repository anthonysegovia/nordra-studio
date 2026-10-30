import { activationProperties, commercialPage, commercialRoutes, measurementDisabled, safeReferrer, sanitizeEvent } from './policy.js';

export function installCommercialAnalytics(win, loadSdk) {
  const doc = win.document, page = commercialPage(win.location.href);
  const scene = page === 'index' ? 'entrada' : page;
  if (!page || doc.body.dataset.scene !== scene) return () => {};
  // Only the site's own navigation frames may participate. Demos/review embeds cannot.
  const frame = win.frameElement;
  if (win.parent !== win && (!frame || !frame.classList.contains('page-navigation-frame'))) return () => {};
  const parentDoc = frame?.ownerDocument;
  let sdk, loading = false, viewed = false, disposed = false, idle = null;
  let loaded = doc.readyState === 'complete';
  const clicks = [];
  function permitted() {
    try { return !measurementDisabled(win.localStorage) && safeReferrer(doc.referrer, win.location.origin); }
    catch { return false; }
  }
  function active() {
    if (disposed || doc.hidden || doc.prerendering || !permitted()) return false;
    if (frame) {
      const ready = [...parentDoc.querySelectorAll('.page-navigation-frame.is-ready')];
      return frame.isConnected && frame.getAttribute('aria-hidden') !== 'true' && ready.at(-1) === frame;
    }
    return commercialPage(win.location.href) === page && !doc.querySelector('.page-navigation-frame.is-ready');
  }
  function beforeSend(event) {
    if (!permitted() || (event?.type === 'pageview' && !active())) return null;
    return sanitizeEvent(event, page);
  }
  function view() {
    if (!sdk || viewed || !active()) return;
    viewed = true;
    sdk.pageview({ path: commercialRoutes[page], route: commercialRoutes[page] });
  }
  async function boot() {
    idle = null;
    if (sdk || loading || disposed || !permitted() || (!active() && !clicks.length)) return;
    loading = true;
    try {
      const module = await loadSdk();
      if (!permitted() || (disposed && !clicks.length) || (!active() && !clicks.length)) return;
      sdk = module;
      // No automatic history/popstate listeners: only the visible document owns a view.
      sdk.inject({ mode: 'production', disableAutoTrack: true, beforeSend });
      view();
      for (const data of clicks.splice(0)) sdk.track('whatsapp_click', data);
    } catch { clicks.length = 0; /* Measurement must never interrupt a contact link. */ }
    finally { loading = false; }
  }
  function sync() {
    if (disposed) return;
    if (frame && !frame.isConnected) { dispose(); return; }
    if (!permitted()) { clicks.length = 0; return; }
    if (!active()) return;
    if (sdk) view();
    else if (loaded && !loading && idle === null) {
      idle = win.requestIdleCallback ? win.requestIdleCallback(boot, { timeout: 1500 }) : win.setTimeout(boot, 200);
    }
  }
  function activate(event) {
    if (!active()) return;
    const data = activationProperties(event, page);
    if (!data) return;
    if (sdk) sdk.track('whatsapp_click', data);
    else { clicks.push(data); boot(); }
  }
  function onLoad() { loaded = true; sync(); }
  function onHide(event) { if (!event.persisted) dispose(); }
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (win.cancelIdleCallback) win.cancelIdleCallback(idle); else win.clearTimeout(idle);
    changes.disconnect(); parentChanges?.disconnect();
    doc.removeEventListener('click', activate); doc.removeEventListener('auxclick', activate);
    doc.removeEventListener('visibilitychange', sync); doc.removeEventListener('prerenderingchange', sync);
    win.removeEventListener('load', onLoad); win.removeEventListener('pageshow', sync);
    win.removeEventListener('pagehide', onHide); win.removeEventListener('storage', sync);
  }
  const changes = new win.MutationObserver(sync);
  changes.observe(doc.body, { childList: true, attributes: true, attributeFilter: ['class'] });
  const parentChanges = parentDoc ? new win.MutationObserver(sync) : null;
  if (frame) {
    parentChanges.observe(frame, { attributes: true, attributeFilter: ['class', 'aria-hidden'] });
    parentChanges.observe(parentDoc.body, { childList: true });
  }
  doc.addEventListener('click', activate); doc.addEventListener('auxclick', activate);
  doc.addEventListener('visibilitychange', sync); doc.addEventListener('prerenderingchange', sync);
  win.addEventListener('load', onLoad, { once: true }); win.addEventListener('pageshow', sync);
  win.addEventListener('pagehide', onHide); win.addEventListener('storage', sync);
  sync();
  return dispose;
}
