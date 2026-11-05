import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {chromium} from 'playwright';import sharp from 'sharp';
const output=process.env.SAMPLE_EVIDENCE||path.join(process.env.TEMP,'nordra-bodas-muestra');fs.mkdirSync(output,{recursive:true});
const url=process.env.SAMPLE_URL||'http://127.0.0.1:5198';const mock=process.env.SAMPLE_MOCK||'file:///E:/Nordra%20Studio/Maquetas/bodas-muestra/index.html?embed=1&photo=1';
const browser=await chromium.launch({channel:'chrome'}),results=[];
const settle=async p=>{await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(900);};
const position=async(p,selector,offset)=>{await p.locator(selector).evaluate((e,y)=>scrollTo({top:scrollY+e.getBoundingClientRect().top-y,behavior:'instant'}),offset);await settle(p);};
try{for(const [width,height] of [[1440,900],[390,844],[375,667]])for(const lang of ['es','en'])for(const theme of ['light','dark']){
 const mobile=width<701,context=await browser.newContext({viewport:{width,height},hasTouch:mobile,isMobile:mobile,locale:lang==='es'?'es-MX':'en-US'}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});await page.route('**/_vercel/insights/script.js',r=>r.fulfill({contentType:'application/javascript',body:''}));
 await page.goto(`${url}/${lang==='en'?'en/':''}bodas?theme=${theme}`);await settle(page);
 const notice=page.locator('.locale-suggestion button');if(await notice.isVisible())await notice.click();
 const ref=await context.newPage();await ref.goto(mock);await ref.addStyleTag({content:'.mock-bar{display:none}'});await settle(ref);
 if(theme==='dark')await ref.addStyleTag({content:':root{--paper:#1c1714;--paper-2:#28201b;--ink:#efe6d8;--soft:#bfae99;--line:#3a3029;--accent:#d8c3a5}'});
 const prefix=`${lang}-${theme}-${width}`;
 async function capture(name){const actual=path.join(output,`${prefix}-${name}.jpg`),reference=path.join(output,`${prefix}-${name}-reference.jpg`);await page.screenshot({path:actual});await ref.screenshot({path:reference});await sharp({create:{width:width*2,height,channels:3,background:'#fff'}}).composite([{input:reference,left:0,top:0},{input:actual,left:width,top:0}]).jpeg({quality:85}).toFile(path.join(output,`${prefix}-${name}-comparison.jpg`));}
 await position(page,'.rings-thread',260);await position(ref,'.thread',260);await capture('transition');
 await position(page,'.rings-couple',110);await position(ref,'.couple',110);await capture('couple');
 const photo=await page.locator('.rings-story-photo').boundingBox();assert(Math.abs(photo.width/photo.height-.8)<.01);assert(photo.width<=380.1);
 assert.equal(await page.locator('.couple-lead').textContent(),lang==='en'?"The rings already have names. Now it's time to tell everyone.":'Los anillos ya tienen nombre. Ahora falta contárselo a todos.');
 const tabs=page.locator('.wedding-switch');assert.equal(await tabs.getAttribute('aria-orientation'),mobile?'horizontal':'vertical');
 const heights={};
 for(const step of ['cover','panel']){
  await position(page,mobile?'.wedding-switch':'.wedding-sample-composition',mobile?82:110);await position(ref,mobile?'.steps':'.sample',mobile?82:110);
  const tab=page.locator(`#tab-${step}`);if(mobile){const b=await tab.boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}else await tab.click();
  await ref.locator(`.steps [data-step=${step}]`).click();await settle(page);await settle(ref);
  assert.equal(await page.locator('#panel-boda').getAttribute('data-step'),step);assert.equal(await tab.getAttribute('aria-selected'),'true');
  const device=page.locator(step==='cover'?'.wedding-phone':'.wedding-dashboard'),box=await device.boundingBox();assert.equal(await device.evaluate(e=>getComputedStyle(e).opacity),'1');
  if(mobile){const bottom=await page.locator('.mobile-route').evaluate(e=>e.getBoundingClientRect().top);assert(box.y>=0&&box.y+box.height<=bottom,`${prefix} ${step} clipped: ${JSON.stringify({box,bottom})}`);assert(box.x>=0&&box.x+box.width<=width);const t=await tabs.boundingBox();assert(box.y-(t.y+t.height)<35,'No empty gap above device');}
  else assert((await page.locator('.wedding-sample-composition').boundingBox()).height<900);
  heights[step]=await page.locator('#bodas-respuesta').evaluate(e=>e.getBoundingClientRect().height);await capture(step);
 }
 if(!mobile){await page.locator('#tab-cover').focus();await page.keyboard.press('ArrowDown');assert.equal(await page.locator('#tab-panel').getAttribute('aria-selected'),'true');await page.keyboard.press('Home');assert.equal(await page.locator('#tab-cover').getAttribute('aria-selected'),'true');await page.keyboard.press('End');assert.equal(await page.locator('#tab-panel').getAttribute('aria-selected'),'true');await page.locator('.wedding-phone').click({position:{x:15,y:40}});assert.equal(await page.locator('#panel-boda').getAttribute('data-step'),'cover');const d=await page.locator('.wedding-dashboard').boundingBox();await page.mouse.click(d.x+d.width-20,d.y+30);assert.equal(await page.locator('#panel-boda').getAttribute('data-step'),'panel');}
 await page.evaluate(()=>location.hash='bodas-panel-muestra');await settle(page);assert.equal(await page.locator('#panel-boda').getAttribute('data-step'),'panel');
 await page.evaluate(()=>document.body.dataset.journeyMotion='paused');assert.equal(await page.locator('#tab-panel').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');await context.clearPermissions();await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('.wedding-dashboard').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);results.push({width,height,lang,theme,heights,photoRatio:photo.width/photo.height,errors});console.log(prefix,heights);await context.close();
}fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));}finally{await browser.close();}
