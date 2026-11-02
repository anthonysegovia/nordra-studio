import test from 'node:test';
import assert from 'node:assert/strict';
import { skyEvents } from '../src/site/landscape/sky-events.js';

test('entrance and still motion never advance the event clock', () => {
  const tick = skyEvents(() => 0);
  for (const [entered, moving] of [[false, true], [true, false]]) {
    const event = tick(100, entered, moving);
    assert.equal(event.pulse, 0);
    assert.equal(event.meteor, -1);
  }
  assert.equal(tick(1, true, true).pulse, 0);
  assert.equal(tick(3, true, true).pulse, 1);
  assert.equal(tick(600, true, false).pulse, 0);
  assert.ok(tick(0.1, true, true).pulse > 0.95);
});

test('pulse envelopes and shooting star intervals on the visible clock', () => {
  for (const seed of [0, 0.5, 0.999]) {
    let lastPulse = 0, pulseStart = 0, lastMeteor = -1;
    const starts = [], durations = [];
    const tick = skyEvents(() => seed);
    for (let step = 1; step <= 3600; step++) {
      const { pulse, meteor } = tick(0.05, true, true);
      if (pulse > 0 && !lastPulse) pulseStart = step;
      if (!pulse && lastPulse) durations.push((step - pulseStart) * 0.05);
      assert.ok(Math.abs(pulse - lastPulse) <= 0.08);
      if (meteor >= 0 && lastMeteor < 0) starts.push(step * 0.05);
      lastPulse = pulse; lastMeteor = meteor;
    }
    assert.ok(durations.length > 10 && durations.every(d => d >= 1.95 && d <= 4.05));
    assert.ok(starts.length >= 4 && starts[0] >= 25 && starts[0] <= 35.05);
    assert.ok(starts.slice(1).every((s, i) => s - starts[i] >= 25.85 - 0.05));
  }
});
