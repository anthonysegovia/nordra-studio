import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {renderInvitation} from '../src/celebrations/numero-que-flota/template.mjs';
import {invitation} from '../src/celebrations/numero-que-flota/config.mjs';

const template=readFileSync('invitaciones/camila-30/index.html','utf8');
test('the HTML ships real cover data, a responsive poster and the original anchors',()=>{
  const html=renderInvitation(template);
  assert.ok(!html.includes('{{float:'));
  assert.match(html,/Camila<span class="sr-only"> 30/);
  assert.match(html,/datetime="2027-07-24T19:00:00-06:00"/);
  assert.match(html,/fetchpriority="high"/);
  assert.deepEqual([...html.matchAll(/<section\b[^>]*?\bid="([^"]+)"/g)].map(m=>m[1]),['bienvenida','detalles','agenda','vestimenta','confirmacion']);
  assert.equal(renderInvitation('<p>Otra página</p>'),'<p>Otra página</p>');
});
test('one configuration changes the foil, event data and visible copy without a client-side rewrite',()=>{
  for(const balloons of ['5','XV','100']){
    const html=renderInvitation(template,{...invitation,balloons,name:'Mar & Luz',phrase:'Una noche juntas',date:'2028-09-18',hour:'20:15',place:'El jardín'});
    for(const text of ['Mar &amp; Luz',balloons,'Una noche juntas','18 · 09 · 2028','20:15','El jardín'])assert.ok(html.includes(text),text);
    assert.doesNotMatch(html,/Camila|Terraza Aurora/);
  }
  assert.throws(()=>renderInvitation(template,{...invitation,balloons:'1234'}));
});
