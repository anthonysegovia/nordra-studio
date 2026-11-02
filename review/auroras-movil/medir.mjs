import { chromium } from 'playwright';
import fs from 'node:fs/promises';
const out='review/auroras-movil/';
const browser=await chromium.launch({channel:'chrome'});const rows=[];
try {
 for(let run=0;run<4;run++)for(const throttle of [1,4])for(const port of run%2?[5292,5291]:[5291,5292]){
 const ctx=await browser.newContext({viewport:{width:375,height:812},deviceScaleFactor:2.625,isMobile:true,hasTouch:true,locale:'es-MX'});
 const p=await ctx.newPage(),cdp=await ctx.newCDPSession(p);
 await cdp.send('Emulation.setCPUThrottlingRate',{rate:throttle});
 const errors=[];p.on('pageerror',e=>errors.push(e.message));
 await p.addInitScript(()=>{
   Object.defineProperty(navigator,'deviceMemory',{get:()=>4});Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});
   new PerformanceObserver(list=>{for(const e of list.getEntries())window.lcp={ms:e.startTime,tag:e.element?.tagName}}).observe({type:'largest-contentful-paint',buffered:true});
   window.draws=[];const clear=WebGL2RenderingContext.prototype.clear;
   WebGL2RenderingContext.prototype.clear=function(...args){
     if(this.canvas.closest('.horizon-landscape')&&!this.getParameter(this.FRAMEBUFFER_BINDING))window.draws.push(performance.now());
     return clear.apply(this,args)
   };
   new MutationObserver(()=>{
      if(window.started==null&&document.querySelector('.horizon-landscape.has-scene')) window.started=performance.now();
   }).observe(document,{subtree:true,attributes:true,attributeFilter:['class']});
 });
 await p.goto('http://127.0.0.1:'+port+'/?theme=dark&nieve=0');
 if(port===5292)await p.waitForSelector('.horizon-landscape.has-scene',{timeout:60000});
 await p.waitForTimeout(port===5292?7000:2900);
 const row=await p.evaluate(()=>{
   const stage=document.querySelector('.horizon-landscape');
   const times=draws.filter(t=>t>performance.now()-3500);
   const deltas=times.slice(1).map((t,i)=>t-times[i]).sort((a,b)=>a-b);
   return {lcp,started:window.started??null,renderer:stage.dataset.renderer??'poster',quality:stage.dataset.quality??null,
     fps:times.length>1?1000*(times.length-1)/(times.at(-1)-times[0]):0,
     p95:deltas[Math.ceil(deltas.length*.95)-1]??null,
     downloadStart:performance.getEntriesByType('resource').find(e=>/\/assets\/(three-|landscape-scene-)/.test(e.name))?.startTime??null,
     chunks:performance.getEntriesByType('resource').filter(e=>/\/assets\/(three-|landscape-scene-)/.test(e.name)).map(e=>e.name.split('/').pop())};
 });
 rows.push({run,port,throttle,...row,errors});console.log(rows.at(-1));
 await fs.writeFile(out+'mediciones.json',JSON.stringify(rows,null,2));
 await ctx.close();
 }
}finally{await browser.close()}