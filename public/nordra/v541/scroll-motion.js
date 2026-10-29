(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let paused=parent!==window||reduced.matches||document.body.dataset.journeyMotion==='paused';
 const animations=new Set();
 const mobile=matchMedia('(max-width:700px)');
 function animate(element,frames,options){
  if(paused||reduced.matches||!element.animate)return;
  const animation=element.animate(frames,{duration:mobile.matches?360:520,easing:'cubic-bezier(.2,.65,.25,1)',...options});
  animations.add(animation);
  animation.onfinish=animation.oncancel=()=>animations.delete(animation);
 }
 function finish(){for(const animation of animations)animation.finish();animations.clear();}
 const toggle=document.getElementById('local-motion-toggle');
 function paintToggle(){if(toggle)toggle.textContent=paused?'Reproducir movimiento':'Pausar movimiento';}
 paintToggle();
 toggle?.addEventListener('click',()=>{paused=!paused;paintToggle();dispatchEvent(new CustomEvent('nordra-local-motion',{detail:{paused}}));if(parent!==window)parent.postMessage({type:'nordra-motion-request',paused},'*');});
 const targets=host.classList.contains('business')?[]:host.querySelectorAll('.studio-heading-copy,.studio-desk,.studio-credit,.project-feature,.home-continuation h2,.service-path,.web-option,.story-body,.studio-principles>div,.process-list li,.contact-layout,.contact-alternatives,.story-horizon,.process-orbit');
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   if(!entry.isIntersecting)continue;
   const el=entry.target;
   // Content stays readable before JS and while motion is paused.
   if(!paused&&!reduced.matches){
    animate(el,[{opacity:.85,transform:mobile.matches?'translateY(5px)':'translateY(10px)'},{opacity:1,transform:'translateY(0)'}]);
    if(el.matches('.story-horizon')){
     const path=el.querySelector('path');
     path.setAttribute('pathLength','1');
     animate(path,[{strokeDasharray:'1 1',strokeDashoffset:1},{strokeDasharray:'1 1',strokeDashoffset:0}],{duration:750});
    }
    if(el.matches('.process-orbit'))animate(el.querySelector('span'),[{transform:'rotate(-35deg) scale(.85)'},{transform:'rotate(0) scale(1)'}],{duration:650});
   }
   el.dataset.revealed='true';observer.unobserve(el);
  }
 },{threshold:.12});
 [...targets].filter(el=>!el.closest('.scroll-scrub')&&!el.querySelector('.scroll-scrub')).forEach(el=>observer.observe(el));
 addEventListener('message',event=>{if(event.source!==parent||event.data?.type!=='nordra-motion')return;paused=!!event.data.paused;paintToggle();if(paused)finish();});
 addEventListener('nordra-local-motion',event=>{paused=!!event.detail.paused;paintToggle();if(paused)finish();});
 reduced.addEventListener('change',event=>{paused=event.matches;paintToggle();if(paused)finish();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 addEventListener('pagehide',()=>{finish();observer.disconnect();},{once:true});
})();
