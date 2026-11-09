import assert from 'node:assert/strict';
import {auditBrowser,report,settle} from './audit-browser.mjs';
import {samplePanelFixture} from './sample-panel-fixture.mjs';
const app=await auditBrowser(),rows=[];
try{
 for(const width of [1280,390])for(const route of ['panel-boda.html','panel-evento.html','panel-cumple.html']){
  const context=await app.browser.newContext({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});
  await context.route('**/api/wedding-links',samplePanelFixture(app.base));
  const page=await context.newPage();await page.goto(`${app.base}/${route}#mesas`);await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
  const triggers=page.locator('.seat-move>button');await triggers.first().waitFor();
  for(const index of [0,(await triggers.count())-1]){
   const trigger=triggers.nth(index);await trigger.scrollIntoViewIfNeeded();
   if(index===0)await trigger.evaluate(el=>scrollBy({top:el.getBoundingClientRect().top-(innerHeight-150),behavior:'instant'}));
   await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
   if(index===0){await trigger.evaluate(el=>scrollBy({top:el.getBoundingClientRect().top-(innerHeight-150),behavior:'instant'}));await page.waitForTimeout(100);const box=await trigger.boundingBox();if(width===390)await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);else await page.mouse.click(box.x+box.width/2,box.y+box.height/2);}else if(width===390)await trigger.tap();else await trigger.click();
   const menu=page.locator('.seat-options');await menu.waitFor();await page.waitForTimeout(220);
   const result=await menu.evaluate(el=>({up:el.classList.contains('opens-up'),rect:el.getBoundingClientRect().toJSON(),options:[...el.querySelectorAll('button')].map(b=>{const r=b.getBoundingClientRect(),x=r.left+r.width/2,y=r.top+r.height/2;return {label:b.textContent,visible:y>=0&&y<innerHeight,uncovered:b.contains(document.elementFromPoint(x,y)),background:getComputedStyle(b).backgroundColor};})}));
   rows.push({route,width,index,...result});
   assert(result.options.length>1);if(index===0)assert(result.up,`${route}: should open upward near viewport bottom`);assert(result.options.every(o=>o.visible&&o.uncovered),`${route} ${width}: menu obscured`);
   assert(result.options.every(o=>o.background!=='rgb(240, 240, 240)'),`${route}: native gray`);
   await page.keyboard.press('Escape');await menu.waitFor({state:'detached'});await trigger.click();await page.locator('#tables-title').click();await menu.waitFor({state:'detached'});
   await trigger.click();const option=menu.locator('button:not(:disabled)').first();await option.click();await menu.waitFor({state:'detached'});
  }
  console.log(`${route} ${width}: first/last selectors, hit testing, Escape, outside and selection passed`);await context.close();
 }
 for(const route of ['panel-boda.html','panel-evento.html','panel-cumple.html']){
  const context=await app.browser.newContext();let requests=0;
  await context.route('**/api/wedding-links',r=>{requests++;return r.fulfill({status:429,json:{code:'limited'}})});
  const page=await context.newPage();await page.goto(`${app.base}/${route}`);await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
  await page.getByText('Por ahora, explora esta muestra',{exact:false}).waitFor();
  assert(await page.locator('.ledger-row').count()>0,'fallback has guests');
  assert.equal(await page.getByText('Conexión interrumpida',{exact:false}).count(),0);
  await page.getByRole('button',{name:/^(Mesas|Zonas)$/}).first().click();await page.locator('.boreal-seating-person').first().waitFor();await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
  assert(await page.locator('.boreal-seating-person').count()>0);
  assert.equal(await page.locator('.seat-move>button:not(:disabled)').count(),0);
  assert.equal(await page.locator('a[href*="guest="]').count(),0);
  const before=requests;await page.waitForTimeout(10500);assert.equal(requests,before,'local preview must stop polling');
  rows.push({route,fallback:true,guests:await page.locator('.boreal-seating-person').count(),requests});await context.close();console.log(`${route}: 429 read-only sample passed`);
 }
 for(const width of [1280,390])for(const route of ['invitaciones/spooky-party/','demos/halloween/index.html']){
  const context=await app.browser.newContext({viewport:{width,height:900},hasTouch:width===390,isMobile:width===390});const page=await context.newPage();await page.goto(`${app.base}/${route}`);await settle(page);if(await page.getByRole('button',{name:'Saltar guía',exact:true}).isVisible())await page.getByRole('button',{name:'Saltar guía',exact:true}).click();
  const overflow=await page.evaluate(()=>({viewport:innerWidth,width:document.documentElement.scrollWidth}));assert(overflow.width<=overflow.viewport+1,`${route}: horizontal overflow`);rows.push({route,width,overflow});await context.close();
 }
}finally{report('panels-and-overflow',rows);await app.close();}
