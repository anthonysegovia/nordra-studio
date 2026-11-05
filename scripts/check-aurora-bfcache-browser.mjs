import fs from 'node:fs';import path from 'node:path';import {pathToFileURL} from 'node:url';import assert from 'node:assert/strict';import {createServer} from 'node:http';import {chromium,webkit as bundledWebkit} from 'playwright';
const output=process.env.BFCACHE_EVIDENCE;if(!output)throw Error('Set BFCACHE_EVIDENCE outside the repository');fs.mkdirSync(output,{recursive:true});
const root=path.resolve('dist');const server=createServer((req,res)=>{try{const url=new URL(req.url,'http://local');if(url.pathname.startsWith('/_vercel/')){res.setHeader('Content-Type','text/javascript');res.end('');return;}
 let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file===root)file=path.join(root,'index.html');else if(!path.extname(file))file+='.html';if(!file.startsWith(root+path.sep))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));
const base=`http://127.0.0.1:${server.address().port}`,results=[];
const webkit=process.env.BFCACHE_WEBKIT_MODULE?(await import(pathToFileURL(process.env.BFCACHE_WEBKIT_MODULE).href)).webkit:bundledWebkit;
try{for(const engine of (process.env.BFCACHE_ENGINES||'webkit,chrome').split(',')){
 let browser;try{browser=engine==='chrome'?await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,ignoreDefaultArgs:['--disable-back-forward-cache'],args:['--enable-features=BackForwardCache']}):await webkit.launch({headless:true});}
 catch(error){results.push({engine,unavailable:String(error)});console.log(engine,String(error));continue;}
 try{for(const route of ['/eventos','/invitaciones','/bodas'])for(const theme of (process.env.BFCACHE_THEMES||'light,dark').split(',')){
 const context=await browser.newContext({viewport:{width:1440,height:900},locale:'es-MX'});
 await context.addInitScript(()=>{
  Object.defineProperty(navigator,'hardwareConcurrency',{get:()=>8});Object.defineProperty(navigator,'deviceMemory',{get:()=>8});
  window.__cacheProbe={id:Math.random().toString(36),events:[],contexts:0};
  addEventListener('pageshow',e=>window.__cacheProbe.events.push({type:'pageshow',persisted:e.persisted}));addEventListener('pagehide',e=>window.__cacheProbe.events.push({type:'pagehide',persisted:e.persisted}));
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(...args){const gl=original.apply(this,args);if(gl&&/^webgl/.test(args[0])&&!gl.__cacheProbe){gl.__cacheProbe=true;this.dataset.cacheId=String(++window.__cacheProbe.contexts);const draw=gl.drawArrays.bind(gl);gl.drawArrays=(...values)=>{this.dataset.cacheDraws=String(Number(this.dataset.cacheDraws||0)+1);return draw(...values);};}return gl;};
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
 const snapshot=()=>page.evaluate(()=>({probe:window.__cacheProbe,scrollY,visible:[...document.querySelectorAll('.aurora-field,.theatre-ribbon')].map((el,index)=>{const r=el.getBoundingClientRect(),c=el.querySelector('canvas');return{index,classes:el.className,visible:r.width>0&&r.height>0&&r.bottom>0&&r.top<innerHeight,renderer:el.dataset.renderer,canvas:c?.dataset.cacheId,opacity:c?getComputedStyle(c).opacity:null,elapsed:c?.dataset.elapsed,draws:Number(c?.dataset.cacheDraws||0)};}).filter(f=>f.visible)}));
 await page.goto(`${base}${route}?theme=${theme}`);const index=await page.evaluate(()=>[...document.querySelectorAll('.aurora-field')].findIndex(el=>el.clientHeight>0&&el.getBoundingClientRect().top>innerHeight));assert(index>=0,'Intermediate aurora exists');
 await page.locator('.aurora-field').nth(index).evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-200,behavior:'instant'}));
 const ready=()=>page.waitForFunction(()=>{const els=[...document.querySelectorAll('.aurora-field,.theatre-ribbon')].filter(el=>{const r=el.getBoundingClientRect();return r.width&&r.height&&r.bottom>0&&r.top<innerHeight;});return els.length&&els.every(el=>el.dataset.renderer==='webgl'&&getComputedStyle(el.querySelector('canvas')).opacity==='1');},null,{timeout:60000});
 await ready();const before=await snapshot();await page.screenshot({path:path.join(output,`${engine}-${route.slice(1)}-${theme}-before.jpg`),type:'jpeg'});
 await page.goto(`${base}/cumpleanos`);await page.waitForTimeout(300);await page.goBack({waitUntil:'commit'});await page.waitForTimeout(300);
 const restored=await page.evaluate(()=>({id:window.__cacheProbe.id,events:window.__cacheProbe.events,persisted:window.__cacheProbe.events.some(e=>e.type==='pageshow'&&e.persisted)}));
 await ready();const after=await snapshot();await page.waitForTimeout(500);const animated=await snapshot();
 for(const field of after.visible.filter(f=>f.classes.includes('aurora-field')))assert(animated.visible.find(f=>f.index===field.index)?.draws>field.draws,'Visible aurora resumes drawing');
 if(restored.persisted){assert.equal(restored.id,before.probe.id);for(const field of after.visible)assert.equal(field.canvas,before.visible.find(f=>f.index===field.index)?.canvas,'Healthy cached canvas survives');}
 await page.evaluate(()=>scrollBy({top:60,behavior:'instant'}));await page.waitForTimeout(150);
 await page.screenshot({path:path.join(output,`${engine}-${route.slice(1)}-${theme}-after.jpg`),type:'jpeg'});
 await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await ready();const closing=await snapshot();await page.evaluate(()=>scrollBy({top:-60,behavior:'instant'}));await page.waitForTimeout(150);
 const beforeLoss=await snapshot();for(const field of beforeLoss.visible.filter(f=>f.classes.includes('theatre-ribbon')))assert(field.draws>closing.visible.find(f=>f.index===field.index)?.draws,'Restored theatre responds to scroll');
 // Context-loss recovery is a separate explicit fixture, not evidence of real BFCache.
 await page.evaluate(()=>{dispatchEvent(new PageTransitionEvent('pagehide',{persisted:true}));for(const el of document.querySelectorAll('.aurora-field,.theatre-ribbon')){const c=el.querySelector('canvas');if(el.dataset.renderer==='webgl'){if(el.classList.contains('theatre-ribbon'))c.addEventListener('webglcontextlost',event=>{event.preventDefault();event.stopImmediatePropagation();},{capture:true,once:true});c.getContext('webgl')?.getExtension('WEBGL_lose_context')?.loseContext();}}});await page.waitForTimeout(100);
 await page.evaluate(()=>dispatchEvent(new PageTransitionEvent('pageshow',{persisted:true})));await ready();const recovered=await snapshot();
 for(const field of recovered.visible)assert.notEqual(field.canvas,beforeLoss.visible.find(f=>f.index===field.index)?.canvas,'Lost context recreates its canvas');
 if(route==='/bodas'){await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForSelector('.rings-hero.has-scene #rings-stage canvas',{timeout:60000});}
 const result={engine,version:browser.version(),route,theme,persisted:restored.persisted,events:restored.events,before,after,beforeLoss,recovered,errors};results.push(result);fs.writeFileSync(path.join(output,'bfcache-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({engine,route,theme,persisted:restored.persisted,errors}));assert.deepEqual(errors,[]);await context.close();
 }}finally{await browser.close();}
}}finally{fs.writeFileSync(path.join(output,'bfcache-results.json'),JSON.stringify(results,null,2));await new Promise(r=>server.close(r));}
