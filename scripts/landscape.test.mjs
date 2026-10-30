import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { landscapePolicy, advanceClock } from '../src/site/landscape/state.js';
import { assertDeferredLandscape } from './check-site-bundles.mjs';
import { resolve } from 'node:path';
import { preparePrograms } from '../src/site/landscape/prepare-programs.js';

test('each screen/reflection program finishes in its own task; the lake never reflects itself', async () => {
  const calls = [], reflection = {}, water = {}, sky = {}, camera = {}, scene = {};
  let target, release, pending = false;
  const renderer = {
    setRenderTarget(value) { target = value; },
    async compileAsync(object, actualCamera, actualScene) {
      assert.equal(pending, false); assert.equal(actualCamera, camera); assert.equal(actualScene, scene);
      calls.push({ object, target }); pending = true;
      await new Promise(resolve => { release = resolve; }); pending = false;
    },
  };
  let tasks = 0;
  const done = preparePrograms(renderer, camera, scene, [sky, water], {
    reflection, water, cancelled: () => false, yieldTask: async () => { assert.equal(pending, false); tasks++; },
  });
  for (let i = 1; i <= 3; i++) {
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(calls.length, i); assert.equal(tasks, i); release();
  }
  assert.equal(await done, true);
  assert.deepEqual(calls, [{ object: sky, target: reflection }, { object: sky, target: null }, { object: water, target: null }]);
  assert.equal(target, null);
});

test('program preparation stops after cancellation and always restores the screen target', async () => {
  for (const failure of [false, true]) {
    let target, cancelled = false, calls = 0;
    const renderer = { setRenderTarget(value) { target = value; }, async compileAsync() {
      calls++; cancelled = true; if (failure) throw Error('fixture shader failure');
    } };
    const result = preparePrograms(renderer, {}, {}, [{}, {}], { reflection: {}, water: {}, yieldTask: async () => {}, cancelled: () => cancelled });
    if (failure) await assert.rejects(result, /fixture shader failure/);
    else assert.equal(await result, false);
    assert.equal(calls, 1); assert.equal(target, null);
  }
});

test('constrained profile prepares only screen programs without a reflection target', async () => {
  const targets = [], objects = [{}, {}];
  const renderer = { setRenderTarget(value) { targets.push(value); }, async compileAsync(object) { assert.equal(object, objects.shift()); } };
  assert.equal(await preparePrograms(renderer, {}, {}, [...objects], { yieldTask: async () => {}, cancelled: () => false }), true);
  assert.equal(objects.length, 0); assert.deepEqual(targets, [null, null, null]);
});

test('bundle guard permits deferred scene imports and rejects static Three dependencies', () => {
  const entry = resolve('fixture/home.js'), shared = resolve('fixture/shared.js');
  const files = new Map([[entry, 'import "./shared.js"; import("./landscape-scene-hash.js");'], [shared, 'export const fixture = 1;']]);
  assert.doesNotThrow(() => assertDeferredLandscape([entry], path => files.get(path)));
  files.set(shared, 'import "./three-hash.js";');
  assert.throws(() => assertDeferredLandscape([entry], path => files.get(path)), /3D code in initial bundle/);
});

test('landscape stays on its fallback until WebGL and shaders are ready', () => {
  assert.equal(landscapePolicy().fallback, true);
  assert.equal(landscapePolicy({ ready: true }).fallback, false);
  for (const state of [{ webgl: false }, { failed: true }, { disposed: true }]) {
    assert.equal(landscapePolicy({ ready: true, ...state }).fallback, true);
    assert.equal(landscapePolicy(state).load, false);
    assert.equal(landscapePolicy({ ready: true, ...state }).animate, false);
  }
});

test('pause and reduced motion keep a still frame; hidden scenes neither load nor render', () => {
  for (const state of [{ paused: true }, { reduced: true }]) {
    assert.equal(landscapePolicy({ ready: true, ...state }).animate, false);
    assert.equal(landscapePolicy({ ready: true, ...state }).render, true);
  }
  for (const state of [{ hidden: true }, { visible: false }, { embeddedHidden: true }]) {
    assert.equal(landscapePolicy(state).load, false);
    assert.equal(landscapePolicy({ ready: true, ...state }).render, false);
  }
  assert.equal(landscapePolicy({ ready: true }).animate, true);
});

test('light is the default and a theme change is independent of pause', () => {
  assert.equal(landscapePolicy().theme, 0);
  assert.equal(landscapePolicy({ dark: true, paused: true }).theme, 1);
  assert.equal(landscapePolicy({ dark: false, reduced: true }).theme, 0);
});

test('the animation clock excludes paused, offscreen and hidden time, without a resume jump', () => {
  const clock = { elapsed: 0, last: null };
  advanceClock(clock, 100, true); assert.equal(advanceClock(clock, 132, true), 32);
  advanceClock(clock, 140, false); assert.equal(advanceClock(clock, 60000, false), 32);
  assert.equal(advanceClock(clock, 60100, true), 32);
  assert.equal(advanceClock(clock, 60132, true), 64);
  assert.equal(advanceClock(clock, 70000, true), 144, 'long frames have a bounded delta');
});

