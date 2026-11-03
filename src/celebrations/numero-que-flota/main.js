import '../invitation';
import './interior';
import {invitation} from './config.mjs';

const stage=document.querySelector('[data-float-stage]'),poster=stage.querySelector('img');
const motion=document.querySelector('[data-float-motion]'),open=document.querySelector('[data-open]');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const forced=new URLSearchParams(location.search).get('quality');
const lowDevice=navigator.connection?.saveData || (navigator.deviceMemory && navigator.deviceMemory<=4);
const quality=['low','medium','high'].includes(forced)?forced:lowDevice?'low':innerWidth<720?'medium':'high';
let scene,canvas,loading=false,failed=false,skipped=false,paused=false,visible=false;
let frame=0,last=0,elapsed=0,startLift=0,timer;
const pointer={x:0,y:0};
const phase=()=>document.body.dataset.phase;
function stop(){cancelAnimationFrame(frame);frame=0;last=0}
function draw(now){
  frame=0;
  if(!scene || document.hidden || !visible || phase()==='open')return;
  if(last && !paused)elapsed+=Math.min(50,now-last)/1000;
  last=now;
  const lift=phase()==='opening'?Math.min(1,(now-startLift)/invitation.openingMs):0;
  scene.render(elapsed,pointer,lift);
  if(!paused || phase()==='opening')frame=requestAnimationFrame(draw);
}
function refresh(){
  stop();
  if(scene && !document.hidden && visible && phase()!=='open')frame=requestAnimationFrame(draw);
}
function staticCover(){
  stop();scene?.dispose();scene=null;canvas?.remove();canvas=null;
  stage.classList.remove('is-live');motion.hidden=true;
}
async function load(){
  if(loading||scene||failed||skipped||!visible||document.hidden||reduced.matches||phase()!=='closed')return;
  loading=true;
  try{
    await poster.decode();
    if(skipped||reduced.matches||document.hidden||!visible||phase()!=='closed')return;
    canvas=document.createElement('canvas');canvas.setAttribute('aria-hidden','true');
    const gl=canvas.getContext('webgl2',{alpha:true,antialias:quality==='high',powerPreference:'low-power'});
    if(!gl)throw Error('WebGL unavailable');
    const {createFloatScene}=await import('./scene');
    if(skipped||reduced.matches||document.hidden||!visible||phase()!=='closed'){staticCover();gl.getExtension('WEBGL_lose_context')?.loseContext();return}
    scene=createFloatScene(stage,canvas,gl,quality);stage.append(canvas);
    scene.render(0,pointer);stage.classList.add('is-live');stage.dataset.quality=quality;
    canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();failed=true;staticCover()},{once:true});
    motion.hidden=false;refresh();
  }catch{failed=true;staticCover()}finally{loading=false}
}
function sync(){
  clearTimeout(timer);
  if(reduced.matches||skipped){staticCover();return}
  motion.hidden=!scene || phase()!=='closed';
  refresh();
  if(visible&&!document.hidden&&phase()==='closed'&&!scene)timer=setTimeout(load,450);
}
new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync()}).observe(stage);
new ResizeObserver(refresh).observe(stage);
new MutationObserver(()=>{if(phase()==='opening')startLift=performance.now();sync()}).observe(document.body,{attributes:true,attributeFilter:['data-phase']});
document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
addEventListener('pagehide',()=>{clearTimeout(timer);stop()});addEventListener('pageshow',sync);
document.querySelector('[data-skip]').addEventListener('click',()=>{skipped=true;document.body.dataset.floatSkipped='';sync()},{capture:true});
motion.addEventListener('click',()=>{
  paused=!paused;document.body.dataset.floatPaused=String(paused);motion.setAttribute('aria-pressed',String(paused));motion.textContent=paused?invitation.copy.resume:invitation.copy.pause;refresh();
});
let down;
function aim(event){
  const rect=stage.getBoundingClientRect();
  pointer.x=Math.max(-1,Math.min(1,(event.clientX-rect.left)/rect.width*2-1));
  pointer.y=Math.max(-1,Math.min(1,(event.clientY-rect.top)/rect.height*2-1));
}
stage.addEventListener('pointerdown',e=>{down={x:e.clientX,y:e.clientY,moved:false};stage.setPointerCapture(e.pointerId);aim(e)});
stage.addEventListener('pointermove',e=>{if(down && Math.hypot(e.clientX-down.x,e.clientY-down.y)>8)down.moved=true;aim(e)});
stage.addEventListener('pointerup',()=>{if(down&&!down.moved)open.click();down=null;pointer.x=pointer.y=0});
stage.addEventListener('pointercancel',()=>{down=null;pointer.x=pointer.y=0});
stage.addEventListener('pointerleave',()=>{if(!down)pointer.x=pointer.y=0});

document.querySelector('.celebration-rsvp').addEventListener('attendance-confirmed',()=>{
  if(reduced.matches||paused||skipped)return;
  const burst=document.createElement('span');burst.className='gold-sparks';burst.setAttribute('aria-hidden','true');
  for(let i=0;i<9;i++){const dot=document.createElement('i');dot.style.setProperty('--angle',i*40+'deg');burst.append(dot)}
  document.querySelector('[data-rsvp-status]').append(burst);setTimeout(()=>burst.remove(),700);
},{once:true});
