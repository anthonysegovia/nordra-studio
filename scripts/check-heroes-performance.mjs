// Comparación local del HTML de la base autorizada frente al hero integrado.
﻿import {createServer} from 'vite';
import {execFileSync} from 'node:child_process';
import {chromium} from 'playwright';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const originals={};for(const name of ['negocios','invitaciones'])originals[name]=await server.transformIndexHtml('/'+name+'.html',execFileSync('git',['show',(process.env.HERO_BASE_REF || '69a1f16')+':'+name+'.html'],{encoding:'utf8'}));
await server.close();
const browser=await chromium.launch({channel:'chrome',headless:true});
try{for(const name of ['negocios','invitaciones'])for(const baseline of [true,false]){
 const page=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});await page.route('**/_vercel/**',r=>r.fulfill({body:'',contentType:'application/javascript'}));
 if(baseline)await page.route('**/'+name+'?baseline',r=>r.fulfill({body:originals[name],contentType:'text/html'}));
 await page.addInitScript(()=>{window.metrics={cls:0,lcp:0};new PerformanceObserver(l=>l.getEntries().forEach(e=>{if(!e.hadRecentInput)window.metrics.cls+=e.value;})).observe({type:'layout-shift',buffered:true});new PerformanceObserver(l=>{window.metrics.lcp=l.getEntries().at(-1).startTime;}).observe({type:'largest-contentful-paint',buffered:true});});
 await page.goto((process.env.HERO_URL || 'http://127.0.0.1:5174')+'/'+name+(baseline?'?baseline':''));await page.waitForTimeout(4500);
 console.log(JSON.stringify({name,baseline,...await page.evaluate(()=>({...window.metrics,fcp:performance.getEntriesByName('first-contentful-paint')[0]?.startTime,parent:getComputedStyle(document.querySelector('.business')).padding}))}));await page.close();
}}finally{await browser.close();}
