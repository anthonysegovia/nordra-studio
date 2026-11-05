// Run against Vite's local source server. Instrumentation exists only in intercepted
// test responses; the shipped scene has no debug globals or capture switches.
import { chromium } from 'playwright';
export const chrome='C:/Program Files/Google/Chrome/Application/chrome.exe';
export const launch=()=>chromium.launch({executablePath:chrome,headless:true});
export async function instrument(page){
 await page.route('**/src/site/wedding-rings/rings-scene.js*',async route=>{
  const response=await route.fetch();let body=await response.text();
  body=body.replace('pose(clock-.25,dt);render();','pose(clock-.25,dt);render();window.__rings.frames.push(performance.now());');
  body=body.replace('return {setState,dispose};',`window.__rings={frames:[],hit(x,y){return overRings({clientX:x,clientY:y})},get rotation(){return userRot},get spin(){return spin},get clock(){return clock},get dragging(){return dragging},get active(){return active},freeze(t){active=false;cancelAnimationFrame(frameId);clock=t;scrollP=0;tilt.x=tilt.y=0;pose(t,0);render();},step(t){clock=t;pose(t,1/60);render();},project(){holder.updateMatrixWorld(true);return pickables.map(o=>{const v=new THREE.Vector3();o.getWorldPosition(v);v.x+=.7;v.project(camera);const r=stage.getBoundingClientRect();return {x:r.left+(v.x+1)*r.width/2,y:r.top+(1-v.y)*r.height/2}})}};return {setState,dispose};`);
  await route.fulfill({response,body});
 });
}
export async function profile(context,{cores=8,memory=8,saveData=false}={}){
 await context.addInitScript(({cores,memory,saveData})=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>cores});Object.defineProperty(navigator,'deviceMemory',{get:()=>memory});
  if(navigator.connection)Object.defineProperty(navigator.connection,'saveData',{get:()=>saveData});
  window.__ringsPerf={tasks:[],lcp:0};window.__ringsStartClicks=0;
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__ringsPerf.tasks.push({start:e.startTime,duration:e.duration});}).observe({type:'longtask',buffered:true});
  new PerformanceObserver(list=>{for(const e of list.getEntries())window.__ringsPerf.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});
  document.addEventListener('click',e=>{if(e.target.closest('[data-rings-start]'))window.__ringsStartClicks++;});
  const original=HTMLCanvasElement.prototype.getContext;window.__webglContexts=0;
  HTMLCanvasElement.prototype.getContext=function(type,...args){if(type==='webgl'||type==='webgl2')window.__webglContexts++;return original.call(this,type,...args)};
 },{cores,memory,saveData});
}

export async function preparationMetrics(page){
 return page.evaluate(()=>{
  const start=performance.getEntriesByName('nordra-rings-load-start').at(-1)?.startTime;
  const ready=performance.getEntriesByName('nordra-rings-ready').at(-1)?.startTime;
  const tasks=window.__ringsPerf.tasks.filter(t=>t.start+t.duration>start&&t.start<ready+1500);
  const fcp=performance.getEntriesByName('first-contentful-paint')[0]?.startTime||0;
  return {start,ready,maximumTask:Math.max(0,...tasks.map(t=>t.duration)),tasks,lcp:window.__ringsPerf.lcp,tbt:window.__ringsPerf.tasks.filter(t=>t.start>=fcp&&t.start<10000).reduce((sum,t)=>sum+Math.max(0,t.duration-50),0),allTasks:window.__ringsPerf.tasks};
 });
}
