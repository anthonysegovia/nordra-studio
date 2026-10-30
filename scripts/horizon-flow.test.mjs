import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';
import { isolateSiteScript } from '../build/site-scripts.mjs';

const source = readFileSync(new URL('../src/site/scripts/horizon-flow.js', import.meta.url), 'utf8');

// Exercise lifecycle and quality budgets without depending on a GPU in CI.
// Shader compilation and the visual result are checked in the local browser.
function setup({ width = 1920, height = 280, dpr = 2, reduced = false, lowPower = false, webgl = true } = {}) {
  function target(extra = {}) {
    const listeners = new Map(), classes = new Set();
    return {
      dataset: {}, setAttribute() {}, ...extra,
      classList: { contains: key => classes.has(key), add: key => classes.add(key), remove: key => classes.delete(key) },
      addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
      removeEventListener(name, fn) { listeners.get(name)?.delete(fn); },
      emit(name, event = {}) { for (const fn of listeners.get(name) ?? []) fn(event); },
    };
  }
  const state = { draws: 0, uniforms: {}, attached: false, lost: false };
  const gl = new Proxy({
    getParameter: () => 8192, getShaderParameter: () => true, getProgramParameter: () => true,
    getUniformLocation: (_, key) => key, getAttribLocation: () => 0,
    uniform1f: (key, value) => { state.uniforms[key] = value; },
    drawElements: () => { state.draws++; }, isContextLost: () => state.lost,
  }, { get: (object, key) => key in object ? object[key] : /^[A-Z_]+$/.test(key) ? 1 : () => ({}) });
  const canvas = target({ getContext: () => webgl ? gl : null, remove() { state.attached = false; } });
  const host = target({ clientWidth: width, clientHeight: height, append() { state.attached = true; } });
  const body = target(), root = target(), page = target({ devicePixelRatio: dpr });
  const reduce = target({ matches: reduced }), mobile = target({ matches: width <= 700 });
  const frames = new Map(), mutations = [];
  let nextFrame = 0, intersection, resizing;
  const document = target({ hidden: false, body, documentElement: root,
    querySelector: () => host, createElement: () => canvas });
  runInNewContext('"use strict";\n' + isolateSiteScript(source, 'horizon-flow.js'), {
    document, window: page, navigator: { deviceMemory: lowPower ? 4 : 8, hardwareConcurrency: 8 },
    matchMedia: query => query.includes('reduced') ? reduce : mobile,
    requestAnimationFrame: fn => { frames.set(++nextFrame, fn); return nextFrame; },
    cancelAnimationFrame: id => frames.delete(id),
    addEventListener: page.addEventListener.bind(page), removeEventListener: page.removeEventListener.bind(page),
    IntersectionObserver: class { constructor(fn) { intersection = fn; } observe() {} disconnect() {} },
    ResizeObserver: class { constructor(fn) { resizing = fn; } observe() {} disconnect() {} },
    MutationObserver: class { constructor(fn) { mutations.push(fn); } observe() {} disconnect() {} },
    console: { warn() {} },
  });
  return { state, canvas, host, body, page, document, reduce, frames,
    visible(value) { intersection([{ isIntersecting: value }]); },
    mutate() { mutations.forEach(fn => fn()); }, resize: () => resizing(),
    frame(time) { const pending = [...frames.values()]; frames.clear(); pending.forEach(fn => fn(time)); },
  };
}

test('retina resolution follows screen density and stays within the pixel budget', () => {
  const a = setup();
  assert.equal(a.canvas.width, 3840); assert.equal(a.canvas.height, 560);
  a.host.clientWidth = 5120; a.resize();
  assert.ok(a.canvas.width * a.canvas.height < 4210000);
  assert.ok(a.canvas.width > 1400);
  a.page.devicePixelRatio = 1; a.resize(); assert.equal(a.canvas.width, 5120);
});

test('mobile and limited devices retain clear resolution with a 30fps budget', () => {
  const mobile = setup({ width: 520, height: 135, dpr: 3 });
  assert.equal(mobile.canvas.width, 1040); assert.equal(mobile.canvas.dataset.targetFps, '30');
  const low = setup({ lowPower: true });
  assert.equal(low.canvas.width, 2880); assert.equal(low.canvas.dataset.targetFps, '30');
});

test('pause, resume, leaving the viewport and hiding the page stop the loop', () => {
  const a = setup(); a.visible(true); a.frame(100);
  assert.ok(a.frames.size > 0);
  a.body.dataset.journeyMotion = 'paused'; a.mutate();
  const time = a.canvas.dataset.elapsed; assert.equal(a.frames.size, 0);
  a.frame(1000); assert.equal(a.canvas.dataset.elapsed, time);
  a.body.dataset.journeyMotion = 'playing'; a.mutate(); assert.equal(a.frames.size, 1);
  a.visible(false); assert.equal(a.frames.size, 0);
  a.visible(true); a.document.hidden = true; a.document.emit('visibilitychange'); assert.equal(a.frames.size, 0);
});

test('reduced motion renders the same geometry without scheduling animation', () => {
  const a = setup({ reduced: true }); a.visible(true);
  assert.equal(a.host.dataset.renderer, 'ribbons-3d'); assert.ok(a.state.draws > 0);
  assert.equal(a.frames.size, 0); assert.equal(a.canvas.dataset.elapsed, '0.000');
  a.reduce.matches = false; a.reduce.emit('change'); assert.equal(a.frames.size, 1);
  a.reduce.matches = true; a.reduce.emit('change'); assert.equal(a.frames.size, 0);
});

test('theme changes redraw the lighting even while paused', () => {
  const a = setup({ reduced: true }), before = a.state.draws;
  a.body.classList.add('dark'); a.mutate();
  assert.equal(a.state.uniforms.dark, 1); assert.ok(a.state.draws > before); assert.equal(a.frames.size, 0);
  a.body.classList.remove('dark'); a.mutate(); assert.equal(a.state.uniforms.dark, 0);
});

test('unavailable or lost WebGL reveals the original image and stops scheduling', () => {
  const unavailable = setup({ webgl: false }); assert.equal(unavailable.host.dataset.renderer, 'image');
  assert.equal(unavailable.state.attached, false);
  const a = setup(); a.visible(true); a.state.lost = true;
  a.canvas.emit('webglcontextlost', { preventDefault() {} });
  assert.equal(a.host.dataset.renderer, 'image'); assert.equal(a.frames.size, 0); assert.equal(a.state.attached, false);
  a.state.lost = false; a.canvas.emit('webglcontextrestored');
  assert.equal(a.host.dataset.renderer, 'ribbons-3d'); assert.equal(a.state.attached, true);
});

test('back-forward cache resumes the renderer; final page exit releases the loop', () => {
  const a = setup(); a.visible(true);
  a.page.emit('pagehide', { persisted: true }); assert.equal(a.frames.size, 0);
  a.page.emit('pageshow'); assert.equal(a.frames.size, 1);
  a.page.emit('pagehide', { persisted: false }); assert.equal(a.frames.size, 0);
});
