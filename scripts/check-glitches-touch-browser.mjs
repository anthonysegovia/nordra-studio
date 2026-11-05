import assert from 'node:assert/strict';
import fs from 'node:fs';
import {auditBrowser,report,settle} from './audit-browser.mjs';
import {samplePanelFixture} from './sample-panel-fixture.mjs';
const app=await auditBrowser(),rows=[];
const screenshots=process.env.AUDIT_SCREENSHOTS;
if(screenshots)fs.mkdirSync(screenshots,{recursive:true});
try{
 const context=await app.browser.newContext({viewport:{width:390,height:900},hasTouch:true,isMobile:true});
 await context.route('**/api/wedding-links',samplePanelFixture(app.base));
 const page=await context.newPage();
 for(const [route,selector] of [['demos/posada/','.sample-bar>a'],['demos/halloween/','.demo-banner>a'],['demos/celebra-2027/','.demo-bar>a'],['aviso-de-privacidad/','.locale-switch>a'],['panel-boda.html','.wedding-sync-status>button'],['invitaciones/valentina-y-sebastian/','.iv-footer a']]){
  await page.goto(`${app.base}/${route}`);await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
  if(route.includes('valentina')){const skip=page.getByRole('button',{name:/sin animación|Saltar/i});if(await skip.count())await skip.first().tap();}
  const target=page.locator(selector).first();await target.scrollIntoViewIfNeeded();await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
  if(route==='aviso-de-privacidad/')assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'language targets must fit the mobile header');
  const area=await target.evaluate(el=>{const r=el.getBoundingClientRect(),pseudos=['::before','::after'].map(p=>getComputedStyle(el,p));const width=Math.max(r.width,...pseudos.map(s=>parseFloat(s.width)||0)),height=Math.max(r.height,...pseudos.map(s=>parseFloat(s.height)||0));const x=r.left+r.width/2,y=r.top+r.height/2;const points=[[x-21,y],[x+21,y],[x,y-21],[x,y+21]];return{rect:r.toJSON(),width,height,targets:points.map(([x,y])=>document.elementFromPoint(x,y)?.outerHTML.slice(0,250)),hits:points.map(([x,y])=>el.contains(document.elementFromPoint(x,y)))};});
  rows.push({route,selector,...area});if(screenshots)await page.screenshot({path:`${screenshots}/touch-${route.replace(/[^a-z]/g,'-')}.jpg`,type:'jpeg',quality:75});assert(area.width>=44&&area.height>=44,`${route}: target <44px`);assert(area.hits.every(Boolean),`${route}: 44px target is obstructed`);
 }
 for(const width of [390,1280]){
  await page.setViewportSize({width,height:900});
  for(const route of ['estudio','panel-boda.html','panel-evento.html','panel-cumple.html','invitaciones/spooky-party/','demos/halloween/']){
   await page.goto(`${app.base}/${route}${route.startsWith('panel')?'#mesas':''}`);await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
   if(route.startsWith('panel')){const button=page.locator('.seat-move>button').first();await button.scrollIntoViewIfNeeded();await button.tap();}
   if(route==='estudio')await page.locator('.studio-work-gallery').scrollIntoViewIfNeeded();
   if(route.includes('spooky')||route.includes('halloween')){await page.locator('#open').tap();await page.waitForTimeout(3200);assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));}
   await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
   if(screenshots)await page.screenshot({path:`${screenshots}/${route.replace(/[^a-z]/g,'-')}-${width}.jpg`,type:'jpeg',quality:75});
   rows.push({route,width,visit:true});
  }
 }
 await context.close();
}finally{report('touch-and-visits',rows);await app.close();}
