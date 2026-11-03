// Browser regression suite and visual evidence for the real built invitations.
// node scripts/check-celebrations-browser.mjs --tools <package.json with Playwright> --url http://127.0.0.1:5502 --evidence <folder>
import {preview} from 'vite';import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{url:{type:'string'},tools:{type:'string'},chrome:{type:'string',default:'C:/Program Files/Google/Chrome/Application/chrome.exe'},evidence:{type:'string',default:'review/celebrations'}}});
const server=values.url?null:await preview({preview:{host:'127.0.0.1',port:5502}});
values.url??=server.resolvedUrls.local[0].replace(/\/$/,'');
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
  if(slug==='camila-30'){
    assert.equal(await page.locator('.album-fan img[loading=lazy]').count(),6);
    assert.equal(await page.locator('[data-pass-name]').textContent(),'Tu nombre aquí');
    const card=page.locator('.note-card button').first();await card.focus();await page.keyboard.press('Enter');
    assert.equal(await card.getAttribute('aria-expanded'),'true');await page.keyboard.press('Space');assert.equal(await card.getAttribute('aria-expanded'),'false');
  }else assert.ok(Math.abs(await page.locator('.welcome img').evaluate(img=>img.clientWidth/img.clientHeight)-1)<.01);
  await page.locator('#guest').fill('Persona de muestra');await page.locator('[value=yes]').check();await page.locator('button[type=submit]').click();assert.match(await page.locator('[data-rsvp-status]').innerText(),/no se ha enviado ni guardado/);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.screenshot({path:path.join(values.evidence,`${slug}-${theme}-${width}-interior.png`),fullPage:true});
  await page.locator('[data-cover]').click();assert.equal(await page.locator('.celebration-header').isVisible(),false);assert.equal(await page.locator('.celebration-header').evaluate(x=>x.inert),true);
  await page.locator('[data-skip]').click();assert.equal(await page.locator('body').getAttribute('data-phase'),'open');
  await page.locator('[data-cover]').click();await page.emulateMedia({reducedMotion:'reduce'});await page.locator('[data-open]').click();await page.waitForFunction(()=>document.body.dataset.phase==='open');
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
 for(const id of ['inicio','cuando','camila','saber','confirmacion']){
   const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
   const loaded=[];page.on('request',r=>loaded.push(r.url()));
   await page.goto(values.url+'/invitaciones/camila-30/#'+id);await settled(page);
   assert.equal(await page.locator('.celebration-header').isVisible(),false);
   await page.locator('[data-open]').click();
   await page.waitForFunction(()=>document.body.dataset.phase==='open');
   assert.equal(await page.evaluate(()=>document.activeElement.id),id==='inicio'?'cuando':id);
   assert.ok(!loaded.some(url=>/\/(?:scene|three)-[^/]+\.js/.test(url)));
   await page.close();
 }
 for(const fallback of ['no-webgl','skip']){
   const page=await browser.newPage();const loaded=[];page.on('request',r=>loaded.push(r.url()));
   if(fallback==='no-webgl')await page.addInitScript(()=>{
     const get=HTMLCanvasElement.prototype.getContext;
     HTMLCanvasElement.prototype.getContext=function(type,...args){return type==='webgl2'?null:get.call(this,type,...args)};
   });
   await page.goto(values.url+'/invitaciones/camila-30/');await settled(page);
   if(fallback==='no-webgl')await page.waitForTimeout(800);
   assert.equal(await page.locator('.cover-art img').isVisible(),true);
   await page.locator(fallback==='no-webgl'?'[data-open]':'[data-skip]').click();
   await page.waitForFunction(()=>document.body.dataset.phase==='open');
   assert.equal(await page.locator('.celebration-header').isVisible(),true);
   assert.equal(await page.locator('canvas').count(),0);
   assert.ok(!loaded.some(url=>/\/(?:scene|three)-[^/]+\.js/.test(url)));await page.close();
 }
 const live=await browser.newPage();await live.goto(values.url+'/invitaciones/camila-30/?quality=low');
 await live.locator('.cover-art.is-live canvas').waitFor();assert.equal(await live.locator('.cover-art').getAttribute('data-quality'),'low');
 await live.locator('[data-float-motion]').click();assert.equal(await live.locator('[data-float-motion]').getAttribute('aria-pressed'),'true');
 await live.locator('[data-float-motion]').click();await live.locator('.cover-art').click();
 assert.equal(await live.locator('.celebration-header').isVisible(),false);
 await live.waitForFunction(()=>document.body.dataset.phase==='open');assert.equal(await live.locator('.celebration-header').isVisible(),true);
 await live.locator('#guest').fill('Mar');await live.locator('[value=yes]').check();await live.locator('[type=submit]').click();await live.locator('.gold-sparks i').first().waitFor();
 await live.waitForTimeout(750);await live.locator('[type=submit]').click();assert.equal(await live.locator('.gold-sparks').count(),0);
 await live.locator('[value=no]').check();await live.locator('[type=submit]').click();
 assert.equal(await live.locator('[data-pass-state]').innerText(),'Esta vez no');
 assert.match(await live.locator('[data-rsvp-status]').innerText(),/Nos debemos ese baile/);
 assert.equal(await live.locator('.gold-sparks').count(),0);
 await live.close();records.push({anchors:5,reducedMotion:true,skip:true,noWebGL:true,interactive:true});
 fs.writeFileSync(path.join(values.evidence,'checks.json'),JSON.stringify(records,null,2));console.log(`${records.length} browser cases passed`);
}finally{await browser.close();await server?.close();}
