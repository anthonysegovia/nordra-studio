import { badgePolicy, staticProfile } from './state.js';
import { warmContext } from '../webgl/warmup.js';

function mountBadge() {
  const hero = document.querySelector('.badge-hero');
  if (!hero) return;
  const stage = hero.querySelector('#badge-stage');
  const motion = hero.querySelector('[data-badge-start]');
  const kind = hero.querySelector('[data-badge-kind]');
  const firstKind = kind.textContent;
  const dots = hero.querySelector('.dots');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const phone = matchMedia('(max-width:700px)');
  const events = new AbortController();
  const frame = window.frameElement;
  let scene, loading = false, failed = false, disposed = false;
  let painted = false, visible = false, near = false, requested = false;
  let idle = 0, paint = 0, expectExpired = false;
  const expectTimer = setTimeout(() => { expectExpired = true; sync(); }, 4500);
  const listen = (target, name, callback) => target?.addEventListener(name, callback, { signal: events.signal });
  function fitViewport() {
    // Include the real header and invitation navigation in the first screen.
    const top = hero.getBoundingClientRect().top + scrollY;
    hero.style.setProperty('--badge-top', `${top}px`);
  }
  const navigationSize = new ResizeObserver(fitViewport);
  for (const element of document.querySelectorAll('.site-header,.occasion-path')) navigationSize.observe(element);
  listen(window, 'resize', fitViewport);
  fitViewport();
  const snapshot = () => ({
    visible, near, requested, painted, failed, disposed,
    hidden: document.hidden,
    embeddedHidden: Boolean(frame && (frame.getAttribute('aria-hidden') === 'true' || !frame.isConnected)),
    paused: document.body.dataset.journeyMotion === 'paused',
    reduced: reduced.matches,
    static: staticProfile(navigator),
    phone: phone.matches,
    dark: document.body.classList.contains('dark'),
    ready: Boolean(scene),
  });
  function cancelIdle() {
    if (window.cancelIdleCallback) cancelIdleCallback(idle);
    else clearTimeout(idle);
    idle = 0;
  }
  function fallback() {
    failed = true;
    scene?.dispose();
    scene = null;
    sync();
  }
  function resetCaption() {
    kind.textContent = firstKind;
    kind.classList.remove('out');
    [...dots.children].forEach((dot, index) => dot.classList.toggle('on', index === 0));
    dots.style.removeProperty('--p');
    hero.style.removeProperty('--ev');
  }
  async function load() {
    idle = 0;
    if (loading || !badgePolicy(snapshot()).load) return;
    loading = true;
    performance.mark('nordra-badge-load-start');
    try {
      await warmContext(events.signal);
      if (!badgePolicy(snapshot()).load) return;
      const { createBadgeScene } = await import('./badge-scene.js');
      if (!badgePolicy(snapshot()).load) return;
      const next = await createBadgeScene(stage, {
        dark: snapshot().dark,
        entered: false,
        isCancelled: () => !badgePolicy(snapshot()).load,
        onFallback: () => queueMicrotask(fallback),
      });
      if (!badgePolicy(snapshot()).load) { next.dispose(); return; }
      scene = next;
    } catch {
      failed = true;
      stage.querySelectorAll('canvas').forEach(canvas => {
        canvas.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();
        canvas.remove();
      });
    } finally {
      loading = false;
      sync();
    }
  }
  function sync() {
    if (disposed) return;
    if (document.body.classList.contains('has-page-frame') || (frame && !frame.isConnected)) { dispose(); return; }
    const state = snapshot();
    if (scene && (state.static || state.reduced)) {
      scene.dispose();
      scene = null;
      state.ready = false;
    }
    const policy = badgePolicy(state);
    hero.classList.toggle('has-scene', policy.showScene);
    // Desktop that will animate: keep the hanging poster out of the way so the badge drops in.
    hero.classList.toggle('expect-scene', !policy.showScene && !failed && !expectExpired && !state.phone && !state.static && !state.reduced && !state.paused);
    hero.dataset.running = String(policy.animate);
    stage.dataset.renderer = policy.showScene ? 'webgl' : 'static';
    motion.hidden = !policy.offerMotion;
    motion.disabled = loading;
    if (!policy.showScene) resetCaption();
    scene?.setState(state);
    if (policy.load && !loading && !idle) {
      idle = window.requestIdleCallback ? requestIdleCallback(load, { timeout: 1800 }) : setTimeout(load, 200);
    }
    if (!policy.load) cancelIdle();
  }
  listen(motion, 'click', () => { requested = true; sync(); });
  const visibility = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && entry.intersectionRatio >= .35;
    sync();
  }, { threshold: [0, .35] });
  visibility.observe(stage);
  const preload = new IntersectionObserver(([entry]) => { near = entry.isIntersecting; sync(); }, { rootMargin: `${innerHeight}px 0px` });
  preload.observe(stage);
  const bodyObserver = new MutationObserver(sync);
  bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class', 'data-journey-motion'] });
  const parentObserver = new MutationObserver(sync);
  if (frame) {
    parentObserver.observe(frame, { attributes: true, attributeFilter: ['aria-hidden'] });
    parentObserver.observe(frame.ownerDocument.body, { childList: true });
  }
  for (const target of [reduced, phone, navigator.connection]) listen(target, 'change', sync);
  listen(document, 'visibilitychange', sync);
  function afterPaint() {
    paint = requestAnimationFrame(() => {
      paint = requestAnimationFrame(() => { painted = true; sync(); });
    });
  }
  if (document.readyState === 'complete') afterPaint();
  else listen(window, 'load', afterPaint);
  function dispose() {
    if (disposed) return;
    disposed = true;
    cancelIdle();
    cancelAnimationFrame(paint);
    events.abort();
    visibility.disconnect();
    preload.disconnect();
    bodyObserver.disconnect();
    parentObserver.disconnect();
    navigationSize.disconnect();
    scene?.dispose();
    scene = null;
    resetCaption();
    hero.classList.remove('has-scene');
    hero.dataset.running = 'false';
  }
  listen(window, 'pagehide', dispose);
  function restore(event) {
    if (event.persisted && disposed) {
      window.removeEventListener('pageshow', restore);
      mountBadge();
    }
  }
  window.addEventListener('pageshow', restore);
  sync();
}

mountBadge();
