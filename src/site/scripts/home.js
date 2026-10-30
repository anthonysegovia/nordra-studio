/* Ambient light and a small reversible image movement; the heading never moves. */
(()=>{
 const root=document.querySelector('.home-horizon');if(!root)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const lights=[...root.querySelectorAll('.horizon-light')];
 const cards=[...root.querySelectorAll('.horizon-path')];
 const visible=new Set();let frame=0;
 const stopped=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target,isIntersecting})=>{
   target.classList.toggle('is-visible',isIntersecting);
   if(cards.includes(target)){if(isIntersecting)visible.add(target);else visible.delete(target);}
  });queue();
 },{threshold:0});
 [...lights,...cards].forEach(el=>observer.observe(el));
 function paint(){
  frame=0;if(document.hidden)return;
  if(stopped()){cards.forEach(card=>card.style.removeProperty('--image-scale'));return;}
  const positions=[...visible].map(card=>({card,rect:card.getBoundingClientRect()}));
  positions.forEach(({card,rect})=>{
   const progress=Math.max(0,Math.min(1,(innerHeight-rect.top)/(innerHeight+rect.height)));
   card.style.setProperty('--image-scale',(1.045-.045*progress).toFixed(4));
  });
 }
 function queue(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
 addEventListener('nordra-local-motion',queue);reduced.addEventListener('change',queue);
 const state=new MutationObserver(queue);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('horizon-window-hidden',document.hidden);queue();});
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();state.disconnect();},{once:true});
 queue();
})();
