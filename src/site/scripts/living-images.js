/* 5.27 — Snow and envelope studies. No remote requests or analytics. */
(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');
 if(!host)return;
 const samples=[...host.querySelectorAll('[data-living]')];
 if(!samples.length)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const stopped=new Set();
 const visible=new Set();
 const animations=new Map();
 const scrollPositions=new Map();let manualEnvelope=false;
 const globallyPaused=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 const running=el=>visible.has(el)&&!stopped.has(el.dataset.living)&&!globallyPaused()&&!document.hidden;

 samples.filter(el=>el.dataset.living==='snow').forEach(el=>{
  const layer=el.querySelector('.snow-layer');
  for(let i=0;i<42;i++){
   const flake=document.createElement('i');
   const near=i%6===0;
   flake.style.cssText=`--x:${(i*47.13)%100}%;--size:${near?4.6:1.2+(i%4)*.55}px;--drift:${(i%2?1:-1)*(14+i%21)}px;--duration:${near?8+i%4:13+i%7}s;--delay:-${(i*2.71)%19}s;--alpha:${near?.55:.25+(i%3)*.12};--blur:${near?1:.15}px`;
   layer.append(flake);
  }
  new ResizeObserver(entries=>{for(const {contentRect} of entries)el.style.setProperty('--snow-fall',`${contentRect.height+35}px`);}).observe(el);
 });

 const envelope=host.querySelector('[data-living="envelope"]');
 if(envelope){
  const timing={duration:6800,fill:'both',easing:'linear'};
  const make=(selector,keys)=>{
   const a=envelope.querySelector(selector).animate(keys,timing);a.pause();a.currentTime=globallyPaused()?6800:0;return a;
  };
  animations.set(envelope,[
   make('.envelope-flap',[{transform:'rotateX(0deg)',zIndex:4,offset:0},{transform:'rotateX(0deg)',zIndex:4,offset:.08},{transform:'rotateX(-180deg)',zIndex:1,offset:.32},{transform:'rotateX(-180deg)',zIndex:1,offset:1}]),
   make('.envelope-letter',[{transform:'translateY(0)',clipPath:'inset(40% 0 0)',offset:0},{transform:'translateY(0)',clipPath:'inset(40% 0 0)',offset:.3,easing:'cubic-bezier(.22,.61,.36,1)'},{transform:'translateY(-53%)',clipPath:'inset(0% 0 0)',offset:.79},{transform:'translateY(-53%)',clipPath:'inset(0% 0 0)',offset:1}]),
   make('.envelope-seal',[{opacity:1,transform:'scale(1)',offset:0},{opacity:1,transform:'scale(1)',offset:.06},{opacity:0,transform:'scale(.9)',offset:.18},{opacity:0,transform:'scale(.9)',offset:1}])
  ]);
 }

 function update(){
  samples.forEach(el=>{
   const play=running(el);el.dataset.sampleRunning=String(play);
   (animations.get(el)||[]).forEach(a=>{
    if(reduced.matches){a.pause();a.currentTime=6800;}
    else if(el===envelope&&!manualEnvelope&&scrollPositions.has(el)){a.pause();if(play)a.currentTime=6800*scrollPositions.get(el);}
    else if(play&&a.playState!=='finished')a.play();
    else if(!play&&a.playState!=='finished')a.pause();
   });
  });
  host.querySelectorAll('[data-living-toggle]').forEach(button=>{
   const type=button.dataset.livingToggle;
   const paused=stopped.has(type)||globallyPaused();
   button.setAttribute('aria-pressed',String(paused));
   button.disabled=globallyPaused();
   button.textContent=document.documentElement.lang==='en'?(globallyPaused()?'Motion paused':`${paused?'Resume':'Pause'} ${type==='snow'?'snow':'preview'}`):globallyPaused()?'Movimiento pausado':`${paused?'Reanudar':'Pausar'} ${type==='snow'?'nieve':'muestra'}`;
  });

 }
 host.querySelectorAll('[data-living-toggle]').forEach(button=>button.addEventListener('click',()=>{
  const type=button.dataset.livingToggle;stopped.has(type)?stopped.delete(type):stopped.add(type);update();
 }));
 host.querySelector('[data-envelope-replay]')?.addEventListener('click',()=>{
  stopped.delete('envelope');manualEnvelope=true;
  (animations.get(envelope)||[]).forEach(a=>{a.pause();a.currentTime=globallyPaused()?6800:0;});update();
 });
 addEventListener('nordra-scroll-moment',event=>{
  const {element,progress,moved}=event.detail;
  if(element!==envelope)return;
  scrollPositions.set(element,progress);
  if(element===envelope&&moved)manualEnvelope=false;
  update();
 });
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>entry.isIntersecting?visible.add(entry.target):visible.delete(entry.target));update();},{threshold:.15});
 samples.forEach(el=>observer.observe(el));
 new MutationObserver(update).observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 document.addEventListener('visibilitychange',update);
 reduced.addEventListener('change',update);
 addEventListener('pageshow',update);
 update();
})();
