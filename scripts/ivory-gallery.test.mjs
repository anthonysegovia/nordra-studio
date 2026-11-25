import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { createRequire } from 'node:module';
import { readFileSync, existsSync } from 'node:fs';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

const require = createRequire(import.meta.url);
async function compile(file) {
 const result=await build({entryPoints:[file],bundle:true,platform:'node',format:'cjs',packages:'external',write:false,jsx:'automatic'});
 const module={exports:{}};
 new Function('require','module','exports',result.outputFiles[0].text)(require,module,module.exports);
 return { ...module.exports, compiled:result.outputFiles[0].text };
}
const extras=await compile('src/components/IvoryExtras.tsx');
const gallery=await compile('src/components/IvoryGallery.tsx');
const photo=await compile('src/components/WeddingEditorialPhoto.tsx');
const html=[extras.IvoryStory,gallery.IvoryGallery,extras.IvoryCalendar,extras.IvoryTravelNotes,extras.IvoryQuestions,extras.IvoryGifts,extras.IvoryAlbum].map(c=>renderToStaticMarkup(createElement(c))).join('');

test('compiled ivory sections preserve exact titles, emphasis and último tamal',()=>{
 for(const title of ['Ocho años en <em>cuatro líneas</em>','De trescientas, nos <em>quedamos</em> con seis','Seguimos con las <em>dos sillas</em>','El fotógrafo no va a ver <em>todo</em>'])assert.ok(html.includes(title),title);
 assert.match(html,/el último tamal/);
 assert.doesNotMatch(html,/ultimo tamal|últimó tamal|último támál/);
 assert.match(html,/<ol class="iv-story-line">/);
 assert.equal((html.match(/aria-expanded="false"/g)||[]).length,5);
});
test('all six compiled gallery images have bilingual alternatives and real responsive assets',()=>{
 assert.equal(gallery.ivoryGallery.length,6);
 for(const item of gallery.ivoryGallery){
  assert.ok(html.includes(item.caption));
  for(const english of [false,true]){
   const image=renderToStaticMarkup(createElement(photo.WeddingEditorialPhoto,{shot:item.shot,english}));
   assert.match(image,/alt="[^"]{20,}"/);assert.match(image,/loading="lazy"/);
   assert.match(image,/width="\d+" height="\d+"/);
   const set=image.match(/srcSet="([^"]+)"/)[1];
   for(const path of set.split(', ').map(s=>s.split(' ')[0]))assert.ok(existsSync('public'+path),path);
  }
 }
});
test('calendar links encode the approved event and sample destinations stay empty',()=>{
 const url=new URL(html.match(/href="(https:\/\/calendar.google.com[^\"]+)"/)[1].replaceAll('&amp;','&'));
 assert.equal(url.searchParams.get('text'),'Boda de Valentina y Sebastián');
 assert.equal(url.searchParams.get('dates'),'20270619T230000Z/20270620T070000Z');
 assert.equal(url.searchParams.get('location'),'Ciudad de México');
 assert.match(html,/href="\/invitaciones\/valentina-y-sebastian\/fecha.ics"/);
 assert.match(readFileSync('public/invitaciones/valentina-y-sebastian/fecha.ics','utf8'),/20270619T230000Z/);
 const links=[...html.matchAll(/href="([^"]+)"/g)].map(m=>m[1]);
 assert.equal(links.length,2,'No store, bank or sample external destinations');
 assert.equal(extras.ivoryExtrasConfig.giftsHref,null);assert.equal(extras.ivoryExtrasConfig.albumHref,null);
 assert.match(html,/Se abre el 20 de junio/);
});
test('compiled countdown handles minute precision, the ceremony and the next day',()=>{
 assert.deepEqual(extras.ivoryCountdown(Date.parse('2027-06-18T16:28:00-06:00')),{days:1,hours:0,minutes:32});
 assert.deepEqual(extras.ivoryCountdown(Date.parse('2027-06-19T17:00:00-06:00')),{message:'Hoy es el día'});
 assert.deepEqual(extras.ivoryCountdown(Date.parse('2027-06-20T00:00:00-06:00')),{message:'Ya nos casamos. Gracias por venir'});
});
