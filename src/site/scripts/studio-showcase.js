// Bootstrap only observes. Each component begins after load and a paint opportunity.
(()=>{
 function boot(){
 const host=document.querySelector('[data-view="estudio"]');if(!host)return;
 const components=[host.querySelector('.studio-work-gallery')].filter(Boolean);
 const pending=new Set(),cleanup=[];let loaded=document.readyState==='complete',frame=0,idle=0;
 function initialize(){idle=0;for(const element of pending){pending.delete(element);observer.unobserve(element);hydrate(element);cleanup.push(gallery(element));}}
 function flush(){
  if(!loaded||frame||idle)return;
  frame=requestAnimationFrame(()=>{frame=requestAnimationFrame(()=>{frame=0;idle=window.requestIdleCallback?requestIdleCallback(initialize,{timeout:1000}):setTimeout(initialize,0);});});
 }
 function hydrate(element){element.querySelectorAll('img[data-src]').forEach(img=>{img.src=img.dataset.src;delete img.dataset.src;});}
 const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting)pending.add(entry.target);});flush();},{rootMargin:'400px 0px'});
 components.forEach(element=>observer.observe(element));
 // The first mobile frame uses the real texture from HTML; scroll hands it to the renderer.
 const handoff=()=>{if(host.querySelector('.studio-aurora>div.mobile-aurora'))host.querySelector('.studio-aurora-poster')?.remove();removeEventListener('scroll',handoff);};
 const onLoad=()=>{loaded=true;flush();if(scrollY)handoff();else addEventListener('scroll',handoff,{once:true,passive:true});};if(!loaded)addEventListener('load',onLoad,{once:true});else onLoad();
 addEventListener('pagehide',()=>{observer.disconnect();cancelAnimationFrame(frame);if(window.cancelIdleCallback)cancelIdleCallback(idle);else clearTimeout(idle);removeEventListener('load',onLoad);removeEventListener('scroll',handoff);cleanup.forEach(dispose=>dispose());},{once:true});
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
