import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium} from 'playwright';
import {preview} from 'vite';
const evidence=path.resolve('documentacion/abrir-con-un-toque');fs.mkdirSync(evidence,{recursive:true});
const server=await preview({preview:{host:'127.0.0.1',port:5575,strictPort:true}}),origin='http://127.0.0.1:5575';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const records=[],hintChecks=[];
async function selectSeason(page,index){const panel=page.locator('.phone-open').nth(index).locator('xpath=ancestor::*[@role="tabpanel"]');if(await panel.count()){const id=await panel.getAttribute('aria-labelledby');await page.locator('#'+id).click();}}
// Include the whole frame and its hanging hint, plus nearby copy in evidence.
async function capturePhone(page,phone,name){
 await phone.evaluate(el=>scrollTo({top:Math.max(0,el.getBoundingClientRect().top+scrollY-128),behavior:'instant'}));
 if(name.includes('hover'))await phone.hover();
 else if(name.includes('reposo'))await page.mouse.move(0,0);
 await page.waitForTimeout(350);
 const clip=await phone.evaluate(el=>{const r=el.getBoundingClientRect(),h=el.querySelector('.phone-open-hint').getBoundingClientRect();const x=Math.max(0,Math.min(r.x,h.x)-16),y=Math.max(0,r.y-12);return {x:x+scrollX,y:y+scrollY,width:Math.min(innerWidth-x,Math.max(r.right,h.right)-x+16),height:Math.max(r.bottom,h.bottom)-y+64};});
 await page.screenshot({path:path.join(evidence,'2b-'+name),clip,fullPage:true});
}
async function checkHint(phone,label){
 const geometry=await phone.evaluate(el=>{
  const hint=el.querySelector('.phone-open-hint'),screen=el.querySelector('.live-screen,.phone-screen')||el.querySelector('img');
  const box=node=>{const r=node.getBoundingClientRect();return {left:r.left,top:r.top,right:r.right,bottom:r.bottom,width:r.width,height:r.height};};
  const h=box(hint),s=box(screen),intersects=r=>Math.min(h.right,r.right)-Math.max(h.left,r.left)>.5&&Math.min(h.bottom,r.bottom)-Math.max(h.top,r.top)>.5;
  const host=el.closest('.showcase-live,.wedding-stage,.season-card,.seasonal-demo,.signature-work');
  const nearby=[...host.querySelectorAll('.live-note,.wedding-credit,.season-caption,.seasonal-demo-copy,.signature-work-link')];
  const article=el.closest('.seasonal-demo');if(article?.nextElementSibling)nearby.push(article.nextElementSibling);
  return {hint:h,screen:s,overlap:intersects(s),collisions:nearby.filter(n=>intersects(box(n))).map(n=>n.className),opacity:getComputedStyle(hint).opacity,height:getComputedStyle(hint).height,fontSize:getComputedStyle(hint).fontSize,pointerEvents:getComputedStyle(hint).pointerEvents};
 });
 assert.equal(geometry.overlap,false,label+': hint must not intersect screen '+JSON.stringify(geometry));
 assert.deepEqual(geometry.collisions,[],label+': hint must not cover nearby copy/cards');
 if(/hover|focus|mobile/.test(label))assert.equal(geometry.opacity,'1',label+': hint is visible');
 assert.equal(geometry.height,'32px');assert.equal(geometry.fontSize,'14px');assert.equal(geometry.pointerEvents,'none');
 hintChecks.push({label,...geometry});
 return geometry;
}
try{
 for(const route of ['cumpleanos','eventos','temporada','invitaciones','bodas']){
  const inventory=await browser.newPage();await inventory.goto(origin+'/'+route);const count=await inventory.locator('.phone-open').count();await inventory.close();
  for(let index=0;index<count;index++){
   const page=await browser.newPage({viewport:{width:1440,height:1000}});await page.goto(origin+'/'+route);await selectSeason(page,index);const control=page.locator('.phone-open').nth(index),screen=control.locator('..'),phone=screen.locator('..');await control.scrollIntoViewIfNeeded();await page.mouse.move(0,0);await page.waitForTimeout(450);await checkHint(phone,`${route} ${index} desktop rest`);await capturePhone(page,phone,`${route}-${index}-reposo-1440.png`);await control.hover();await page.waitForTimeout(450);await checkHint(phone,`${route} ${index} desktop hover`);await capturePhone(page,phone,`${route}-${index}-hover-1440.png`);await control.focus();await page.waitForTimeout(350);await checkHint(phone,`${route} ${index} desktop focus`);
   const href=await control.getAttribute('href');assert.ok(href.startsWith('/'));assert.match(await control.getAttribute('aria-label'),/Abrir/);
   await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await screen.evaluate(el=>getComputedStyle(el.closest('.live-phone,.phone-interactive')||el).translate),'none');
   await control.focus();if(route==='bodas'){await Promise.all([page.waitForURL('**'+href),page.keyboard.press('Enter')]);}else{await page.keyboard.press('Enter');await page.locator('.is-live iframe').waitFor();await page.locator('.phone-fullscreen').waitFor();assert.equal(await control.isVisible(),false);const frame=page.locator('.is-live iframe');assert.ok(await frame.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el}));assert.equal(await page.locator('.phone-fullscreen').getAttribute('href'),origin+href);}
   await page.close();
   const mobile=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});await mobile.goto(origin+'/'+route);await selectSeason(mobile,index);const tap=mobile.locator('.phone-open').nth(index);await tap.scrollIntoViewIfNeeded();assert.equal(await tap.locator('../..').locator('.phone-open-hint').evaluate(el=>getComputedStyle(el).opacity),'1');await checkHint(tap.locator('../..'),`${route} ${index} mobile`);await capturePhone(mobile,tap.locator('../..'),`${route}-${index}-tacto-390.png`);await Promise.all([mobile.waitForURL('**'+href),tap.tap()]);await mobile.close();records.push({route,index,href,desktop:true,mobile:true,keyboard:true,reducedMotion:true});
  }
 }
 for(const route of ['cumpleanos','eventos','temporada','invitaciones','bodas']){const page=await browser.newPage({javaScriptEnabled:false});await page.goto(origin+'/'+route);for(const a of await page.locator('.phone-open').all()){assert.ok((await a.getAttribute('href')).startsWith('/'));assert.ok(await a.getAttribute('aria-label'));}assert.equal(await page.getByText('Pruébala aquí',{exact:true}).count(),0);await page.close();}
 for(const route of ['cumpleanos','eventos','temporada','invitaciones','bodas'])for(const width of [375,390,1440,1920])for(const theme of ['light','dark']){const page=await browser.newPage({viewport:{width,height:1000}});await page.goto(`${origin}/${route}?theme=${theme}`);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} ${width} ${theme}`);if(route==='invitaciones'){
 const cards=page.locator('.inv-occasions>div');assert.equal(await cards.count(),4);assert.equal(await cards.locator('img').count(),4);assert.equal(await cards.locator('a a').count(),0);for(const card of await cards.all()){await card.scrollIntoViewIfNeeded();assert.ok(await card.evaluate(el=>{const r=el.getBoundingClientRect(),a=document.elementFromPoint(r.right-12,r.bottom-12)?.closest('a');return a===el.querySelector('a')}));}for(const sample of await cards.locator('.inv-sample').all()){assert.ok(await sample.evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)?.closest('a')===el}));}if([390,1440].includes(width))await page.locator('.inv-occasions').screenshot({path:path.join(evidence,`despues-${width}-${theme}.png`)});
 }await page.close();}
 for(const route of ['cumpleanos','eventos','temporada','invitaciones','bodas']){const p=await browser.newPage();await p.goto(origin+'/en/'+route);assert.equal((await p.locator('.phone-open').first().locator('../..').locator('.phone-open-hint').innerText()).trim(),'Open it');assert.equal(await p.locator('.phone-open').first().locator('../..').locator('.phone-open-hint svg').count(),1);assert.match(await p.locator('.phone-open').first().getAttribute('aria-label'),/^Open /);await p.close();}
 const home=await browser.newPage({viewport:{width:1440,height:1000}});await home.goto(origin+'/');const phone=home.locator('.signature-work .phone-interactive');assert.equal(await phone.count(),1);await phone.scrollIntoViewIfNeeded();await home.mouse.move(0,0);await checkHint(phone,'home desktop rest');await capturePhone(home,phone,'inicio-reposo-1440.png');await phone.hover();await home.waitForTimeout(400);await checkHint(phone,'home desktop hover');await capturePhone(home,phone,'inicio-hover-1440.png');await home.locator('.signature-work:has(.phone-interactive)').focus();await checkHint(phone,'home desktop focus');await home.close();const touchHome=await browser.newPage({viewport:{width:390,height:844},hasTouch:true});await touchHome.goto(origin+'/');const homePhone=touchHome.locator('.signature-work .phone-interactive');await homePhone.scrollIntoViewIfNeeded();await checkHint(homePhone,'home mobile');await capturePhone(touchHome,homePhone,'inicio-tacto-390.png');await touchHome.close();
 assert.equal(records.length,15);fs.writeFileSync(path.join(evidence,'2b-geometria.json'),JSON.stringify(hintChecks,null,2));
 fs.writeFileSync(path.join(evidence,'2b-verificacion.json'),JSON.stringify(records,null,2));console.log(`${records.length + 1} etiquetas sin cruce con pantalla a 390 y 1440; ${records.length} teléfonos: escritorio, Enter, móvil, enlaces sin JS; tarjetas, inglés y 40 combinaciones sin desbordamiento`);
}finally{await browser.close();await server.close();}
