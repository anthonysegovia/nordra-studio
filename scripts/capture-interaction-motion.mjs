import {chromium} from 'playwright';
import {preview} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
const output=path.resolve('documentacion/animaciones-de-calidad');
fs.mkdirSync(output,{recursive:true});
const server=await preview({preview:{host:'127.0.0.1',port:5592}});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const metrics=[];
async function clip(name,route,width,prepare,action){
 const context=await browser.newContext({viewport:{width,height:900},recordVideo:{dir:output,size:{width,height:900}}});
 const page=await context.newPage();await page.goto(server.resolvedUrls.local[0]+route);await page.evaluate(()=>document.fonts.ready);
 await prepare(page);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(1600);
 await page.evaluate(()=>{
  window.motionFrames=[];window.motionCLS=0;window.motionLast=0;window.motionShifts=[];
  window.motionObserver=new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput){window.motionCLS+=e.value;window.motionShifts.push({value:e.value,sources:e.sources.map(s=>({node:s.node?.className,before:s.previousRect.toJSON(),after:s.currentRect.toJSON()}))});}});
  window.motionObserver.observe({type:'layout-shift',buffered:false});
  window.motionMeasure=true;
  function frame(t){if(window.motionLast)window.motionFrames.push(t-window.motionLast);window.motionLast=t;if(window.motionMeasure)requestAnimationFrame(frame);}requestAnimationFrame(frame);
 });
 await action(page);await page.waitForTimeout(1100);
 await page.screenshot({path:path.join(output,name+'.png')});
 const measured=await page.evaluate(()=>{if(!window.motionObserver)return {navigation:true};window.motionMeasure=false;window.motionObserver.disconnect();const f=window.motionFrames.sort((a,b)=>a-b);return {frames:f.length,medianMs:f[Math.floor(f.length*.5)],p95Ms:f[Math.floor(f.length*.95)],fps:1000/(f.reduce((a,b)=>a+b,0)/f.length),cls:window.motionCLS,shifts:window.motionShifts};});
 metrics.push({name,...measured});const video=page.video();await context.close();await video.saveAs(path.join(output,name+'.webm'));await video.delete();console.log(name,measured);
}
try{
 for(const route of ['cumpleanos','bodas','negocios'])await clip('planes-'+route,route,1440,async page=>{
  await page.locator(route==='negocios'?'.offer-panel:not([inert])':'.invite-card').first().scrollIntoViewIfNeeded();
 },async page=>{
  const cards=page.locator(route==='negocios'?'.offer-panel:not([inert])':'.invite-card');
  await page.mouse.move(5,5);await page.waitForTimeout(700);await cards.first().hover();await page.waitForTimeout(1500);await page.mouse.move(5,5);await page.waitForTimeout(500);await cards.last().hover();await page.waitForTimeout(1500);
 });
 await clip('despliegue-plan','cumpleanos',1440,p=>p.locator('.invite-details summary').first().scrollIntoViewIfNeeded(),async p=>{const s=p.locator('.invite-details summary').first();await s.focus();await p.keyboard.press('Enter');await p.waitForTimeout(1700);await p.keyboard.press('Space');await p.waitForTimeout(1700);});
 await clip('pregunta-frecuente','bodas',1440,p=>p.locator('.faq-item summary').first().scrollIntoViewIfNeeded(),async p=>{const s=p.locator('.faq-item summary').first();await s.focus();await p.keyboard.press('Enter');await p.waitForTimeout(1700);await p.keyboard.press('Space');await p.waitForTimeout(1700);});
 await clip('contacto-canales','',1440,p=>p.locator('.contact-channel').first().scrollIntoViewIfNeeded(),async p=>{const a=p.locator('.contact-channel');await a.first().hover();await p.waitForTimeout(1700);await a.last().focus();await p.waitForTimeout(1700);});
 await clip('menu-movil','cumpleanos',390,async()=>{},async p=>{await p.locator('.menu-button').click();await p.waitForTimeout(1700);await p.keyboard.press('Escape');await p.waitForTimeout(800);await p.locator('.menu-button').click();await p.waitForTimeout(1300);});
 await clip('tema-idioma','cumpleanos',1440,async()=>{},async p=>{await p.locator('.theme-button').click();await p.waitForTimeout(1500);await p.locator('.header-actions .locale-switch a').last().hover();await p.waitForTimeout(800);await p.locator('.header-actions .locale-switch a').last().click();await p.waitForTimeout(1700);});
}finally{fs.writeFileSync(path.join(output,'rendimiento.json'),JSON.stringify(metrics,null,2));await browser.close();await new Promise(resolve=>server.httpServer.close(resolve));}
if(metrics.some(record=>record.name.startsWith('planes-')&&record.cls>.001)){
 console.error('Plan hover introduced layout shifts; inspect rendimiento.json');process.exitCode=1;
}
