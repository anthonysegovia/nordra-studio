import { landscapePolicy } from './state.js';

const stage = document.querySelector('.horizon-landscape');
if (stage) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  // Observe the parent-owned frame: document.hidden does not reflect aria-hidden.
  const frame = window.frameElement;
  const parentDocument = frame?.ownerDocument;
  let scene, loading = false, failed = false, disposed = false, loaded = document.readyState === 'complete';
  let visible = false, idle;
  const state = () => ({
    ready: Boolean(scene), failed, disposed, visible, hidden: document.hidden,
    embeddedHidden: Boolean(frame && (frame.getAttribute('aria-hidden') === 'true' || !frame.isConnected)),
    paused: document.body.dataset.journeyMotion === 'paused', reduced: reduced.matches,
    dark: document.body.classList.contains('dark'),
  });
  const signal = (active, release = false) => dispatchEvent(new CustomEvent('nordra-landscape', { detail: { active, release } }));
  // A still visit already has its final landscape; do not allocate WebGL for it.
  const shouldLoad = current => landscapePolicy(current).load && !current.paused && !current.reduced;
  function fallback() {
    stage.classList.remove('has-scene'); stage.dataset.renderer = 'static'; signal(false);
  }
  function webglAvailable() {
    try {
      const probe = document.createElement('canvas');
      // Reuse the successfully tested context instead of allocating a second one.
      return probe.getContext('webgl2', { antialias: true, alpha: false, powerPreference: 'high-performance' });
    } catch { return null; }
  }
  async function start() {
    idle = null;
    if (loading || !shouldLoad(state())) return;
    const context = webglAvailable();
    if (!context) { failed = true; fallback(); return; }
    let transferred = false;
    loading = true;
    try {
      const { createLandscapeScene } = await import('./landscape-scene.js');
      if (!shouldLoad(state())) return;
      const next = await createLandscapeScene(stage, {
        ...state(), context,
        // The poster has already revealed the place. Seed the existing settled
        // state, then getState restores live motion when preparation finishes.
        paused: true,
        getState: state,
        onFallback: fallback,
        onReady: () => { if (!disposed) signal(true); },
      });
      transferred = true;
      if (disposed) next.dispose();
      // Preparation already reads getState and starts the renderer. A second
      // synchronous sync here would draw the full settled landscape twice.
      else scene = next;
    } catch {
      failed = true; fallback();
    } finally {
      if (!transferred) context.getExtension('WEBGL_lose_context')?.loseContext();
      loading = false;
    }
  }
  function sync() {
    if (disposed) return;
    // The original document remains under navigation iframes; release its GPU too.
    if (document.body.classList.contains('has-page-frame') || (frame && !frame.isConnected)) { dispose(); return; }
    const current = state();
    scene?.setState(current);
    if (loaded && !loading && idle == null && shouldLoad(current)) {
      idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1800 }) : setTimeout(start, 200);
    }
  }
  function onLoad() { loaded = true; sync(); }
  function onHide(event) { if (event.persisted) scene?.setState({ ...state(), hidden: true }); else dispose(); }
  function dispose() {
    if (disposed) return;
    disposed = true;
    if (window.cancelIdleCallback) cancelIdleCallback(idle); else clearTimeout(idle);
    view.disconnect(); changes.disconnect(); parentChanges?.disconnect();
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    removeEventListener('load', onLoad); removeEventListener('pageshow', sync); removeEventListener('pagehide', onHide);
    scene?.dispose(); scene = null; signal(false, true);
  }
  const view = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); });
  view.observe(stage);
  const changes = new MutationObserver(sync);
  changes.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-journey-motion'] });
  const parentChanges = parentDocument ? new MutationObserver(sync) : null;
  parentChanges?.observe(parentDocument.body, { childList: true });
  if (frame) parentChanges.observe(frame, { attributes: true, attributeFilter: ['aria-hidden', 'class'] });
  reduced.addEventListener('change', sync); document.addEventListener('visibilitychange', sync);
  addEventListener('load', onLoad, { once: true }); addEventListener('pageshow', sync); addEventListener('pagehide', onHide);
  sync();
}
