(() => {
  'use strict';
  const root = document.documentElement;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  const ease = 'cubic-bezier(.22,.68,.2,1)';
  const allowed = () => !reduced.matches && root.dataset.motion !== 'paused' && !document.hidden;
  function run(element, frames, options = {}) {
    if (!allowed()) return null;
    const animation = element.animate(frames, { duration: 380, easing: ease, ...options });
    active.add(animation);
    animation.finished.then(() => active.delete(animation), () => active.delete(animation));
    return animation;
  }
  function finishWhenPaused() {
    if (!allowed()) for (const animation of active) animation.finish();
  }
  new MutationObserver(finishWhenPaused).observe(root, { attributes: true, attributeFilter: ['data-motion'] });
  reduced.addEventListener('change', finishWhenPaused);
  document.addEventListener('visibilitychange', finishWhenPaused);
  window.PosadaMotion = { allowed, run, ease };
  root.classList.add('has-interaction-motion');

  // Touch, mouse and keyboard receive the same quiet response. Navigation,
  // downloads and native sharing keep their original, immediate activation.
  const responses = new WeakMap();
  document.addEventListener('click', event => {
    const control = event.target.closest('a, button, summary');
    if (!control || control.matches('.star-trigger, :disabled') || !allowed()) return;
    const opacity = getComputedStyle(control).opacity;
    responses.get(control)?.cancel();
    const response = run(control, [{ opacity }, { opacity: .82, offset: .28 }, { opacity: 1 }], { duration: 360 });
    responses.set(control, response);
  }, true);

  document.querySelectorAll('.calendar-picker, .motion-disclosure').forEach(picker => {
  const summary = picker.querySelector('summary');
  const panel = picker.querySelector('.calendar-options, [data-disclosure-panel]');
  let expanded = picker.open;
  let revision = 0;
  let sizeAnimation;
  let panelAnimation;
  summary.setAttribute('aria-controls', panel.id);
  summary.setAttribute('aria-expanded', String(expanded));
  panel.inert = !expanded;
  summary.addEventListener('click', event => {
    event.preventDefault();
    const turn = ++revision;
    const wasOpen = picker.open;
    const fromHeight = parseFloat(getComputedStyle(picker).height);
    const fromOpacity = wasOpen ? getComputedStyle(panel).opacity : '0';
    expanded = !expanded;
    sizeAnimation?.cancel();
    panelAnimation?.cancel();
    picker.style.height = `${fromHeight}px`;
    picker.style.overflow = 'hidden';
    picker.open = true;
    picker.dataset.expanded = String(expanded);
    summary.setAttribute('aria-expanded', String(expanded));
    panel.inert = !expanded;
    const toHeight = summary.offsetHeight + (expanded ? panel.offsetHeight : 0);
    function settle() {
      if (turn !== revision) return;
      picker.open = expanded;
      picker.style.removeProperty('height');
      picker.style.removeProperty('overflow');
      sizeAnimation?.cancel();
      panelAnimation?.cancel();
    }
    sizeAnimation = run(picker, [{ height: `${fromHeight}px` }, { height: `${toHeight}px` }], { duration: expanded ? 460 : 340, fill: 'both' });
    panelAnimation = run(panel, [{ opacity: fromOpacity }, { opacity: expanded ? 1 : 0 }], { duration: expanded ? 400 : 260, fill: 'both' });
    if (sizeAnimation) sizeAnimation.finished.then(settle, () => {});
    else settle();
  });
  });
})();
