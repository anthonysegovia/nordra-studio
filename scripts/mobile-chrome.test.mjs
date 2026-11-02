import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isolateSiteScript } from '../build/site-scripts.mjs';

describe('site — mobile-chrome', () => {
  const raw = readFileSync(new URL('../src/site/scripts/mobile-chrome.js', import.meta.url), 'utf8');
  const source = '"use strict";\n' + isolateSiteScript(raw, 'mobile-chrome.js');
  function setup({ phone = true } = {}) {
    const events = new Map(), names = new Set(), headerEvents = new Map();
    const header = { classList: { toggle: (name, on) => on ? names.add(name) : names.delete(name) }, contains: node => node === header.focusTarget, addEventListener: (name, fn) => headerEvents.set(name, fn) };
    const menu = { hidden: true };
    const document = { activeElement: null, querySelector: selector => selector === '.site-header' ? header : null, getElementById: id => id === 'mobile-menu' ? menu : null };
    const context = {
      document, scrollY: 0,
      matchMedia: () => ({ matches: phone, addEventListener() {} }),
      requestAnimationFrame: fn => { fn(); return 1; },
      addEventListener: (name, fn) => events.set(name, fn),
      MutationObserver: class { observe() {} },
    };
    runInNewContext(source, context);
    const scroll = y => { context.scrollY = y; events.get('scroll')(); };
    return { scroll, tucked: () => names.has('header-tucked'), menu, header, document, headerEvents };
  }
  test('tucks while reading down and returns on the first move up', () => {
    const app = setup();
    app.scroll(400); assert.equal(app.tucked(), true);
    app.scroll(900); assert.equal(app.tucked(), true);
    app.scroll(860); assert.equal(app.tucked(), false);
    app.scroll(1300); assert.equal(app.tucked(), true);
  });
  test('stays visible near the top and ignores tiny jitters', () => {
    const app = setup();
    app.scroll(100); assert.equal(app.tucked(), false);
    app.scroll(600); assert.equal(app.tucked(), true);
    app.scroll(596); assert.equal(app.tucked(), true);
    app.scroll(40); assert.equal(app.tucked(), false);
  });
  test('stays visible while the menu is open or the header holds focus', () => {
    const app = setup();
    app.menu.hidden = false; app.scroll(800); assert.equal(app.tucked(), false);
    app.menu.hidden = true; app.scroll(1400); assert.equal(app.tucked(), true);
    app.headerEvents.get('focusin')(); assert.equal(app.tucked(), false);
  });
  test('never tucks on larger screens', () => {
    const app = setup({ phone: false });
    app.scroll(800); app.scroll(1600); assert.equal(app.tucked(), false);
  });
});
