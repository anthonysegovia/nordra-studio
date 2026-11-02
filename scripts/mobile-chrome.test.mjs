import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { isolateSiteScript } from '../build/site-scripts.mjs';

describe('site — mobile-chrome', () => {
  const raw = readFileSync(new URL('../src/site/scripts/mobile-chrome.js', import.meta.url), 'utf8');
  const source = '"use strict";\n' + isolateSiteScript(raw, 'mobile-chrome.js');
  const element = (extra = {}) => {
    const attrs = new Map(), names = new Set(), listeners = new Map();
    return {
      hidden: false, attrs, listeners,
      classList: { toggle: (name, on) => on ? names.add(name) : names.delete(name), has: name => names.has(name) },
      setAttribute: (name, value) => attrs.set(name, value), removeAttribute: name => attrs.delete(name),
      addEventListener: (name, fn) => listeners.set(name, fn), focus() {}, before() {}, append() {},
      ...extra,
    };
  };
  function setup({ phone = true, sections = [] } = {}) {
    const events = new Map(), observers = [], docEvents = new Map(), stored = new Map();
    const header = element({ contains: node => node === header.focusTarget, querySelector: () => null });
    const menu = element({ hidden: true, contains: () => false, querySelector: () => null });
    const menuButton = element();
    const created = [];
    const routes = sections.map(({ id }) => ({ hash: '#' + id, ...element() }));
    const boxes = new Map(sections.map(({ id, top, bottom }) => [id, { top, bottom }]));
    const document = {
      activeElement: null, addEventListener: (name, fn) => docEvents.set(name, fn),
      body: element(), documentElement: element(),
      querySelector: selector => selector === '.site-header' ? header : selector === '.menu-button' ? menuButton : null,
      querySelectorAll: () => routes,
      getElementById: id => id === 'mobile-menu' ? menu : boxes.has(id) ? { getBoundingClientRect: () => boxes.get(id) } : null,
      createElement: () => { const node = element(); created.push(node); return node; },
    };
    const context = {
      document, scrollY: 0, innerHeight: 800,
      matchMedia: () => ({ matches: phone, addEventListener() {} }),
      requestAnimationFrame: fn => { fn(); return 1; },
      addEventListener: (name, fn) => events.set(name, fn),
      scrollTo() {}, location: { pathname: '/bodas', hash: '#bodas-event-experience' },
      sessionStorage: { setItem: (k, v) => stored.set(k, v) },
      MutationObserver: class { constructor(fn) { observers.push(fn); } observe() {} },
    };
    runInNewContext(source, context);
    const scroll = y => { context.scrollY = y; events.get('scroll')(); };
    const [topButton, backdrop] = created;
    const toggleMenu = open => { menu.hidden = !open; observers.forEach(fn => fn()); };
    return { scroll, tucked: () => header.classList.has('header-tucked'), menu, header, document, headerEvents: header.listeners, topButton, backdrop, toggleMenu, routes, boxes, docEvents, stored };
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
  test('offers a way back to the top after about two screens', () => {
    const app = setup();
    app.scroll(900); assert.equal(app.topButton.hidden, true);
    app.scroll(1700); assert.equal(app.topButton.hidden, false);
    app.scroll(300); assert.equal(app.topButton.hidden, true);
  });
  test('marks the section in view on the bottom bar', () => {
    const app = setup({ sections: [{ id: 'paquetes', top: 100, bottom: 900 }, { id: 'casos', top: 900, bottom: 1800 }] });
    app.scroll(200);
    assert.equal(app.routes[0].attrs.get('aria-current'), 'location');
    assert.equal(app.routes[1].attrs.has('aria-current'), false);
    app.boxes.set('paquetes', { top: -700, bottom: 100 }); app.boxes.set('casos', { top: 100, bottom: 1000 });
    app.scroll(1000);
    assert.equal(app.routes[0].attrs.has('aria-current'), false);
    assert.equal(app.routes[1].attrs.get('aria-current'), 'location');
  });
  test('the open menu dims the page and holds its scroll', () => {
    const app = setup();
    app.toggleMenu(true);
    assert.equal(app.backdrop.hidden, false);
    assert.equal(app.document.documentElement.classList.has('menu-open'), true);
    app.backdrop.listeners.get('click')();
    assert.equal(app.menu.hidden, true);
    app.toggleMenu(false);
    assert.equal(app.backdrop.hidden, true);
    assert.equal(app.document.documentElement.classList.has('menu-open'), false);
  });
  test('notes this page when a sample invitation opens in the same tab', () => {
    const app = setup();
    const click = link => app.docEvents.get('click')({ target: { closest: () => link } });
    click({ target: '_blank' }); assert.equal(app.stored.size, 0);
    click(null); assert.equal(app.stored.size, 0);
    click({ target: '', closest: () => null }); assert.equal(app.stored.get('nordra-return'), '/bodas#bodas-event-experience');
    click({ target: '', closest: () => ({ id: 'bodas-planes-eventos' }) }); assert.equal(app.stored.get('nordra-return'), '/bodas#bodas-planes-eventos');
  });
  test('never tucks on larger screens', () => {
    const app = setup({ phone: false });
    app.scroll(800); app.scroll(1600); assert.equal(app.tucked(), false); assert.equal(app.topButton.hidden, true);
  });
});
