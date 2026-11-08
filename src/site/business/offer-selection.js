export function resolveOfferAnchor(id, levels) {
  return levels.find(level => id === 'service-' + level.id || id === 'offer-' + level.group);
}

export function initializeObjectives(root) {
  const goals = root.querySelector('.offer-goals');
  const panels = [...root.querySelectorAll('[data-group]')];
  const radios = [...goals.querySelectorAll('input')];
  const stage = root.querySelector('.offer-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let resize;
  const cancelResize = () => resize?.cancel();
  reduced.addEventListener('change', cancelResize);
  stage.addEventListener('click', e => {
    if (e.target.closest('summary')) cancelResize();
  });

  function select(panel, levelId, anchor) {
    const oldHeight = stage.getBoundingClientRect().height;
    const anchorTop = anchor?.getBoundingClientRect().top;
    let lastScroll = window.scrollY;
    cancelResize();
    const levels = [...panel.querySelectorAll('.offer-level')];
    const selected = levels.find(el => el.dataset.level === levelId) || levels[0];
    const id = selected.dataset.level;
    panels.forEach(el => { el.inert = el !== panel; });
    radios.forEach(input => { input.checked = input.value === panel.dataset.group; });
    for (const el of panel.querySelectorAll('[data-level]')) el.hidden = el.dataset.level !== id;
    for (const input of panel.querySelectorAll('.offer-switch input')) input.checked = input.value === id;
    for (const detail of root.querySelectorAll('.offer-details[open]')) detail.open = false;
    root.dataset.selectedOffer = id;
    root.dispatchEvent(new Event('offerchange', {bubbles:true}));

    // Anchor the control above the card, or the row strip if the tapped row is replaced.
    // Stop compensating as soon as the visitor scrolls independently.
    function keepPosition() {
      if (!anchor || window.scrollY !== lastScroll) return;
      const delta = anchor.getBoundingClientRect().top - anchorTop;
      if (Math.abs(delta) >= 1) window.scrollBy({top:delta, behavior:'instant'});
      lastScroll = window.scrollY;
    }

    const newHeight = panel.getBoundingClientRect().height;
    const paused = reduced.matches || document.body.dataset.businessMotion === 'paused' || document.body.dataset.journeyMotion === 'paused';
    if (anchor && !paused && Math.abs(oldHeight - newHeight) >= 1) {
      const animation = panel.animate(
        [{height:oldHeight + 'px'}, {height:newHeight + 'px'}],
        {duration:220, easing:'ease-out'}
      );
      resize = animation;
      function frame() {
        if (animation !== resize || animation.playState === 'idle') return;
        keepPosition();
        if (animation.playState === 'finished') resize = undefined;
        else requestAnimationFrame(frame);
      }
      requestAnimationFrame(frame);
    }
    keepPosition();
  }

  const levels = panels.flatMap(panel => [...panel.querySelectorAll('.offer-level')].map(el => ({
    group:panel.dataset.group, id:el.dataset.level, panel,
  })));
  function fromAnchor(id) {
    const level = resolveOfferAnchor(id, levels);
    if (level) select(level.panel, level.id);
  }

  function choose(group, levelId, anchor) {
    const panel = panels.find(el => el.dataset.group === group);
    select(panel, levelId, anchor);
    const id = levelId ? 'service-' + levelId : 'offer-' + group;
    history.replaceState(history.state, '', '#' + id);
    return panel;
  }

  goals.addEventListener('change', e => choose(e.target.value, undefined, e.target));
  for (const panel of panels) {
    panel.querySelector('.offer-switch')?.addEventListener('change', e => choose(panel.dataset.group, e.target.value, e.target));
  }
  root.addEventListener('offeranchor', e => fromAnchor(e.detail));
  fromAnchor(root.dataset.requestedAnchor || location.hash.slice(1));
  root.classList.add('offers-ready');
  goals.hidden = false;
}
