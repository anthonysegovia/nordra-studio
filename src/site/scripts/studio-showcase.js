// Bootstrap only observes. Each component begins after load and a paint opportunity.
(()=>{
 function boot(){
 const host=document.querySelector('[data-view="estudio"]');if(!host)return;
 const components=[host.querySelector('.studio-type-reveal'),host.querySelector('.studio-work-gallery')].filter(Boolean);
 const pending=new Set(),cleanup=[];let loaded=document.readyState==='complete',frame=0,idle=0;
 function initialize(){idle=0;for(const element of pending){pending.delete(element);observer.unobserve(element);hydrate(element);cleanup.push(element.matches('.studio-type-reveal')?typeReveal(element):gallery(element));}}
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
 function typeReveal(element){
  const reduced=matchMedia('(prefers-reduced-motion:reduce)'),small=matchMedia('(max-width:700px),(pointer:coarse)');
  let travel=220,raf=0,listening=false,last=-1;
  const still=()=>reduced.matches||small.matches||document.body.dataset.journeyMotion==='paused';
  // Finish before the first line passes under the header, without pinning the hero.
  function measure(){const titleTop=element.querySelector('h1').getBoundingClientRect().top+scrollY,header=document.querySelector('.site-header')?.getBoundingClientRect().height||0;travel=Math.max(1,Math.min(220,titleTop-header-12));queue();}
  function paint(){raf=0;const p=still()?1:Math.max(0,Math.min(1,scrollY/travel));if(p!==last){element.style.setProperty('--studio-open',p.toFixed(4));last=p;}}
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
