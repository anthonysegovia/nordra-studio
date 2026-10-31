// Keep the module bootstrap read-only. The hero gets its load and first paint
// before the below-fold table installs any controls or changes attributes.
(()=>{
 const table=document.querySelector('[data-view="negocios"] .light-table');if(!table)return;
 let initialized=false,loaded=document.readyState==='complete',near=false,frame=0,idle=0,timer=0;
 const proximity=new IntersectionObserver(entries=>{
  if(entries.some(entry=>entry.isIntersecting)){near=true;if(loaded)schedule();}
 },{rootMargin:'600px 0px'});
 function start(){
  if(initialized)return;initialized=true;cancelAnimationFrame(frame);clearTimeout(timer);
  if(idle&&window.cancelIdleCallback)cancelIdleCallback(idle);
  proximity.disconnect();removeEventListener('load',onLoad);removeEventListener('pagehide',cancel);
  initializeLightTable(table);
 }
 function schedule(){
  if(initialized||frame)return;
  // Two frames leave a paint opportunity before the component work.
  frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{
   frame=0;
   if(near)start();
   else if('requestIdleCallback' in window)idle=requestIdleCallback(start,{timeout:2500});
   else timer=setTimeout(start,250);
  });});
 }
 function onLoad(){loaded=true;schedule();}
 function cancel(){cancelAnimationFrame(frame);clearTimeout(timer);if(idle&&window.cancelIdleCallback)cancelIdleCallback(idle);proximity.disconnect();removeEventListener('load',onLoad);}
 proximity.observe(table);
 if(loaded)schedule();else addEventListener('load',onLoad,{once:true});
 addEventListener('pagehide',cancel,{once:true});
})();

function initializeLightTable(table){
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const fine=matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');
 const cards=[...table.querySelectorAll('[data-light-case]')];
 const links=[...table.querySelectorAll('.case-index a,.project-feature')];
 const lights=[...table.querySelectorAll('.light-table-screen-light')];
 const preview=table.querySelector('[data-living-toggle="bruma"]');
 let previewReady=false,previewLoading=false;
 const animations=new Set();let revealed=false,pointers,hovered='',selected='';
 const stopped=()=>reduce.matches||!fine.matches||document.body.dataset.businessMotion==='paused'||document.body.dataset.journeyMotion==='paused';
 const key=link=>link.closest('[data-light-case]')?.dataset.lightCase||(link.hash.includes('lumina')?'lumina':'bruma');
 function active(){
  const focused=links.find(link=>link===document.activeElement);
  const value=fine.matches?(focused?key(focused):hovered||selected):'';
  if(value)table.dataset.lightActive=value;else delete table.dataset.lightActive;
  cards.forEach(card=>card.toggleAttribute('data-light-active',card.dataset.lightCase===value));
  links.forEach(link=>link.toggleAttribute('data-light-active',key(link)===value));
 }
 function finish(){animations.forEach(animation=>animation.cancel());animations.clear();}
 function animate(element,frames,duration,delay=0){
  const animation=element.animate(frames,{duration,delay,easing:'cubic-bezier(.22,.7,.2,1)',fill:'backwards'});
  animations.add(animation);animation.onfinish=animation.oncancel=()=>animations.delete(animation);
 }
 function reveal(){
  if(revealed)return;revealed=true;table.dataset.lightState='on';table.dataset.lightReveals='1';observer.unobserve(table);
  if(stopped()||!table.animate)return;
  animate(table.querySelector('.light-table-horizon'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],300);
  animate(table.querySelector('.light-table-glow'),[{opacity:0,transform:'scaleY(.35)'},{opacity:1,transform:'scaleY(1)'}],380,160);
  lights.forEach((light,i)=>animate(light,[{opacity:0},{opacity:1}],260,440+i*120));
 }
 const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))reveal();},{threshold:.12});
 function sync(){
  if(stopped()){finish();reveal();}
  const enable=fine.matches&&!stopped();
  if(enable!==!!pointers){
   pointers?.abort();pointers=null;hovered='';
   if(enable){
    pointers=new AbortController();const options={passive:true,signal:pointers.signal};
    links.forEach(link=>{
     link.addEventListener('pointerenter',()=>{hovered=key(link);active();},options);
     link.addEventListener('pointerleave',()=>{hovered='';active();},options);
    });
   }
  }
  active();syncPreview();
 }
 links.forEach(link=>{
  link.addEventListener('focus',active);link.addEventListener('blur',()=>queueMicrotask(active));
  link.addEventListener('click',()=>{selected=key(link);active();});
 });
 function fromHash(){selected=location.hash.includes('bruma')?'bruma':location.hash.includes('lumina')?'lumina':'';active();}
 addEventListener('hashchange',fromHash);fromHash();
 table.dataset.lightState='waiting';observer.observe(table);
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-business-motion','data-journey-motion']});
 reduce.addEventListener('change',sync);fine.addEventListener('change',sync);sync();
 // The existing tour controller is needed only when someone starts the tour.
 // Keeping its iframe idle avoids hidden document layout during the hero's LCP.
 function syncPreview(){
  if(previewReady)return;
  const paused=reduce.matches||document.body.dataset.businessMotion==='paused'||document.body.dataset.journeyMotion==='paused';
  preview.disabled=paused||previewLoading;preview.setAttribute('aria-pressed','true');
  preview.textContent=paused?'Movimiento pausado':'Reanudar muestra';
 }
 async function resumePreview(){
  if(previewReady||previewLoading||preview.disabled)return;
  previewLoading=true;syncPreview();
  try{
   await import('./living-images.js?entry=business');
   previewReady=true;preview.removeEventListener('click',resumePreview);
  }catch(error){console.error('No se pudo cargar el recorrido de BRUMA',error);}
  finally{previewLoading=false;syncPreview();}
 }
 const previewState=new MutationObserver(()=>{table.dataset.lightPreview=preview.getAttribute('aria-pressed')==='true'?'still':'playing';});
 previewState.observe(preview,{attributes:true,attributeFilter:['aria-pressed']});
 preview.addEventListener('click',resumePreview);
 table.dataset.lightPreview='still';
 const visibility=()=>{if(document.hidden)finish();};document.addEventListener('visibilitychange',visibility);
 addEventListener('pagehide',()=>{finish();pointers?.abort();observer.disconnect();state.disconnect();previewState.disconnect();preview.removeEventListener('click',resumePreview);reduce.removeEventListener('change',sync);fine.removeEventListener('change',sync);removeEventListener('hashchange',fromHash);document.removeEventListener('visibilitychange',visibility);},{once:true});
}
