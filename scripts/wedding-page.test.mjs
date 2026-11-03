import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { renderOccasionPage } from '../build/occasion-content.mjs';
import { invitationMoney, invitationOffers, invitationPlanFeatures } from '../src/data/invitationPricing.ts';

const page = name => renderOccasionPage(readFileSync(name + '.html', 'utf8'));
const wedding = page('bodas');

test('Bodas has a single three-tab sample, legacy anchors and the actual dashboard', () => {
  assert.doesNotMatch(wedding, /class="[^"]*wedding-atelier/);
  for (const id of ['bodas-event-experience','event-experience','bodas-respuesta','panel-boda']) {
    assert.equal(wedding.split('id="' + id + '"').length, 2);
  }
  assert.equal(wedding.match(/role="tab"/g).length, 3);
  for (const match of wedding.matchAll(/role="tab" id="([^"]+)" aria-controls="([^"]+)"/g)) {
    assert.ok(wedding.includes(`id="${match[2]}" role="tabpanel" aria-labelledby="${match[1]}"`));
  }
  assert.match(wedding, /href="\/panel-boda.html"><img src="\/artwork\/wedding-dashboard-preview\/dashboard-v3-es-760.webp"/);
  assert.match(wedding, /No se envían datos ni se guardan respuestas/);
});

test('Bodas shows both catalogue prices before each disclosure and keeps the complete plan inside', () => {
  assert.doesNotMatch(wedding, /plan-comparison|Qué incluyen los paquetes/);
  for (const offer of invitationOffers) {
    const article = wedding.split('id="bodas-plan-' + offer.id + '"')[1].split('</article>')[0];
    const [visible, detail] = article.split('<details');
    assert.ok(visible.includes('<strong>' + invitationMoney(offer.cents) + '</strong>'));
    assert.ok(visible.match(/<s [^>]*>([^<]+)<\/s>/)[1].includes(invitationMoney(offer.regularCents)));
    assert.ok(visible.includes(offer.delivery));
    assert.equal(visible.match(/<li>/g).length, 3);
    assert.ok(invitationPlanFeatures[offer.id].every(feature => detail.includes(feature)));
  }
  assert.match(wedding, /class="faq-answer"><p>[^<]*50% de anticipo; el resto, al aprobar y antes de publicar/);
  assert.match(wedding, /<summary>Servicios adicionales/);
});

for (const name of ['cumpleanos','eventos']) test(name + ' retains its comparison and original package disclosures', () => {
  const html = page(name);
  assert.match(html, /class="plan-comparison"/);
  assert.equal(html.match(/class="web-option invitation-plan"/g).length, 2);
  assert.doesNotMatch(html, /class="wedding-plan-grid"/);
});
