import assert from 'node:assert/strict';
import {auditBrowser,report,settle} from './audit-browser.mjs';
const app=await auditBrowser(),rows=[];
try{
 for(const width of [1280,390])for(const route of ['invitaciones','bodas','cumpleanos','eventos','temporada','negocios']){
  const context=await app.browser.newContext({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
  const page=await context.newPage();await page.goto(`${app.base}/${route}`);await settle(page);
  const faq=page.locator('.faq-item').first(),summary=faq.locator('summary');await summary.scrollIntoViewIfNeeded();await settle(page);
  for(const opening of [true,false]){
   await faq.evaluate(el=>{
    window.disclosureFrames=[];window.disclosureDone=false;
    const begin=()=>{const start=performance.now();function frame(t){window.disclosureFrames.push({t:t-start,height:el.getBoundingClientRect().height});if(t-start<750)requestAnimationFrame(frame);else window.disclosureDone=true;}window.disclosureFrames.push({t:0,height:el.getBoundingClientRect().height});requestAnimationFrame(frame);};
    el.querySelector('summary').addEventListener('click',begin,{once:true,capture:true});
   });
   if(width===390)await summary.tap();else await summary.click();
   await page.waitForFunction(()=>window.disclosureDone);
   const frames=await page.evaluate(()=>window.disclosureFrames),deltas=frames.slice(1).map((f,i)=>f.height-frames[i].height);
   rows.push({route,width,opening,frames});
   assert.equal(await faq.evaluate(el=>el.open),opening);
   assert(Math.max(...deltas.map(Math.abs))<=20,`${route} ${width}: jump >20px`);
   if(!opening)assert(deltas.every(d=>d<=.5),`${route} ${width}: closing reversed`);
   assert(Math.abs(frames.at(-1).height-frames[0].height)>20,`${route}: no disclosure movement recorded`);
  }
  for(const mode of ['reduced','paused']){
   await page.emulateMedia({reducedMotion:mode==='reduced'?'reduce':'no-preference'});await page.waitForTimeout(150);
   if(mode==='paused')await page.evaluate(()=>{document.body.dataset.journeyMotion='paused';dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:true}}));});
   await summary.click();await page.waitForTimeout(200);
   assert(await faq.evaluate(el=>el.open));
   const icon=await summary.locator('[aria-hidden=true]').evaluate(el=>getComputedStyle(el).transform);
   assert(icon.includes('0.707'),`${route} ${mode}: open icon must remain a cross`);
   await summary.click();await page.waitForTimeout(200);assert.equal(await faq.evaluate(el=>el.open),false);
  }
  console.log(`FAQ ${route} ${width}: smooth opening and monotonic closing`);await context.close();
 }
}finally{report('disclosures',rows);await app.close();}
