/* Ambient light and a small reversible image movement; the heading never moves. */
(()=>{
 const root=document.querySelector('.home-horizon');if(!root)return;
 const reduced=matchMedia('(prefers-reduced-motion:reduce)');
 const lights=[...root.querySelectorAll('.horizon-light:not(.landscape-poster)')];
 const cards=[...root.querySelectorAll('.horizon-path, .signature-work')];
 const glowMedia=matchMedia('(hover:hover) and (pointer:fine) and (prefers-reduced-motion:no-preference)');
 const paths=[...root.querySelectorAll('.horizon-path')];
 let glowController,glowFrame=0,glowTarget,glowRect,glowX=0,glowY=0;
 function measureGlow(){
  if(!glowTarget)return;
  const rect=glowTarget.getBoundingClientRect();
  // Document coordinates keep this cache valid when the page scrolls.
  glowRect={left:rect.left+scrollX,top:rect.top+scrollY};
 }
 function paintGlow(){
  glowFrame=0;if(!glowTarget)return;
  glowTarget.style.setProperty('--glow-x',`${glowX-glowRect.left}px`);
  glowTarget.style.setProperty('--glow-y',`${glowY-glowRect.top}px`);
 }
 function moveGlow(event){
  glowX=event.pageX;glowY=event.pageY;
  if(glowTarget&&!glowFrame)glowFrame=requestAnimationFrame(paintGlow);
 }
 function leaveGlow(){cancelAnimationFrame(glowFrame);glowFrame=0;glowTarget=null;}
 function enterGlow(event){glowTarget=event.currentTarget;measureGlow();moveGlow(event);}
 function syncGlow(){
  const enabled=glowMedia.matches&&!stopped();
  if(enabled===!!glowController)return;
  if(!enabled){
   glowController.abort();glowController=null;leaveGlow();
   paths.forEach(path=>{path.style.removeProperty('--glow-x');path.style.removeProperty('--glow-y');});
   return;
  }
  glowController=new AbortController();
  const options={passive:true,signal:glowController.signal};
  paths.forEach(path=>{
   path.addEventListener('pointerenter',enterGlow,options);
   path.addEventListener('pointermove',moveGlow,options);
   path.addEventListener('pointerleave',leaveGlow,options);
  });
  addEventListener('resize',measureGlow,options);
 }
 const visible=new Set();let frame=0;
 const stopped=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 const observer=new IntersectionObserver(entries=>{
  entries.forEach(({target,isIntersecting})=>{
   target.classList.toggle('is-visible',isIntersecting);
   if(isIntersecting)target.querySelectorAll('.signature-work-image img[data-src]').forEach(img=>{img.src=img.dataset.src;delete img.dataset.src;});
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
 const state=new MutationObserver(()=>{queue();syncGlow();});state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 glowMedia.addEventListener('change',syncGlow);syncGlow();
 document.addEventListener('visibilitychange',()=>{document.body.classList.toggle('horizon-window-hidden',document.hidden);queue();});
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();state.disconnect();glowController?.abort();leaveGlow();glowMedia.removeEventListener('change',syncGlow);},{once:true});
 queue();
})();
