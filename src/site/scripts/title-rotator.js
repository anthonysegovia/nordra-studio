// Home title: the accent line cycles through several endings.
// «Escarcha»: frost creeps over the current words from left to right, the
// frozen letters crumble into a few snowflakes that drift down, and the next
// words condense out of the cold air and thaw into the accent colour.
// The <h1> keeps a static, readable text; the rotating copy is aria-hidden.
const root = document.querySelector('[data-title-rotator]');

if (root) {
  const phrases = [...root.querySelectorAll('[data-phrase]')].map(node => node.textContent.trim()).filter(Boolean);
  const stage = root.querySelector('.title-rotator-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const HOLD = 3800, FREEZE_STEP = 30, FREEZE_TIME = 420, CRUMBLE_TIME = 420, THAW_STEP = 42, THAW_TIME = 1000;
  let index = 0, timer = 0, visible = true, busy = false;

  const stopped = () => reduced.matches || document.body.dataset.journeyMotion === 'paused' || document.hidden || !visible;

  function letters(text) {
    const word = document.createElement('span');
    word.className = 'title-rotator-word';
    for (const char of text) {
      const span = document.createElement('span');
      span.className = 'title-rotator-char';
      span.textContent = char === ' ' ? ' ' : char;
      word.append(span);
    }
    return word;
  }

  function measure(text) {
    const probe = letters(text);
    probe.style.cssText = 'position:absolute;visibility:hidden;white-space:nowrap';
    stage.append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width + 4;
  }

  function settle(text) {
    stage.replaceChildren(letters(text));
    stage.style.width = `${Math.ceil(measure(text))}px`;
  }

  // One small flake per letter, never more: the title stays calm and legible.
  function snowFrom(chars) {
    const box = root.getBoundingClientRect();
    const layer = document.createElement('span');
    layer.className = 'title-snow';
    layer.setAttribute('aria-hidden', 'true');
    chars.forEach((char, i) => {
      if (!char.textContent.trim()) return;
      const r = char.getBoundingClientRect();
      const flake = document.createElement('i');
      const size = 4 + Math.random() * 4;
      flake.style.cssText = `left:${r.left - box.left + r.width * (0.2 + Math.random() * 0.6)}px;top:${r.top - box.top + r.height * (0.35 + Math.random() * 0.3)}px;width:${size}px;height:${size}px;--dx:${(Math.random() * 2 - 1) * 26}px;--dy:${40 + Math.random() * 46}px;animation-delay:${i * FREEZE_STEP * 0.5}ms;animation-duration:${1100 + Math.random() * 600}ms`;
      layer.append(flake);
    });
    root.append(layer);
    setTimeout(() => layer.remove(), 2400);
  }

  function schedule() {
    clearTimeout(timer);
    if (phrases.length > 1 && !stopped()) timer = setTimeout(next, HOLD);
  }

  function next() {
    if (busy || stopped()) return schedule();
    busy = true;
    const current = stage.querySelector('.title-rotator-word');
    const outChars = current ? [...current.children] : [];
    outChars.forEach((char, i) => { char.style.animationDelay = `${i * FREEZE_STEP}ms`; });
    current?.classList.add('is-freezing');
    index = (index + 1) % phrases.length;
    const text = phrases[index];
    const frozen = FREEZE_TIME + outChars.length * FREEZE_STEP;
    setTimeout(() => {
      // The frost cracks: letters crumble while a few flakes fall from them.
      outChars.forEach((char, i) => { char.style.animationDelay = `${i * 14}ms`; });
      current?.classList.add('is-crumbling');
      snowFrom(outChars);
    }, frozen);
    setTimeout(() => {
      stage.style.width = `${Math.ceil(measure(text))}px`;
      const word = letters(text);
      [...word.children].forEach((char, i) => { char.style.animationDelay = `${i * THAW_STEP}ms`; });
      word.classList.add('is-thawing');
      stage.replaceChildren(word);
      setTimeout(() => { word.classList.remove('is-thawing'); busy = false; schedule(); }, THAW_TIME + text.length * THAW_STEP);
    }, frozen + CRUMBLE_TIME);
  }

  function sync() {
    if (stopped()) {
      clearTimeout(timer);
      if (reduced.matches || document.body.dataset.journeyMotion === 'paused') {
        index = 0; busy = false; root.querySelectorAll('.title-snow').forEach(node => node.remove()); settle(phrases[0]);
      }
    } else if (!busy) schedule();
  }

  settle(phrases[0]);
  root.classList.add('is-ready');
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; sync(); }).observe(root);
  new MutationObserver(sync).observe(document.body, { attributes: true, attributeFilter: ['data-journey-motion'] });
  reduced.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  addEventListener('resize', () => { if (!busy) settle(phrases[index]); });
  document.fonts?.ready.then(() => { if (!busy) settle(phrases[index]); });
}
