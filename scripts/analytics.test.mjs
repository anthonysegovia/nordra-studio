import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { activationProperties, commercialPage, commercialRoutes, measurementDisabled, preferenceKey, safeReferrer, sanitizeEvent, buttonIds } from '../src/site/analytics/policy.js';
import { installCommercialAnalytics } from '../src/site/analytics/runtime.js';

test('only eight exact commercial routes and approved hosts participate', () => {
  for (const [page, path] of Object.entries(commercialRoutes)) {
    assert.equal(commercialPage('https://nordrastudio.mx' + path + '?token=fixture#private'), page);
  }
  assert.equal(commercialPage('https://nordrastudio.mx/index.html'), 'index');
  for (const path of ['/gestion.html', '/panel-boda.html', '/mi-boda.html', '/pase-boda.html', '/recepcion-boda.html', '/invitacion-boda.html', '/invitaciones/valentina-y-sebastian/', '/invitaciones/fixture/', '/demos/fixture/', '/aviso-de-privacidad.html', '/?panel=fixture', '/?pago=fixture', '/negocios/fixture']) {
    assert.equal(commercialPage('https://nordrastudio.mx' + path), null, path);
  }
  for (const host of ['spooky.nordrastudio.mx', 'confirmadoscova.nordrastudio.mx', 'client.example', 'nordrastudio.mx.example']) assert.equal(commercialPage(`https://${host}/`), null);
});

