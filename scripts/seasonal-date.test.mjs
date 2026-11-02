import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';
import {seasons,upcomingSeason} from '../src/data/invitationPricing.ts';
import {seasonOrder,inOrderingWindow,returnMessage} from '../src/seasonal/order.mjs';
import {renderSeasonalPage} from '../build/seasonal-page.mjs';
const root=fileURLToPath(new URL('../',import.meta.url)),read=file=>fs.readFileSync(path.join(root,file),'utf8');
for(const [month,day,first] of [[8,31,'halloween'],[9,1,'halloween'],[10,24,'halloween'],[10,25,'posadas'],[11,1,'posadas'],[12,15,'posadas'],[12,16,'fin-de-ano'],[12,28,'fin-de-ano'],[12,29,'halloween'],[1,1,'halloween']]){
 test(`visitor date ${month}/${day}: same selection as upcomingSeason, approved Halloween exception`,()=>{const date=new Date(2027,month-1,day),ordered=seasonOrder(date);assert.equal(ordered[0],upcomingSeason(date));assert.equal(ordered[0].id,first);assert.deepEqual(ordered.map(s=>s.id),first==='halloween'?['halloween','posadas','fin-de-ano']:first==='posadas'?['posadas','fin-de-ano','halloween']:['fin-de-ano','posadas','halloween']);});
}
test('return notice derives the month from the canonical source',()=>{assert.equal(returnMessage(seasons[0]),'Vuelve en septiembre');assert.equal(returnMessage({...seasons[0],order:{from:[7,1],to:[7,30]}}),'Vuelve en julio');assert.ok(inOrderingWindow(seasons[0],new Date(2027,8,15)));assert.ok(!inOrderingWindow(seasons[0],new Date(2027,10,1)));});
test('ordering windows may only be declared in invitationPricing.ts',()=>{
 const files=[];function walk(dir){for(const e of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())walk(file);else if(/\.(?:[cm]?[jt]sx?|html)$/.test(file))files.push(file);}}walk('src');walk('build');files.push('temporada.html');
 const windows=/(?:from|to)\s*:\s*\[\s*\d+\s*,\s*\d+\s*\]/g;for(const file of files)if(file.replaceAll('\\','/')!=='src/data/invitationPricing.ts')assert.doesNotMatch(read(file),windows,`${file} duplicates a seasonal date window`);
 assert.match(read('src/seasonal/order.mjs'),/upcomingSeason\(date\)/);assert.doesNotMatch(read('src/seasonal/prepaint.js'),/\b(?:901|1024|1025|1215|1216|1228)\b/);
});
test('only the seasonal HTML changes; dates are compiled and no-JS fallback remains usable',()=>{
 assert.equal(renderSeasonalPage('<p>untouched</p>'),'<p>untouched</p>');const html=renderSeasonalPage(read('temporada.html'));assert.doesNotMatch(html,/\{\{seasonal:/);assert.match(html,/data-season-return hidden/);assert.match(html,/<noscript><img src="\/nordra\/v545\/assets\/inv-season-halloween-780.webp"/);assert.match(html,/fetchpriority="high"/);
 const hero=html.slice(html.indexOf('<div class="seasonal-hero">'),html.indexOf('<nav class="seasonal-route"'));assert.doesNotMatch(hero.replace(/<noscript>[\s\S]*?<\/noscript>/g,''),/<img[^>]*\bsrc=/);assert.ok(html.indexOf('prepareNordraSeason?.()')>html.indexOf('id="temporada-fin-de-ano"'));assert.match(read('src/site/styles/seasonal-page.css'),/html\[data-season-preparing\] body\{visibility:hidden\}/);
});
