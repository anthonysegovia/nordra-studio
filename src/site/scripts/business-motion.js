(()=>{
 const host=document.querySelector('.business[data-view]:not([hidden])');
 if(!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:700px)');
 const animations=new Set(),expansions=new Map();
 const seen=new WeakSet();
 let paused=parent!==window||reduced.matches||document.body.dataset.journeyMotion==='paused',ready=parent===window;
 const toggle=host.querySelector('[data-business-toggle]');
 const enabled=()=>!paused&&!reduced.matches&&!document.hidden;
 function animate(el,frames,options={},onDone){
  if(!enabled()||!el.animate){onDone?.();return null;}
  const animation=el.animate(frames,{duration:mobile.matches?360:520,easing:'cubic-bezier(.22,.7,.2,1)',...options});
  animations.add(animation);
  animation.onfinish=()=>{animations.delete(animation);onDone?.();};
  animation.oncancel=()=>animations.delete(animation);
  return animation;
 }
 function paint(){
  document.body.dataset.businessMotion=paused||reduced.matches?'paused':'playing';
  toggle.textContent=paused?'Reproducir movimiento':'Pausar movimiento';
  toggle.setAttribute('aria-pressed',String(paused));
 }
 function finish(){for(const a of [...animations]){try{a.finish();}catch{a.cancel();}}}
 function state(value){paused=!!value;ready=true;paint();if(!enabled())finish();revealVisible();}
 toggle.addEventListener('click',()=>{
  const next=!paused;
  dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused:next}}));
  if(parent!==window)parent.postMessage({type:'nordra-motion-request',paused:next},'*');
 });
 addEventListener('nordra-local-motion',e=>state(e.detail.paused));
 addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='nordra-motion')state(e.data.paused);});
 reduced.addEventListener('change',e=>state(e.matches));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});

 // A small set of editorial groups: controls and body copy stay immediately readable.
 const selector='.business-title-line,.business-topline,.business-lead>p,h2,.feature-heading,.feature-stage,.feature-context>div,.atelier-heading,.atelier-copy,.atelier-photo,.occasion-hero-photo,.occasion-hero-poster,.occasion-sample-copy,.seasonal-chapter-heading,.seasonal-cover,.options-intro,.decision-guide,.case-intention,.case-decision,.case-try-heading,.case-test-link,.studio-principles>div,.process-intro,.process-list>li,.contact-layout>p,.footer-brand';
 const candidates=[...host.querySelectorAll(selector)];
 const targets=candidates.filter(el=>{
  if(el.closest('.occasion-path,.response-stage,.scroll-scrub')||el.querySelector('.scroll-scrub'))return false;
  let ancestor=el.parentElement;
  while(ancestor&&ancestor!==host){
   if(ancestor.matches(selector))return false;
   ancestor=ancestor.parentElement;
  }
  return true;
 });
 const visible=new Set();
 let revealCount=0;
 function reveal(el){
  if(seen.has(el)||!ready)return;
  seen.add(el);el.dataset.businessRevealed='true';host.dataset.revealCount=String(++revealCount);
  const intro=!!el.closest('.business-head,.occasion-hero,.seasonal-hero');
  const visual=el.matches('.feature-stage,.atelier-photo,.occasion-hero-photo,.occasion-hero-poster,.seasonal-cover');
  const heading=el.matches('h2,.feature-heading,.atelier-heading,.case-intention,.process-intro');
  el.dataset.motionRole=intro?'arrival':visual?'image':heading?'heading':'support';
  if(!enabled())return;
  let frames,duration,delay;
  if(visual){
   // Opacity preserves composed rotations/crops and avoids moving readable artwork.
   frames=[{opacity:.84},{opacity:1}];duration=mobile.matches?420:620;delay=60;
  }else{
   const travel=intro?4:heading?(mobile.matches?6:12):(mobile.matches?4:7);
   frames=[{opacity:intro ? .94 : heading ? .78 : .9,transform:`translateY(${travel}px)`},{opacity:1,transform:'translateY(0)'}];
   duration=intro?280:heading?(mobile.matches?360:520):(mobile.matches?280:380);
   delay=heading||intro?0:40;
  }
  animate(el,frames,{duration,delay,fill:'backwards'});
 }
 function revealVisible(){for(const el of visible)if(!seen.has(el))reveal(el);}
 // A prepared navigation frame must not re-fade its first viewport after appearing.
 addEventListener('nordra-page-prepared',()=>{
  const wasPaused=paused,wasReady=ready;paused=true;ready=true;finish();
  for(const el of targets){const r=el.getBoundingClientRect();if(r.bottom>0&&r.top<innerHeight)reveal(el);}
  paused=wasPaused;ready=wasReady;
 });
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){if(entry.isIntersecting)visible.add(entry.target);else visible.delete(entry.target);}
  revealVisible();
 },{threshold:.08});
 targets.forEach(el=>observer.observe(el));
 const surfaces=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting){entry.target.dataset.arrived='true';surfaces.unobserve(entry.target);}
 },{threshold:.12});
 host.querySelectorAll('.project-feature,.home-continuation,.process-list,.case-story').forEach(el=>surfaces.observe(el));

 // Native details remain usable without JavaScript; enhanced height changes are cancellable.
 const options=[...host.querySelectorAll('.web-option,.sample-detail')];
 function expand(detail,open){
  const from=detail.getBoundingClientRect().height;
  const old=expansions.get(detail);
  if(old){old.onfinish=null;old.cancel();expansions.delete(detail);}
  detail.dataset.expanded=String(open);
  detail.style.height='';detail.style.overflow='';
  if(open)detail.open=true;
  const to=open?detail.getBoundingClientRect().height:detail.querySelector('summary').getBoundingClientRect().height+1;
  const settle=()=>{detail.open=open;detail.style.height='';detail.style.overflow='';expansions.delete(detail);};
  if(!enabled()){settle();return;}
  detail.style.overflow='hidden';
  const animation=animate(detail,[{height:`${from}px`},{height:`${to}px`}],{duration:mobile.matches?220:280},settle);
  if(animation)expansions.set(detail,animation);
 }
 options.forEach(detail=>{
  detail.dataset.motionGroup=detail.getAttribute('name')||'web-options';
  detail.removeAttribute('name');
  detail.dataset.expanded=String(detail.open);
  detail.querySelector('summary').addEventListener('click',event=>{
   event.preventDefault();
   const opening=detail.dataset.expanded!=='true';
   if(opening)options.filter(other=>other!==detail&&other.dataset.motionGroup===detail.dataset.motionGroup&&other.dataset.expanded==='true').forEach(other=>expand(other,false));
   expand(detail,opening);
  });
 });
 addEventListener('nordra-preview-change',event=>{finish();const panel=event.detail?.panel;if(panel&&host.contains(panel))animate(panel,[{opacity:.85,transform:'translateY(4px)'},{opacity:1,transform:'translateY(0)'}],{duration:mobile.matches?220:320});});
 paint();
 addEventListener('pagehide',()=>{finish();observer.disconnect();surfaces.disconnect();},{once:true});
})();
