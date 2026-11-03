// Review the built page with the visitor's clock fixed before any site script runs.
// node scripts/check-seasonal-browser.mjs --url http://127.0.0.1:5521 --tools <package.json with Playwright> --evidence <folder>
import {preview} from 'vite';import {seasons,seasonalOffer,invitationMoney} from '../src/data/invitationPricing.ts';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';import {parseArgs} from 'node:util';
const {values}=parseArgs({options:{url:{type:'string'},tools:{type:'string'},evidence:{type:'string',default:'review/seasonal'},chrome:{type:'string',default:'C:/Program Files/Google/Chrome/Application/chrome.exe'}}});
const require=createRequire(values.tools?path.resolve(values.tools):import.meta.url),{chromium}=require('playwright');fs.mkdirSync(values.evidence,{recursive:true});const records=[];
const server=values.url?null:await preview({preview:{host:'127.0.0.1',port:5521,strictPort:false}});
const origin=values.url??server.resolvedUrls.local[0].replace(/\/$/,'');
const browser=await chromium.launch({executablePath:values.chrome,headless:true,args:['--enable-unsafe-swiftshader']});
const cases=[{date:'2027-01-05',season:'halloween',chapters:['halloween','navidad','fin-de-ano'],image:'halloween',demo:'/demos/halloween/index.html'},{date:'2026-11-01',season:'posadas',chapters:['navidad','fin-de-ano','halloween'],image:'posada',demo:'/demos/posada-pinata/index.html'},{date:'2026-12-20',season:'fin-de-ano',chapters:['fin-de-ano','navidad','halloween'],image:'celebra',demo:'/demos/celebra-2027/index.html'},{date:'2026-09-15',season:'halloween',chapters:['halloween','navidad','fin-de-ano'],image:'halloween',demo:'/demos/halloween/index.html'}];
try{
 for(const c of cases)for(const width of [375,1440,1920])for(const theme of ['light','dark']){
  const context=await browser.newContext({viewport:{width,height:width===375?844:1000},timezoneId:'America/Monterrey'}),page=await context.newPage();await context.addInitScript(iso=>{const NativeDate=Date,fixed=NativeDate.parse(iso);window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[fixed]));}static now(){return fixed;}};},c.date+'T12:00:00-06:00');
  await context.addInitScript(theme=>{localStorage.setItem('nordra-theme',theme);window.seasonTest={shifts:[],lateMoves:[]};new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput){seasonTest.shifts.push(e.value);(seasonTest.details??=[]).push(e.sources.map(s=>[s.node?.outerHTML?.slice(0,110),s.previousRect.y,s.currentRect.y]));}}).observe({type:'layout-shift',buffered:true});new MutationObserver(mutations=>{
   const root=document.documentElement;if(root?.dataset.season&&!root.hasAttribute('data-season-preparing')&&!seasonTest.reveal){seasonTest.reveal=performance.now();seasonTest.orderAtReveal=[...document.querySelectorAll('[role=tab]')].map(x=>x.getAttribute('aria-controls'));}
   if(performance.getEntriesByName('first-contentful-paint').length)for(const m of mutations)for(const n of m.removedNodes)if(n.nodeType===1&&(n.matches('.seasonal-chapter')||n.matches('[role=tab]')))seasonTest.lateMoves.push(n.id||n.getAttribute('href'));
  }).observe(document,{subtree:true,childList:true,attributes:true,attributeFilter:['data-season-preparing']});},theme);
  const requests=[],docs=[],errors=[];page.on('request',r=>{requests.push(r.url());if(r.resourceType()==='document')docs.push(r.url());});page.on('pageerror',e=>errors.push(e.message));
  await page.goto(origin+'/temporada');await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(2000);
  const expected=c.chapters.map(x=>'temporada-'+x),tabs=page.getByRole('tab'),actual=await tabs.evaluateAll(nodes=>nodes.map(x=>x.getAttribute('aria-controls')));assert.deepEqual(actual,expected);
  assert.equal(await page.getByRole('tab',{selected:true}).getAttribute('aria-controls'),expected[0]);
  assert.equal(await page.locator('.mobile-route a').first().getAttribute('href'),'#temporada-coleccion');assert.equal(await page.locator('html').getAttribute('data-season'),c.season);assert.equal(await page.locator('body').evaluate(x=>getComputedStyle(x).visibility),'visible');
  const stats=await page.evaluate(()=>({...seasonTest,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,cls:seasonTest.shifts.reduce((a,b)=>a+b,0)}));assert.deepEqual(stats.orderAtReveal,expected);assert.ok(stats.reveal<=stats.fcp,'DOM finalized before first contentful paint');assert.deepEqual(stats.lateMoves,[]);assert.ok(stats.cls<.01,`CLS ${c.date} ${width} ${theme} ${stats.cls} ${JSON.stringify(stats.details)}`);
  const covers=[...new Set(requests.filter(x=>/inv-season-.*\.webp/.test(x)))];const heroCover=await page.locator('.seasonal-hero-live .live-screen > img').evaluate(img=>img.currentSrc);assert.ok(covers.includes(heroCover)&&heroCover.includes('inv-season-'+c.image+'-'));
  assert.ok(covers.every(url=>url.includes('inv-season-'+c.image+'-')),'only active season covers load');
  assert.equal(docs.length,1,'no invitation document before click');
  assert.equal(await page.locator('.seasonal-hero-live .live-note').isVisible(),true);const link=page.locator('.seasonal-hero-live [data-live-try]');assert.equal(await link.getAttribute('href'),c.demo);const halloween=tabs.filter({hasText:'Halloween'}).locator('small');
  assert.equal(await halloween.isVisible(),c.date!=='2026-09-15');
  if(await halloween.isVisible())assert.equal(await halloween.textContent(),'Vuelve en septiembre');
  assert.equal(await page.locator('link[rel=stylesheet]').count(),1);
  assert.equal((await page.locator('body').innerText()).split(invitationMoney(seasonalOffer.cents)).length,2);
  await tabs.first().focus();
  for(let i=0;i<expected.length;i++){
    assert.equal(await page.getByRole('tab',{selected:true}).getAttribute('aria-controls'),expected[i]);
    assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-controls')),expected[i]);
    const panel=page.getByRole('tabpanel');assert.equal(await panel.count(),1);
    for(const card of await panel.locator('.seasonal-demo').all()){
      const title=await card.locator('h3').textContent();
      const url=new URL(await card.locator('[data-analytics-whatsapp]').getAttribute('href'));
      assert.ok(url.searchParams.get('text').includes(title));
    }
    await page.keyboard.press('ArrowRight');
  }
  const motion=page.locator('[data-business-toggle]');
  assert.equal(await motion.isVisible(),true);
  const before=await motion.getAttribute('aria-pressed');
  await motion.click();
  assert.notEqual(await motion.getAttribute('aria-pressed'),before);
  await motion.click();
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.screenshot({path:path.join(values.evidence,`${c.date}-${theme}-${width}-collection.png`)});
  assert.deepEqual(errors,[],'collection has no page errors before opening the standalone demo');
  if(theme==='light'&&width!==1920){await link.click();if(width===375)await page.waitForURL('**'+c.demo);else{await page.locator('.seasonal-hero-live iframe').waitFor();const frame=await (await page.locator('.seasonal-hero-live iframe').elementHandle()).contentFrame();await frame.waitForLoadState('domcontentloaded');assert.ok(frame.url().endsWith(c.demo));}await page.screenshot({path:path.join(values.evidence,`${c.date}-${width}-live.png`)});}
  records.push({date:c.date,width,theme,order:actual,cover:covers[0],...stats,errors});await context.close();
 }
 for(const prefix of ['','/en']){
  const page=await browser.newPage({viewport:{width:390,height:844},reducedMotion:'reduce'});
  for(const id of cases[1].chapters){
    await page.goto(origin+prefix+'/temporada#temporada-'+id);
    assert.equal(await page.getByRole('tabpanel').getAttribute('id'),'temporada-'+id);
    const button=page.locator('[data-business-toggle]');
    assert.ok(await button.isVisible());
    for(const card of await page.getByRole('tabpanel').locator('.seasonal-demo').all()){
      const title=await card.locator('h3').textContent();
      const url=new URL(await card.locator('[data-analytics-whatsapp]').getAttribute('href'));
      assert.equal(url.searchParams.get('text'),prefix?'Hi, Nordra. I’d like the seasonal invitation '+title+'.':'Hola, Nordra. Me gustaría la invitación de temporada '+title+'.');
    }
  }
  const payment=page.locator('details').filter({hasText:prefix?'How do payments work?':'¿Cómo se paga?'});
  await payment.locator('summary').click();assert.match(await payment.innerText(),/50%/);
  await page.close();
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}}),fallback=await context.newPage();
  await fallback.goto(origin+prefix+'/temporada');
  assert.equal(await fallback.locator('.seasonal-chapter:visible').count(),3);
  assert.equal(await fallback.locator('.seasonal-demo:visible').count(),6);
  assert.equal(await fallback.locator('.seasonal-hero-live noscript img').isVisible(),true);
  for(const season of seasons)for(const design of season.designs){
    assert.equal(await fallback.locator('.seasonal-demo a[href="'+(design.demo??season.demo)+'"]').count(),1);
  }
  records.push({noJavaScript:true,language:prefix?'en':'es',passed:true});await context.close();
 }
 fs.writeFileSync(path.join(values.evidence,'checks.json'),JSON.stringify(records,null,2));console.log(`${records.length} cases passed`);
}finally{await browser.close();await server?.close();}
