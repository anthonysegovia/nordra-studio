import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderBusinessContent } from '../build/business-content.mjs';
import { renderBusinessOffers } from '../build/business-offers.mjs';
const source = readFileSync('negocios.html', 'utf8').replaceAll('\r\n', '\n');
// Exact content captured before moving the approved sections. This fixture
// protects their wording, detail controls and demo links while allowing reordering.
const approved = JSON.parse(readFileSync('scripts/fixtures/business-variant-b.json', 'utf8'));

test('business variant B puts benefits and source-driven prices before a single case collection', () => {
  const html = renderBusinessOffers(renderBusinessContent(source));
  const order = ['class="business-head"', 'class="business-benefits"', 'id="opciones-web"', 'class="offer-guide', 'id="proyectos"', 'id="quien-esta-detras"', 'id="negocios-preguntas"', 'id="proceso"', 'id="contacto-negocios"'];
  const positions = order.map(marker => html.indexOf(marker));
  assert.ok(positions.every(i => i >= 0), JSON.stringify(order.filter((_, i) => positions[i] < 0)));
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
  assert.equal((source.match(/class="business-cases"/g) || []).length, 1);
  for (const name of ['bruma','lumina']) assert.equal((source.match(new RegExp(`id="caso-${name}"`, 'g')) || []).length, 1);
  assert.doesNotMatch(source, /class="light-table|class="case-index|data-light-case=/);
  assert.equal((source.match(/\{\{business:offers\}\}/g) || []).length, 1);
  assert.equal((source.match(/\{\{business:faq\}\}/g) || []).length, 1);
});

test('unified cases preserve every approved introduction, complete case, demo disclaimer and direct-contact content', () => {
  for (const fragment of [...approved.articles, ...approved.introductions, approved.person, approved.benefits]) assert.ok(source.includes(fragment));
  assert.match(source, /id="bruma-diseno"/);
  assert.match(source, /id="lumina-diseno"/);
});

