// Run against a built preview: node scripts/check-birthday-sign-browser.mjs http://127.0.0.1:5198
// CHROME_PATH overrides detection; system Edge is the fallback. No bundled browser required.
import assert from 'node:assert/strict';
import fs from 'node:fs';import path from 'node:path';import os from 'node:os';
import {chromium} from 'playwright';
const base=(process.argv[2]||process.env.BIRTHDAY_BASE_URL||'http://127.0.0.1:5198').replace(/\/$/,'');
const candidates=[process.env.CHROME_PATH,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean);
const executablePath=candidates.find(p=>fs.existsSync(p));if(!executablePath)throw Error('Set CHROME_PATH to an installed Chrome or Edge executable.');
const output=process.env.BIRTHDAY_EVIDENCE||path.join(os.tmpdir(),'nordra-birthday-sign');fs.mkdirSync(output,{recursive:true});
const styles=['neon','caja','bar','xv','espacio'],results=[];
const mobileLayout=process.argv.includes('--mobile-layout');
const browser=await chromium.launch({executablePath,headless:process.env.HEADLESS!=='false'});
async function contextFor({lang='es',theme='light',width=1440,height=900,reduced=false,staticMode=false}={}){
 const context=await browser.newContext({viewport:{width,height},hasTouch:width<=900,isMobile:width<=900,locale:lang==='en'?'en-US':'es-MX',reducedMotion:reduced?'reduce':'no-preference'});
 await context.addInitScript(({staticMode})=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>staticMode?3:4});Object.defineProperty(navigator,'deviceMemory',{get:()=>staticMode?2:8});
  if(navigator.connection)Object.defineProperty(navigator.connection,'saveData',{get:()=>staticMode});
  window.__signTransitions=[];window.__specialTransitions=[];window.__doorStates=[];
  addEventListener('DOMContentLoaded',()=>{
   const wall=document.getElementById('bs-wall');
   if(wall)new MutationObserver(()=>{
    if(wall.dataset.ready!=='true'||window.__wallReveal)return;
    const css=getComputedStyle(wall);window.__wallReveal={start:Number(css.opacity),duration:css.transitionDuration};
    setTimeout(()=>window.__wallReveal.mid=Number(getComputedStyle(wall).opacity),120);
    setTimeout(()=>window.__wallReveal.end=Number(getComputedStyle(wall).opacity),520);
   }).observe(wall,{attributes:true,attributeFilter:['data-ready']});
   const veil=document.getElementById('bs-veil');if(!veil)return;let started;
   const door=document.getElementById('bs-door'),zone=document.getElementById('bs-zone');const traceDoor=()=>window.__doorStates.push(zone.className+' '+door.className);new MutationObserver(traceDoor).observe(door,{attributes:true,attributeFilter:['class']});new MutationObserver(traceDoor).observe(zone,{attributes:true,attributeFilter:['class']});
   new MutationObserver(()=>{if(veil.classList.contains('on')){started??=performance.now();}else if(started!=null){window.__signTransitions.push({ms:performance.now()-started,kind:veil.dataset.transition});started=null;}}).observe(veil,{attributes:true,attributeFilter:['class']});
   new MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1&&n.matches('.v-rocket,.v-curtain,.v-iris'))window.__specialTransitions.push(n.className);}).observe(veil,{childList:true});
  });
 },{staticMode});
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 // Analytics is external and irrelevant to local UI correctness.
 await page.route('**/_vercel/insights/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
 await page.route('**/_vercel/speed-insights/**',r=>r.fulfill({status:200,contentType:'application/javascript',body:''}));
 return {context,page,errors,lang,theme,width,height,reduced,staticMode};
}
async function visit(s,style){await s.page.goto(base+'/'+(s.lang==='en'?'en/':'')+'cumpleanos?estilo='+style+'&theme='+s.theme);await s.page.waitForSelector('#bs-hero[data-ready=true]',{timeout:30000});await s.page.evaluate(()=>document.fonts.ready);assert.equal(await s.page.locator('body').getAttribute('data-world'),style);assert.equal(await s.page.locator('body').evaluate(b=>b.classList.contains('dark')),s.theme==='dark');if(s.reduced||s.staticMode){await s.page.waitForFunction(()=>window.__wallReveal);const reveal=await s.page.evaluate(()=>window.__wallReveal);assert.equal(reveal.start,1);assert.equal(reveal.duration,'0s');}}
async function openControls(s){if(s.width<=900&&await s.page.locator('#bs-custom-toggle').getAttribute('aria-expanded')!=='true')await s.page.locator('#bs-custom-toggle').click();}
async function choose(s,style){const p=s.page;await p.evaluate(()=>scrollTo(0,0));await p.locator('#bs-world-btn').click();await p.locator('#bs-world-menu [data-world='+style+']').click();await p.waitForFunction(w=>document.body.dataset.world===w,style);await p.waitForFunction(()=>!document.getElementById('bs-veil').classList.contains('on'));}
async function clickCards(s){
 for(const style of ['caja','bar','xv','espacio']){
  const button=s.page.locator('.try-style[data-world='+style+']');
  await button.scrollIntoViewIfNeeded();
  await button.click(); // Real pointer input: never DOM click(), force, or a retry workaround.
  await s.page.waitForFunction(w=>document.body.dataset.world===w&&scrollY<5,style);
  await s.page.waitForFunction(()=>!document.getElementById('bs-veil').classList.contains('on'));
 }
}
async function name(s,age){await openControls(s);await s.page.locator('#bs-nm').fill('Andrés Peña');await s.page.locator('#bs-ag').fill(age);await s.page.locator('#bs-namer button').click();await s.page.locator('#bs-ask').waitFor({state:'visible'});await s.page.waitForFunction(()=>document.getElementById('bs-sign').getAttribute('aria-label').includes('Andrés Peña'));}
async function snapshot(s,label){await s.page.screenshot({path:path.join(output,label+'.jpg'),type:'jpeg',quality:88});}
try{
 for(const lang of ['es','en'])for(const [width,height] of [[1440,900],[390,664],[390,844]])for(const theme of ['light','dark'])for(const style of styles){
  if(mobileLayout&&(width!==390||height!==664))continue;
  const caseLabel=[lang,theme,width,height,style].join("-");if(process.env.BIRTHDAY_CASE&&process.env.BIRTHDAY_CASE!==caseLabel)continue;const s=await contextFor({lang,theme,width,height}),p=s.page;const label=[lang,theme,width,height,style].join('-');
  try{
   await visit(s,style);assert.match(await p.locator('h1').textContent(),lang==='en'?/in lights/:/en luces/);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Horizontal overflow '+label);
   assert.equal(await p.locator('#bs-sound').getAttribute('aria-pressed'),'false');
   if(width===390){
    const eyebrow=await p.locator('.kicker .eyebrow').boundingBox(),pause=await p.locator('.kicker [data-business-toggle]').boundingBox();
    assert(Math.abs(eyebrow.y+eyebrow.height/2-pause.y-pause.height/2)<2,'Motion control must share the eyebrow row');
    const fits=await p.locator('.occasion-path a').evaluateAll(links=>links.map(a=>{const range=document.createRange();range.selectNodeContents(a);return {text:a.textContent,width:a.getBoundingClientRect().width,textWidth:range.getBoundingClientRect().width};}));
    for(const link of fits)assert(link.width+.5>=link.textWidth,'Occasion link too narrow: '+JSON.stringify(link));
    if(mobileLayout){
     // Check both extremes of the subtle sway, with clearance for the glow.
     const collisions=await p.evaluate(()=>{
      const garland=document.querySelector('.garland'),animation=garland.getAnimations()[0],time=animation?.currentTime;
      const targets=[...document.querySelectorAll('.kicker .eyebrow,.kicker [data-business-toggle]')];const errors=[];
      for(const phase of [0,2000,4000]){
       if(animation)animation.currentTime=phase;
       for(const bulb of garland.querySelectorAll('.bulb'))for(const target of targets){
        const b=bulb.getBoundingClientRect(),t=target.getBoundingClientRect();
        if(b.bottom+8>t.top)errors.push({phase,bottom:b.bottom,top:t.top,target:target.textContent});
       }
      }
      if(animation)animation.currentTime=time;return errors;
     });
     assert.deepEqual(collisions,[],'Garland must hang above eyebrow and pause, including glow clearance');
    }
   }
   if(width===390&&height===664){
    const sign=await p.locator('#bs-sign').boundingBox(),date=await p.locator('#bs-sub').boundingBox(),bar=await p.locator('.mobile-route').boundingBox();
    assert(sign.y+sign.height<=bar.y,label+' sign behind bottom bar');assert(date.y+date.height<=bar.y,label+' date behind bottom bar');
   }
   // Initial mobile viewport must contain both the complete heading and sign.
   if(width<=900)for(const selector of ['h1','#bs-sign']){const b=await p.locator(selector).boundingBox();assert(b&&b.y>=0&&b.y+b.height<=height,label+' first screen '+selector);}
   await snapshot(s,label+'-initial');
   if(mobileLayout){
    await p.waitForFunction(()=>window.__wallReveal?.end!=null);
    const reveal=await p.evaluate(()=>window.__wallReveal);assert.equal(reveal.start,0);assert.equal(reveal.duration,'0.4s');assert(reveal.mid>0&&reveal.mid<1);assert.equal(reveal.end,1);
    await p.evaluate(()=>scrollTo(0,document.body.scrollHeight));await p.waitForSelector('#bs-hero.hero-asleep');
    assert(await p.locator('#bs-hero').evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a instanceof CSSAnimation).every(a=>a.playState==='paused')),'Offscreen decoration still running');
    await p.evaluate(()=>scrollTo(0,0));await p.waitForFunction(()=>!document.getElementById('bs-hero').classList.contains('hero-asleep'));
    await p.locator('[data-business-toggle]').click();await p.waitForFunction(()=>document.body.dataset.journeyMotion==='paused');assert.equal(await p.locator('#bs-wall').evaluate(e=>getComputedStyle(e).transitionDuration),'0s');assert.deepEqual(s.errors,[]);results.push({label,status:'passed',mobileLayout:true,reveal});console.log('PASS mobile layout',label);continue;
   }
   if(style==='caja'){assert(await p.locator('#bs-zone').evaluate(e=>e.classList.contains('is-wrapped')));await p.locator('#bs-bow').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>!document.getElementById('bs-zone').classList.contains('is-wrapped'));}
   if(style==='bar'){await p.waitForFunction(()=>!document.getElementById('bs-zone').classList.contains('door-in'),null,{timeout:5000});assert(!await p.locator('#bs-door').isVisible());const doorStates=(await p.evaluate(()=>window.__doorStates)).join(' ');for(const state of ['door-in','peek','open'])assert(doorStates.includes(state),'Missing automatic door state: '+state);}
   await p.locator('#bs-world-btn').click();assert.equal(await p.locator('#bs-world-btn').getAttribute('aria-expanded'),'true');await p.keyboard.press('Escape');assert.equal(await p.locator('#bs-world-btn').getAttribute('aria-expanded'),'false');assert.equal(await p.evaluate(()=>document.activeElement.id),'bs-world-btn');
   await openControls(s);const checked=await p.locator('#bs-switch').getAttribute('aria-checked');await p.locator('#bs-switch').click();assert.notEqual(await p.locator('#bs-switch').getAttribute('aria-checked'),checked);await p.waitForTimeout(650);await p.locator('#bs-switch').click();
   await name(s,'15');await p.waitForTimeout(1800);
   const privacy=await p.evaluate(()=>({url:location.href,session:JSON.stringify(sessionStorage),local:JSON.stringify(localStorage),href:document.getElementById('bs-ask').href}));
   for(const text of [privacy.url,privacy.session,privacy.local]){assert(!text.includes('Andrés'));assert(!text.includes(encodeURIComponent('Andrés')));assert(!text.includes('Peña'));}
   assert.match(new URL(privacy.href).searchParams.get('text'),/Andrés Peña 15/);assert(privacy.href.includes('Andr%C3%A9s%20Pe%C3%B1a'));assert.match(new URL(privacy.href).searchParams.get('text'),lang==='en'?/^Hi, Nordra\./:/^Hola, Nordra\./);
   assert.equal(await p.locator('#bs-ask').getAttribute('data-analytics-whatsapp'),'letrero');
   if(style==='xv'){assert.equal(await p.locator('#bs-sign').getAttribute('data-age'),'XV');await name(s,'30');await p.waitForFunction(()=>document.getElementById('bs-sign').dataset.age==='30');}
   if(style==='espacio'){await p.locator('[data-l="1"]').click();assert(await p.locator('body').evaluate(b=>b.classList.contains('panel-alt')));await p.locator('[data-l="2"]').click();assert(await p.locator('#bs-plate').evaluate(e=>e.classList.contains('radar-off')));const before=await p.locator('#bs-plate').getAttribute('style');await p.locator('#bs-knob').click();assert.notEqual(await p.locator('#bs-plate').getAttribute('style'),before);}
   // Every target transition is exercised throughout the initial-style matrix.
   const target=styles[(styles.indexOf(style)+1)%styles.length];await choose(s,target);
   const transitions=await p.evaluate(()=>window.__signTransitions);assert(transitions.length);for(const t of transitions)assert(t.ms<=1300,'Transition exceeded 1.3 s: '+JSON.stringify(t));
   if(target==='caja'){assert(await p.locator('#bs-zone').evaluate(e=>e.classList.contains('is-wrapped')));await p.locator('#bs-bow').focus();await p.keyboard.press('Enter');await p.waitForFunction(()=>!document.getElementById('bs-zone').classList.contains('is-wrapped'));}
   if(target==='bar'){await p.waitForFunction(()=>!document.getElementById('bs-zone').classList.contains('door-in'),null,{timeout:5000});assert(!await p.locator('#bs-door').isVisible());}
   await openControls(s);await p.locator('#bs-party').click();await p.waitForTimeout(300);await p.locator('[data-business-toggle]').click();await p.waitForFunction(()=>document.body.dataset.journeyMotion==='paused');await p.waitForTimeout(100);
   const a=await p.locator('#bs-fx').evaluate(c=>c.toDataURL());await p.waitForTimeout(1000);const b=await p.locator('#bs-fx').evaluate(c=>c.toDataURL());assert.equal(a,b,'Effects canvas changes while motion paused');
   await choose(s,styles[(styles.indexOf(target)+1)%styles.length]);const pausedTransition=await p.evaluate(()=>window.__signTransitions.at(-1));assert.equal(pausedTransition.kind,'fade');assert(pausedTransition.ms<=450);
   await p.waitForSelector('#bs-wall[data-ready=true]');assert.deepEqual(await p.locator('#bs-wall').evaluate(e=>({opacity:getComputedStyle(e).opacity,duration:getComputedStyle(e).transitionDuration})),{opacity:'1',duration:'0s'},'Paused wall must appear without fading');
   await p.locator('#bs-estilos').scrollIntoViewIfNeeded();assert.equal(await p.locator('.birthday-sign-root .fan a.phone').count(),1);assert.equal(await p.locator('.birthday-sign-root .fan div.phone').count(),3);assert.equal(await p.locator('.birthday-sign-root .badge').count(),0);
   if(width<=900){assert.match(await p.locator('.birthday-sign-root .fan').evaluate(e=>getComputedStyle(e).scrollSnapType),/x mandatory/);await p.locator('.birthday-sign-root .try-style[data-world=espacio]').scrollIntoViewIfNeeded();}
   await snapshot(s,label+'-styles');await clickCards(s);
   assert.deepEqual(s.errors,[],'Console errors '+label);results.push({label,status:'passed',transitions});console.log("PASS",label);
  }finally{await s.context.close();}
 }
 if(!mobileLayout){
 for(const lang of ['es','en'])for(const [width,height] of [[1440,900],[390,664],[390,844]])for(const theme of ['light','dark']){
  const s=await contextFor({lang,theme,width,height,reduced:true});try{await visit(s,'neon');for(const target of ['caja','bar','xv','espacio','neon'])await choose(s,target);await clickCards(s);const traces=await s.page.evaluate(()=>({transitions:window.__signTransitions,special:window.__specialTransitions}));assert.equal(traces.special.length,0,'Reduced motion inserted rocket, curtain or iris');assert.equal(traces.transitions.length,9);for(const t of traces.transitions){assert.equal(t.kind,'fade');assert(t.ms<=450,'Reduced fade exceeded scheduling tolerance for 300 ms');}results.push({lang,width,height,theme,reduced:true,...traces});}finally{await s.context.close();}
 }
 for(const style of styles){const s=await contextFor({staticMode:true});try{await visit(s,style);assert.equal(await s.page.locator('body').getAttribute('data-sign-static'),'true');assert.equal(await s.page.locator('#bs-fx').isVisible(),false);const text=await s.page.locator('#bs-sign').getAttribute('aria-label');await s.page.waitForTimeout(6000);assert.equal(await s.page.locator('#bs-sign').getAttribute('aria-label'),text);results.push({staticMode:true,style,status:'passed'});}finally{await s.context.close();}}
 }
 console.log('Birthday sign browser checks passed:',results.length,'cases. Evidence:',output);
}catch(error){results.push({status:'failed',error:error.stack});throw error;}finally{fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify({base,executablePath,results},null,2));await browser.close();}
