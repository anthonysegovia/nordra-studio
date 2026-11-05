import assert from 'node:assert/strict';
import {auditBrowser,report,settle} from './audit-browser.mjs';
const app=await auditBrowser(),rows=[],failures=[];
const cases=[
 ...['invitaciones','bodas','cumpleanos','eventos','temporada','negocios'].map(route=>({route,target:'.faq-item summary',measure:'.faq-item summary>span:first-child'})),
 {route:'estudio',target:'a.studio-work:nth-child(2)',realHover:true},
 ...['bodas','cumpleanos','eventos'].map(route=>({route,target:'.wedding-devices>a.wedding-dashboard'})),
 ...['cumpleanos','eventos'].map(route=>({route,target:'.invite-card',measure:'.invite-card .invite-cta'})),
 {route:'bodas',target:'.wedding-plan-grid .invite-card'},
 {route:'',target:'.signature-work .nordra-phone'},
 {route:'negocios',target:'.locale-switch>a'},
 {route:'demos/posada-pinata/',target:'.star-trigger'},
 {route:'demos/celebra-2027/',target:'#enter-button'},
 {route:'demos/halloween/',target:'#open'},
 {route:'invitaciones/camila-30/',target:'.gift>button.pull'},
 {route:'invitaciones/camila-30/',target:'.actions>a'},
 {route:'demos/del-otro-lado/',target:'.wordmark'},
 ...[['posada','.sample-bar>a'],['celebra-2027','.demo-bar>a'],['halloween','.demo-banner>a']].map(([route,target])=>({route:`demos/${route}/`,target})),
 ...['.oc-link','.oc-input','.oc-nav__brand','.oc-nav__links a'].map(target=>({route:'demos/nitida/',target,state:target==='.oc-input'?'focus':'hover'})),
];
try{
 for(const item of cases){
  const context=await app.browser.newContext({viewport:{width:1280,height:900}}),page=await context.newPage();await page.goto(`${app.base}/${item.route}`);await settle(page);
  const target=page.locator(item.target).first();assert(await target.count(),`Missing ${item.route} ${item.target}`);await target.scrollIntoViewIfNeeded();await settle(page);
  const measure=page.locator(item.measure||item.target).first();
  const cdp=await context.newCDPSession(page);await cdp.send('DOM.enable');await cdp.send('CSS.enable');const {root}=await cdp.send('DOM.getDocument');const {nodeId}=await cdp.send('DOM.querySelector',{nodeId:root.nodeId,selector:item.target});
  await measure.evaluate(el=>{window.motionFrames=[];window.motionStop=false;const start=performance.now();const frame=t=>{const s=getComputedStyle(el);window.motionFrames.push({t:t-start,padding:s.padding,width:s.width,translate:s.translate,rotate:s.rotate,transform:s.transform,opacity:s.opacity,color:s.color,background:s.backgroundColor,border:s.borderColor});if(!window.motionStop)requestAnimationFrame(frame);};requestAnimationFrame(frame);});
  await page.waitForTimeout(40);const beforeCount=await page.evaluate(()=>window.motionFrames.length);
  if(item.realHover){const b=await target.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);}else await cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[item.state||'hover']});await page.waitForTimeout(750);await page.evaluate(()=>window.motionStop=true);
  const frames=await page.evaluate(()=>window.motionFrames),before=frames[beforeCount-1],after=frames.at(-1),first=frames[beforeCount];
  const changed=['padding','width','translate','rotate','transform','opacity','color','background','border'].filter(p=>before[p]!==after[p]);
  for(const prop of changed){const firstChange=frames.slice(beforeCount).find(f=>f[prop]!==before[prop]);if(firstChange?.[prop]===after[prop])failures.push({...item,prop,reason:'final value on first changed frame',before:before[prop],first:firstChange[prop],after:after[prop]});}
  if(!changed.length)failures.push({...item,reason:'no visible interaction feedback'});
  rows.push({...item,changed,frames});
  // Real pointer hover confirms these styles are reachable, not just forced states.
  await cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});
  if(item.state==='focus')await target.focus();else await target.hover();
  for(const mode of ['reduced','paused']){
   await cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[]});await page.mouse.move(0,0);await target.blur();
   await page.emulateMedia({reducedMotion:mode==='reduced'?'reduce':'no-preference'});await page.waitForTimeout(100);
   if(mode==='paused')await page.evaluate(()=>{document.body.dataset.journeyMotion='paused';dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:true}}));});
   await page.waitForTimeout(300);
   const visual=el=>{const s=getComputedStyle(el);return {transform:s.transform,translate:s.translate,rotate:s.rotate};};const resting=await measure.evaluate(visual);
   await cdp.send('CSS.forcePseudoState',{nodeId,forcedPseudoClasses:[item.state||'hover']});await page.waitForTimeout(350);const hovered=await measure.evaluate(visual);
   if(JSON.stringify(resting)!==JSON.stringify(hovered))failures.push({...item,mode,reason:'spatial motion despite pause',resting,hovered});
  }
  console.log(`${item.route||'inicio'} ${item.target}: ${changed.join(', ')}`);await context.close();
 }
}finally{report('interaction-frames',{rows,failures});await app.close();}
assert.equal(failures.length,0,JSON.stringify(failures,null,2));
