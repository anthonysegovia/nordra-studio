// Browser regression suite and visual evidence for the real built invitations.
// node scripts/check-celebrations-browser.mjs --tools <package.json with Playwright> --url http://127.0.0.1:5502 --evidence <folder>
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{url:{type:'string',default:'http://127.0.0.1:5502'},tools:{type:'string'},chrome:{type:'string',default:'C:/Program Files/Google/Chrome/Application/chrome.exe'},evidence:{type:'string',default:'review/celebrations'}}});
const require=createRequire(values.tools?path.resolve(values.tools):import.meta.url);const {chromium}=require('playwright');
fs.mkdirSync(values.evidence,{recursive:true});const records=[];
const browser=await chromium.launch({executablePath:values.chrome,headless:true,args:['--enable-unsafe-swiftshader']});
async function settled(page){await page.evaluate(()=>document.fonts.ready);await page.locator('.cover-art img').evaluate(img=>img.decode());}
async function geometry(page){return page.evaluate(()=>{
 const box=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,y:r.y,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
 return {art:box('.cover-art img'),copy:box('.cover-copy'),cover:box('.cover'),footer:box('.cover-bottom'),width:innerWidth,scrollWidth:document.documentElement.scrollWidth};
});}
function checkGeometry(g){assert.ok(g.art.x>=g.cover.x&&g.art.right<=g.cover.right+1,'art within cover');assert.ok(g.art.y>=g.cover.y&&g.art.bottom<=g.cover.bottom+1,'whole artwork inside cover');assert.ok(g.art.x>=g.copy.right||g.art.y>=g.copy.bottom-1,'name/age and artwork do not overlap');assert.ok(g.art.x>=g.footer.right||g.art.bottom<=g.footer.y+1,'art does not overlap footer');assert.ok(g.scrollWidth<=g.width,'no horizontal overflow');}
try{
 for(const slug of ['camila-30','conexion-27'])for(const theme of ['light','dark'])for(const width of [375,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:width===375?844:1000},colorScheme:'dark'});
  // Unset preference with a dark device verifies the required light default.
  if(theme==='dark')await context.addInitScript(()=>localStorage.setItem('nordra-theme','dark'));
  const page=await context.newPage(),requests=[],errors=[];page.on('request',r=>requests.push({url:r.url(),method:r.method()}));page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${values.url}/invitaciones/${slug}/#confirmacion`);await settled(page);assert.equal(await page.locator('html').getAttribute('data-theme'),theme);
  assert.equal(await page.locator('.celebration-header').isVisible(),false);assert.equal(await page.locator('.celebration-header').evaluate(x=>x.inert),true);
  checkGeometry(await geometry(page));await page.screenshot({path:path.join(values.evidence,`${slug}-${theme}-${width}-cover.png`)});
  await page.keyboard.press('Tab');assert.equal(await page.locator('[data-open]').evaluate(x=>x===document.activeElement),true);
  await page.keyboard.press('Enter');assert.equal(await page.locator('body').getAttribute('data-phase'),'opening');assert.equal(await page.locator('.celebration-header').isVisible(),false);
  await page.waitForFunction(()=>document.body.dataset.phase==='open');assert.equal(await page.locator('.celebration-header').isVisible(),true);assert.equal(await page.evaluate(()=>document.activeElement.id),'confirmacion');
  const artRatio=await page.locator('.welcome img').evaluate(img=>img.clientWidth/img.clientHeight);assert.ok(Math.abs(artRatio-1)<0.01,'interior artwork keeps its square proportions');
  await page.locator('#guest').fill('Persona de muestra');await page.locator('[value=yes]').check();await page.locator('button[type=submit]').click();assert.match(await page.locator('[data-rsvp-status]').innerText(),/no se ha enviado ni guardado/);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(values.evidence,`${slug}-${theme}-${width}-interior.png`),fullPage:true});
  await page.locator('[data-cover]').click();assert.equal(await page.locator('.celebration-header').isVisible(),false);assert.equal(await page.locator('.celebration-header').evaluate(x=>x.inert),true);
  await page.locator('[data-skip]').click();assert.equal(await page.locator('body').getAttribute('data-phase'),'open');
  await page.locator('[data-cover]').click();await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-open]').click();assert.equal(await page.locator('body').getAttribute('data-phase'),'open');
  assert.equal(requests.filter(r=>new URL(r.url).pathname.startsWith('/api')||r.method!=='GET').length,0);assert.deepEqual(errors,[]);
  records.push({slug,theme,width,opening:true,sampleNoNetwork:true,geometry:true});await context.close();
 }
 for(const width of [360,390,430]){
  const context=await browser.newContext({viewport:{width,height:844}});const page=await context.newPage();await page.goto(`${values.url}/invitaciones/camila-30/`);await settled(page);const g=await geometry(page);checkGeometry(g);await page.screenshot({path:path.join(values.evidence,`camila-30-light-${width}-cover.png`)});records.push({slug:'camila-30',width,geometry:g});await context.close();
 }
 for(const theme of ['light','dark'])for(const width of [375,1440,1920])for(const [category,slug] of [['cumpleanos','camila-30'],['eventos','conexion-27']]){
  const context=await browser.newContext({viewport:{width,height:width===375?844:1000},reducedMotion:'reduce'});await context.addInitScript(theme=>localStorage.setItem('nordra-theme',theme),theme);
  const page=await context.newPage(),docs=[];page.on('request',r=>{if(r.resourceType()==='document')docs.push(r.url());});await page.goto(`${values.url}/invitaciones`);const link=page.locator(`#tipos-invitacion a[href="/invitaciones/${slug}/"]`);await link.scrollIntoViewIfNeeded();
  assert.equal(docs.some(u=>u.includes(slug)),false,'invitation not loaded before click');
  await page.screenshot({path:path.join(values.evidence,`directory-${category}-${theme}-${width}.png`)});
  await link.click();await page.waitForURL(`**/invitaciones/${slug}/`);await settled(page);checkGeometry(await geometry(page));
  assert.equal(await page.locator('.celebration-header').isVisible(),false);await page.locator('[data-skip]').click();assert.equal(await page.locator('.celebration-header').isVisible(),true);
  records.push({category,theme,width,loadsOnlyOnClick:true,mode:'direct'});await context.close();
 }
 fs.writeFileSync(path.join(values.evidence,'checks.json'),JSON.stringify(records,null,2));console.log(`${records.length} browser cases passed`);
}finally{await browser.close();}
