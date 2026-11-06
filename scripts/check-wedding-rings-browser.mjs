import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';import {launch,instrument,profile,preparationMetrics} from './wedding-rings-browser-support.mjs';
const url=process.env.RINGS_URL||'http://127.0.0.1:5198';const output=process.env.RINGS_EVIDENCE||path.join(process.env.TEMP||'.','nordra-wedding-rings');fs.mkdirSync(output,{recursive:true});const results=[];
const browser=await launch();
try{
 if(!['static','language'].includes(process.env.RINGS_SUITE))for(const lang of ['es','en'])for(const mobile of [false,true])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},hasTouch:mobile,isMobile:mobile,locale:lang==='es'?'es-MX':'en-US'});await profile(context);const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});await instrument(page);await page.route('**/_vercel/insights/script.js',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
  await page.goto(`${url}/${lang==='en'?'en/':''}bodas?theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
  const title=await page.locator('h1').textContent();assert.match(title,lang==='es'?/para siempre/:/forever/);
  assert.equal(await page.locator('[data-rings-sound]').getAttribute('aria-pressed'),'false');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow');
  if(mobile){await page.waitForTimeout(500);assert.equal(await page.evaluate(()=>window.__webglContexts),0);await page.locator('[data-rings-start]').scrollIntoViewIfNeeded();const box=await page.locator('[data-rings-start]').boundingBox();assert(box.y>=0&&box.y+box.height<=await page.locator('.mobile-route').evaluate(el=>el.getBoundingClientRect().top));await page.screenshot({path:path.join(output,`${lang}-${theme}-390-initial.jpg`),type:'jpeg'});await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);assert.equal(await page.evaluate(()=>window.__ringsStartClicks),1,'Real touch must dispatch a click');}
  await page.waitForFunction(()=>window.__rings&&document.querySelector('.rings-hero.has-scene'));await page.waitForTimeout(8500);
  let preparation;
  if(!mobile){
   const first=await preparationMetrics(page);assert(first.maximumTask<=200,`First visit blocked ${first.maximumTask} ms`);
   await page.reload();await page.waitForFunction(()=>window.__rings&&document.querySelector('.rings-hero.has-scene'));await page.waitForTimeout(8500);
   const repeat=await preparationMetrics(page);assert(repeat.maximumTask<=200,`Repeated visit blocked ${repeat.maximumTask} ms`);preparation={first,repeat};
  }
  const fps=await page.evaluate(()=>{const a=window.__rings.frames.filter(t=>t>performance.now()-5000);return (a.length-1)*1000/(a.at(-1)-a[0]);});if(!mobile)assert(fps>50,`Expected >50 fps, got ${fps}`);
  // Find an actual ray-hit point by probing pointerdown across the ring region.
  const hit=await page.evaluate(()=>{const hero=document.querySelector('.rings-hero'),r=hero.getBoundingClientRect();for(let y=Math.max(0,r.top+r.height*.35);y<Math.min(innerHeight-10,r.bottom);y+=18)for(let x=innerWidth*(innerWidth>900?.5:.15);x<innerWidth*.95;x+=18){if(window.__rings.hit(x,y)&&window.__rings.hit(x-6,y)&&window.__rings.hit(x+6,y)&&window.__rings.hit(x,y-6)&&window.__rings.hit(x,y+6)&&!document.elementFromPoint(x,y)?.closest('button,a,.copy,.site-header')&&![...document.querySelectorAll('button,a')].some(el=>{const b=el.getBoundingClientRect();return b.width&&x>b.left-24&&x<b.right+24&&y>b.top-24&&y<b.bottom+24})){return{x,y};}}return null;});
  assert(hit,'Visible rings must have a hit target');
  // Real mouse/touch input, not a call to the scene tap handler.
  if(mobile)await page.touchscreen.tap(hit.x,hit.y);else await page.mouse.click(hit.x,hit.y);await page.waitForTimeout(1700);assert(await page.evaluate(()=>window.__rings.spin)>6,`Tap spins a full turn: ${JSON.stringify({hit,state:await page.evaluate(()=>({spin:window.__rings.spin,active:window.__rings.active,clock:window.__rings.clock}))})}`);
  await page.mouse.move(hit.x,hit.y);await page.mouse.down();await page.mouse.move(hit.x+65,hit.y,{steps:16});await page.mouse.up();await page.waitForTimeout(100);const displaced=await page.evaluate(()=>window.__rings.rotation);assert(Math.abs(displaced)>.05,'Drag rotates');await page.waitForTimeout(10500);const returned=await page.evaluate(()=>{const r=window.__rings.rotation;return Math.abs(r-Math.round(r/(2*Math.PI))*2*Math.PI)});assert(returned<.06,'Spring returns to nearest full turn');
  await page.locator('[data-business-toggle]').click();await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>window.__rings.active),false);const a=await page.evaluate(()=>document.querySelector('#rings-stage canvas').toDataURL());await page.waitForTimeout(1000);const b=await page.evaluate(()=>document.querySelector('#rings-stage canvas').toDataURL());assert(a===b,'Paused canvas changes');
  assert.equal(await page.locator('.rings-hero').getAttribute('data-running'),'false');assert(await page.locator(`.rings-poster-${theme} img`).isVisible());
  await page.locator('.rings-story-photo').scrollIntoViewIfNeeded();assert(await page.locator('.rings-story-photo').isVisible());const photo=await page.locator('.rings-story-photo').boundingBox();assert(Math.abs(photo.width/photo.height-.8)<.01,'Couple photo retains its 4:5 ratio');await page.locator('#rings-seal').scrollIntoViewIfNeeded();await page.waitForFunction(()=>document.querySelector('#rings-seal').classList.contains('on'));
  await page.screenshot({path:path.join(output,`${lang}-${theme}-${mobile?'mobile':'desktop'}-story.jpg`),type:'jpeg'});assert.deepEqual(errors,[]);results.push({lang,mobile,theme,fps,dragError:returned,consoleErrors:errors.length,preparation});console.log(lang,mobile,theme,fps.toFixed(1));await context.close();
 }
 if(!['static','language'].includes(process.env.RINGS_SUITE))for(const [width,height] of [[375,667],[412,915]])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,locale:'es-MX'});await profile(context);const page=await context.newPage();await instrument(page);
  await page.goto(`${url}/bodas?theme=${theme}`);await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(200);
  await page.locator('[data-rings-start]').scrollIntoViewIfNeeded();const box=await page.locator('[data-rings-start]').boundingBox();assert(box.y>=0&&box.y+box.height<=await page.locator('.mobile-route').evaluate(el=>el.getBoundingClientRect().top),'Control above bottom bar');
  assert.match(await page.locator(`.rings-poster-${theme} img`).evaluate(img=>img.currentSrc),/mobile.webp/);
  await page.screenshot({path:path.join(output,`es-${theme}-${width}-initial.jpg`),type:'jpeg'});await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);assert.equal(await page.evaluate(()=>window.__ringsStartClicks),1);
  await page.waitForFunction(()=>window.__rings&&document.querySelector('.rings-hero.has-scene'));await page.waitForTimeout(8500);await page.screenshot({path:path.join(output,`es-${theme}-${width}-live.jpg`),type:'jpeg'});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);results.push({width,height,theme,realTouch:true});await context.close();
 }
 if(process.env.RINGS_SUITE!=='static')for(const [width,height] of [[375,667],[390,844],[412,915]])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,locale:'en-US'});await profile(context);const page=await context.newPage();await instrument(page);
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(`${url}/bodas?theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
  const checkFit=async()=>{
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForFunction(()=>document.querySelector('.rings-back').getBoundingClientRect().top>=document.querySelector('.site-header').getBoundingClientRect().bottom);
   await page.locator('[data-rings-start]').scrollIntoViewIfNeeded();const box=await page.locator('[data-rings-start]').boundingBox();
   assert(box.y>=0&&box.y+box.height<=await page.locator('.mobile-route').evaluate(el=>el.getBoundingClientRect().top),'Motion control above actual bottom bar');
   assert(await page.evaluate(({x,y,width,height})=>Boolean(document.elementFromPoint(x+width/2,y+height/2)?.closest('[data-rings-start]')),box),'Motion control owns the touch point');
   return box;
  };
  const box=await checkFit();const fitted=await page.locator('.rings-hero').evaluate(el=>el.getBoundingClientRect().height);
  const sizes=await page.evaluate(()=>Object.fromEntries(['.eyebrow','.hint','.rings-controls button'].map(selector=>[selector,parseFloat(getComputedStyle(document.querySelector('.rings-hero '+selector)).fontSize)])));
  assert(sizes['.eyebrow']>=11&&sizes['.hint']>=11&&sizes['.rings-controls button']>=12);
  await page.screenshot({path:path.join(output,`locale-${theme}-${width}.jpg`),type:'jpeg'});
  await page.touchscreen.tap(box.x+box.width/2,box.y+box.height/2);assert.equal(await page.evaluate(()=>window.__ringsStartClicks),1);
  await page.waitForFunction(()=>document.querySelector('.rings-hero.has-scene #rings-stage canvas'));await page.waitForTimeout(8500);
  await page.screenshot({path:path.join(output,`locale-${theme}-${width}-live.jpg`),type:'jpeg'});
  await page.setViewportSize({width,height:height+40});assert.equal(await page.locator('.rings-hero').evaluate(el=>el.getBoundingClientRect().height),fitted,'Viewport height does not shrink typography');
  assert.deepEqual(errors,[]);results.push({locale:'en-US',width,height,theme,realTouch:true,resized:true,sizes});await context.close();
 }
 if(process.env.RINGS_SUITE!=='language')for(const mobile of [false,true])for(const mode of ['reduced','cores','memory','saveData','paused'])for(const lang of ['es','en'])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1440,height:900},locale:lang,reducedMotion:mode==='reduced'?'reduce':'no-preference'});await profile(context,{cores:mode==='cores'?3:8,memory:mode==='memory'?2:8,saveData:mode==='saveData'});const page=await context.newPage();await page.goto(`${url}/${lang==='en'?'en/':''}bodas?theme=${theme}${mode==='paused'?'&motion=paused':''}`);await page.waitForTimeout(350);
  assert.equal(await page.evaluate(()=>window.__webglContexts),0,mode);assert.equal(await page.locator('#rings-stage canvas').count(),0);assert(await page.locator(`.rings-poster-${theme} img`).isVisible());assert.match(await page.locator(`.rings-poster-${theme} img`).evaluate(i=>i.currentSrc),new RegExp(`rings-poster-${theme}-${mobile?'mobile':'desktop'}.webp`));assert.equal(await page.locator('#hint').isVisible(),false);results.push({mode,lang,theme,mobile,webglContexts:0});await context.close();
 }
 fs.writeFileSync(path.join(output,process.env.RINGS_SUITE==='static'?'browser-static-results.json':process.env.RINGS_SUITE==='language'?'browser-language-results.json':'browser-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results,null,2));
}finally{await browser.close();}
