import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { enhancePage, lastModified, sitemapSource } from '../build/site-trust.mjs';

const routes=JSON.parse(readFileSync('vercel.json','utf8')).routes;
test('security headers continue before all host and filesystem rules',()=>{
  const rule=routes[0], h=rule.headers;
  assert.equal(rule.src,'/(.*)'); assert.equal(rule.continue,true);
  assert.equal(h['X-Content-Type-Options'],'nosniff');
  assert.equal(h['Referrer-Policy'],'strict-origin-when-cross-origin');
  assert.equal(h['X-Frame-Options'],'SAMEORIGIN');
  assert.equal(h['Permissions-Policy'],'camera=(self), microphone=(), geolocation=(), payment=(), usb=()');
  assert.match(h['Content-Security-Policy-Report-Only'],/frame-ancestors 'self'/);
  for(const origin of ['https://fonts.googleapis.com','https://fonts.gstatic.com','https://va.vercel-scripts.com','https://vitals.vercel-insights.com','https://www.google.com','https://wa.me','https://www.mercadopago.com.mx']) assert.ok(h['Content-Security-Policy-Report-Only'].includes(origin));
  assert.equal(h['Content-Security-Policy'],undefined);
});
test('404 comes after the filesystem and does not replace valid routes',()=>{
  const index=routes.findIndex(r=>r.status===404);
  assert.ok(index>routes.findIndex(r=>r.handle==='filesystem'));
  assert.equal(routes[index-1].handle,'error');
  assert.deepEqual(routes[index],{src:'^(?!/api/).*$',status:404,dest:'/404.html'});
  assert.ok(!new RegExp(routes[index].src).test('/api/weddings'));
});
test('shared head and first focusable skip link preserve existing main targets',()=>{
  const html=enhancePage('<html><head></head><body><header><a href="/">Home</a></header><main id="content">Hi</main><a href="/terminos-del-servicio.html">Terms</a></body></html>','en/index.html');
  assert.match(html,/<body><a class="nordra-skip-link" href="#content">Skip to content/);
  assert.match(html,/<main id="content" tabindex="-1">/);
  assert.match(html,/href="\/en\/terminos-del-servicio"/);
  assert.match(html,/rel="apple-touch-icon"/);
  assert.match(enhancePage('<head></head><body><main></main></body>','index.html'),/href="#nordra-content">Saltar al contenido/);
});
test('sitemap dates use source history and a build-date fallback',()=>{
  assert.match(lastModified(['index.html']),/^\d{4}-\d{2}-\d{2}$/);
  assert.equal(lastModified(['does-not-exist-fixture'],'2026-11-07'),'2026-11-07');
  assert.deepEqual(sitemapSource('/en/negocios'),['negocios.html','src/i18n/negocios.en.json']);
});
