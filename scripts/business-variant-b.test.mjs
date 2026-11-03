import { runInNewContext } from 'node:vm';
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderBusinessContent } from '../build/business-content.mjs';
import { renderBusinessOffers } from '../build/business-offers.mjs';
const source = readFileSync('negocios.html', 'utf8').replaceAll('\r\n', '\n');
const approved = JSON.parse(readFileSync('scripts/fixtures/business-variant-b.json', 'utf8'));

test('business sections lead from prices to examples, questions and contact', () => {
  const html = renderBusinessOffers(renderBusinessContent(source));
  const order = ['class="business-head"', 'class="business-benefits"', 'id="opciones-web"', 'class="offer-hosting"', 'id="proyectos"', 'class="business-trust"', 'id="negocios-preguntas"', 'id="proceso"', 'id="contacto-negocios"'];
  const positions = order.map(marker => html.indexOf(marker));
  assert.ok(positions.every(i => i >= 0));
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
  assert.doesNotMatch(source, /light-table|case-scenes|case-full|business:delivery|<iframe\b/);
  for(const marker of ['offers','faq']) assert.equal(source.split('{{business:'+marker+'}}').length,2);
  const benefits=source.match(/class="business-benefits"[\s\S]*?<\/section>/)[0];
  assert.deepEqual([...benefits.matchAll(/<h3>(.*?)<\/h3>/g)].map(m=>m[1]),approved.benefits);
});

test('four objectives share one feature stage and use only published work',()=>{
 const html=renderBusinessOffers('{{business:offers}}');
 assert.doesNotMatch(html,/guide-form|offers-grid|<section[^>]*id="guia-web"/);
 const choices=[...html.matchAll(/<input type="radio" name="web-goal" value="([^"]+)"( checked)?><strong>([^<]+)<\/strong>/g)];
 assert.deepEqual(Object.fromEntries(choices.map(m=>[m[1],m[3]])),approved.objectives);
 assert.deepEqual(choices.filter(m=>m[2]).map(m=>m[1]),['business']);
 const rows=[...html.matchAll(/<a class="offer-row"[^>]+>/g)].map(m=>m[0]);
 assert.equal(rows.filter(row=>!row.endsWith(' hidden>')).length,3);
 assert.ok(rows.every(row=>row.includes('https://wa.me/')));
 const images=[...html.matchAll(/<img src="([^"]+)"[^>]+>/g)].map(m=>m[1]);
 assert.deepEqual(images.sort(),approved.examples.map(o=>'/nordra/'+o.image).sort());
});
test('three whole example cards link to the demos and share one notice', () => {
  const gallery=source.match(/<section class="business-examples"[\s\S]*?<\/section>/)[0];
  const cards=[...gallery.matchAll(/<a class="example-card"[\s\S]*?<\/a>/g)];
  assert.equal(cards.length,approved.examples.length);
  cards.forEach(([card],i)=>{
    const {slug,name,image,caption}=approved.examples[i];
    for(const fragment of [`id="caso-${slug}"`,`href="/demos/${slug}/"`,'target="_blank"','rel="noopener"',`src="/nordra/${image}"`,`<h3>${name}</h3>`,caption,'Ver demo']) assert.ok(card.includes(fragment), fragment);
  });
  assert.equal(gallery.split(approved.notice).length,2);
});

test('old case and design hashes select the right card and bring the gallery into view', () => {
  const arrive=source.match(/function arrive\(id\)[\s\S]+?\n}/)[0];
  for(const {slug} of approved.examples){
    const track={clientLeft:0,scrollTo({left}){assert.equal(left,160);}};
    for(const hash of ['caso-'+slug,slug+'-diseno',...(slug==='sobremesa'?['universos']:[])]){
      let scrolled=false;
      const gallery={scrollIntoView(){scrolled=true;}};
      const target={matches:()=>true,parentElement:track,offsetLeft:160,closest:sel=>sel==='section'?gallery:null};
      const document={getElementById(id){assert.equal(id,'caso-'+slug);return target;}};
      runInNewContext(arrive+';arrive(hash)',{document,hash});
      assert.ok(scrolled);
    }
  }
});

test('the studio owns the profile and business links there beside the examples', () => {
  const studio = readFileSync('estudio.html', 'utf8');
  assert.match(studio, /id="quien-esta-detras"[^>]*>[\s\S]*?Quién está detrás[\s\S]*?Hablas con quien diseña y programa tu proyecto/);
  assert.doesNotMatch(source, /id="quien-esta-detras"|>Quién está detrás</);
  assert.match(source, /href="\/estudio#quien-esta-detras"/);

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
