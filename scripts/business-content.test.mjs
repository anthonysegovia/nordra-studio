import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { businessOffers, businessHosting, businessMoney } from '../src/data/businessOffers.ts';
import { businessFAQs, renderBusinessContent, jsonLD } from '../build/business-content.mjs';
import { renderBusinessOffers } from '../build/business-offers.mjs';
const source=readFileSync(new URL('../negocios.html',import.meta.url),'utf8');
const rendered=renderBusinessOffers(renderBusinessContent(source));
const schemas=[...rendered.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(m=>JSON.parse(m[1]));
test('FAQPage contains exactly the eight visible answers from the same source',()=>{
 const faq=schemas.find(s=>s['@type']==='FAQPage');assert.equal(faq.mainEntity.length,8);
 const section=rendered.match(/<section[^>]+id="negocios-preguntas"[\s\S]*?<\/section>/)[0];
 const visible=[...section.matchAll(/<summary><span>(.*?)<\/span>[\s\S]*?<div class="faq-answer"><p>([\s\S]*?)<\/p>/g)].map(m=>({question:m[1],answer:m[2].replace(/<[^>]+>/g,'')}));
 assert.deepEqual(visible,businessFAQs.map(({question,answer})=>({question,answer})));
 assert.deepEqual(faq.mainEntity.map(q=>({question:q.name,answer:q.acceptedAnswer.text})),visible);
 for(const offer of businessOffers)assert.ok(businessFAQs[3].answer.includes(offer.delivery.toLowerCase()));
 for(const host of businessHosting)assert.ok(businessFAQs[5].answer.includes(businessMoney(host.terms.find(t=>t.months===1).cents)));
});
test('each service has the source minimum, MXN, VAT and the existing business identity',()=>{
 const graph=schemas.find(s=>s['@graph'])['@graph'];assert.equal(graph.length,businessOffers.length);
 graph.forEach((service,i)=>{const offer=businessOffers[i];assert.equal(service['@type'],'Service');assert.equal(service.name,offer.name);assert.equal(service.provider['@id'],'https://nordrastudio.mx/#negocio');assert.equal(service.offers['@type'],'Offer');assert.deepEqual(service.offers.priceSpecification,{'@type':'PriceSpecification',minPrice:offer.cents/100,priceCurrency:'MXN',valueAddedTaxIncluded:true});assert.match(service.offers.url,/https:\/\/nordrastudio.mx\/negocios#offer-/);});
 assert.ok(!rendered.includes('{{business:'));assert.equal(JSON.parse(jsonLD({text:'</script>'}).match(/>(.*)</)[1]).text,'</script>');assert.ok(!jsonLD({text:'</script>'}).includes('"</script>"'));
});
test('delivery appears on every quote and the business hero title stays intact',()=>{
 for(const offer of businessOffers)assert.ok(rendered.includes('data-delivery="'+offer.id+'">'+offer.delivery));
 assert.match(rendered,/<title>Diseño de páginas web en Monterrey · Nordra Studio<\/title>/);
 assert.match(rendered,/id="business-title"[^>]*><span class="business-title-static">Tu visión,/);
});
