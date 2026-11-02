// Use actual frame intervals, including GPU backpressure. Hidden time is excluded by reset().
export function mobileFrameBudget() {
  let previous = null, elapsed = 0, samples = [], reduced = false, complete = false;
  function reset() {
    previous = null;
    elapsed = 0;
    samples = [];
  }
  function observe(now) {
    if (complete) return;
    if (previous !== null) {
      const delta = now - previous;
      samples.push(delta);
      elapsed += delta;
    }
    previous = now;
    if (elapsed < 2000) return;
    samples.sort((a, b) => a - b);
    const slow = samples[Math.ceil(samples.length * 0.95) - 1] > 22;
    reset();
    if (slow && !reduced) {
      reduced = true;
      return 'reduce';
    }
    complete = true;
    return slow ? 'poster' : 'keep';
  }
  return { observe, reset };
}
