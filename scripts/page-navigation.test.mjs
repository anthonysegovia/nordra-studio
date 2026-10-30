import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';

import { isolateSiteScript } from '../build/site-scripts.mjs';

describe('site — page-navigation', () => {
  const file = '../src/site/scripts/page-navigation.js';
  const raw = readFileSync(new URL(file, import.meta.url), 'utf8');
  const source = '"use strict";\n' + isolateSiteScript(raw, 'page-navigation.js');
  function setup({ hidden = false, reduced = false, paused = false } = {}) {
    const docEvents = new Map(), events = new Map(), timers = new Map(), children = [], navigations = [], addresses = [], animations = [];
    let timerId = 0;
    const classList = () => { const names = new Set(); return { add: (...values) => values.forEach(v => names.add(v)), remove: (...values) => values.forEach(v => names.delete(v)), contains: name => names.has(name) }; };
    const element = () => ({ classList: classList(), style: {}, attributes: {}, textContent: '', setAttribute(name, value) { this.attributes[name] = value; }, removeAttribute(name) { delete this.attributes[name]; }, addEventListener() {}, remove() { this.removed = true; }, focus() {} });
    const root = element(), body = { dataset: { scene: 'estudio', journeyMotion: paused ? 'paused' : 'playing' }, classList: classList(), style: {}, append: item => children.push(item) };
    const location = { href: 'https://example.invalid/estudio.html', pathname: '/estudio.html', hash: '', assign: url => navigations.push({ method: 'assign', url }), replace: url => navigations.push({ method: 'replace', url }) };
    const history = { state: null, pushState(state, _, url) { this.state = state; addresses.push({ method: 'push', url }); }, replaceState(state, _, url) { this.state = state; addresses.push({ method: 'replace', url }); } };
    const document = {
      body, documentElement: root, title: 'Estudio', hidden, fonts: { ready: Promise.resolve() },
      querySelector: selector => selector.startsWith('[data-view]') ? { querySelectorAll: () => [] } : null,
      getElementById: () => ({ scrollIntoView() {} }), addEventListener: (name, fn) => docEvents.set(name, fn),
      createElement(tag) {
        const node = element(); node.tagName = tag;
        if (tag === 'iframe') {
          node.messages = []; node.contentWindow = { postMessage: message => node.messages.push(message) };
          node.animate = (frames, options) => { animations.push({ frames, options }); return { finished: Promise.resolve(), cancel() {} }; };
        }
        return node;
      },
    };
    const context = { document, location, history, URL, URLSearchParams, innerHeight: 900, Event,
      matchMedia: () => ({ matches: reduced }), getComputedStyle: () => ({ backgroundColor: '#fff' }),
      setTimeout: (fn, ms) => { const id = ++timerId; timers.set(id, { fn, ms }); return id; }, clearTimeout: id => timers.delete(id),
      requestAnimationFrame: fn => fn(), dispatchEvent() {}, addEventListener: (name, fn) => events.set(name, fn),
    };
    context.window = context; context.parent = context;
    runInNewContext(source, context);
    function click(next, anchor = '') {
      const link = { dataset: { go: next, anchor }, href: `https://example.invalid/${next}.html#${anchor}`, hasAttribute: () => false };
      docEvents.get('click')({ target: { closest: () => link }, button: 0, preventDefault() {}, stopImmediatePropagation() {} });
    }
    const frames = () => children.filter(c => c.tagName === 'iframe');
    function ready(frame, scene) { events.get('message')({ source: frame.contentWindow, data: { type: 'nordra-page-ready', scene, title: scene, background: '#fff' } }); }
    function visibility(value) { document.hidden = value; docEvents.get('visibilitychange')(); }
    function backTo(next, anchor) { location.pathname = `/${next}.html`; location.hash = `#${anchor}`; history.state = { nordraPage: next, anchor }; events.get('popstate')(); }
    return { click, ready, visibility, backTo, frames, timers, root, navigations, addresses, animations, status: children[0] };
  }
  test('timeout navigates normally with the requested anchor instead of reporting a failed page', () => {
    const app = setup(); app.click('bodas', 'panel-boda');
    const timeout = [...app.timers.values()].find(t => t.ms === 12000); timeout.fn();
    assert.deepEqual(app.navigations, [{ method: 'assign', url: 'https://example.invalid/bodas.html#panel-boda' }]);
    assert.equal(app.status.textContent, ''); assert.equal(app.root.attributes['aria-busy'], undefined);
    assert.ok(app.frames()[0].removed);
  });
  test('hiding a tab with a pending navigation falls back immediately and ignores stale readiness', () => {
    const app = setup(); app.click('negocios', 'proceso'); const frame = app.frames()[0];
    const timeout = [...app.timers.values()].find(t => t.ms === 12000);
    app.visibility(true); app.ready(frame, 'negocios'); timeout.fn();
    assert.deepEqual(app.navigations, [{ method: 'assign', url: 'https://example.invalid/negocios.html#proceso' }]);
    assert.equal(app.addresses.length, 0);
  });
  test('a navigation started while already hidden goes directly to its destination', () => {
    const app = setup({ hidden: true }); app.click('eventos', 'planes-eventos');
    assert.equal(app.frames().length, 0);
    assert.deepEqual(app.navigations, [{ method: 'assign', url: 'https://example.invalid/eventos.html#planes-eventos' }]);
  });
  test('a superseded timeout cannot navigate to an earlier request', () => {
    const app = setup(); app.click('bodas'); const old = [...app.timers.values()].find(t => t.ms === 12000);
    app.click('negocios'); old.fn(); assert.equal(app.navigations.length, 0);
    app.visibility(true); assert.equal(app.navigations[0].url, 'https://example.invalid/negocios.html');
  });
  test('normal readiness preserves iframe navigation, anchor messages and push history', async () => {
    const app = setup(); app.click('bodas', 'panel-boda'); const frame = app.frames()[0];
    app.ready(frame, 'bodas'); await Promise.resolve();
    assert.equal(app.navigations.length, 0); assert.equal(app.animations.length, 1);
    assert.equal(app.addresses[0].method, 'push'); assert.equal(app.addresses[0].url, 'https://example.invalid/bodas.html#panel-boda');
    assert.ok(frame.messages.some(m => m.type === 'nordra-anchor' && m.id === 'panel-boda'));
  });
  for (const preference of [{ reduced: true }, { paused: true }]) test(`normal navigation respects ${JSON.stringify(preference)}`, () => {
    const app = setup(preference); app.click('bodas'); app.ready(app.frames()[0], 'bodas');
    assert.equal(app.animations.length, 0); assert.equal(app.navigations.length, 0); assert.equal(app.addresses[0].method, 'push');
  });
  test('fallback during back or forward replaces the selected history entry instead of pushing', () => {
    const app = setup(); app.backTo('bodas', 'panel-boda'); app.visibility(true);
    assert.deepEqual(app.navigations, [{ method: 'replace', url: 'https://example.invalid/bodas.html#panel-boda' }]);
  });
});
