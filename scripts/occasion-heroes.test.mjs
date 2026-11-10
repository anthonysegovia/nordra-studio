import test from 'node:test';
import {renderInvitation} from '../src/celebrations/caja-de-regalo/template.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {fileURLToPath} from 'node:url';
import {buildInputs} from './check-vercel-build-inputs.mjs';
const root=new URL('../',import.meta.url),read=file=>fs.readFileSync(new URL(file,root),'utf8');
test('eventos: approved badge hero has responsive fallbacks and retains the experience anchor',()=>{
 const html=read('eventos.html'),hero=html.slice(html.indexOf('<section class="badge-hero'),html.indexOf('<section class="home-continuation wedding-sample'));
 assert.match(hero,/id="badge-stage"/);
 assert.match(hero,/href="#eventos-event-experience"/);
 assert.match(hero,/href="#eventos-planes-eventos"/);
 assert.doesNotMatch(hero,/live-phone|data-live-try|<iframe|mock-panel/);
 for(const theme of ['light','dark'])for(const format of ['mobile','desktop','wide'])assert.ok(hero.includes(`badge-poster-${theme}-${format}.webp`));
 assert.match(read('src/site/entries/events.js'),/event-badge\/badge-hero.js/);
 assert.match(read('src/site/event-badge/badge-hero.js'),/import\('\.\/badge-scene.js'\)/);
 assert.match(html,/href="\/invitaciones\/conexion-27\/"/);
});
test('Camila uses her own copy throughout the five stops',()=>{const html=renderInvitation(read('invitaciones/camila-30/index.html'));assert.match(html,/Hay algo para ti en esta caja/);assert.doesNotMatch(html,/Nos vemos a las siete|Lo que debes saber|Tu pase|Treinta y con ganas de bailar|Tu presencia es el regalo|Lo mejor es celebrarlo contigo|Nuestra noche|Con mis personas favoritas|Así lo celebramos|Mi noche favorita empieza contigo/i);});
test('retired poster styles and assets are absent from deploy inputs',()=>{
 assert.doesNotMatch(read('src/site/styles/scene.css'),/occasion-poster|organic-poster|birthday-poster|event-poster/);
 const inputs=buildInputs(fileURLToPath(root));
 for(const page of ['cumpleanos','eventos']){const file=`public/nordra/v541/assets/${page}-organico-5-33.webp`;assert.equal(inputs.includes(file),false);assert.equal(fs.existsSync(new URL(file,root)),false);}
 for(const file of ['birthday-noche/camila-portada-390.webp','birthday-noche/camila-portada-780.webp','invitation-covers/conexion-27.webp'])assert.ok(inputs.includes('public/artwork/'+file));
});
