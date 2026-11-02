import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderLocaleHome } from '../build/commercial-locales.mjs';
import { renderHomeClientHighlights } from '../build/client-cases.mjs';
import { mobileWhatsApp } from '../build/mobile-whatsapp.mjs';
import { clientCases } from '../src/data/clientCases.ts';

const template=readFileSync('index.html','utf8');
const render=en=>mobileWhatsApp(renderHomeClientHighlights(renderLocaleHome(template,en)));
const stripScripts=html=>html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi,'');
test('both home documents have matching section IDs, reciprocal alternates and their own canonical',()=>{
  const es=render(false),en=render(true);
  for(const [html,lang,path] of [[es,'es-MX','/'],[en,'en','/en/']]){
    assert.ok(html.includes(`<html lang="${lang}"`));
    assert.ok(html.includes(`rel="canonical" href="https://nordrastudio.mx${path}"`));
    for(const [language,url] of [['es-MX','/'],['en','/en/'],['x-default','/']]){
      assert.ok(html.includes(`hreflang="${language}" href="https://nordrastudio.mx${url}"`));
    }
    assert.ok(html.includes(`"inLanguage":"${lang}"`));
    assert.equal((html.match(/role="group" aria-label="(?:Idioma|Language)"/g)||[]).length,2);
  }
  const ids=html=>[...stripScripts(html).matchAll(/\bid="([^"]+)"/g)].map(m=>m[1]);
  assert.deepEqual(ids(en),ids(es));
  assert.ok(readFileSync('public/sitemap.xml','utf8').includes('<loc>https://nordrastudio.mx/en/</loc>'));
});

test('English home localizes commercial links and WhatsApp, keeps sample URLs and quotes verbatim',()=>{
  const html=stripScripts(render(true));
  const hrefs=[...html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m=>m[1]);
  for(const href of hrefs.filter(h=>h.startsWith('/'))){
    assert.ok(href.startsWith('/en/') || ['/', '/demos/nitida/','/demos/sobremesa/','/invitaciones/valentina-y-sebastian/','/terminos-del-servicio.html'].includes(href),href);
  }
  const messages=hrefs.filter(h=>h.startsWith('https://wa.me')).map(h=>new URL(h).searchParams.get('text'));
  assert.equal(messages.length,2);assert.ok(messages.every(message=>message.startsWith('Hi, Nordra.')));
  assert.equal((html.match(/Demo in Spanish/g)||[]).length,3);
  for(const item of clientCases.filter(c=>c.highlight)){
    assert.ok(html.includes(`<blockquote lang="es-MX"><p>${item.highlight}</p>`));
    assert.ok(html.includes(item.displayName));
  }
  const prose=html.replace(/<blockquote[^>]*>[\s\S]*?<\/blockquote>/g,'').replace(/<[^>]+>/g,' ');
  assert.doesNotMatch(prose,/\b(?:páginas|negocios|invitaciones|contigo|clínica|contacto|platiquemos|conoce)\b/i);
  assert.match(prose,/Your idea,\s+made into a website or invitation/);
});
