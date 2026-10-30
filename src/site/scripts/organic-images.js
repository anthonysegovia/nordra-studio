/* 5.35 — Paper openings follow scroll; the original photo and copy stay in place. */
(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');
 if(!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const candidates=[...host.querySelectorAll('.organic-poster,#showcase-temporada .showcase-art,.seasonal-hero-art')];
 if(!candidates.length)return;
 const items=candidates.map(el=>{
  const kind=el.classList.contains('birthday-poster')?'birthday':el.classList.contains('event-poster')?'event':'season';
  el.classList.add('scroll-invitation');el.dataset.paper=kind;
  const paper=document.createElement('div');paper.className='occasion-paper';paper.setAttribute('aria-hidden','true');
  paper.innerHTML='<i class="paper-left"></i><i class="paper-right"></i>';
  el.append(paper);
  return {el,value:0,target:0,visible:false};
 });
 let frame=0,last=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 const paused=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 function draw(item){
  const p=item.value,smooth=p*p*(3-2*p);
  item.el.style.setProperty('--paper-open',smooth.toFixed(4));
  item.el.style.setProperty('--paper-fade',(1-clamp((p-.72)/.28)).toFixed(4));
  item.el.dataset.openingProgress=p.toFixed(3);
 }
 function measure(item){
  let y=0;for(let n=item.el;n;n=n.offsetParent)y+=n.offsetTop;
  const r={top:y-scrollY,height:item.el.offsetHeight};
  // Open during the approach to the center. Scrolling back reverses the fold.
  item.target=clamp((innerHeight*.96-r.top)/(innerHeight*.72));
 }
 function tick(now){
  frame=0;if(paused()||document.hidden)return;
  const dt=last?Math.min(now-last,50):16;last=now;let unsettled=false;
  for(const item of items){
   if(!item.visible)continue;
   const delta=item.target-item.value;
   item.value=item.target;
   draw(item);
  }
  if(unsettled)frame=requestAnimationFrame(tick);else last=0;
 }
 function wake(){if(!frame&&!paused()&&!document.hidden){last=0;frame=requestAnimationFrame(tick);}}
 function sync(){
  const still=paused();
  for(const item of items){
   item.el.classList.toggle('organic-running',item.visible&&!document.hidden&&!still);
   if(still){item.value=1;item.target=1;draw(item);}else if(item.visible)measure(item);
  }
  if(still||document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}else wake();
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){const item=items.find(i=>i.el===entry.target);item.visible=entry.isIntersecting;}
  sync();
 },{threshold:0});
 items.forEach(item=>{draw(item);observer.observe(item.el);});
 function onScroll(){for(const item of items)if(item.visible)measure(item);wake();}
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',onScroll,{passive:true});
 addEventListener('nordra-showcase-select',event=>{
  for(const item of items){
   const panel=item.el.closest('.showcase-panel');
   if(panel&&panel.id==='showcase-'+event.detail.celebration){item.value=paused()?1:0;draw(item);measure(item);}
  }
  wake();
 });
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);sync();
 addEventListener('pagehide',()=>{observer.disconnect();state.disconnect();cancelAnimationFrame(frame);removeEventListener('scroll',onScroll);removeEventListener('resize',onScroll);},{once:true});
})();
