import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync, existsSync} from 'node:fs';
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pages=[['negocios','business','right'],['invitaciones','invitations','left'],['estudio','estudio','center']];
test('los heroes de página usan el paisaje de Inicio con texto visible antes del motor',()=>{
 for(const [page,entry,side] of pages){
  assert.match(read(`src/site/entries/${entry}.js`),/landscape\/landscape-hero\.js/);
  assert.match(read(page+'.html'),new RegExp(`<section class="page-landscape[^>]*>\\s*\\{\\{landscape:${page}:${side}\\}\\}[\\s\\S]*?<h1[^>]*class="horizon-title"`));
 }
});
test('cada página tiene sus imágenes fijas de día y de noche',()=>{
 const has=name=>assert.ok(existsSync(new URL('../public/nordra/v552/assets/landscape-'+name+'.webp',import.meta.url)),name);
 for(const theme of ['light','dark']){
  for(const format of ['mobile','tablet'])has(`page-${theme}-${format}`);
  for(const [page] of pages)for(const format of ['compact','desktop','wide'])has(`${page}-${theme}-${format}`);
 }
});
