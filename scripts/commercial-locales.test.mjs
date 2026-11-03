import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {translatedPages, translatedPageOutput} from '../build/translated-pages.mjs';
import {renderBusinessContent} from '../build/business-content.mjs';
import {renderBusinessOffers} from '../build/business-offers.mjs';
import {renderInvitationPage} from '../build/invitation-offers.mjs';
import {renderOccasionPage} from '../build/occasion-content.mjs';
import {renderSeasonalPage} from '../build/seasonal-page.mjs';
import {mobileWhatsApp} from '../build/mobile-whatsapp.mjs';
import {buttonIds} from '../src/site/analytics/policy.js';
import {businessOffers,businessMoney} from '../src/data/businessOffers.ts';
import {invitationOffers,invitationMoney} from '../src/data/invitationPricing.ts';

const render=translatedPageOutput().transformIndexHtml.handler;
const origin='https://nordrastudio.mx';
for(const page of translatedPages){
 test(`${page}: equivalent routes, anchors, prices and English contact links`,()=>{
   const file=(page==='aviso-de-privacidad'?'public/':'')+page+'.html';
   const source=[renderOccasionPage,renderSeasonalPage,renderBusinessContent,renderBusinessOffers,renderInvitationPage,mobileWhatsApp]
     .reduce((html,fn)=>fn(html),readFileSync(file,'utf8'));
   const en=render(source,{path:'/en/'+page+'.html'}),es=render(source,{path:'/'+page+'.html'});
   for(const [html,path,language] of [[en,'/en/'+page,'en'],[es,'/'+page,'es-MX']]){
     assert.ok(html.includes('<html lang="'+language+'"'));
     assert.ok(html.includes('rel="canonical" href="'+origin+path+'"'));
     for(const [lang,prefix] of [['en','/en'],['x-default',''],['es-MX','']])assert.ok(html.includes('hreflang="'+lang+'" href="'+origin+prefix+'/'+page+'"'));
     assert.ok(html.includes('"inLanguage":"'+language+'"'));
   }
   const ids=html=>[...html.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
   assert.deepEqual(ids(en),ids(es));
   const links=[...en.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map(m=>m[1]);
   for(const href of links){
     if(href.startsWith('https://wa.me/'))assert.match(new URL(href).searchParams.get('text'),/^Hi[,!]/);
     if(href.startsWith('/')&&!href.startsWith('/en/')&&!['/'+page,'/panel-boda.html','/panel-cumple.html','/panel-evento.html','/terminos-del-servicio.html'].includes(href)){
       assert.match(href,/^\/(?:demos|invitaciones)\/|^\/panel-(?:boda|cumple|evento)\.html\?/);
     }
   }
   for(const match of en.matchAll(/data-analytics-whatsapp="([^"]+)"/g))assert.ok(buttonIds.includes(match[1]),match[1]);
   const prose=en.replace(/<(script|style|blockquote)\b[^>]*>[\s\S]*?<\/\1>/gi,'').replace(/<[^>]+>/g,' ');
   assert.doesNotMatch(prose,/\b(?:negocios|invitaciones|tu proyecto|conoce|platiquemos|cotizar|vestimenta|asistencia)\b/i);
   if(page==='negocios')for(const offer of businessOffers){
     const tag=en.match(new RegExp('<a [^>]*data-offer="'+offer.id+'"[^>]*>'))[0];
     assert.ok(decodeURIComponent(tag).includes(businessMoney(offer.cents)+' MXN'));
   }
   if(page==='invitaciones')for(const offer of invitationOffers)assert.ok(en.includes(invitationMoney(offer.cents)));
   if(page==='aviso-de-privacidad')assert.ok(en.includes('This is a translation for convenience; the Spanish version is the legally binding one'));
 });
}
