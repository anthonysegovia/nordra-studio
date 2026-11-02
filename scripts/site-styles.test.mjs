import assert from 'node:assert/strict';
import test from 'node:test';
import { siteStyles } from '../build/site-styles.mjs';

function consolidate(bundle) {
  const emitted = [];
  siteStyles().generateBundle.handler.call({
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
