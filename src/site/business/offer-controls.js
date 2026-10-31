import {recommendBusiness,borderPoint,orbitPoint} from './offer-model.js';

export function initializeBusinessOffers(root,guide){
 const form=guide.querySelector('form'),steps=[...form.querySelectorAll('fieldset')],progress=[...form.querySelectorAll('[data-progress]')],result=form.querySelector('.guide-result'),next=form.querySelector('[data-next]'),back=form.querySelector('[data-back]'),restart=form.querySelector('[data-restart]'),announcement=form.querySelector('[role=status]');
 let step=0;
 function show(focus=false){
  steps.forEach((field,i)=>{field.hidden=i!==step;field.disabled=i!==step;});progress.forEach((dot,i)=>{dot.toggleAttribute('data-current',i===step);dot.toggleAttribute('data-complete',i<step);if(i===step)dot.setAttribute('aria-current','step');else dot.removeAttribute('aria-current');});
  result.hidden=step<3;next.hidden=step===3;back.hidden=step===3;restart.hidden=step!==3;back.disabled=step===0;next.disabled=step<3&&!steps[step].querySelector('input:checked');next.innerHTML=step===2?'Ver mi recomendación <span aria-hidden="true">→</span>':'Continuar <span aria-hidden="true">→</span>';
  if(focus)(step===3?result:steps[step].querySelector('legend')).focus({preventScroll:true});
 }
 form.addEventListener('change',()=>{next.disabled=!steps[step].querySelector('input:checked');});
 form.addEventListener('submit',event=>{
  event.preventDefault();if(step>=3||!steps[step].querySelector('input:checked'))return;
  if(step<2){step++;show(true);return;}
  const answers=steps.map(f=>Number(f.querySelector('input:checked').value)),choice=recommendBusiness(answers),offer=root.querySelector(`[data-offer="${choice.id}"]`),name=offer.dataset.offerName,price=offer.querySelector('.offer-price').textContent.trim(),labels=steps.map(f=>`${f.querySelector('legend').textContent} ${f.querySelector('input:checked').nextElementSibling.textContent}`),url=new URL(offer.href);
  url.searchParams.set('text',`${url.searchParams.get('text')}\n\n${labels.join('\n')}`);
  result.querySelector('[data-result-name]').textContent=name;result.querySelector('[data-result-price]').textContent=`${price} MXN · IVA incluido`;result.querySelector('[data-result-reason]').textContent=choice.reason;result.querySelector('[data-result-contact]').href=url.href;result.querySelector('[data-result-package]').href=`#${offer.closest('.offer-card').id}`;result.dataset.recommendation=choice.id;announcement.textContent=`Te sugerimos ${name}, ${price} MXN con IVA incluido. ${choice.reason}`;step=3;show(true);
 });
 back.addEventListener('click',()=>{if(step>0){step--;show(true);}});
 restart.addEventListener('click',()=>{step=0;form.reset();announcement.textContent='';show(true);});
 result.querySelector('[data-result-package]').addEventListener('click',()=>{const id=result.querySelector('[data-result-package]').hash.slice(1);document.getElementById(id)?.focus({preventScroll:true});});
 guide.querySelector('.guide-loading').hidden=true;form.hidden=false;show();guide.dataset.ready='true';
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),fine=matchMedia('(hover:hover) and (pointer:fine)'),cards=[...root.querySelectorAll('.offer-card')],visible=new Set();let pointer=null,frame=0,previous=0,phase=0;
 const paused=()=>reduce.matches||document.body.dataset.businessMotion==='paused'||document.body.dataset.journeyMotion==='paused'||document.hidden;
 const values=new Map(cards.map(card=>[card,{x:card.clientWidth*.3,y:0,strength:card.classList.contains('offer-recommended')?.5:0}]));
 function paint(card,p){card.style.setProperty('--lamp-x',`${p.x}px`);card.style.setProperty('--lamp-y',`${p.y}px`);card.style.setProperty('--lamp-strength',String(p.strength));}
 function tick(now){frame=0;const delta=previous?Math.min(now-previous,50):16;previous=now;phase+=delta/7000;let again=false;
  for(const card of visible){const rect=card.getBoundingClientRect(),value=values.get(card),recommended=card.classList.contains('offer-recommended');let target={x:rect.width*.3,y:0,strength:card.contains(document.activeElement)?.85:recommended?.55:0};
   if(pointer&&fine.matches){const point=borderPoint(rect.width,rect.height,pointer.x-rect.left,pointer.y-rect.top);if(point.distance<120)target={...point,strength:Math.max(target.strength,(1-point.distance/120)*.95)};}
   if(recommended&&!pointer){target={...orbitPoint(rect.width,rect.height,phase),strength:.8};again=true;}
   const ease=1-Math.exp(-delta/65);for(const key of ['x','y','strength']){value[key]+=(target[key]-value[key])*ease;if(Math.abs(value[key]-target[key])>.01)again=true;}paint(card,value);
  }
  if(again&&!paused()&&visible.size)frame=requestAnimationFrame(tick);
 }
 function wake(){if(!frame&&!paused()&&visible.size)frame=requestAnimationFrame(tick);}
 function sync(){if(paused()){cancelAnimationFrame(frame);frame=0;previous=0;pointer=null;cards.forEach(card=>paint(card,{x:card.clientWidth*.3,y:0,strength:card.classList.contains('offer-recommended')?.6:card.contains(document.activeElement)?.8:0}));}else wake();}
 const visibility=new IntersectionObserver(entries=>{for(const e of entries)e.isIntersecting?visible.add(e.target):visible.delete(e.target);if(!visible.size){cancelAnimationFrame(frame);frame=0;previous=0;}else wake();});cards.forEach(card=>visibility.observe(card));
 const move=e=>{if(e.pointerType==='touch'||paused())return;pointer={x:e.clientX,y:e.clientY};wake();},leave=()=>{pointer=null;wake();};root.addEventListener('pointermove',move,{passive:true});root.addEventListener('pointerleave',leave,{passive:true});root.addEventListener('focusin',sync);root.addEventListener('focusout',()=>queueMicrotask(sync));
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-business-motion','data-journey-motion']});reduce.addEventListener('change',sync);fine.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();root.dataset.offersReady='true';
 addEventListener('pagehide',e=>{if(e.persisted)return;cancelAnimationFrame(frame);visibility.disconnect();state.disconnect();reduce.removeEventListener('change',sync);fine.removeEventListener('change',sync);document.removeEventListener('visibilitychange',sync);},{once:true});
}
