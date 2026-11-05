import { ringsPolicy, staticProfile } from './state.js';
function mountRings(){
 const hero=document.querySelector('.rings-hero');if(!hero)return;
 const stage=hero.querySelector('#rings-stage'),start=hero.querySelector('[data-rings-start]'),sound=hero.querySelector('[data-rings-sound]');
 const wide=matchMedia('(min-width:901px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),phone=matchMedia('(max-width:700px)');
 const frame=window.frameElement,parentDocument=frame?.ownerDocument,events=new AbortController();
 let scene,loading=false,failed=false,disposed=false,painted=false,visible=false,optedIn=false,idle=0,paint=0;
 const listen=(target,name,fn)=>target?.addEventListener(name,fn,{signal:events.signal});
 const snapshot=()=>({visible,hidden:document.hidden,embeddedHidden:Boolean(frame&&(frame.getAttribute('aria-hidden')==='true'||!frame.isConnected)),paused:document.body.dataset.journeyMotion==='paused',reduced:reduced.matches,static:staticProfile(navigator),phone:phone.matches,optedIn,dark:document.body.classList.contains('dark'),ready:Boolean(scene),failed,disposed,painted});
 const cancelIdle=()=>{if(idle){if(window.cancelIdleCallback)cancelIdleCallback(idle);else clearTimeout(idle);idle=0;}};
 function fallback(){failed=true;scene?.dispose();scene=null;sync();}
 async function load(){
  idle=0;if(loading||!ringsPolicy(snapshot()).load)return;loading=true;
  try{
   const {createRingsScene}=await import('./rings-scene.js');
   if(!ringsPolicy(snapshot()).load)return;
   let entered=false;try{entered=sessionStorage.getItem('nordra-rings-entered')==='1';}catch{}
   hero.classList.toggle('entering',!entered);
   const next=await createRingsScene(stage,{dark:snapshot().dark,initialElapsed:entered?7.8:0,isCancelled:()=>!ringsPolicy(snapshot()).load,onFallback:()=>queueMicrotask(fallback)});
   if(!ringsPolicy(snapshot()).load){next.dispose();return;}
   scene=next;hero.classList.toggle('ready',entered);try{sessionStorage.setItem('nordra-rings-entered','1');}catch{}
  }catch{failed=true;stage.querySelectorAll('canvas').forEach(c=>{c.getContext('webgl2')?.getExtension('WEBGL_lose_context')?.loseContext();c.remove();});}
  finally{loading=false;sync();}
 }
 function sync(){
  if(disposed)return;
  if(document.body.classList.contains('has-page-frame')||(frame&&!frame.isConnected)){dispose();return;}
  for(const text of hero.querySelectorAll('.ink')){text.setAttribute('x',wide.matches?'20':'450');text.setAttribute('text-anchor',wide.matches?'start':'middle');}
  const state=snapshot();
  if(scene&&(state.static||state.reduced)){scene.dispose();scene=null;state.ready=false;}
  const policy=ringsPolicy(state);
  hero.classList.toggle('has-scene',policy.showScene);hero.dataset.running=String(policy.animate);
  stage.dataset.renderer=policy.showScene?'webgl':'static';
  if(!policy.showScene)hero.classList.add('ready');
  start.hidden=!policy.offerMotion;sound.hidden=!policy.showScene;
  scene?.setState(state);
  if(policy.load&&!loading&&!idle)idle=window.requestIdleCallback?requestIdleCallback(load,{timeout:1800}):setTimeout(load,200);
  if(!policy.load)cancelIdle();
 }
 listen(start,'click',()=>{optedIn=true;sync();});
 const io=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;sync();});io.observe(hero);
 const bodyObserver=new MutationObserver(sync);bodyObserver.observe(document.body,{attributes:true,attributeFilter:['class','data-journey-motion']});
 const parentObserver=new MutationObserver(sync);if(parentDocument){parentObserver.observe(parentDocument.body,{childList:true});parentObserver.observe(frame,{attributes:true,attributeFilter:['aria-hidden']});}
 const seal=document.getElementById('rings-seal');const sealObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){seal.classList.add('on');sealObserver.disconnect();}},{threshold:.6});sealObserver.observe(seal);
 for(const target of [reduced,phone,wide,navigator.connection])listen(target,'change',sync);
 listen(document,'visibilitychange',sync);
 function afterPaint(){paint=requestAnimationFrame(()=>{paint=requestAnimationFrame(()=>{painted=true;sync();});});}
 if(document.readyState==='complete')afterPaint();else listen(window,'load',afterPaint);
 function dispose(){if(disposed)return;disposed=true;cancelIdle();cancelAnimationFrame(paint);events.abort();io.disconnect();bodyObserver.disconnect();parentObserver.disconnect();sealObserver.disconnect();scene?.dispose();scene=null;hero.classList.remove('has-scene');hero.dataset.running='false';}
 listen(window,'pagehide',dispose);
 // BFCache restores the static DOM; reconstruct the policy without keeping GPU resources alive.
 function restore(e){if(e.persisted&&disposed){window.removeEventListener('pageshow',restore);mountRings();}}
 window.addEventListener('pageshow',restore);
 sync();
}

mountRings();
