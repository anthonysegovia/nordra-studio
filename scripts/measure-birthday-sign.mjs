// Cold-cache load medians + CDP TaskDuration / rAF, same viewport/CPU policy as the review.
// node scripts/measure-birthday-sign.mjs http://127.0.0.1:5217
import {chromium} from 'playwright';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
const base=process.argv[2]||'http://127.0.0.1:5217';
const executablePath=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean).find(fs.existsSync);
const output=process.env.BIRTHDAY_PERFORMANCE_OUTPUT||path.join(os.tmpdir(),'birthday-revision','performance.json');fs.mkdirSync(path.dirname(output),{recursive:true});
const browser=await chromium.launch({executablePath,headless:true}),results={base,browser:await browser.version(),loads:[],cpu:[]};
const quick=process.argv.includes('--quick'),sampleMs=quick?4000:10000;
async function pageFor(mobile){
 const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},isMobile:mobile,hasTouch:mobile});
 await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>4});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  window.__perf={lcp:0,element:'',longTasks:[]};new PerformanceObserver(list=>{for(const e of list.getEntries()){window.__perf.lcp=e.startTime;window.__perf.element=e.element?.tagName+'.'+e.element?.className;}}).observe({type:'largest-contentful-paint',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__perf.longTasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
 });
 const page=await context.newPage(),cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Emulation.setCPUThrottlingRate',{rate:mobile?4:1});await cdp.send('Performance.enable');
 return {context,page,cdp};
}
const metrics=async cdp=>Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(m=>[m.name,m.value]));
try{
 for(const mobile of process.argv.includes('--mobile')?[true]:[false,true]){
  if(!quick&&!process.argv.includes('--cpu-only'))for(let run=0;run<3;run++){
   const {context,page}=await pageFor(mobile);await page.goto(base+'/cumpleanos?estilo=neon');await page.waitForTimeout(10000);
   const measurement={mobile,run,...await page.evaluate(()=>{const perf=window.__perf,fcp=performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0;return {...perf,fcp,tbt:perf.longTasks.reduce((total,t)=>total+Math.max(0,t.start+t.duration-Math.max(fcp,t.start+50)),0),blockingIncludingBeforeFCP:perf.longTasks.reduce((total,t)=>total+Math.max(0,t.duration-50),0)};})};results.loads.push(measurement);console.log('load',measurement);await context.close();
  }
  for(const style of process.argv.includes('--loads-only')?[]:['neon','caja','bar','xv','espacio']){
   if(process.env.BIRTHDAY_PERFORMANCE_STYLE&&process.env.BIRTHDAY_PERFORMANCE_STYLE!==style)continue;
   const {context,page,cdp}=await pageFor(mobile);await page.goto(base+'/cumpleanos?estilo='+style);await page.waitForSelector('#bs-hero[data-ready=true]');await page.waitForTimeout(quick?1000:10000);
   await page.evaluate(()=>{window.__frames=0;window.__counting=true;function frame(){if(window.__counting){window.__frames++;requestAnimationFrame(frame);}}requestAnimationFrame(frame);});
   const before=await metrics(cdp);await page.waitForTimeout(sampleMs);const after=await metrics(cdp);const frames=await page.evaluate(()=>{window.__counting=false;return window.__frames;});
   const seconds=after.Timestamp-before.Timestamp,task=after.TaskDuration-before.TaskDuration;
   const row={mobile,style,seconds,occupiedPercent:task/seconds*100,msPerFrame:task*1000/frames,fps:frames/seconds};results.cpu.push(row);console.log('cpu',row);await context.close();
  }
 }
}finally{fs.writeFileSync(output,JSON.stringify(results,null,2));await browser.close();console.log('Saved:',output);}
