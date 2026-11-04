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
