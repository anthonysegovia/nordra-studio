// Controlled before/after framing comparison; only the desktop view offset differs.
import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import sharp from 'sharp';
import {launch,instrument,profile} from './wedding-rings-browser-support.mjs';
const output=process.env.RINGS_EVIDENCE;if(!output)throw Error('Set RINGS_EVIDENCE outside the repository');
fs.mkdirSync(output,{recursive:true});const browser=await launch();
try{for(const theme of ['light','dark']){
 const images={};
 for(const variant of ['before','after']){
  const context=await browser.newContext({viewport:{width:1440,height:900},locale:'es-MX'});await profile(context);
  await context.addInitScript(()=>{let s=271828;Math.random=()=>{s=(s*1664525+1013904223)>>>0;return s/4294967296;};});
  const page=await context.newPage();await instrument(page);
  if(variant==='before')await page.route('**/src/site/wedding-rings/rings-scene.js*',async route=>{
   const response=await route.fetch();const original=await response.text();const body=original.replace('*(wideQ.matches?1:k)','*k');assert.notEqual(body,original,'Expected desktop framing expression');
   // Pass the altered source through the same instrumentation as the after case.
   await route.fulfill({response,body:body.replace('return {setState,dispose};','window.__rings={freeze(t){active=false;cancelAnimationFrame(frameId);clock=t;scrollP=0;tilt.x=tilt.y=0;pose(t,0);render();},step(t){clock=t;pose(t,1/60);render();}};return {setState,dispose};')});
  });
  await page.goto(`${process.env.RINGS_URL||'http://127.0.0.1:5198'}/bodas?theme=${theme}`);await page.waitForFunction(()=>window.__rings);
  const alignment=await page.evaluate(()=>{const a=document.querySelector('[data-business-toggle]').getBoundingClientRect(),b=document.querySelector('[data-rings-sound]').getBoundingClientRect();return Math.abs(a.top+a.height/2-b.top-b.height/2);});assert(alignment<.5,'Sound and pause controls must align');
  await page.evaluate(()=>{window.__rings.freeze(0);for(const animation of document.getAnimations()){animation.pause();animation.currentTime=0;}});
  let previous=0;
  for(const time of [.4,1.2,2]){
   await page.evaluate(({previous,time})=>{for(let t=previous+1/60;t<=time+.0001;t+=1/60)window.__rings.step(t);},{previous,time});previous=time;
   const file=path.join(output,`${theme}-${variant}-${time}s.jpg`);await page.screenshot({path:file,type:'jpeg',quality:90});images[`${variant}-${time}`]=file;
  }
  await context.close();
 }
 for(const time of [.4,1.2,2])await sharp({create:{width:2880,height:900,channels:3,background:'#fff'}}).composite([{input:images[`before-${time}`],left:0,top:0},{input:images[`after-${time}`],left:1440,top:0}]).jpeg({quality:90}).toFile(path.join(output,`comparison-${theme}-${time}s.jpg`));
}}finally{await browser.close();}
