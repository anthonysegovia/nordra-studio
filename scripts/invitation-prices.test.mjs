import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {invitationOffers, invitationMoney, seasonalPanelOffer} from '../src/data/invitationPricing.ts';
import {renderOccasionPage} from '../build/occasion-content.mjs';
import {renderInvitationPage} from '../build/invitation-offers.mjs';
import {renderInvitationTerms} from '../build/invitation-terms.mjs';
import {checkInvitationPrices} from './check-invitation-prices.mjs';
test('new fixed prices, essential scope and three plans render without promotional references',()=>{
 assert.deepEqual(invitationOffers.map(o=>[o.id,invitationMoney(o.cents)]),[['esencial','$399'],['aurora','$999'],['boreal','$1,499']]);
 assert.equal(seasonalPanelOffer.cents,invitationOffers.find(o=>o.id==='aurora').cents);
 for(const page of ['bodas','cumpleanos','eventos','invitaciones','temporada']) checkInvitationPrices(renderInvitationPage(renderOccasionPage(readFileSync(page+'.html','utf8'))),page==='temporada');
 for(const prefix of ['', 'en/']) {
  const terms=renderInvitationTerms(readFileSync(`public/${prefix}terminos-del-servicio.html`,'utf8'));
  for(const offer of invitationOffers) assert.ok(terms.includes(invitationMoney(offer.cents)));
  assert.doesNotMatch(terms,/\{\{offer:|precio regular|opening offer|regular price/i);
 }
});
