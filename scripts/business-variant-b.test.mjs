import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderBusinessContent } from '../build/business-content.mjs';
import { renderBusinessOffers } from '../build/business-offers.mjs';
const source = readFileSync('negocios.html', 'utf8').replaceAll('\r\n', '\n');
// Exact content captured before moving the approved sections. This fixture
// protects their wording, detail controls and demo links while allowing reordering.
const approved = JSON.parse(readFileSync('scripts/fixtures/business-variant-b.json', 'utf8'));

test('business variant B puts benefits and source-driven prices before the single Signature light table', () => {
  const html = renderBusinessOffers(renderBusinessContent(source));
  const order = ['class="business-head"', 'class="business-benefits"', 'id="opciones-web"', 'class="business-guarantees"', 'class="offer-guide', 'id="proyectos"', 'class="business-trust"', 'id="negocios-preguntas"', 'id="proceso"', 'id="contacto-negocios"'];
  const positions = order.map(marker => html.indexOf(marker));
  assert.ok(positions.every(i => i >= 0), JSON.stringify(order.filter((_, i) => positions[i] < 0)));
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
  assert.equal((source.match(/class="light-table scroll-scrub"/g) || []).length, 1);
  assert.equal((source.match(/class="case-index"/g) || []).length, 1);
  for (const name of ['sobremesa','nitida']) assert.equal((source.match(new RegExp(`id="caso-${name}"`, 'g')) || []).length, 1);
  assert.doesNotMatch(source, /class="business-cases|class="design-case|class="case-story |id="(?:sobremesa|nitida)-story-title"|EL DISEÑO, POR DENTRO/);
  assert.equal((source.match(/\{\{business:offers\}\}/g) || []).length, 1);
  assert.equal((source.match(/\{\{business:faq\}\}/g) || []).length, 1);
});

test('the light table integrates approved case details, key points, demo links and disclaimers without duplicating the stories', () => {
  for (const fragment of [approved.benefits]) assert.ok(source.includes(fragment));
  for (const [i,name] of ['sobremesa','nitida'].entries()) {
    const article=approved.articles[i];
    assert.ok(source.includes(article),name);
    assert.ok(source.includes(approved.introductions[i]),name);
    assert.equal((article.match(/class="case-decision"/g)||[]).length,3);
    const links=[...article.matchAll(/class="case-test-link" href="([^"]+)"/g)].map(match=>match[1]);
    const anchors=name==='sobremesa'?['bodega','bodega','bodega']:['visita','precios','agenda'];
    assert.deepEqual(links,anchors.map(anchor=>'/demos/'+name+'/#'+anchor));
    assert.ok(article.includes(name==='sobremesa'?'href="#offer-immersive"':'href="#offer-business"'));
  }
  for (const text of ['CAFETERÍA · EXPERIENCIA INMERSIVA','CLÍNICA DE LA VISTA · SITIO DE NEGOCIO','Cafetería ficticia, sin pedidos ni cobros reales.','Clínica ficticia, sin atención médica ni citas reales.']) assert.ok(source.includes(text));
  assert.equal((source.match(/Ver el caso de diseño/g)||[]).length,2);
  assert.equal((source.match(/Ver el caso completo/g)||[]).length,2);
  assert.doesNotMatch(source, /<iframe\b/);
  for(const name of ['flor','bodega']) assert.ok(source.includes('/nordra/v546/assets/sobremesa-'+name+'-1100.webp'));
  assert.match(source, /class="feature-heading" href="#sobremesa-diseno"/);
});

test('the studio owns the profile and business links there after the light table', () => {
  const studio = readFileSync('estudio.html', 'utf8');
  assert.match(studio, /id="quien-esta-detras"[^>]*>[\s\S]*?Quién está detrás[\s\S]*?Hablas con quien diseña y programa tu proyecto/);
  assert.doesNotMatch(source, /id="quien-esta-detras"|>Quién está detrás</);
  assert.match(source, /href="\/estudio#quien-esta-detras"/);
  for(const text of ['Tu web, preparada para celular desde el diseño','Precios publicados y cotización por escrito','Factura (CFDI)']){
    assert.ok(renderBusinessOffers(source).includes(text));
    assert.ok(!studio.includes(text));
  }
});

for(const [oldPath,newPath] of [['cafe-nordra','sobremesa'],['lumina','nitida']]){
  test(`la ruta de ${oldPath} redirige a ${newPath} con o sin parámetros`, () => {
    const { routes } = JSON.parse(readFileSync('vercel.json','utf8'));
    const redirect = routes.find(route => route.headers?.Location === `/demos/${newPath}/`);
    assert.equal(redirect.status,308);
    const pattern = new RegExp(redirect.src);
    for(const suffix of ['', '/', '/index.html']){
      for(const search of ['', '?lang=es']){
        assert.ok(pattern.test(new URL(`https://example.test/demos/${oldPath}${suffix}${search}`).pathname));
      }
    }
    assert.ok(!pattern.test(`/demos/${oldPath}/assets/foto.webp`));
  });
}