const loaderSource = readFileSync(new URL('../src/site/landscape/landscape-hero.js', import.meta.url), 'utf8');
function fixture({ webgl = true, embedded = false, importFailure = false } = {}) {
  function target(extra = {}) {
    const listeners = new Map(), classes = new Set(), attributes = new Map();
    return { dataset: {}, isConnected: true, ...extra,
      classList: { contains: key => classes.has(key), add: key => classes.add(key), remove: key => classes.delete(key) },
      getAttribute: key => attributes.get(key), setAttribute: (key, value) => attributes.set(key, value),
      addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
      removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
      emit(name, event = {}) { for (const fn of [...listeners.get(name) ?? []]) fn(event); },
    };
  }
  const stage = target(), body = target(), parentBody = target(), media = target({ matches: false });
  const frame = embedded ? target({ ownerDocument: { body: parentBody } }) : null;
  frame?.setAttribute('aria-hidden', 'true');
  const page = target({ frameElement: frame, requestIdleCallback: true, cancelIdleCallback: true });
  let contextReleases = 0;
  const context = { getExtension: () => ({ loseContext: () => contextReleases++ }) };
  const document = target({ body, hidden: false, readyState: 'loading', querySelector: () => stage,
    createElement: () => ({ getContext: () => webgl ? context : null }) });
  const idle = new Map(), mutations = []; let intersect, imports = 0, releases = 0, id = 0;
  const states = [], signals = [];
  const controller = { setState: state => states.push(state), dispose: () => releases++ };
  runInNewContext(loaderSource.replace(/^import .*;\s*/, '').replace("import('./landscape-scene.js')", 'loadScene()'), {
    landscapePolicy, document, window: page, matchMedia: () => media,
    addEventListener: page.addEventListener.bind(page), removeEventListener: page.removeEventListener.bind(page),
    dispatchEvent: event => signals.push(event), CustomEvent: class { constructor(type, { detail }) { this.type = type; this.detail = detail; } },
    requestIdleCallback: fn => { idle.set(++id, fn); return id; }, cancelIdleCallback: key => idle.delete(key),
    IntersectionObserver: class { constructor(fn) { intersect = fn; } observe() {} disconnect() {} },
    MutationObserver: class { constructor(fn) { mutations.push(fn); } observe() {} disconnect() {} },
    loadScene: async () => { imports++; if (importFailure) throw Error('fixture import failure'); return { createLandscapeScene: async (_, options) => { states.push(options); options.onReady(); return controller; } }; },
  });
  return { stage, body, frame, document, page, media, idle, states, signals,
    imports: () => imports, releases: () => releases, context, contextReleases: () => contextReleases,
    visible: value => intersect([{ isIntersecting: value }]), mutate: () => mutations.forEach(fn => fn()),
    async runIdle() { for (const [key, fn] of [...idle]) { idle.delete(key); await fn(); } },
  };
}

test('loader transfers its tested context to the scene and releases it if the import fails', async () => {
  const a = fixture(); a.visible(true); a.page.emit('load'); await a.runIdle();
  assert.equal(a.states[0].context, a.context); assert.equal(a.contextReleases(), 0);
  const b = fixture({ importFailure: true }); b.visible(true); b.page.emit('load'); await b.runIdle();
  assert.equal(b.contextReleases(), 1); assert.equal(b.stage.dataset.renderer, 'static');
});

test('loader waits for load AND idle, probes WebGL and never imports it when unavailable', async () => {
  const a = fixture({ webgl: false }); a.visible(true);
  assert.equal(a.idle.size, 0); a.page.emit('load'); assert.equal(a.imports(), 0);
  await a.runIdle(); assert.equal(a.imports(), 0); assert.equal(a.stage.dataset.renderer, 'static');
  const b = fixture(); b.visible(true); b.page.emit('load'); assert.equal(b.imports(), 0);
  await b.runIdle(); assert.equal(b.imports(), 1);
});

test('hidden navigation iframe waits until revealed and disposes when removed', async () => {
  const a = fixture({ embedded: true }); a.visible(true); a.page.emit('load'); await a.runIdle();
  assert.equal(a.imports(), 0);
  a.frame.setAttribute('aria-hidden', 'false'); a.mutate(); await a.runIdle(); assert.equal(a.imports(), 1);
  a.frame.isConnected = false; a.mutate(); assert.equal(a.releases(), 1);
  assert.equal(a.signals.at(-1).detail.release, true);
});

test('loader forwards live theme, pause, reduced motion and visibility; root navigation releases it', async () => {
  const a = fixture(); a.visible(true); a.page.emit('load'); await a.runIdle();
  a.body.classList.add('dark'); a.body.dataset.journeyMotion = 'paused'; a.mutate();
  assert.equal(a.states.at(-1).dark, true); assert.equal(a.states.at(-1).paused, true);
  a.media.matches = true; a.media.emit('change'); assert.equal(a.states.at(-1).reduced, true);
  a.document.hidden = true; a.document.emit('visibilitychange'); assert.equal(a.states.at(-1).hidden, true);
  a.visible(false); assert.equal(a.states.at(-1).visible, false);
  a.body.classList.add('has-page-frame'); a.mutate(); assert.equal(a.releases(), 1);
  a.page.emit('pagehide', { persisted: false }); assert.equal(a.releases(), 1);
});

test('Three version is exact, dynamically loaded; prototype review hooks are absent', () => {
  const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
  assert.equal(JSON.parse(read('package.json')).dependencies.three, '0.181.0');
  assert.match(loaderSource, /await import\('\.\/landscape-scene\.js'\)/);
  assert.doesNotMatch(loaderSource, /from ['"]three/);
  const scene = read('src/site/landscape/landscape-scene.js');
  assert.doesNotMatch(scene + loaderSource, /__landscape|frozenAt|searchParams|prototype\//);
});
