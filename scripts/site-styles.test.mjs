import assert from 'node:assert/strict';
import test from 'node:test';
import { siteStyles } from '../build/site-styles.mjs';
import { assertNoMergedStyleDependencies } from './check-site-bundles.mjs';
import { resolve } from 'node:path';

function consolidate(bundle, plugin = siteStyles()) {
  const emitted = [];
  plugin.generateBundle.handler.call({
    emitFile(asset) { emitted.push(asset); return String(emitted.length - 1); },
    getFileName(id) { return `assets/${emitted[Number(id)].name}`; },
    error(message) { throw new Error(message); },
  }, {}, bundle);
  return emitted;
}
const asset = source => ({ type: 'asset', source });
const link = name => `<link rel="stylesheet" crossorigin href="/assets/${name}.css">`;

test('combines shared CSS in final HTML cascade order, preserving rules and relative URLs', () => {
  const bundle = {
    'index.html': asset(`<head>${link('home')}${link('contact')}${link('phone')}</head>`),
    'assets/home.css': asset('.phone{color:red;background:url(./image.webp)}'),
    'assets/contact.css': asset('.phone{color:green}'),
    'assets/phone.css': asset('.phone{color:ivory}'),
  };
  const [sheet] = consolidate(bundle);
  assert.equal(sheet.source, '.phone{color:red;background:url(./image.webp)}\n.phone{color:green}\n.phone{color:ivory}');
  assert.equal(bundle['index.html'].source, `<head>${link('index-styles')}</head>`);
  assert.equal(bundle['assets/phone.css'].source, '.phone{color:ivory}');
});

test('dynamic preloads reuse the commercial sheet while private and lazy-only CSS remain intact', () => {
  const plugin = siteStyles();
  const chunk = (imports = [], dynamicImports = []) => ({ type: 'chunk', imports, dynamicImports });
  consolidate({
    'index.html': asset(`<script src="/assets/home.js"></script>${link('home')}${link('phone')}`),
    'panel-boda.html': asset('<script src="/assets/panel.js"></script>'),
    'mi-boda.html': asset('<script src="/assets/client.js"></script>'),
    'gestion.html': asset('<script src="/assets/management.js"></script>'),
    'assets/home.js': chunk([], ['assets/landscape.js']),
    'assets/landscape.js': chunk(['assets/home.js']),
    'assets/panel.js': chunk([], ['assets/private-lazy.js']),
    'assets/client.js': chunk([], ['assets/private-lazy.js']),
    'assets/management.js': chunk([], ['assets/private-lazy.js']),
    'assets/private-lazy.js': chunk(),
    'assets/home.css': asset('body{}'), 'assets/phone.css': asset('.phone{}'),
  }, plugin);
  const render = plugin.config().experimental.renderBuiltUrl;
  for (const hostId of ['assets/home.js', 'assets/landscape.js']) {
    assert.equal(render('assets/phone.css', { hostType: 'js', hostId }), '/assets/index-styles.css');
    assert.equal(render('assets/lazy-only.css', { hostType: 'js', hostId }), undefined);
  }
  for (const hostId of ['assets/panel.js', 'assets/client.js', 'assets/management.js', 'assets/private-lazy.js']) {
    assert.equal(render('assets/phone.css', { hostType: 'js', hostId }), undefined);
    assert.equal(render('assets/private.css', { hostType: 'js', hostId }), undefined);
  }
  assert.equal(render('assets/phone.css', { hostType: 'html', hostId: 'index.html' }), undefined);
});

test('build assertion catches merged CSS in a nested dynamic preload, but permits required CSS', () => {
  const root = resolve('fixture-dist'), file = name => resolve(root, 'assets', name);
  const sources = new Map([
    [file('home.js'), 'import("./scene.js")'],
    [file('scene.js'), 'const deps=["assets/phone.css","assets/lazy.css"];import("./home.js")'],
    [file('combined.css'), '.home{}\n.phone{}'],
    [file('phone.css'), '.phone{}'],
    [file('lazy.css'), '.lazy{}'],
  ]);
  const check = () => assertNoMergedStyleDependencies([file('home.js')], file('combined.css'), root, name => {
    assert.ok(sources.has(name), `Unexpected file: ${name}`); return sources.get(name);
  });
  assert.throws(check, /preload requests CSS already merged/);
  sources.set(file('scene.js'), 'const deps=["assets/combined.css","assets/lazy.css"];import("./home.js")');
  assert.doesNotThrow(check);
});

test('refuses a substitution when a JS host is also used by a private page', () => {
  const plugin = siteStyles();
  consolidate({
    'index.html': asset(`<script src="/assets/shared.js"></script>${link('home')}${link('phone')}`),
    'gestion.html': asset('<script src="/assets/shared.js"></script>'),
    'assets/shared.js': { type: 'chunk', imports: [], dynamicImports: [] },
    'assets/home.css': asset('body{}'), 'assets/phone.css': asset('.phone{}'),
  }, plugin);
  assert.throws(() => plugin.config().experimental.renderBuiltUrl('assets/phone.css', { hostType: 'js', hostId: 'assets/shared.js' }), /ambiguous stylesheet consumers/);
});

test('leaves single-sheet commercial pages and noncommercial pages unchanged', () => {
  const bundle = { 'bodas.html': asset(link('weddings')), 'gestion.html': asset(link('a') + link('b')) };
  const original = structuredClone(bundle);
  assert.deepEqual(consolidate(bundle), []);
  assert.deepEqual(bundle, original);
});

test('fails closed for conditional styles, missing assets and CSS imports', () => {
  for (const extra of [link('missing'), '<link rel="stylesheet" media="print" href="/assets/a.css">']) {
    assert.throws(() => consolidate({ 'index.html': asset(link('a') + extra), 'assets/a.css': asset('a{}') }), /unconditional local stylesheet/);
  }
  assert.throws(() => consolidate({ 'index.html': asset(link('a') + link('b')), 'assets/a.css': asset('a{}'), 'assets/b.css': asset('@import "other.css";') }), /cannot concatenate/);
});
