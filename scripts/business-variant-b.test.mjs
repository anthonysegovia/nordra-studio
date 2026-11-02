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
  const order = ['class="business-head"', 'class="business-benefits"', 'id="opciones-web"', 'class="offer-guide', 'id="proyectos"', 'id="quien-esta-detras"', 'id="negocios-preguntas"', 'id="proceso"', 'id="contacto-negocios"'];
  const positions = order.map(marker => html.indexOf(marker));
  assert.ok(positions.every(i => i >= 0), JSON.stringify(order.filter((_, i) => positions[i] < 0)));
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
  assert.equal((source.match(/class="light-table scroll-scrub"/g) || []).length, 1);
  assert.equal((source.match(/class="case-index"/g) || []).length, 1);
  for (const name of ['bruma','lumina']) assert.equal((source.match(new RegExp(`id="caso-${name}"`, 'g')) || []).length, 1);
  assert.doesNotMatch(source, /class="business-cases|class="design-case|class="case-story |id="(?:bruma|lumina)-story-title"|EL DISEÑO, POR DENTRO/);
  assert.equal((source.match(/\{\{business:offers\}\}/g) || []).length, 1);
  assert.equal((source.match(/\{\{business:faq\}\}/g) || []).length, 1);
});

test('the light table integrates approved case details, key points, demo links and disclaimers without duplicating the stories', () => {
  for (const fragment of [approved.person, approved.benefits]) assert.ok(source.includes(fragment));
  for (const [i,name] of ['bruma','lumina'].entries()) {
    const article=approved.articles[i];
    const points=article.match(/<ul class="case-brief-decisions">([\s\S]*?)<\/ul>/)[1];
    assert.ok(source.includes(`<ul class="light-table-key-points">${points}</ul>`));
    const demo=article.match(/<a class="case-brief-demo"[\s\S]*?<\/a>/)[0];
    assert.ok(source.includes(demo));
    const details=article.match(/<details class="business-disclosure case-full">[\s\S]*?<\/details>/)[0]
      .replace('<details class="business-disclosure case-full">',`<details class="business-disclosure case-full" id="${name}-diseno">`)
      .replace(/\s*<div class="case-story-top">[\s\S]*?<\/div>/,'');
    assert.ok(source.includes(details),name);
  }
  for (const text of ['CAFÉ & PAUSA · DEMO CONCEPTUAL','ESPACIO PARA CUIDAR · DEMO CONCEPTUAL','Cafetería ficticia. Sin pedidos ni cobros reales.','Clínica ficticia. Sin atención médica ni citas reales.']) assert.ok(source.includes(text));
  assert.equal((source.match(/Ver el caso de diseño/g)||[]).length,2);
  assert.equal((source.match(/Ver el caso completo/g)||[]).length,2);
  assert.match(source, /data-living-toggle="bruma"[^>]*disabled>Reproducir muestra/);
  assert.match(source, /<iframe class="bruma-film"[^>]*><\/iframe>/);
  assert.doesNotMatch(source.match(/<iframe class="bruma-film"[^>]*>/)[0], /\ssrc=/);
});
