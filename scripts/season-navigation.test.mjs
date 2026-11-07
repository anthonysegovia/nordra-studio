import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { runInNewContext } from 'node:vm';

function files(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name);
    return entry.isDirectory() ? files(path) : [path];
  });
}

test('public assets and site sources never link to retired seasonal anchors', () => {
  const sources = ['public', 'src', 'build', 'en', 'invitaciones'].flatMap(files);
  sources.push(...readdirSync('.').filter(name => name.endsWith('.html')));
  for (const path of sources.filter(path => /\.(?:html|[cm]?js|tsx?|jsx|json|css|svg)$/i.test(path))) {
    assert.doesNotMatch(readFileSync(path, 'utf8'), /\/(?:en\/)?invitaciones(?:\.html|\/)?(?:\?[^\s"'<>#]*)?#(?:temporadas?|plan-temporada)(?![\w-])/i, path);
  }
});

test('legacy seasonal hashes replace the URL synchronously at the start of head', () => {
  const html = readFileSync('invitaciones.html', 'utf8');
  const script = html.match(/<head><script data-season-redirect>([^<]+)<\/script>/)?.[1];
  assert.ok(script, 'Redirect must precede styles, body and deferred scripts');
  for (const pathname of ['/invitaciones', '/invitaciones.html', '/en/invitaciones']) {
    for (const hash of ['#temporadas', '#temporada', '#plan-temporada', '#clientes-reales', '']) {
      const calls = [];
      runInNewContext(script, { location: { pathname, hash, replace: url => calls.push(url) } });
      assert.deepEqual(calls, ['#temporadas', '#temporada', '#plan-temporada'].includes(hash)
        ? [pathname.startsWith('/en/') ? '/en/temporada' : '/temporada'] : []);
    }
  }
});

test('occasion sample tabs have no decorative numbers and preserve their selection', () => {
  for (const page of ['bodas', 'cumpleanos', 'eventos']) {
    const tabs = readFileSync(`${page}.html`, 'utf8').match(/<button[^>]*role="tab"[^>]*>[\s\S]*?<\/button>/g);
    assert.equal(tabs.length, 2, page);
    for (const tab of tabs) assert.doesNotMatch(tab.replace(/<[^>]+>/g, ''), /\b0[12]\b/, page);
    assert.match(tabs[0], /aria-selected="true"/);
    assert.match(tabs[1], /aria-selected="false"/);
  }
});
