// Dynamic copy shares the invitation's quiet fade and small upward movement.
// Keep one pending value per label so rapid choices can never restore stale text.
const weddingSetText = (() => {
  const pending = new Map();
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  function settle(element, state) {
    if (pending.get(element) !== state) return;
    pending.delete(element);
    state.animation?.cancel();
    if (element.textContent !== state.value) element.textContent = state.value;
  }
  function settleAll() {
    for (const [element, state] of pending) settle(element, state);
  }
  document.addEventListener('wedding:motionchange', () => {
    if (!weddingMotionAllowed()) settleAll();
  });
  preference.addEventListener('change', () => { if (preference.matches) settleAll(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) settleAll(); });

  return function updateText(element, value, {immediate = false, compact = false} = {}) {
    value = String(value);
    const previous = pending.get(element);
    const rect = element.getBoundingClientRect();
    const visible = rect.width > 0 && rect.height > 0 && rect.bottom > 0 && rect.top < innerHeight;
    if (immediate || document.hidden || !visible || !weddingMotionAllowed() || !element.animate) {
      if (previous) { previous.value = value; settle(element, previous); }
      else if (element.textContent !== value) element.textContent = value;
      return;
    }
    if ((previous?.value ?? element.textContent) === value) return;
    const current = getComputedStyle(element);
    const from = {opacity: current.opacity, transform: current.transform};
    previous?.animation?.cancel();
    const state = {value, animation: null};
    pending.set(element, state);
    const distance = compact ? 2 : 3;
    const enter = () => {
      if (pending.get(element) !== state) return;
      element.textContent = state.value;
      state.animation?.cancel();
      state.animation = element.animate([
        {opacity: 0, transform: `translateY(${distance}px)`},
        {opacity: 1, transform: 'none'}
      ], {duration: compact ? 230 : 360, easing: 'cubic-bezier(.22,1,.36,1)', fill: 'both'});
      state.animation.finished.then(() => settle(element, state)).catch(() => {});
    };
    if (!element.textContent.trim()) { enter(); return; }
    state.animation = element.animate([
      from, {opacity: 0, transform: `translateY(-${distance}px)`}
    ], {duration: compact ? 90 : 120, easing: 'ease-out', fill: 'both'});
    state.animation.finished.then(enter).catch(() => {});
  };
})();
