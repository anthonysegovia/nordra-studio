import test from 'node:test';
import {renderInvitation} from '../src/celebrations/numero-que-flota/template.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildInputs} from './check-vercel-build-inputs.mjs';
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
for(const [page,entry,slug] of [['cumpleanos','birthdays','camila-30'],['eventos','events','conexion-27']]){
 const html=read(page+'.html'),hero=html.slice(html.indexOf('<div class="occasion-hero '),html.indexOf('<section class="home-continuation wedding-sample'));
 test(`${page}: hero cannot regress to a conceptual poster`,()=>{
  assert.doesNotMatch(hero,/organico|occasion-poster|organic-poster/);assert.match(hero,/live-phone nordra-phone/);assert.match(hero,/fetchpriority="high"/);assert.match(hero,/loading="eager"/);assert.match(hero,/width="780" height="1688"/);
 });
 test(`${page}: try link opens the right invitation using the shared controller`,()=>{
  assert.match(hero,new RegExp(`href="/invitaciones/${slug}/" data-live-try="[^"]+">Pruébala aquí`));assert.match(hero,/Un diseño de Nordra/);assert.ok(hero.includes(slug==='camila-30'?'/artwork/birthday-noche/camila-portada-780.webp':'/artwork/invitation-covers/conexion-27.webp'));assert.doesNotMatch(hero,/<iframe/);
  const entryText=read(`src/site/entries/${entry}.js`);for(const css of ['phone-frame','showcase-live','occasion-live'])assert.ok(entryText.includes(`../styles/${css}.css`));assert.ok(entryText.includes(`../scripts/showcase-live.js?entry=${entry}`));assert.match(read('src/site/scripts/showcase-live.js'),new RegExp(`data-view="${page}"`));
 });
}
test('Camila keeps the approved message only on the cover',()=>{const html=renderInvitation(read('invitaciones/camila-30/index.html'));assert.equal(html.split('Mi noche favorita empieza contigo').length-1,1);assert.match(html,/Lo mejor es celebrarlo contigo/);});
test('retired poster styles and assets are absent from deploy inputs',()=>{
 assert.doesNotMatch(read('src/site/styles/scene.css'),/occasion-poster|organic-poster|birthday-poster|event-poster/);
 const inputs=buildInputs(fileURLToPath(root));
 for(const page of ['cumpleanos','eventos']){const file=`public/nordra/v541/assets/${page}-organico-5-33.webp`;assert.equal(inputs.includes(file),false);assert.equal(fs.existsSync(new URL(file,root)),false);}
 for(const file of ['birthday-noche/camila-portada-390.webp','birthday-noche/camila-portada-780.webp','invitation-covers/conexion-27.webp'])assert.ok(inputs.includes('public/artwork/'+file));
});