test('beforeSend reconstructs a canonical URL and exactly two allowed event properties', () => {
  for (const page of Object.keys(commercialRoutes)) for (const button of buttonIds) {
    const input = { type: 'event', url: 'https://wa.me/0000000000?text=PRIVATE_FIXTURE#secret', __cdp: 'PRIVATE_FIXTURE', payload: { name: 'whatsapp_click', data: { page, button } } };
    const result = sanitizeEvent(input, page);
    assert.deepEqual(result.payload, { name: 'whatsapp_click', data: { page, button } });
    assert.equal(result.url, 'https://nordrastudio.mx' + commercialRoutes[page]);
    assert.doesNotMatch(JSON.stringify(result), /wa\.me|PRIVATE|secret|0000000000|\?|#/);
    assert.deepEqual(sanitizeEvent({ type: 'pageview', url: input.url, extra: 'PRIVATE_FIXTURE' }, page), { type: 'pageview', url: result.url });
  }
});

test('unknown names, pages, buttons, extra properties and identification events fail closed', () => {
  const valid = { type: 'event', payload: { name: 'whatsapp_click', data: { page: 'bodas', button: 'closing' } } };
  for (const bad of [
    { ...valid, type: 'identify' }, { ...valid, payload: { ...valid.payload, name: 'identify' } },
    { ...valid, payload: { ...valid.payload, data: { page: 'client', button: 'closing' } } },
    { ...valid, payload: { ...valid.payload, data: { page: 'bodas', button: 'person-fixture' } } },
    ...['href', 'message', 'phone', 'name', 'token', 'email', 'params'].map(key => ({ ...valid, payload: { ...valid.payload, data: { ...valid.payload.data, [key]: 'PRIVATE_FIXTURE' } } })),
  ]) assert.equal(sanitizeEvent(bad, 'bodas'), null);
  assert.equal(sanitizeEvent(valid, 'index'), null);
});

const link = { href: 'https://wa.me/0000000000?text=PRIVATE_FIXTURE', dataset: { analyticsWhatsapp: 'closing' } };
const click = extra => ({ type: 'click', button: 0, isTrusted: true, defaultPrevented: false, target: { closest: () => link }, ...extra });
test('only real primary/keyboard/middle activations of annotated WhatsApp links count', () => {
  for (const event of [click(), click({ detail: 0 }), click({ type: 'auxclick', button: 1 })]) assert.deepEqual(activationProperties(event, 'index'), { page: 'index', button: 'closing' });
  for (const event of [click({ isTrusted: false }), click({ defaultPrevented: true }), click({ type: 'keydown' }), click({ button: 2 }), click({ type: 'auxclick', button: 2 }), click({ target: { closest: () => ({ ...link, href: 'https://example.invalid' }) } })]) assert.equal(activationProperties(event, 'index'), null);
});

test('external private referrers, opt-out and unavailable storage prevent measurement', () => {
  assert.equal(safeReferrer('', 'https://nordrastudio.mx'), true);
  assert.equal(safeReferrer('https://search.example/', 'https://nordrastudio.mx'), true);
  assert.equal(safeReferrer('https://nordrastudio.mx/client?token=fixture', 'https://nordrastudio.mx'), true, 'provider discards same-origin referrers; document policy removes the header');
  for (const ref of ['https://external.example/private/name', 'https://external.example/?token=fixture', 'https://external.example/#fixture', 'https://user:pass@external.example/', 'invalid']) assert.equal(safeReferrer(ref, 'https://nordrastudio.mx'), false);
  assert.equal(measurementDisabled({ getItem: key => key === preferenceKey ? 'true' : null }), true);
  assert.equal(measurementDisabled({ getItem: () => null }), false);
  assert.equal(measurementDisabled({ getItem() { throw Error('fixture'); } }), true);
});

function fixture({ page = 'index', embedded = false, optedOut = false, href } = {}) {
  function target(extra = {}) {
    const listeners = new Map(), classes = new Set(), attrs = new Map();
    return { ...extra, classList: { contains: value => classes.has(value), add: value => classes.add(value) }, getAttribute: key => attrs.get(key), setAttribute: (key, value) => attrs.set(key, value),
      addEventListener(name, fn) { if (!listeners.has(name)) listeners.set(name, new Set()); listeners.get(name).add(fn); },
      removeEventListener(name, fn) { listeners.get(name)?.delete(fn); }, emit(name, event) { for (const fn of listeners.get(name) ?? []) fn(event); } };
  }
  let readyFrames = [], imports = 0, filter, injections = 0;
  const sent = [], idle = new Map(), mutations = [];
  const parentDoc = { body: {}, querySelectorAll: () => readyFrames };
  const frame = embedded ? target({ isConnected: true, ownerDocument: parentDoc }) : null;
  frame?.classList.add('page-navigation-frame'); frame?.setAttribute('aria-hidden', 'true');
  const doc = target({ body: { dataset: { scene: page === 'index' ? 'entrada' : page } }, hidden: false, prerendering: false, readyState: 'loading', referrer: '', querySelector: () => readyFrames[0] ?? null });
  const win = target({ document: doc, frameElement: frame, location: new URL(href ?? 'https://nordrastudio.mx' + commercialRoutes[page]), localStorage: { getItem: () => optedOut ? 'true' : null },
    requestIdleCallback: fn => { idle.set(1, fn); return 1; }, cancelIdleCallback: key => idle.delete(key),
    MutationObserver: class { constructor(fn) { mutations.push(fn); } observe() {} disconnect() {} },
  });
  win.parent = embedded ? {} : win;
  const sdk = { inject(options) { injections++; assert.equal(options.disableAutoTrack, true); filter = options.beforeSend; }, pageview() { const event = filter({ type: 'pageview', url: win.location.href }); if (event) sent.push(event); }, track(name, data) { const event = filter({ type: 'event', url: win.location.href, payload: { name, data } }); if (event) sent.push(event); } };
  const dispose = installCommercialAnalytics(win, async () => { imports++; return sdk; });
  return { win, doc, frame, sent, idle, dispose, imports: () => imports, injections: () => injections,
    async flush() { for (const [id, fn] of [...idle]) { idle.delete(id); await fn(); } await new Promise(resolve => setImmediate(resolve)); },
    reveal() { frame?.setAttribute('aria-hidden', 'false'); readyFrames = frame ? [frame] : []; mutations.forEach(fn => fn()); },
    cover() { readyFrames.push({}); mutations.forEach(fn => fn()); },
    optOut(value) { optedOut = value; win.emit('storage', {}); },
    mutate() { mutations.forEach(fn => fn()); },
  };
}

test('one view after load/idle; preference, theme, anchor and repeated visibility changes never duplicate it', async () => {
  const a = fixture(); assert.equal(a.imports(), 0); a.win.emit('load'); await a.flush();
  assert.equal(a.injections(), 1); assert.equal(a.sent.length, 1);
  a.mutate(); a.win.emit('pageshow'); a.doc.emit('visibilitychange'); a.win.location.hash = 'contacto'; a.mutate(); await a.flush();
  assert.equal(a.sent.length, 1);
  a.doc.emit('click', click()); a.doc.emit('keydown', click({ type: 'keydown' }));
  a.doc.emit('click', click({ detail: 0 })); a.doc.emit('auxclick', click({ type: 'auxclick', button: 1 }));
  assert.equal(a.sent.filter(e => e.type === 'event').length, 3);
});

test('preloaded iframe has no SDK/views; revealed frame owns one view and covered documents stop counting', async () => {
  const a = fixture({ embedded: true }); a.win.emit('load'); await a.flush(); assert.equal(a.imports(), 0);
  a.reveal(); await a.flush(); assert.equal(a.sent.length, 1);
  a.doc.emit('click', click()); assert.equal(a.sent.length, 2);
  a.cover(); a.doc.emit('click', click()); assert.equal(a.sent.length, 2);
  const root = fixture(); root.win.emit('load'); await root.flush(); root.cover(); root.doc.emit('click', click()); assert.equal(root.sent.length, 1);
});

test('early real click is kept while SDK loads, without sending destination or counting a hidden page', async () => {
  const a = fixture(); a.doc.emit('click', click()); a.doc.hidden = true; await a.flush();
  assert.equal(a.sent.length, 1); assert.equal(a.sent[0].type, 'event');
  assert.doesNotMatch(JSON.stringify(a.sent), /wa\.me|PRIVATE_FIXTURE/);
});

test('excluded document, hidden/prerendered page and opt-out do not load analytics', async () => {
  for (const a of [fixture({ href: 'https://nordrastudio.mx/gestion.html' }), fixture({ optedOut: true })]) {
    a.win.emit('load'); a.doc.emit('click', click()); await a.flush(); assert.equal(a.imports(), 0);
  }
  const a = fixture(); a.doc.prerendering = true; a.win.emit('load'); await a.flush(); assert.equal(a.imports(), 0);
  a.doc.prerendering = false; a.doc.emit('prerenderingchange'); await a.flush(); assert.equal(a.sent.length, 1);
  a.optOut(true); a.doc.emit('click', click()); assert.equal(a.sent.length, 1);
  a.optOut(false); a.doc.emit('click', click()); assert.equal(a.sent.length, 2);
});

test('all commercial WhatsApp links are annotated with closed identifiers and no-referrer policy', () => {
  for (const page of Object.keys(commercialRoutes)) {
    const html = readFileSync(new URL(`../${page}.html`, import.meta.url), 'utf8');
    assert.match(html, /<meta name="referrer" content="no-referrer">/);
    const links = [...html.matchAll(/<a\b[^>]*href="https:\/\/wa\.me\/[^\"]*"[^>]*>/g)];
    assert.ok(links.length);
    for (const [tag] of links) assert.ok(buttonIds.includes(tag.match(/data-analytics-whatsapp="([^"]+)"/)?.[1]), page);
  }
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(pkg.dependencies['@vercel/analytics'], '2.0.1');
});
