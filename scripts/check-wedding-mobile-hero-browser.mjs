import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {pathToFileURL} from 'node:url';import {chromium,webkit as bundledWebkit} from 'playwright';
import sharp from 'sharp';
const output=process.env.HERO_EVIDENCE;if(!output)throw Error('Set HERO_EVIDENCE outside the repository');fs.mkdirSync(output,{recursive:true});
const base=process.env.RINGS_URL||'http://127.0.0.1:5198';
const webkit=process.env.HERO_WEBKIT_MODULE?(await import(pathToFileURL(process.env.HERO_WEBKIT_MODULE).href)).webkit:bundledWebkit;
const results=[];
async function tap(page,selector){const el=page.locator(selector);await el.scrollIntoViewIfNeeded();const b=await el.boundingBox();assert(b&&b.height>=40,`${selector}: touch area`);assert(await el.evaluate(el=>{const b=el.getBoundingClientRect();return el.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2));}),`${selector}: obscured`);await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);}
try{for(const engine of (process.env.HERO_ENGINES||'chrome,webkit').split(',')){
 const browser=await(engine==='chrome'?chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe'}):webkit.launch());
 try{if(process.env.HERO_SUITE!=='visual')for(const [width,height] of [[390,664],[390,844],[375,667],[412,915]])for(const theme of ['light','dark'])for(const state of ['es','notice','closed','en']){
  const context=await browser.newContext({viewport:{width,height},hasTouch:true,isMobile:true,locale:state==='es'?'es-MX':'en-US'});
  await context.addInitScript(()=>{Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text()+' '+m.location().url);});await page.route('**/_vercel/**',r=>r.fulfill({status:200,body:''}));
  page.on('response',r=>{if(r.status()>=400)console.log('HTTP',r.status(),r.url());});
  // Local UI tests do not send telemetry or depend on the remote debug SDK.
  await page.route('https://va.vercel-scripts.com/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
  const id=`${engine}-${width}x${height}-${theme}-${state}`;console.log(id);
  await page.goto(`${base}/${state==='en'?'en/':''}bodas?theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
  if(state==='notice'||state==='closed')await page.locator('.locale-suggestion').waitFor();
  if(state==='closed')await page.locator('.locale-suggestion button').click();
  const layout=await page.evaluate(()=>{const hero=document.querySelector('.rings-hero'),back=hero.querySelector('.rings-back'),b=back.getBoundingClientRect(),header=document.querySelector('.site-header').getBoundingClientRect();return {title:parseFloat(getComputedStyle(hero.querySelector('h1')).fontSize),lead:parseFloat(getComputedStyle(hero.querySelector('.lead')).fontSize),eyebrow:parseFloat(getComputedStyle(hero.querySelector('.eyebrow')).fontSize),backVisible:back.contains(document.elementFromPoint(b.x+b.width/2,b.y+b.height/2)),top:hero.getBoundingClientRect().top,headerBottom:header.bottom,height:hero.getBoundingClientRect().height,titleBottom:hero.querySelector('h1').getBoundingClientRect().bottom,stageAfterActions:hero.querySelector('#rings-stage').getBoundingClientRect().top>=hero.querySelector('.actions').getBoundingClientRect().bottom-25,overflow:document.documentElement.scrollWidth>innerWidth};});
  assert(layout.title>=38&&layout.lead>=15&&layout.eyebrow>=11,JSON.stringify(layout));assert(layout.backVisible&&layout.top>=layout.headerBottom-1,JSON.stringify(layout));assert(!layout.overflow);assert(layout.stageAfterActions&&layout.titleBottom<height-54,JSON.stringify(layout));
  await page.screenshot({path:path.join(output,id+'-initial.png')});await page.locator('h1').screenshot({path:path.join(output,id+'-title.png')});
  await tap(page,'[data-business-toggle]');assert.equal(await page.locator('[data-business-toggle]').getAttribute('aria-pressed'),'true');await tap(page,'[data-business-toggle]');assert.equal(await page.locator('[data-business-toggle]').getAttribute('aria-pressed'),'false');
  // Preserve this document while verifying that a native touch reaches each pill.
  await page.locator('.rings-hero .occasion-path').evaluate(nav=>nav.addEventListener('click',e=>{const a=e.target.closest('a');if(a){e.preventDefault();window.__pill=a.getAttribute('href');}},true));
  for(const href of ['bodas','cumpleanos','eventos','temporada']){await tap(page,`.rings-hero .occasion-path a[data-go="${href}"]`);assert((await page.evaluate(()=>window.__pill)).endsWith('/'+href));}
  await tap(page,'[data-rings-start]');await page.waitForFunction(()=>document.querySelector('.rings-hero.has-scene #rings-stage canvas'),{},{timeout:45000});
  await page.waitForTimeout(1000);assert.equal(await page.locator('#rings-stage').getAttribute('data-renderer'),'webgl');
  await page.locator('#rings-stage').screenshot({path:path.join(output,id+'-scene.png')});assert.deepEqual(errors,[]);results.push({engine,width,height,theme,state,...layout,realTouch:true,canvas:true,errors});await context.close();
 }
 for(const width of [390,1440])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height:900},locale:'es-MX',reducedMotion:'reduce'});await page.goto(`${base}/bodas?theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
  const title=page.locator('h1'),box=await title.boundingBox(),clip={x:Math.max(0,box.x-40),y:box.y,width:Math.min(width,box.width+80),height:box.height+20};const masked=await page.screenshot({path:path.join(output,`${engine}-${width}-${theme}-title-complete.png`),clip});
  await page.locator('#script1').evaluate(el=>el.parentElement.removeAttribute('mask'));
  const unmasked=await page.screenshot({path:path.join(output,`${engine}-${width}-${theme}-title-unmasked.png`),clip});const a=await sharp(masked).raw().toBuffer(),b=await sharp(unmasked).raw().toBuffer();const changed=a.reduce((n,v,i)=>n+(Math.abs(v-b[i])>16?1:0),0);assert.equal(changed,0,`${engine} ${width}: mask clips glyphs`);results.push({kind:'title-mask',engine,width,theme,changed,total:a.length});await page.close();
 }
 if(engine==='chrome')for(const [width,height] of [[390,664],[390,844],[375,667],[412,915]])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height}});await page.goto((process.env.HERO_MOCK||'file:///E:/Nordra%20Studio/Maquetas/bodas-hero-movil/index.html')+`?embed=1&theme=${theme}`);await page.evaluate(()=>document.fonts.ready);
  const mock=await page.screenshot({path:path.join(output,`mock-${width}x${height}-${theme}.png`)}),site=path.join(output,`chrome-${width}x${height}-${theme}-es-initial.png`);
  await sharp({create:{width:width*2,height,channels:3,background:'#fff'}}).composite([{input:mock,left:0,top:0},{input:site,left:width,top:0}]).png().toFile(path.join(output,`compare-${width}x${height}-${theme}.png`));await page.close();
 }
 }finally{await browser.close();}
}}finally{fs.writeFileSync(path.join(output,'mobile-results-'+(process.env.HERO_SUITE||'matrix')+'-'+(process.env.HERO_ENGINES||'all')+'.json'),JSON.stringify(results,null,2));}
