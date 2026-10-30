import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { basename, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export function assertNoLegacySiteAssets(html, label) {
  for (const tag of html.matchAll(/<(?:script|link)\b[^>]*>/gi)) {
    for (const attribute of tag[0].matchAll(/\b(?:src|href)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
      const value = attribute[1] ?? attribute[2] ?? attribute[3];
      const url = new URL(value, 'https://example.invalid/');
      assert.ok(!/^\/nordra\/.*\.(?:js|css)$/i.test(url.pathname), `${label}: retired public script or style: ${value}`);
    }
  }
}

// Follow emitted static imports in ES-module evaluation order. Initialization
// error labels are retained by minification and identify each isolated script.
export function bundledOrder(entryFiles, read) {
  const visited = new Set(), order = [];
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    const source = read(file);
    for (const match of source.matchAll(/\bimport\s*(?:[^;"']*?\bfrom\s*)?["']([^"']+)["']/g)) visit(resolve(dirname(file), match[1]));
    order.push(...[...source.matchAll(/\[Nordra site\] ([a-z-]+)\.js failed to initialize/g)].map(match => match[1]));
  }
  entryFiles.forEach(visit);
  return order;
}

export function assertDeferredLandscape(entryFiles, read) {
  const visited = new Set();
  function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    assert.ok(!/^(?:three|landscape-scene)-.*\.js$/.test(basename(file)), `3D code in initial bundle: ${file}`);
    for (const match of read(file).matchAll(/\bimport\s*(?:[^;"']*?\bfrom\s*)?["']([^"']+)["']/g)) visit(resolve(dirname(file), match[1]));
  }
  entryFiles.forEach(visit);
}

export function checkSiteBundles(root) {
  const pages = { index: 'home', estudio: 'estudio', negocios: 'business', invitaciones: 'invitations', bodas: 'weddings', cumpleanos: 'birthdays', eventos: 'events', temporada: 'seasonal' };
  return Object.entries(pages).map(([page, entry]) => {
    const html = readFileSync(resolve(root, `dist/${page}.html`), 'utf8');
    assertNoLegacySiteAssets(readFileSync(resolve(root, `${page}.html`), 'utf8'), `${page} source`);
    assertNoLegacySiteAssets(html, `${page} build`);
    const entrySource = readFileSync(resolve(root, `src/site/entries/${entry}.js`), 'utf8');
    const expected = [...entrySource.matchAll(/import '\.\.\/scripts\/([a-z-]+)\.js(?:\?entry=[a-z]+)?';/g)].map(match => match[1]);
    const modules = [...html.matchAll(/<script\b[^>]*src="(\/assets\/[^"?]+\.js)"[^>]*>/g)].map(match => resolve(root, 'dist' + match[1]));
    assert.ok(modules.length, `${page}: no emitted module`);
    const preloads = [...html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map(match => resolve(root, 'dist' + match[1]));
    assertDeferredLandscape([...modules, ...preloads], file => readFileSync(file, 'utf8'));
    assert.equal([...html.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].length, 1, `${page}: styles must stay in one ordered blocking sheet`);
    const actual = bundledOrder(modules, file => readFileSync(file, 'utf8'));
    assert.deepEqual(actual, expected, `${page}: emitted initialization order differs from the entry`);
    assert.doesNotMatch(html, /(?:src|href)="\/assets\/[^"<>]*\?/);
    return { page, order: actual, hashedAssets: true };
  });
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  console.log(JSON.stringify(checkSiteBundles(resolve(fileURLToPath(new URL('../', import.meta.url)))), null, 2));
}
