// Home title: the accent line cycles through several endings.
// «Horizonte»: the current words sink below a line of water, a glint runs
// along the horizon and the next words rise out of it, still shining.
// The <h1> keeps a static, readable text; the rotating copy is aria-hidden.
const root = document.querySelector('[data-title-rotator]');

if (root) {
  const phrases = [...root.querySelectorAll('[data-phrase]')].map(node => node.textContent.trim()).filter(Boolean);
  const stage = root.querySelector('.title-rotator-stage');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const HOLD = 3600, OUT_STEP = 22, IN_STEP = 34, OUT_TIME = 460, IN_TIME = 760;
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

  function schedule() {
    clearTimeout(timer);
    if (phrases.length > 1 && !stopped()) timer = setTimeout(next, HOLD);
  }

  function next() {
    if (busy || stopped()) return schedule();
    busy = true;
    const current = stage.querySelector('.title-rotator-word');
    const outChars = current ? [...current.children] : [];
    outChars.forEach((char, i) => { char.style.animationDelay = `${i * OUT_STEP}ms`; });
    current?.classList.add('is-sinking');
    root.classList.remove('is-glinting');
    void root.offsetWidth;
    root.classList.add('is-glinting');
    index = (index + 1) % phrases.length;
    const text = phrases[index];
    const sinkTime = OUT_TIME + outChars.length * OUT_STEP;
    setTimeout(() => {
      // Once the old words are under water, the line opens or closes toward the new width.
      stage.style.width = `${Math.ceil(measure(text))}px`;
      const word = letters(text);
      [...word.children].forEach((char, i) => { char.style.animationDelay = `${i * IN_STEP}ms`; });
      word.classList.add('is-rising');
      stage.replaceChildren(word);
      setTimeout(() => { word.classList.remove('is-rising'); busy = false; schedule(); }, IN_TIME + text.length * IN_STEP);
    }, Math.min(sinkTime, 620));
  }

  function sync() {
    if (stopped()) {
      clearTimeout(timer);
      if (reduced.matches || document.body.dataset.journeyMotion === 'paused') {
        index = 0; busy = false; root.classList.remove('is-glinting'); settle(phrases[0]);
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
