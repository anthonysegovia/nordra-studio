import { landscapePolicy } from './state.js';

const stage = document.querySelector('.horizon-landscape');
if (stage) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const poster = window.NordraLandscapePoster;
  const staticProfile = navigator.connection?.saveData === true;
  // Observe the parent-owned frame: document.hidden does not reflect aria-hidden.
  const frame = window.frameElement;
  const parentDocument = frame?.ownerDocument;
  let scene, loading = false, failed = false, disposed = false, loaded = false;
  let visible = false, idle, paintFrame;
  const state = () => ({
    ready: Boolean(scene), failed, disposed, visible, hidden: document.hidden,
    embeddedHidden: Boolean(frame && (frame.getAttribute('aria-hidden') === 'true' || !frame.isConnected)),
    paused: document.body.dataset.journeyMotion === 'paused', reduced: reduced.matches,
    dark: document.body.classList.contains('dark'),
  });
  const signal = (active, release = false) => dispatchEvent(new CustomEvent('nordra-landscape', { detail: { active, release } }));
  // A still visit already has its final landscape; do not allocate WebGL for it.
  const shouldLoad = current => landscapePolicy(current).load && !current.paused && !current.reduced && !staticProfile;
  function fallback() {
    failed = true; poster?.final();
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
        // The still and the first rendered frame share the same clock/camera.
        initialElapsed: poster?.phase === 'start' ? 0 : 60000,
        getState: () => ({ ...state(), finishEntrance: poster?.phase === 'final' }),
        onFallback: fallback,
        onReady: () => { if (!disposed) { poster?.started(); signal(true); } },
      });
      transferred = true;
      if (disposed) next.dispose();
      // Preparation already reads getState and starts the renderer. A second
      // synchronous sync here would draw the landscape twice.
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
    if (current.paused || current.reduced || staticProfile) poster?.final();
    scene?.setState(current);
    if (loaded && !loading && idle == null && shouldLoad(current)) {
      idle = window.requestIdleCallback ? requestIdleCallback(start, { timeout: 1800 }) : setTimeout(start, 200);
    }
  }
  function onLoad() {
    // An idle slot after load can precede the poster's first paint. Give the
    // browser a paint opportunity before probing WebGL or importing Three.
    paintFrame = requestAnimationFrame(() => {
      paintFrame = requestAnimationFrame(() => { loaded = true; sync(); });
    });
  }
  function onShow(event) {
    if (event.persisted) { poster?.final(); scene?.setState({ ...state(), finishEntrance: true }); }
    sync();
  }
  function onHide(event) { if (event.persisted) scene?.setState({ ...state(), hidden: true }); else dispose(); }
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelAnimationFrame(paintFrame);
    if (window.cancelIdleCallback) cancelIdleCallback(idle); else clearTimeout(idle);
    view.disconnect(); changes.disconnect(); parentChanges?.disconnect();
    reduced.removeEventListener('change', sync);
    document.removeEventListener('visibilitychange', sync);
    removeEventListener('load', onLoad); removeEventListener('pageshow', onShow); removeEventListener('pagehide', onHide);
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
  addEventListener('load', onLoad, { once: true }); addEventListener('pageshow', onShow); addEventListener('pagehide', onHide);
  if (document.readyState === 'complete') onLoad();
  sync();
}
