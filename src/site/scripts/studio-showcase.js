// Bootstrap only observes. Each component begins after load and a paint opportunity.
(()=>{
 function boot(){
 const host=document.querySelector('[data-view="estudio"]');if(!host)return;
 const components=[host.querySelector('.studio-type-reveal'),host.querySelector('.studio-work-gallery')].filter(Boolean);
 const pending=new Set(),cleanup=[];let loaded=document.readyState==='complete',frame=0;
 function flush(){
  if(!loaded||frame)return;
  frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;for(const element of pending){pending.delete(element);observer.unobserve(element);hydrate(element);cleanup.push(element.matches('.studio-type-reveal')?typeReveal(element):gallery(element));}});});
 }
 function hydrate(element){element.querySelectorAll('img[data-src]').forEach(img=>{img.src=img.dataset.src;delete img.dataset.src;});}
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)pending.add(entry.target);});flush();},{rootMargin:'400px 0px'});
 components.forEach(element=>observer.observe(element));
 const onLoad=()=>{loaded=true;flush();};if(!loaded)addEventListener('load',onLoad,{once:true});
 addEventListener('pagehide',()=>{observer.disconnect();cancelAnimationFrame(frame);removeEventListener('load',onLoad);cleanup.forEach(dispose=>dispose());},{once:true});
 function typeReveal(element){
  const reduced=matchMedia('(prefers-reduced-motion:reduce)'),small=matchMedia('(max-width:700px),(pointer:coarse)');
  let top=0,raf=0,listening=false,last=-1;
  const still=()=>reduced.matches||small.matches||document.body.dataset.journeyMotion==='paused';
  function measure(){top=element.getBoundingClientRect().top+scrollY;queue();}
  function paint(){raf=0;const p=still()?1:Math.max(0,Math.min(1,(scrollY-Math.max(0,top-120))/300));if(p!==last){element.style.setProperty('--studio-open',p.toFixed(4));last=p;}}
  function queue(){if(!raf&&!document.hidden)raf=requestAnimationFrame(paint);}
  function sync(){const enabled=!still();if(enabled!==listening){listening=enabled;if(enabled)addEventListener('scroll',queue,{passive:true});else removeEventListener('scroll',queue);}queue();}
  const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
  reduced.addEventListener('change',sync);small.addEventListener('change',sync);addEventListener('resize',measure,{passive:true});document.fonts.ready.then(measure);measure();sync();
  return()=>{cancelAnimationFrame(raf);state.disconnect();removeEventListener('scroll',queue);removeEventListener('resize',measure);reduced.removeEventListener('change',sync);small.removeEventListener('change',sync);};
 }
 function gallery(element){
  const links=[...element.querySelectorAll('.studio-work')],fine=matchMedia('(min-width:701px) and (hover:hover) and (pointer:fine)'),controller=new AbortController();
  const options={signal:controller.signal};
  function select(link){links.forEach(item=>item.toggleAttribute('data-studio-active',item===link));}
  links.forEach(link=>{link.addEventListener('pointerenter',()=>{if(fine.matches)select(link);},options);link.addEventListener('focus',()=>select(link),options);});
  element.addEventListener('pointerleave',()=>select(links.find(link=>link===document.activeElement)||links[0]),options);
  return()=>controller.abort();
 }
 }
 boot();
 addEventListener('pageshow',event=>{if(event.persisted)boot();});
})();
