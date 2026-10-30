// GPU-free policy shared by the loader, renderer and regression tests.
export function landscapePolicy({ webgl = true, failed = false, ready = false,
  visible = true, hidden = false, embeddedHidden = false, disposed = false,
  paused = false, reduced = false, dark = false } = {}) {
  const available = webgl && !failed && !disposed;
  const present = visible && !hidden && !embeddedHidden && !disposed;
  return {
    fallback: !available || !ready,
    load: available && present && !ready,
    render: available && present && ready,
    animate: available && present && ready && !paused && !reduced,
    theme: dark ? 1 : 0,
  };
}

export function advanceClock(clock, now, animate) {
  if (!animate) { clock.last = null; return clock.elapsed; }
  if (clock.last !== null) clock.elapsed += Math.min(80, Math.max(0, now - clock.last));
  clock.last = now;
  return clock.elapsed;
}
