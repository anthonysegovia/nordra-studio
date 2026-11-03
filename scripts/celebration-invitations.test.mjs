import {renderInvitation} from '../src/celebrations/numero-que-flota/template.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {entranceVisibility,initialTheme} from '../src/celebrations/entrance.mjs';
const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
test('cover and transition keep navigation and content unavailable, including on reopening',()=>{
 for(const phase of ['closed','opening','open','closed'])assert.deepEqual(entranceVisibility(phase),{entranceHidden:phase==='open',contentHidden:phase!=='open',menuHidden:phase!=='open'});
 assert.throws(()=>entranceVisibility('unexpected'));
});
test('light is default; only the saved dark preference changes it',()=>{
 for(const value of [null,'light','system','invalid'])assert.equal(initialTheme({getItem:()=>value}),'light');
 assert.equal(initialTheme({getItem:()=>{throw Error('blocked')}}),'light');assert.equal(initialTheme({getItem:()=> 'dark'}),'dark');
});
for(const [slug,start] of [['camila-30','20270725T010000Z'],['conexion-27','20270612T160000Z']]){
 test(`${slug}: safe initial markup and local sample`,()=>{
  const html=renderInvitation(read(`invitaciones/${slug}/index.html`));
  assert.match(html,/class="celebration-header" hidden inert/);assert.match(html,/class="celebration-content" hidden inert/);
  assert.match(html,/data-skip/);assert.match(html,/Las respuestas de esta vista no se envían/);assert.match(html,/fecha\.ics" download/);
  assert.doesNotMatch(html,/\/api\b|<iframe|action=/);assert.match(read('vite.config.ts'),new RegExp(`invitaciones/${slug}/index.html`));
  const routes=JSON.parse(read('vercel.json')).routes;const route=routes.find(x=>x.dest&&new RegExp(x.src).test(`/invitaciones/${slug}/`));assert.equal(`/invitaciones/${slug}/`.replace(new RegExp(route.src),route.dest),`/invitaciones/${slug}/index.html`);
 });
 test(`${slug}: calendar uses CRLF and the approved local date/time`,()=>{
  const ics=read(`public/invitaciones/${slug}/fecha.ics`);assert.doesNotMatch(ics,/(?<!\r)\n|\r(?!\n)/);assert.ok(ics.endsWith('END:VCALENDAR\r\n'));assert.match(ics,/VERSION:2.0/);assert.ok(ics.includes(`DTSTART:${start}\r\n`));assert.match(ics,/UID:/);assert.match(ics,/STATUS:TENTATIVE/);for(const line of ics.split('\r\n'))assert.ok(Buffer.byteLength(line)<=75);
 });
}
test('sample does not send requests or persist responses',()=>{
 const js=read('src/celebrations/invitation.js');assert.doesNotMatch(js,/\bfetch\s*\(|XMLHttpRequest|sendBeacon|\/api\b|\.setItem\s*\(|indexedDB|WebSocket/);assert.match(js,/event.preventDefault\(\)/);assert.match(js,/status.textContent/);assert.match(js,/no se ha enviado ni guardado ninguna respuesta/);
});

test('Invitaciones keeps the legacy destinations and the four real screens in reading order', async()=>{
 const {renderInvitationPage}=await import('../build/invitation-offers.mjs');
 const html=renderInvitationPage(read('invitaciones.html'));
 const order=['tipos-invitacion','planes-invitaciones','asi-lo-viven','clientes-reales','temporadas','invitaciones-preguntas','proceso-invitaciones','contacto-invitaciones'];
 const positions=order.map(id=>html.indexOf('id="'+id+'"'));assert.ok(positions.every(n=>n>=0));assert.deepEqual(positions,[...positions].sort((a,b)=>a-b));
 for(const [section,ids] of [['asi-lo-viven',['panel-invitados','event-experience']],['planes-invitaciones',['planes-eventos']],['temporadas',['temporada','plan-temporada']]]){
   const contents=html.split('id="'+section+'"')[1].split('</section>')[0];
   for(const id of ids)assert.ok(contents.includes('id="'+id+'"'),id);
 }
 const journey=html.split('id="asi-lo-viven"')[1].split('</section>')[0];
 assert.equal((journey.match(/class="journey-card"/g)||[]).length,4);
 for(const name of ['inv-guest-cover','inv-guest-open','inv-guest-rsvp','dashboard-v3-es'])assert.ok(journey.includes(name));
 for(const href of ['/invitaciones/valentina-y-sebastian/','/panel-boda.html'])assert.ok(journey.includes('href="'+href+'"'));
 for(const forPage of ['/bodas','/cumpleanos','/eventos','/temporada','/invitaciones/camila-30/','/invitaciones/conexion-27/'])assert.ok(html.split('id="tipos-invitacion"')[1].split('</section>')[0].includes('href="'+forPage+'"'));
});
