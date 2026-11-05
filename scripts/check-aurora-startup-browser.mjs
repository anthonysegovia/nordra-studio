import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createServer} from 'node:http';import {launch} from './wedding-rings-browser-support.mjs';
const output=process.env.AURORA_EVIDENCE;if(!output)throw Error('Set AURORA_EVIDENCE outside the repository');fs.mkdirSync(output,{recursive:true});
const root=path.resolve(process.env.AURORA_ROOT||'dist'),label=process.env.AURORA_LABEL||'after';
const server=createServer((req,res)=>{try{const url=new URL(req.url,'http://local');if(url.pathname.startsWith('/_vercel/')){res.setHeader('Content-Type','text/javascript');res.end('');return;}
 let file=path.resolve(root,'.'+decodeURIComponent(url.pathname));if(file===root)file=path.join(root,'index.html');else if(!path.extname(file))file+='.html';if(!file.startsWith(root+path.sep))throw Error();
 res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.webp':'image/webp','.jpg':'image/jpeg','.png':'image/png','.svg':'image/svg+xml'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));
}catch{res.writeHead(404).end();}});await new Promise(r=>server.listen(0,'127.0.0.1',r));const results=[];
try{for(const route of (process.env.AURORA_PAGES||'/,/bodas,/eventos,/temporada,/invitaciones,/en/bodas').split(','))for(const theme of (process.env.AURORA_THEMES||'light,dark').split(',')){
 const browser=await launch();try{
 const context=await browser.newContext({viewport:{width:1440,height:900},locale:route.startsWith('/en/')?'en-US':'es-MX'});
 await context.addInitScript(()=>{
  window.__aurora={contexts:[],calls:[],tasks:[],allContexts:0};const seen=new WeakSet();
  new PerformanceObserver(list=>window.__aurora.tasks.push(...list.getEntries().map(e=>({start:e.startTime,duration:e.duration})))).observe({type:'longtask',buffered:true});
  const original=HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext=function(type,...args){
   const owner=this.closest('.aurora-field,.theatre-ribbon'),start=performance.now();const gl=original.call(this,type,...args);
   if(/^webgl/.test(type)&&gl&&!seen.has(gl)){seen.add(gl);window.__aurora.allContexts++;}
   if(owner&&/^webgl/.test(type)&&gl&&!gl.__observed){
    gl.__observed=true;const id=window.__aurora.contexts.length;owner.dataset.probeId=id;
    window.__aurora.contexts.push({id,classes:owner.className,start,width:owner.clientWidth,height:owner.clientHeight});
    window.__aurora.calls.push({id,name:'getContext',start,duration:performance.now()-start});
    for(const name of ['compileShader','linkProgram','getShaderParameter','getProgramParameter','drawArrays']){
     const method=gl[name].bind(gl);let drawn=false;
     gl[name]=(...values)=>{const begin=performance.now(),result=method(...values),duration=performance.now()-begin;
      if(name!=='drawArrays'||!drawn||duration>1)window.__aurora.calls.push({id,name,start:begin,duration});
      if(name==='drawArrays'){drawn=true;this.dataset.probeDraws=String(Number(this.dataset.probeDraws||0)+1);}
      return result;
     };
    }
   }return gl;
  };
 });
 const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(`http://127.0.0.1:${server.address().port}${route}?theme=${theme}`);await page.waitForTimeout(8000);
 const initial=await page.evaluate(()=>({at:performance.now(),count:window.__aurora.contexts.length,allContexts:window.__aurora.allContexts,fields:[...document.querySelectorAll('.aurora-field,.theatre-ribbon')].map(el=>({classes:el.className,width:el.clientWidth,height:el.clientHeight,top:el.getBoundingClientRect().top,renderer:el.dataset.renderer}))}));
 if(label==='after'&&route.endsWith('/bodas'))assert.equal(initial.count,0,'Bodas must allocate no aurora contexts at entry');
 const fields=await page.locator('.aurora-field,.theatre-ribbon').count(),sections=[];
 for(let index=0;index<fields;index++){
  const field=page.locator('.aurora-field,.theatre-ribbon').nth(index);const box=await field.boundingBox();if(!box?.width||!box.height)continue;
  await field.evaluate(el=>scrollTo({top:Math.max(0,el.getBoundingClientRect().top+scrollY-200),behavior:'instant'}));
  await page.waitForFunction(index=>{const el=document.querySelectorAll('.aurora-field,.theatre-ribbon')[index];return Number(el.querySelector('canvas')?.dataset.probeDraws)>0;},index,{timeout:30000});await page.waitForTimeout(750);
  const name=`${label}-${route.replaceAll('/','_')||'home'}-${theme}-${index}`;
  await page.screenshot({path:path.join(output,name+'.jpg'),type:'jpeg',quality:85});
  const first=await field.locator('canvas').evaluate(c=>({elapsed:c.dataset.elapsed,draws:Number(c.dataset.probeDraws),data:c.toDataURL()}));await page.waitForTimeout(400);
  const second=await field.locator('canvas').evaluate(c=>({elapsed:c.dataset.elapsed,draws:Number(c.dataset.probeDraws),data:c.toDataURL()}));
  const kind=await field.evaluate(el=>el.classList.contains('aurora-field')?'time':'scroll');
  if(kind==='time')assert(second.draws>first.draws,'Visible field animates');
  else{await page.evaluate(()=>scrollBy({top:90,behavior:'instant'}));await page.waitForTimeout(150);assert(await field.locator('canvas').evaluate(c=>Number(c.dataset.probeDraws))>second.draws,'Ribbon responds to scroll');}
  // The public motion control broadcasts this event; it also updates the shared page state.
  await page.evaluate(()=>{document.body.dataset.journeyMotion='paused';dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:true}}));});await page.waitForTimeout(150);
  const paused=await field.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(300);assert.equal(await field.locator('canvas').evaluate(c=>c.toDataURL()),paused,'Pause freezes the aurora');
  await page.evaluate(()=>{document.body.dataset.journeyMotion='playing';dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:false}}));});
  await page.emulateMedia({reducedMotion:'reduce'});await page.waitForTimeout(150);const reduced=await field.locator('canvas').evaluate(c=>c.toDataURL());await page.waitForTimeout(300);assert.equal(await field.locator('canvas').evaluate(c=>c.toDataURL()),reduced,'Reduced motion freezes the aurora');await page.emulateMedia({reducedMotion:'no-preference'});
  sections.push({index,kind,classes:await field.getAttribute('class'),screenshot:name+'.jpg'});
 }
 if(sections.length&&await page.locator('[data-business-toggle]').count()){
  const field=page.locator('.aurora-field,.theatre-ribbon').nth(sections.at(-1).index);
  await page.locator('[data-business-toggle]').click();assert.equal(await page.locator('[data-business-toggle]').getAttribute('aria-pressed'),'true');
  await field.evaluate(el=>scrollTo({top:el.getBoundingClientRect().top+scrollY-200,behavior:'instant'}));await page.waitForTimeout(300);
  const stopped=await field.locator('canvas').evaluate(c=>c.dataset.probeDraws);await page.waitForTimeout(400);assert.equal(await field.locator('canvas').evaluate(c=>c.dataset.probeDraws),stopped,'Real pause control stops drawing');
  await page.locator('[data-business-toggle]').click();assert.equal(await page.locator('[data-business-toggle]').getAttribute('aria-pressed'),'false');
 }
 await page.evaluate(()=>scrollTo({top:document.body.scrollHeight,behavior:'instant'}));await page.waitForTimeout(1500);
 const data=await page.evaluate(()=>{const {contexts,calls,tasks,allContexts}=window.__aurora;const attributable=tasks.filter(t=>calls.some(c=>c.start<t.start+t.duration&&c.start+c.duration>=t.start));return{contexts,calls,tasks,allContexts,attributable,maximumTask:Math.max(0,...attributable.map(t=>t.duration))};});
 results.push({route,theme,initial,finalContexts:data.contexts.length,sections,errors,...data});fs.writeFileSync(path.join(output,label+'-results.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({route,theme,initial:initial.count,final:data.contexts.length,max:data.maximumTask,errors}));
 assert.deepEqual(errors,[]);if(label==='after')assert(data.maximumTask<=100,'Aurora long task exceeds 100 ms');
 if(label==='after'&&route==='/bodas'&&theme==='light'){
  // Separate functional fixture: a field that starts at zero size can later become visible.
  const fixture=await context.newPage();await fixture.goto(`http://127.0.0.1:${server.address().port}/bodas`);await fixture.waitForTimeout(1000);
  await fixture.evaluate(()=>{
   const field=document.querySelector('.theme-wedding>.aurora-field');
   if(field.clientHeight!==0||field.dataset.renderer!=='pending')throw Error('Expected a dormant zero-size field');
   dispatchEvent(new CustomEvent('nordra-aurora-unfold',{detail:{field,progress:.37}}));
   dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:true}}));
   document.body.classList.add('dark');dispatchEvent(new Event('nordra-theme'));
   postMessage({type:'nordra-motion',paused:true,intensity:.6},'*');
  });await fixture.waitForTimeout(50);
  await fixture.evaluate(()=>{const field=document.querySelector('.theme-wedding>.aurora-field');field.style.display='block';field.style.height='240px';});
  await fixture.waitForFunction(()=>document.querySelector('.theme-wedding>.aurora-field').dataset.renderer==='webgl');
  const stored=await fixture.evaluate(()=>{const canvas=document.querySelector('.theme-wedding>.aurora-field canvas'),gl=canvas.getContext('webgl'),program=gl.getParameter(gl.CURRENT_PROGRAM);return{unfold:gl.getUniform(program,gl.getUniformLocation(program,'unfold')),strength:gl.getUniform(program,gl.getUniformLocation(program,'strength')),dark:gl.getUniform(program,gl.getUniformLocation(program,'dark')),motion:canvas.dataset.motion};});
  assert(Math.abs(stored.unfold-.37)<.001);assert(Math.abs(stored.strength-.6)<.001);assert.equal(stored.dark,1);assert.equal(stored.motion,'paused');
  await fixture.evaluate(()=>dispatchEvent(new PageTransitionEvent('pagehide')));assert.equal(await fixture.locator('.theme-wedding>.aurora-field canvas').count(),0);await fixture.close();
  fs.writeFileSync(path.join(output,'deferred-events.json'),JSON.stringify(stored,null,2));
 }
 }finally{await browser.close();}
}}finally{await new Promise(r=>server.close(r));}
