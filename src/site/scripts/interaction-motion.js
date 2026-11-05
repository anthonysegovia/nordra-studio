// Decorative enhancement only. Native controls and details own their behavior.
document.querySelectorAll('.invite-card,.offer-panel').forEach(card=>{
 const sheen=document.createElement('span');sheen.className='motion-sheen';sheen.setAttribute('aria-hidden','true');card.append(sheen);
});
document.querySelectorAll('a span,button span').forEach(span=>{
 if(span.textContent.trim()==='↗')span.classList.add('motion-arrow');
});
document.querySelectorAll('#mobile-menu a,#mobile-menu button').forEach((link,index)=>{
 link.style.setProperty('--motion-index',Math.min(index,7));
});
document.querySelectorAll('[role=tablist],.offer-goals,.offer-switch,.locale-switch').forEach(group=>{
 const marker=document.createElement('span');
 marker.className='motion-indicator';marker.setAttribute('aria-hidden','true');
 group.classList.add('motion-segment');group.append(marker);
 const update=()=>{
  const active=group.querySelector('[aria-selected=true],[aria-current],input:checked');
  const target=active?.matches('input')?active.closest('label'):active;
  if(!target||!target.getClientRects().length){marker.style.opacity='0';return;}
  const rect=target.getBoundingClientRect(),parent=group.getBoundingClientRect();
  marker.style.opacity='1';
  marker.style.transform=`translate(${rect.left-parent.left+group.scrollLeft}px,${rect.bottom-parent.top+group.scrollTop-2}px) scaleX(${rect.width})`;
 };
 const observer=new MutationObserver(update);
 observer.observe(group,{subtree:true,attributes:true,attributeFilter:['aria-selected','aria-current','hidden','checked']});
 const resize=new ResizeObserver(update);resize.observe(group);
 group.addEventListener('change',update);update();
 addEventListener('pagehide',()=>{observer.disconnect();resize.disconnect();},{once:true});
});
// Height motion for native details only where CSS cannot interpolate to auto (Safari, Firefox).
// Chrome animates through motion-system.css, so this never runs alongside it.
(()=>{
 if(window.CSS?.supports?.('interpolate-size','allow-keywords'))return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)');
 const still=()=>reduce.matches||document.body.dataset.journeyMotion==='paused'||document.hidden;
 const running=new Map();
 function settle(detail,opening){detail.style.height='';detail.style.overflow='';detail.removeAttribute('data-closing');detail.open=opening;running.delete(detail);}
 function finishAll(){for(const [detail,item] of running){item.animation.onfinish=null;item.animation.cancel();settle(detail,item.opening);}}
 document.addEventListener('click',event=>{
  const summary=event.target instanceof Element?event.target.closest('summary'):null;
  const detail=summary?.parentElement;
  if(!detail||detail.tagName!=='DETAILS'||detail.querySelector(':scope>summary')!==summary||!detail.animate||still())return;
  event.preventDefault();
  const previous=running.get(detail),opening=previous?!previous.opening:!detail.open;
  const from=detail.getBoundingClientRect().height;
  if(previous){previous.animation.onfinish=null;previous.animation.cancel();}
  detail.style.height='';
  detail.open=false;const closed=detail.getBoundingClientRect().height;
  detail.open=true;const full=detail.getBoundingClientRect().height;
  const to=opening?full:closed;
  detail.toggleAttribute('data-closing',!opening);
  detail.style.overflow='hidden';
  const animation=detail.animate([{height:`${from}px`},{height:`${to}px`}],{duration:Math.min(420,220+Math.abs(to-from)*.6),easing:'cubic-bezier(.2,.7,.2,1)'});
  running.set(detail,{animation,opening});
  animation.onfinish=()=>settle(detail,opening);
 });
 reduce.addEventListener('change',finishAll);
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finishAll();});
 new MutationObserver(()=>{if(still())finishAll();}).observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
})();
