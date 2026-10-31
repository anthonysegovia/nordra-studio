import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { resolvePreviewRoute } from '../build/commercial-preview.mjs';

const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url)));
const routes = config.routes, host = 'nordrastudio.mx';
const names = ['estudio','negocios','invitaciones','bodas','cumpleanos','eventos','temporada'];
export const routeCases = [
  ...names.flatMap(page => [
    { path: `/${page}`, expected: { url: `/${page}.html`, headers: {} } },
    { path: `/${page}.html`, expected: { status: 308, headers: { Location: `/${page}` } } },
    ...['', '.html'].flatMap(ext => ['panel','pago'].map(key => ({ path: `/${page}${ext}?${key}=fixture`, expected: { url: '/gestion.html?' + key + '=fixture', headers: { 'X-Robots-Tag': 'noindex, nofollow' } } }))),
  ]),
  { path: '/negocios.html?x=1#opciones-negocio', expected: { status: 308, headers: { Location: '/negocios?x=1' } } },
  { path: '/negocios.html?x=a%26b&x=c&empty=&q=hello+world', expected: { status: 308, headers: { Location: '/negocios?x=a%26b&x=c&empty=&q=hello+world' } } },
  { path: '/?panel=fixture', expected: { url: '/gestion.html?panel=fixture', headers: { 'X-Robots-Tag': 'noindex, nofollow' } } },
  { path: '/?pago=fixture', expected: { url: '/gestion.html?pago=fixture', headers: { 'X-Robots-Tag': 'noindex, nofollow' } } },
  { path: '/index.html?panel=fixture', expected: { url: '/gestion.html?panel=fixture', headers: { 'X-Robots-Tag': 'noindex, nofollow' } } },
  { path: '/', host: 'confirmadoscova.nordrastudio.mx', expected: { url: '/invitaciones/posada-confirmados/index.html', headers: { 'X-Robots-Tag': 'noindex, nofollow' } } },
  { path: '/favicon.ico', host: 'confirmadoscova.nordrastudio.mx', expected: { url: '/invitaciones/posada-confirmados/assets/confirmados-icon-v1.ico', headers: {} } },
  { path: '/apple-touch-icon.png', host: 'confirmadoscova.nordrastudio.mx', expected: { url: '/invitaciones/posada-confirmados/assets/confirmados-apple-v1.png', headers: {} } },
  { path: '/', host: 'spooky.nordrastudio.mx', expected: { url: '/invitaciones/spooky-party/index.html', headers: {} } },
  { path: '/favicon.svg', host: 'spooky.nordrastudio.mx', expected: { url: '/invitaciones/spooky-party/favicon.svg', headers: {} } },
  { path: '/invitacion-original.jpeg', host: 'spooky.nordrastudio.mx', expected: { url: '/invitaciones/spooky-party/invitacion-original.jpeg', headers: {} } },
  { path: '/portada.html', expected: { status: 308, headers: { Location: '/' } } },
  { path: '/demos/ano-nuevo', expected: { status: 308, headers: { Location: '/demos/celebra-2027/' } } },
  ...['/gestion.html','/panel-boda.html','/mi-boda.html','/pase-boda.html','/recepcion-boda.html','/invitacion-boda.html','/terminos-del-servicio.html','/aviso-de-privacidad.html','/demos/posada/','/invitaciones/valentina-y-sebastian/','/invitaciones/personal/?token=fixture','/estudio/extra','/index.html','/'].map(path => ({ path, expected: null })),
];

test('ordered legacy routes keep exceptions, redirect seven pages and leave private URLs alone', () => {
  for (const row of routeCases) assert.deepEqual(resolvePreviewRoute(row.path, row.host || host, routes), row.expected, `${row.host || host}${row.path}`);
  for (const key of ['cleanUrls','redirects','rewrites']) assert.equal(config[key], undefined);
  const filesystem = routes.findIndex(r => r.handle === 'filesystem');
  assert.ok(routes.findIndex(r => r.headers?.Location === '/$1') < filesystem);
  assert.ok(routes.findIndex(r => r.dest === '/$1.html') < filesystem);
});

test('commercial links and SEO use clean routes while HTML files remain build inputs', () => {
  const files = execFileSync('git', ['ls-files','-z'], { encoding: 'utf8' }).split('\0').filter(f => f.endsWith('.html'));
  for (const file of files) {
    const source = readFileSync(file,'utf8');
    for (const [,href] of source.matchAll(/\bhref=["']([^"']+)["']/g)) {
      const url = new URL(href,'https://nordrastudio.mx/');
      if (url.hostname === host) assert.ok(!names.some(name => url.pathname === `/${name}.html`), `${file}: ${href}`);
    }
  }
  for (const name of names) {
    const html = readFileSync(`${name}.html`,'utf8');
    assert.ok(html.includes(`<link rel="canonical" href="https://nordrastudio.mx/${name}">`));
    assert.ok(html.includes(`<meta property="og:url" content="https://nordrastudio.mx/${name}">`));
    assert.ok(readFileSync('public/sitemap.xml','utf8').includes(`<loc>https://nordrastudio.mx/${name}</loc>`));
  }
});
