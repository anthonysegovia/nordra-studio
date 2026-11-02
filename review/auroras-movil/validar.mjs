import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome'});
const rows=[];
try{for(const route of ['/','/en/']){
 const ctx=await b.newContext({viewport:{width:375,height:812},deviceScaleFactor:2.625,hasTouch:true,isMobile:true,locale:route==='/'?'es-MX':'en-US'});
 const p=await ctx.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{
   Object.defineProperty(navigator,'deviceMemory',{get:()=>4});Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
   const raf=requestAnimationFrame.bind(window);
   window.requestAnimationFrame=fn=>raf(t=>window.forceSlow&&document.querySelector('.has-scene')?raf(()=>raf(fn)):fn(t));
   window.draws=0;const original=WebGL2RenderingContext.prototype.clear;
   WebGL2RenderingContext.prototype.clear=function(...args){
     if(this.canvas.closest('.horizon-landscape')&&!this.getParameter(this.FRAMEBUFFER_BINDING))window.draws++;
     return original.apply(this,args)
   };
 });
 await p.goto('http://127.0.0.1:5292'+route+'?theme=dark&nieve=0');
 await p.waitForSelector('.horizon-landscape.has-scene');
 const still=async label=>{await p.waitForTimeout(350);const n=await p.evaluate(()=>draws);await p.waitForTimeout(400);assert.equal(await p.evaluate(()=>draws),n,label)};
 await p.emulateMedia({reducedMotion:'reduce'});await still('reduced');await p.emulateMedia({reducedMotion:'no-preference'});
 await p.waitForFunction(()=>document.body.dataset.journeyMotion==='playing');
 await p.locator('#local-motion-toggle').dispatchEvent('click');await still('pause');
 await p.locator('#local-motion-toggle').dispatchEvent('click');
 await p.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await still('outside');
 await p.evaluate(()=>scrollTo({top:0,behavior:'instant'}));let n=await p.evaluate(()=>draws);await p.waitForFunction(n=>draws>n+3,n);
 // Simulate document visibility, including dispatch of the browser event.
 await p.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await still('hidden');
 await p.evaluate(()=>{delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));});n=await p.evaluate(()=>draws);await p.waitForFunction(n=>draws>n+3,n);
 await p.reload();await p.evaluate(()=>window.forceSlow=true);
 await p.waitForSelector('[data-quality="mobile-low"]',{timeout:25000});
 const ctxLost=await p.evaluate(()=>{window.probe=document.querySelector('.horizon-landscape canvas').getContext('webgl2');return probe.isContextLost()});assert.equal(ctxLost,false);
 if(route==='/en/')await p.evaluate(()=>window.forceSlow=false);
 await p.waitForTimeout(3800);
 if(route==='/'){
  assert.equal(await p.locator('.horizon-landscape canvas').count(),0);
  assert.equal(await p.evaluate(()=>probe.isContextLost()),true);
 }else assert.equal(await p.locator('.horizon-landscape.has-scene').count(),1);
 assert.deepEqual(errors,[]);rows.push({route,quiet:true,guard:route==='/'?'poster and released context':'recovered at mobile-low',errors});console.log(rows.at(-1));await ctx.close();
} await fs.writeFile('review/auroras-movil/validacion.json',JSON.stringify(rows,null,2));}finally{await b.close()}