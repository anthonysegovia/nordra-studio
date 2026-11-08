import assert from 'node:assert/strict';
import { chromium } from 'playwright';
// Servidor Vite ya iniciado. CHROME_CHANNEL permite usar el navegador instalado.
const base = process.env.HERO_URL || 'http://127.0.0.1:5174';
const browser = await chromium.launch({headless:true,channel:process.env.CHROME_CHANNEL || 'chrome'});
try {
 for (const [route,mobile,quiet] of [['negocios',false,false],['invitaciones',false,false],['invitaciones',false,true],['en/invitaciones',false,true],['negocios',true,false],['invitaciones',true,true]]) {
  const page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1440,height:1000},isMobile:mobile,hasTouch:mobile,reducedMotion:quiet?'reduce':'no-preference'});
  const errors=[],requests=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>requests.push(r.url()));page.on('console',m=>{if(m.type()==='error'&&/THREE|Shader|WebGL/.test(m.text()))errors.push(m.text());});
  await page.route('**/_vercel/**',r=>r.fulfill({body:'',contentType:'application/javascript'}));
  await page.addInitScript(()=>{window.heroMetrics={cls:0,lcp:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.heroMetrics.cls+=e.value;})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{window.heroMetrics.lcp=l.getEntries().at(-1).startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
  await page.goto(base+'/'+route+(quiet?'?quieto':''));
  await page.waitForFunction(()=>document.querySelector('#hero')?.dataset.loaded==='true',{},{timeout:25000});
  await page.waitForTimeout(1200);
  assert.equal(await page.locator('#stage canvas').count(),1);
  assert.equal(await page.locator('#hero h1').isVisible(),true);
  assert.equal(await page.locator('#hero .cta').isVisible(),true);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,'Sin desbordamiento horizontal');
  if(quiet)assert.ok(!requests.some(u=>/apertura-.*\.mp4/.test(u)),'Quieto no descarga videos');
  const initialMetrics=await page.evaluate(()=>({...window.heroMetrics}));
  if(route.includes('invitaciones')){
   await page.locator('#names').fill('Alex & Dani');
   await page.locator('.pill[data-occ="cumple"]').click();
   assert.equal(await page.locator('#hero').getAttribute('data-occ'),'cumple');
   await page.locator('.pill[data-occ="eventos"]').click();
   assert.equal(await page.locator('#hero').getAttribute('data-occ'),'eventos');
   if(!mobile){await page.locator('#qrBtn').evaluate(b=>b.click());await page.waitForFunction(()=>!!document.querySelector('#qrBox svg'));await page.keyboard.press('Escape');assert.equal(await page.locator('#qrBtn').getAttribute('aria-expanded'),'false');}
  }else{await page.evaluate(()=>{const target=document.querySelector('.hero-flight-shot');scrollTo(0,target.getBoundingClientRect().top+scrollY-innerHeight*.3+2);});await page.waitForTimeout(150);assert.equal(await page.locator('.hero-flight-shot').first().evaluate(e=>e.style.opacity),'1');await page.locator('#pause').click();assert.equal(await page.locator('#pause').getAttribute('aria-pressed'),'true');await page.locator('#replay').click();}
  await page.locator('.theme-button').click();await page.waitForTimeout(750);assert.ok(await page.locator('body').evaluate(e=>e.classList.contains('dark')));
  await page.evaluate(()=>scrollTo(0,0));
  await page.screenshot({path:`review/hero-${route.replaceAll('/','-')}-${mobile?'movil':'escritorio'}.jpg`,type:'jpeg',quality:85});
  const metrics=await page.evaluate(()=>({...window.heroMetrics,paint:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,three:performance.getEntriesByType('resource').find(e=>/\/heroes\/(vitrina|sobre)\.js/.test(e.name))?.startTime}));
  if(metrics.three)assert.ok(metrics.three>metrics.paint,'El texto se pinta antes de importar el hero');
  assert.deepEqual(errors,[],route);
  console.log(JSON.stringify({route,mobile,quiet,...metrics,...initialMetrics}));await page.close();
 }
} finally {await browser.close();}
