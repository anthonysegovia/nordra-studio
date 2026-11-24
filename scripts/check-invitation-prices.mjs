import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {invitationOffers, invitationMoney, seasonalOffer, seasonalPanelOffer} from '../src/data/invitationPricing.ts';
export function checkInvitationPrices(html, seasonal = false, english = false) {
  const offers=seasonal ? [seasonalOffer,seasonalPanelOffer] : invitationOffers;
  for(const offer of offers) assert.ok(html.includes(invitationMoney(offer.cents)),offer.id);
  assert.doesNotMatch(html, /\$(?:1,999|2,999|5,999|599)\b|Precio de apertura|precio regular|Introductory price|regular price|regularCents/i);
  assert.doesNotMatch(html, /\{\{(?:offer|occasion|invitations):/);
  const cards=[...html.matchAll(/<article class="invite-card[^]*?<\/article>/g)].map(m=>m[0]);
  assert.equal(cards.length, offers.length);
  for(const card of cards) assert.doesNotMatch(card,/<s[ >]|(?:desde|from)\s*<strong>/i);
  assert.ok(cards[0].includes(english ? 'No dashboard or RSVP per person' : 'Sin panel ni confirmación por persona'));
}
if(process.argv[1]?.endsWith('check-invitation-prices.mjs')) {
 for(const prefix of ['', 'en/']) for(const page of ['bodas','cumpleanos','eventos','invitaciones','temporada']) {
  checkInvitationPrices(readFileSync(`dist/${prefix}${page}.html`,'utf8'),page==='temporada',!!prefix);
 }
 for(const prefix of ['', 'en/']) {
  const terms=readFileSync(`dist/${prefix}terminos-del-servicio.html`,'utf8');
  for(const offer of invitationOffers) assert.ok(terms.includes(invitationMoney(offer.cents)));
  assert.doesNotMatch(terms,/\{\{offer:|Precio de apertura|precio regular|opening offer|regular price|\$(?:1,999|2,999|5,999)\b/i);
 }
 console.log('Precios compilados ES/EN: 399 / 999 / 1,499; Temporada 399 / 999; sin apertura ni precios regulares');
}
