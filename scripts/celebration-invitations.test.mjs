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
for(const [slug,start] of [['sofia-25','20270725T010000Z'],['conexion-27','20270612T160000Z']]){
 test(`${slug}: safe initial markup and local sample`,()=>{
  const html=read(`invitaciones/${slug}/index.html`);
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
