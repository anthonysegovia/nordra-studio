import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

const source = readFileSync(new URL('../public/nordra/v541/theme-transition.js', import.meta.url), 'utf8');
function setup({ reduced = false, paused = false } = {}) {
  const classes = new Set(), rootClasses = new Set();
  const classList = set => ({ contains: name => set.has(name), add: (...names) => names.forEach(name => set.add(name)), remove: (...names) => names.forEach(name => set.delete(name)), toggle: (name, on) => on ? set.add(name) : set.delete(name) });
  let click, starts = 0, changes = 0;
  const button = { addEventListener: (_, handler) => { click = handler; }, setAttribute() {} };
  const document = {
    querySelector: () => button, documentElement: { classList: classList(rootClasses) },
    body: { classList: classList(classes), dataset: { journeyMotion: paused ? 'paused' : 'playing' } },
    startViewTransition(update) {
      starts++; update();
      return { ready: Promise.reject(new DOMException('Transition was skipped', 'AbortError')), finished: Promise.resolve(), skipTransition() {} };
    },
  };
  runInNewContext(source, { document, matchMedia: () => ({ matches: reduced }), clearTimeout, setTimeout, Event, dispatchEvent: () => { changes++; } });
  return { click: () => click(), classes, rootClasses, starts: () => starts, changes: () => changes };
}
test('a skipped transition handles ready rejection while applying and finishing the theme', async () => {
  const app = setup(); app.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.starts(), 1); assert.equal(app.changes(), 1);
  assert.ok(app.classes.has('dark')); assert.equal(app.rootClasses.size, 0);
});
test('rapid theme toggles finish at the latest requested theme without unhandled rejections', async () => {
  const app = setup(); app.click(); app.click();
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(app.starts(), 2); assert.equal(app.changes(), 2);
  assert.ok(!app.classes.has('dark')); assert.equal(app.rootClasses.size, 0);
});
for (const preference of [{ reduced: true }, { paused: true }]) test(`theme updates without a transition for ${JSON.stringify(preference)}`, () => {
  const app = setup(preference); app.click();
  assert.equal(app.starts(), 0); assert.ok(app.classes.has('dark'));
});
