import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import { isolateSiteScript } from '../build/site-scripts.mjs';

describe('site — theme-transition', () => {
  const file = '../src/site/scripts/theme-transition.js';
  const raw = readFileSync(new URL(file, import.meta.url), 'utf8');
  const source = '"use strict";\n' + isolateSiteScript(raw, 'theme-transition.js');
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
    runInNewContext(source, { document, matchMedia: () => ({ matches: reduced }), clearTimeout, setTimeout, Event, CustomEvent: class { constructor(type, { detail }) { this.type = type; this.detail = detail; } }, dispatchEvent: event => { if(event.type === "nordra-theme") changes++; } });
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
});

// Portrait preparation must preserve the existing transition behavior above.

const source = readFileSync(new URL('../src/site/scripts/theme-transition.js', import.meta.url), 'utf8');
function fixture(prepare) {
  function classes() {
    const names = new Set();
    return { contains: name => names.has(name), add: (...items) => items.forEach(name => names.add(name)),
      remove: (...items) => items.forEach(name => names.delete(name)),
      toggle: (name, enabled) => enabled ? names.add(name) : names.delete(name) };
  }
  let click;
  const events = [], body = { classList: classes(), dataset: { journeyMotion: 'paused' } };
  const button = { addEventListener: (_, fn) => { click = fn; }, setAttribute() {} };
  runInNewContext(source, {
    document: { body, documentElement: { classList: classes() }, querySelector: () => button },
    matchMedia: () => ({ matches: false }), clearTimeout() {}, setTimeout() {},
    CustomEvent: class { constructor(type, { detail }) { this.type = type; this.detail = detail; } },
    Event: class { constructor(type) { this.type = type; } },
    dispatchEvent(event) { events.push(event.type); if (event.type === 'nordra-theme-prepare') prepare?.(event.detail); },
  });
  return { click: () => click(), dark: () => body.classList.contains('dark'), events };
}

test('pages without theme assets still change synchronously', async () => {
  const page = fixture(); const result = page.click();
  assert.equal(page.dark(), true); await result;
  assert.deepEqual(page.events, ['nordra-theme-prepare', 'nordra-theme']);
});

test('the existing theme remains painted until the requested image is decoded', async () => {
  let ready; const image = new Promise(resolve => { ready = resolve; });
  const page = fixture(({ waitUntil }) => waitUntil(image));
  const result = page.click(); assert.equal(page.dark(), false);
  ready(); await result; assert.equal(page.dark(), true);
});

test('a second click cancels a pending theme before its image finishes', async () => {
  let ready; const image = new Promise(resolve => { ready = resolve; });
  const page = fixture(({ dark, waitUntil }) => { if (dark) waitUntil(image); });
  const first = page.click(); await page.click();
  assert.equal(page.dark(), false); ready(); await first;
  assert.equal(page.dark(), false, 'a stale image must not overwrite the latest choice');
});

test('an image failure does not trap the theme control', async () => {
  const page = fixture(({ waitUntil }) => waitUntil(Promise.reject(Error('image unavailable'))));
  await page.click(); assert.equal(page.dark(), true);
  await page.click(); assert.equal(page.dark(), false);
});
