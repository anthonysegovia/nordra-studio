import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {renderInvitation} from '../src/celebrations/caja-de-regalo/template.mjs';
import {invitation} from '../src/celebrations/caja-de-regalo/config.mjs';

const template=readFileSync('invitaciones/camila-30/index.html','utf8');
test('the HTML ships real cover data, a responsive poster and the original anchors',()=>{
  const html=renderInvitation(template);
  assert.ok(!html.includes('{{gift:'));
  assert.match(html,/aria-label="Jala el lazo para abrir la invitación"/);
  assert.deepEqual([...html.matchAll(/<a href="#([^"]+)"/g)].map(m=>m[1]),['cuando','cuando','camila','saber','confirmacion']);
  assert.match(html,/Camila cumple 30/);
  assert.match(html,/datetime="2027-07-24T19:00:00-06:00"/);
  assert.match(html,/fetchpriority="high"/);
  assert.deepEqual([...html.matchAll(/<section\b[^>]*?\bid="([^"]+)"/g)].map(m=>m[1]),['cuando','camila','saber','confirmacion']);
  assert.equal(renderInvitation('<p>Otra página</p>'),'<p>Otra página</p>');
});
test('one configuration changes the foil, event data and visible copy without a client-side rewrite',()=>{
  for(const balloons of ['5','XV','100']){
    const html=renderInvitation(template,{...invitation,photos:[],balloons,name:'Mar & Luz',copy:{...invitation.copy,subtitle:'Una noche juntas'},date:'2028-09-18',hour:'20:15',place:'El jardín'});
    for(const text of ['Mar &amp; Luz',balloons,'Una noche juntas','septiembre','20:15','El jardín'])assert.ok(html.includes(text),text);
    assert.doesNotMatch(html,/Camila|Terraza Aurora/);
  }
  assert.throws(()=>renderInvitation(template,{...invitation,balloons:'1234'}));
});

test('the optional album removes both the section and its menu link',()=>{
 const html=renderInvitation(template,{...invitation,photos:[]});
 assert.doesNotMatch(html,/id="camila"|href="#camila"/);
});
test('countdown follows the local celebration date',async()=>{
 const {countdown}=await import('../src/celebrations/caja-de-regalo/clock.mjs');
 assert.equal(countdown(invitation,new Date('2027-07-20T19:00:00-06:00')),'Faltan 4 días para el brindis');
 assert.equal(countdown(invitation,new Date('2027-07-23T21:00:00-06:00')),'Faltan 22 h y 0 min para el brindis');
 assert.equal(countdown(invitation,new Date('2027-07-24T08:00:00-06:00')),'Hoy es el brindis');
 assert.equal(countdown(invitation,new Date('2027-07-25T06:00:00Z')),'Gracias por brindar conmigo');
});
test('original implementation excludes export signatures',()=>{
 const markers=[['HorizonX',' Tools License'],['o','gf-'],['c','tk-']];
 const scan=spawnSync('git',['grep','-I','-l','-F',...markers.flatMap(parts=>['-e',parts.join('')])],{encoding:'utf8'});
 assert.equal(scan.status,1,scan.stdout||scan.stderr);
});