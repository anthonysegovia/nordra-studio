import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {sanitizeName,sanitizeAge,displayAge,daysToLiftoff,whatsappMessage,whatsappURL,initialStyle,rememberStyle,STYLE_KEY,staticProfile} from '../src/site/birthday-sign/state.js';
import {dictionary,format} from '../src/site/birthday-sign/copy.js';
import {lightingCache} from '../src/site/birthday-sign/lighting.js';
test('only a fifteenth birthday becomes XV in the gala',()=>{
 for(const [age,style,want] of [['15','xv','XV'],['30','xv','30'],['40','xv','40'],['15','bar','15'],['XV','xv','XV'],['6','espacio','6'],['','xv','']])assert.equal(displayAge(age,style),want);
});
test('name normalization retains accents, ñ, apostrophes and Unicode without markup or controls',()=>{
 assert.equal(sanitizeName('  Andre\u0301s   Peña  '.replace('\\u0301','\u0301')),'Andrés Peña');
 assert.equal(sanitizeName("O’Neill"),"O’Neill");assert.equal(sanitizeName('<Iker>\u0000'.replace('\\u0000','\u0000')),'Iker');
 assert.equal(Array.from(sanitizeName('🎉'.repeat(20))).length,12);assert.equal(sanitizeName('abcdefghijklmnop'),'abcdefghijkl');
 assert.equal(sanitizeName(null),'');
});
test('age accepts digits or exactly XV, never arbitrary Roman numerals',()=>{
 for(const [input,want] of [[' xv ','XV'],['15 años','15'],['30<script>','30'],['XXX',''],['12345','123'],['15XV','15'],['X',''],['','']])assert.equal(sanitizeAge(input),want);
});
test('ES and EN WhatsApp have the correct destination, style and percent-encoded Unicode',()=>{
 const options={name:'Andrés Peña',age:'40',style:'neon',color:'ambar',lettering:'bloque'};
 assert.equal(whatsappMessage({...options,lang:'es'}),'Hola, Nordra. Quiero una invitación con mi nombre en luces: Andrés Peña 40, estilo Neón, en ámbar y letra bloque.');
 assert.equal(whatsappMessage({...options,lang:'en'}),"Hi, Nordra. I'd like an invitation with my name in lights: Andrés Peña 40, Neon style, in amber with block lettering.");
 for(const lang of ['es','en'])for(const style of ['neon','caja','bar','xv','espacio']){
  const url=new URL(whatsappURL({...options,style,lang}));assert.equal(url.origin,'https://wa.me');assert.equal(url.pathname,'/528129022231');assert.equal(url.searchParams.get('text'),whatsappMessage({...options,style,lang}));assert.match(url.search,/%C3%A9/);assert.match(url.search,/%20/);
  if(style!=='neon')assert.doesNotMatch(url.searchParams.get('text'),/lettering|letra|ámbar|amber/);
 }
});
test('personal data helpers cannot write browser history or storage; only validated style is persisted',()=>{
 const writes=[],storage={getItem:key=>key===STYLE_KEY?'bar':null,setItem:(...args)=>writes.push(args)};
 const before=globalThis.location;globalThis.location=Object.freeze({href:'https://example.test/cumpleanos?estilo=xv'});
 try{for(const lang of ['es','en'])whatsappURL({name:'Andrés Peña',age:'15',lang});assert.equal(globalThis.location.href,'https://example.test/cumpleanos?estilo=xv');assert.deepEqual(writes,[]);
  assert.equal(initialStyle('?estilo=xv',storage),'xv');assert.equal(initialStyle('',storage),'bar');assert.equal(initialStyle('?estilo=Andrés',storage),'neon');
  rememberStyle('Andrés',storage);rememberStyle('caja',storage);assert.deepEqual(writes,[[STYLE_KEY,'caja']]);
 }finally{if(before===undefined)delete globalThis.location;else globalThis.location=before;}
 const runtime=fs.readFileSync(new URL('../src/site/birthday-sign/sign-runtime.js',import.meta.url),'utf8');
 assert.doesNotMatch(runtime,/\b(?:localStorage|sessionStorage|pushState|replaceState)\b|location\s*\.|\.innerHTML\s*=/);
 assert.match(runtime,/s\.textContent = ch/);assert.match(runtime,/rememberStyle\(w\)/);
 const html=fs.readFileSync(new URL('../cumpleanos.html',import.meta.url),'utf8');
 for(const input of html.matchAll(/<input[^>]*id="bs-(?:nm|ag)"[^>]*>/g))assert.doesNotMatch(input[0],/\bname=/,'Native form submission must not serialize personal data before JS loads');
});
test('countdown uses visitor local midnight and clamps past dates',()=>{
 assert.equal(daysToLiftoff(new Date(2027,6,23,0)),1);assert.equal(daysToLiftoff(new Date(2027,6,23,12)),1);assert.equal(daysToLiftoff(new Date(2027,6,24,0)),0);assert.equal(daysToLiftoff(new Date(2027,6,25)),0);
 assert.equal(daysToLiftoff(new Date(2027,6,22,23,59)),2);
});
test('English dynamic dictionary has every key and matching placeholders',()=>{
 function check(es,en,p=''){assert.deepEqual(Object.keys(en).sort(),Object.keys(es).sort(),p);for(const key of Object.keys(es)){if(typeof es[key]==='object')check(es[key],en[key],p+'.'+key);else {assert.equal(typeof en[key],'string');assert(en[key].length,p+'.'+key);assert.deepEqual([...es[key].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),[...en[key].matchAll(/\{\w+\}/g)].map(m=>m[0]).sort(),p+'.'+key);}}}check(dictionary.es,dictionary.en);
 assert.equal(format(dictionary.en.sign,{name:'Ximena',age:'XV'}),'Sign: Ximena XV');
});
test('static policy matches wedding resource constraints',()=>{
 assert(staticProfile({hardwareConcurrency:3}));assert(staticProfile({deviceMemory:2}));assert(staticProfile({connection:{saveData:true}}));assert(!staticProfile({hardwareConcurrency:4,deviceMemory:4}));assert(!staticProfile({}));
});

