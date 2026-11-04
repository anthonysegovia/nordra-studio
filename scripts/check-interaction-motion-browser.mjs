import {chromium} from 'playwright';
import fs from 'node:fs';
import {createServer,preview} from 'vite';
const baseline=process.argv.includes('--baseline');
const server=process.env.MOTION_URL?null:baseline?await createServer({server:{host:'127.0.0.1',port:5591}}):await preview({preview:{host:'127.0.0.1',port:5591}});
if(baseline)await server?.listen();
const base=process.env.MOTION_URL||server.resolvedUrls.local[0].replace(/\/$/,'');
const directory='documentacion/animaciones-de-calidad';
fs.mkdirSync(directory,{recursive:true});
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'C:/Program Files/Google/Chrome/Application/chrome.exe'});
const rows=[],failures=[],states=[];
const routes=process.env.MOTION_ROUTE?process.env.MOTION_ROUTE.split(','):['','estudio','negocios','invitaciones','bodas','cumpleanos','eventos','temporada','aviso-de-privacidad'];
const reportName=baseline?'antes':process.env.MOTION_ROUTE?'despues-'+process.env.MOTION_ROUTE.replace(/[^a-z-]/g,'_'):'despues';
const selector='a,button,summary,input:not([type=hidden]),select,textarea,[role=tab],.invite-card,.offer-panel,.season-card,.client-case';
try {
for(const language of ['es','en'])for(const route of [...routes,...(language==='es'?['terminos-del-servicio.html']:[])])for(const width of baseline?[390,1440]:[375,390,1440,1920])for(const theme of ['light','dark']){
 const context=await browser.newContext({viewport:{width,height:900}});
 await context.addInitScript(theme=>localStorage.setItem('nordra-theme',theme),theme);
 const page=await context.newPage();await page.goto(`${base}/${language==='en'?'en/':''}${route}`);await page.evaluate(()=>document.fonts.ready);
 const record={language,route,width,theme,elements:await page.locator(selector).evaluateAll(nodes=>nodes.filter(n=>n.getClientRects().length&&!n.closest('[hidden],[inert]')).map(n=>{const s=getComputedStyle(n);return {tag:n.tagName,class:n.className,text:(n.textContent||n.getAttribute('aria-label')||'').trim().slice(0,70),transition:s.transition,animation:s.animation,animated:s.transitionDuration.split(',').some(v=>parseFloat(v)>0)||s.animationDuration.split(',').some(v=>parseFloat(v)>0)};}))};
 record.overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
 for(const e of record.elements)if(!e.animated)failures.push({...record,elements:undefined,element:e});
 if(!baseline&&width===1440&&theme==='light'){
  // Inspect real pseudo-states on every visible control, including offscreen
  // controls, without following links or submitting anything.
  const cdp=await context.newCDPSession(page);
  await cdp.send('DOM.enable');await cdp.send('CSS.enable');
  const {root}=await cdp.send('DOM.getDocument');
  const {nodeIds}=await cdp.send('DOM.querySelectorAll',{nodeId:root.nodeId,selector});
  const elements=await page.locator(selector).elementHandles();
  const visual=el=>{const s=getComputedStyle(el);return {element:el.tagName+'.'+el.className,label:(el.textContent||el.getAttribute('aria-label')||'').trim().slice(0,70),transform:s.transform,translate:s.translate,rotate:s.rotate,color:s.color,background:s.backgroundColor,shadow:s.boxShadow,opacity:s.opacity,border:s.borderColor,transition:s.transitionDuration};};
  for(let i=0;i<elements.length;i++){
   const el=elements[i];if(!await el.isVisible()||await el.evaluate(e=>!!e.closest('[hidden],[inert]')))continue;
   const before=await el.evaluate(visual);
   await cdp.send('CSS.forcePseudoState',{nodeId:nodeIds[i],forcedPseudoClasses:['focus-visible','focus']});
   const focused=await el.evaluate(visual);
   await cdp.send('CSS.forcePseudoState',{nodeId:nodeIds[i],forcedPseudoClasses:[]});
   states.push({language,route,index:i,before,focused});
  }
  for(const motion of ['reduced','paused']){
  await page.emulateMedia({reducedMotion:motion==='reduced'?'reduce':'no-preference'});
  // Let the application's media-query change handlers settle before toggling
  // pause; otherwise their queued resume can overwrite the requested state.
  await page.waitForTimeout(150);
  if(motion==='paused')await page.evaluate(()=>{document.body.dataset.journeyMotion='paused';dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:true}}));});
  await page.waitForTimeout(200);
  if(motion==='paused'&&await page.locator('body').getAttribute('data-journey-motion')!=='paused')throw Error('Pause did not remain enabled');
  for(let i=0;i<elements.length;i++){
   const el=elements[i];if(!await el.isVisible()||await el.evaluate(e=>!!e.closest('[hidden],[inert]')))continue;
   const before=await el.evaluate(visual);
   await cdp.send('CSS.forcePseudoState',{nodeId:nodeIds[i],forcedPseudoClasses:['hover']});
   const hovered=await el.evaluate(visual);
   for(const prop of ['transform','translate','rotate'])if(before[prop]!==hovered[prop])failures.push({language,route,index:i,reason:`${motion} hover changes ${prop}`,before,hovered});
   await cdp.send('CSS.forcePseudoState',{nodeId:nodeIds[i],forcedPseudoClasses:[]});
  }
  }
  await cdp.detach();
 }
 rows.push(record);await context.close();
 console.log(`${language}/${route||'inicio'} ${width} ${theme}: ${record.elements.length} controls`);
}
if(!baseline)for(const language of ['es','en'])for(const route of routes){
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:1440,height:900}});
 const page=await context.newPage();await page.goto(`${base}/${language==='en'?'en/':''}${route}`);
 const details=page.locator('details');
 for(let i=0;i<await details.count();i++){
  const detail=details.nth(i),summary=detail.locator(':scope > summary');if(!await summary.isVisible())continue;
  const initial=await detail.getAttribute('open')!==null;
  await summary.focus();await page.keyboard.press('Enter');await page.waitForTimeout(450);
  if((await detail.getAttribute('open')!==null)===initial)failures.push({language,route,reason:'details Enter failed without JS',index:i});
  await page.keyboard.press('Space');await page.waitForTimeout(450);
  if((await detail.getAttribute('open')!==null)!==initial)failures.push({language,route,reason:'details Space failed without JS',index:i});
 }
 await context.close();
 console.log(`${language}/${route||'inicio'}: keyboard details without JavaScript checked`);
}
}finally{await browser.close();if(server){if(baseline)await server.close();else await new Promise(resolve=>server.httpServer.close(resolve));}fs.writeFileSync(`${directory}/${reportName}.json`,JSON.stringify({rows,states,failures},null,2));}
console.log(`${failures.length} motion failures; ${rows.filter(r=>r.overflow).length} overflowing pages`);
if(failures.length)console.table(failures.map(f=>({page:f.language+'/'+f.route,element:f.element?.class||f.before?.element||f.index,reason:f.reason||'No transition or animation'})));
if(!baseline&&(failures.length||rows.some(r=>r.overflow)))process.exitCode=1;
