// One brief native reveal; the existing anchors and story navigation remain native.
(()=>{
 const table=document.querySelector('[data-view="negocios"] .light-table');if(!table)return;
 table.dataset.mesa=new URLSearchParams(location.search).get('mesa')==='b'?'b':'a';
 const reduce=matchMedia('(prefers-reduced-motion:reduce)');
 const fine=matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)');
 const cards=[...table.querySelectorAll('[data-light-case]')];
 const links=[...table.querySelectorAll('.case-index a,.project-feature')];
 const animations=new Set();let revealed=false,pointers,hovered='',selected='';
 const stopped=()=>reduce.matches||!fine.matches||document.body.dataset.businessMotion==='paused'||document.body.dataset.journeyMotion==='paused';
 const key=link=>link.closest('[data-light-case]')?.dataset.lightCase||(link.hash.includes('lumina')?'lumina':'bruma');
 function active(){
  const focused=links.find(link=>link===document.activeElement);
  const value=focused?key(focused):hovered||selected;
  if(value)table.dataset.lightActive=value;else delete table.dataset.lightActive;
  cards.forEach(card=>card.toggleAttribute('data-light-active',card.dataset.lightCase===value));
  links.forEach(link=>link.toggleAttribute('data-light-active',key(link)===value));
 }
 function finish(){animations.forEach(animation=>animation.cancel());animations.clear();}
 function animate(element,frames,delay=0){
  const animation=element.animate(frames,{duration:620,delay,easing:'cubic-bezier(.22,.7,.2,1)',fill:'backwards'});
  animations.add(animation);animation.onfinish=animation.oncancel=()=>animations.delete(animation);
 }
 function reveal(){
  if(revealed)return;revealed=true;table.dataset.lightState='on';table.dataset.lightReveals='1';observer.unobserve(table);
  if(stopped()||!table.animate)return;
  animate(table.querySelector('.light-table-glow'),[{opacity:.06},{opacity:1}]);
  cards.forEach((card,i)=>animate(card,[{translate:'0 10px',opacity:.88},{translate:'0 0',opacity:1}],i*70));
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
  active();
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
 // Retain the BRUMA tour and its control, but make playback an explicit choice.
 const preview=table.querySelector('[data-living-toggle="bruma"]');
 const previewState=new MutationObserver(()=>{table.dataset.lightPreview=preview.getAttribute('aria-pressed')==='true'?'still':'playing';});
 previewState.observe(preview,{attributes:true,attributeFilter:['aria-pressed']});
 preview.dispatchEvent(new Event('click'));
 table.dataset.lightPreview='still';
 const visibility=()=>{if(document.hidden)finish();};document.addEventListener('visibilitychange',visibility);
 addEventListener('pagehide',()=>{finish();pointers?.abort();observer.disconnect();state.disconnect();previewState.disconnect();reduce.removeEventListener('change',sync);fine.removeEventListener('change',sync);removeEventListener('hashchange',fromHash);document.removeEventListener('visibilitychange',visibility);},{once:true});
})();
