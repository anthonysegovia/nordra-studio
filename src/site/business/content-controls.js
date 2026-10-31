export function initializeBusinessContent(root){
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:700px)'),pending=new Map(),abort=new AbortController(),options={signal:abort.signal};
 const paused=()=>reduce.matches||document.body.dataset.businessMotion==='paused'||document.body.dataset.journeyMotion==='paused';
 // Native lazy loading reaches several screens ahead on slow networks. Keep this
 // below-fold portrait out of the hero's bandwidth, with a square reserved slot.
 const photo=root.querySelector('.person-photo');
 const photoObserver=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){photo.dataset.photoReady='true';photoObserver.disconnect();}},{rootMargin:'600px'});
 if(photo)photoObserver.observe(photo);addEventListener('pageshow',()=>{if(photo&&!photo.dataset.photoReady)photoObserver.observe(photo);},{signal:abort.signal});addEventListener('pagehide',()=>photoObserver.disconnect(),{signal:abort.signal});
 function settle(detail,open){detail.open=open;detail.style.height='';detail.style.overflow='';pending.delete(detail);}
 function finish(){for(const[detail,{animation,open}]of pending){animation.oncancel=null;animation.onfinish=null;animation.cancel();settle(detail,open);}}
 root.querySelectorAll('.business-disclosure').forEach(detail=>{
  const summary=detail.querySelector('summary');summary.addEventListener('click',event=>{
   if(paused()||!detail.animate)return;
   event.preventDefault();const current=pending.get(detail),open=current?!current.open:!detail.open,from=detail.getBoundingClientRect().height;
   if(current){current.animation.oncancel=null;current.animation.onfinish=null;current.animation.cancel();pending.delete(detail);}
   detail.style.height='';detail.style.overflow='';detail.open=true;
   const to=open?detail.getBoundingClientRect().height:summary.getBoundingClientRect().height+2;
   detail.style.overflow='hidden';const animation=detail.animate([{height:`${from}px`},{height:`${to}px`}],{duration:mobile.matches?220:300,easing:'cubic-bezier(.2,.7,.2,1)'});pending.set(detail,{animation,open});animation.onfinish=()=>settle(detail,open);animation.oncancel=()=>settle(detail,open);
  },options);
 });
 function sync(){if(paused()||document.hidden)finish();const process=root.querySelector('.business-process');if(process)process.dataset.stack=paused()||mobile.matches?'off':'on';}
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-business-motion','data-journey-motion']});reduce.addEventListener('change',sync,options);mobile.addEventListener('change',sync,options);document.addEventListener('visibilitychange',sync,options);sync();root.dataset.businessContentReady='true';
 addEventListener('pagehide',e=>{if(e.persisted){finish();return;}finish();state.disconnect();abort.abort();},{once:true});
}