test('incremental brick light matches the original sum, and only dirties influenced bricks',()=>{
 const bricks=[[0,0,60,30],[70,0,60,30],[1000,1000,60,30]];
 const sources=[{x:30,y:8,k:.8},{x:100,y:40,k:.4}];
 const cache=lightingCache(bricks,sources,90);
 const states=[[[255,20,90],[0,0,0]],[[255,20,90],[80,180,255]],[[0,0,0],[80,180,255]],[[0,0,0],[0,0,0]]];
 for(const colors of states){
  const dirty=cache.update(colors);assert(!dirty.has(2));
  bricks.forEach(([x,y,w,h],i)=>{
   const expected=[0,0,0,0];sources.forEach((s,j)=>{const k=s.k/(1+(((x+w/2-s.x)**2+(y+h/2-s.y)**2)/90**2)*4.5)-.07;if(k<=0||!colors[j].some(Boolean))return;for(let c=0;c<3;c++)expected[c]+=colors[j][c]*k;expected[3]+=(s.y<y+h/2?1:-1)*k;});
   expected.forEach((v,j)=>assert(Math.abs(v-cache.values[i][j])<1e-9));
  });
  assert.equal(cache.update(colors).size,0);
 }
 assert.equal(cache.update(states.at(-1),true).size,3);
});

test('approved birthday hero is text-first with one real invitation and three non-link covers',()=>{
 const html=fs.readFileSync(new URL('../cumpleanos.html',import.meta.url),'utf8');
 const hero=html.slice(html.indexOf('<section class="hero"'),html.indexOf('<section class="styles"'));
 assert.ok(hero.includes('<h1 id="bs-titulo">Tu nombre,<br><em>en luces</em></h1>'));
 assert.doesNotMatch(hero,/<img|<iframe|occasion-poster|fetchpriority="high"/);
 assert.match(hero,/class="btn" href="#bs-estilos"/);
 assert.ok(html.includes('href="/invitaciones/camila-30/"'));
 assert.equal((html.match(/<a class="phone"/g)||[]).length,1);
 assert.equal((html.match(/<div class="phone"/g)||[]).length,3);
 assert.doesNotMatch(html,/PROPUESTA|Maqueta v5/);
});

test('lazy style painters have self-contained contexts at desktop and mobile sizes',async()=>{
 const noop=()=>{},gradient={addColorStop:noop};
 const canvas=new Proxy({createLinearGradient:()=>gradient,createRadialGradient:()=>gradient},{get:(o,k)=>o[k]??noop,set:(o,k,v)=>(o[k]=v,true)});
 const el=(tag,attrs,parent)=>({tag,attrs,parent});
 const rand=seed=>()=>((seed=seed*16807%2147483647)/2147483647);
 for(const style of ['neon','caja','bar','xv','espacio']){
  const module=await import('../src/site/birthday-sign/styles/'+style+'.js');
  for(const W of [390,1440])for(const dark of [true,false]){
   const rects=module.paintWorld(canvas,dark,rand(7),{W,H:900,css:()=> '#ab73ef',star4:noop,copy:dictionary.en});
   assert(Array.isArray(rects));for(const rect of rects)assert(rect.every(Number.isFinite));
   const bulbs=module.garlandWorld(9,W,()=>44,W<700,{rand,el,gsvg:{}});assert.equal(bulbs.length,style==='caja'?0:9,style+' luminous bulbs (gift uses unlit paper flags)');
  }
 }
});
