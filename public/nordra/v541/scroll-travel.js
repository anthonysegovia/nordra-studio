/* 5.37 — Scroll position is the playhead: forward and backward, without timed reveals. */
(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');if(!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),mobile=matchMedia('(max-width:700px)');
 const paused=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 const seasonal=host.dataset.view==='temporada';
 let field=host.querySelector('.seasonal-flow-field');
 if(!field){field=document.createElement('div');field.className='aurora-field';field.setAttribute('aria-hidden','true');host.append(field);}
 field.classList.add('travel-ambient');
 const groups=[...host.querySelectorAll('.home-continuation,.project-feature,.seasonal-chapter')].filter(el=>!el.parentElement.closest('.home-continuation,.project-feature,.seasonal-chapter'));
 const sections=groups.map(el=>{
  el.classList.add('travel-section');
  const thread=document.createElement('span');thread.className='travel-thread';thread.setAttribute('aria-hidden','true');el.append(thread);
  const h=el.querySelector('h2');h?.classList.add('travel-heading');
  const closing=el.matches('.home-closing,.studio-footer')||!!el.querySelector('.contact-layout');
  if(closing){el.classList.add('travel-closing');el.querySelectorAll('.contact-layout .primary-action').forEach(a=>a.classList.add('travel-contact-link'));}
  return {el,kind:'section',value:0,target:0,closing};
 });
 const media=[...host.querySelectorAll('.studio-desk,.occasion-hero-photo,.occasion-hero-poster,.feature-stage,.seasonal-cover,.showcase-stage,.living-envelope')].filter(el=>!el.parentElement.closest('.feature-stage,.showcase-stage'));
 const images=media.map(el=>{el.classList.add('travel-media','scroll-scrub');return {el,kind:'media',value:0,target:0};});
 const headingElements=[...new Set([...host.querySelectorAll('.travel-heading,.business-head h1,.opening-title,.occasion-hero h1,.seasonal-hero h1')])];
 const headings=headingElements.map(el=>{el.classList.add('scroll-scrub');return {el,kind:'heading',value:0,target:0};});
 const blockElements=[...host.querySelectorAll('.service-path,.story-body,.studio-principles>div,.process-list>li,.options-intro,.case-intention,.case-decision,.case-try-heading,.contact-layout,.contact-alternatives,.studio-credit,.feature-context>div,.atelier-copy,.occasion-sample-copy,.faq-item,.web-option,.package-details details,.plan-comparison tbody tr,.decision-actions,.case-index,.response-stage,.seasonal-chapter-heading,.seasonal-demo,.footer-layout>*,.studio-heading-copy,.studio-notes,.options-intro>p,.plan-comparison thead,.plan-comparison caption,.decision-guide>.eyebrow,.decision-note,.section-signoff,.footer-legal')].filter(el=>!el.closest('.travel-media')&&!el.querySelector('.scroll-scrub'));
 const blocks=blockElements.filter(el=>!blockElements.some(other=>other!==el&&other.contains(el))).map(el=>{el.classList.add('scroll-scrub');return {el,kind:'block',value:0,target:0};});
 const moments=[...host.querySelectorAll('[data-living="bruma"],[data-living="envelope"]')].map(el=>({el,kind:'moment',value:0,target:0}));
 const items=[...sections,...images,...headings,...blocks,...moments],visible=new Set();
 let frame=0,last=0,previousScroll=scrollY,dirty=true,documentHeight=1,ambient=0,ambientTarget=0;
 const clamp=x=>Math.max(0,Math.min(1,x));
 function dimensions(){documentHeight=Math.max(1,document.documentElement.scrollHeight-innerHeight);dirty=true;queue();}
 function layoutTop(el){let top=0;for(let node=el;node;node=node.offsetParent)top+=node.offsetTop;return top;}
 function measure(){
  const h=innerHeight;
  ambientTarget=clamp(scrollY/documentHeight);
  for(const item of visible){
   const r={top:layoutTop(item.el)-scrollY,height:item.el.offsetHeight};
   item.leave=clamp((h*.30-(r.top+r.height))/(h*.30));
   if(item.kind==='section')item.target=clamp((h*.92-r.top)/(h*.56));
   if(['media','heading','block'].includes(item.kind))item.target=clamp((h*.96-r.top)/(h*.46));
   if(item.kind==='moment'){
    const composition=item.el.closest('.nordra-composition');
    item.target=composition?clamp((-h*.4-(layoutTop(composition.closest('.composition-track')||composition)-scrollY))/(h*.65)):clamp((h*.9-r.top)/Math.min(r.height*.85,h*.68));
   }
  }
  dirty=false;
 }
 function paint(item,moved){
  const p=item.value,small=mobile.matches;
  if(item.kind==='section'){
   item.el.style.setProperty('--travel-enter',p.toFixed(4));
   
  }else if(['media','heading','block'].includes(item.kind)){
   const enter=p*p*(3-2*p),out=(item.leave||0),leave=out*out*(3-2*out);
   const isMedia=item.kind==='media',isBlock=item.kind==='block';
   const distance=small?(isMedia?30:isBlock?14:22):(isMedia?64:isBlock?28:44);
   const y=(1-enter)*distance-leave*distance*.6;
   const scale=isMedia?.92+.08*enter-.035*leave:1;
   const alpha=isBlock?.65+.35*enter-.30*leave:.30+.70*enter-.45*leave;
   item.el.style.setProperty('--scrub-y',`${y.toFixed(3)}px`);
   item.el.style.setProperty('--scrub-scale',scale.toFixed(4));
   item.el.style.setProperty('--scrub-alpha',alpha.toFixed(4));
   item.el.dataset.scrubProgress=p.toFixed(4);
   item.el.dataset.scrubExit=out.toFixed(4);
  }else dispatchEvent(new CustomEvent('nordra-scroll-moment',{detail:{element:item.el,progress:p,moved}}));
 }
 function tick(now){
  frame=0;if(paused()||document.hidden)return;
  const moved=Math.abs(scrollY-previousScroll)>.1;previousScroll=scrollY;
  if(dirty)measure();
  const ease=1;let pending=false;
  for(const item of visible){
   item.value=item.target;
   paint(item,moved);
  }
  ambient=ambientTarget;
  const wave=Math.sin(ambient*Math.PI*3);
  field.style.setProperty('--travel-ambient-x',`${(wave*(mobile.matches?2:4)).toFixed(3)}vw`);
  field.style.setProperty('--travel-ambient-y',`${((ambient-.5)*(mobile.matches?5:10)).toFixed(3)}vh`);
  field.style.setProperty('--travel-ambient-alpha',(seasonal?1:.16+.08*Math.sin(ambient*Math.PI)).toFixed(3));
  field.style.setProperty('--travel-ambient-hue',`${(seasonal?0:wave*(host.dataset.view==='bodas'?9:16)).toFixed(2)}deg`);
  host.dataset.travelProgress=ambient.toFixed(3);
  if(pending)frame=requestAnimationFrame(tick);else last=0;
 }
 function queue(){if(!frame&&!paused()&&!document.hidden)frame=requestAnimationFrame(tick);}
 function onScroll(){dirty=true;queue();}
 function sync(){
  if(paused()||document.hidden){cancelAnimationFrame(frame);frame=0;last=0;}
  if(paused()){
   host.classList.add('travel-still');
   for(const item of items){if(item.kind==='section'){item.el.style.setProperty('--travel-enter','1');item.el.style.setProperty('--travel-heading-y','0px');}if(item.kind==='media')item.el.style.setProperty('--travel-media-y','0px');}
  }else{host.classList.remove('travel-still');dirty=true;queue();}
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){for(const item of items)if(item.el===entry.target){if(entry.isIntersecting)visible.add(item);else visible.delete(item);}}
  dirty=true;queue();
 },{rootMargin:'120px 0px',threshold:0});
 [...new Set(items.map(i=>i.el))].forEach(el=>observer.observe(el));
 const sizes=new ResizeObserver(dimensions);sizes.observe(host);
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 addEventListener('scroll',onScroll,{passive:true});addEventListener('resize',dimensions,{passive:true});
 document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);mobile.addEventListener('change',dimensions);
 document.fonts.ready.then(dimensions);sync();
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);observer.disconnect();sizes.disconnect();state.disconnect();removeEventListener('scroll',onScroll);removeEventListener('resize',dimensions);},{once:true});
})();
/* 5.41 — Reversible disclosure motion, including keyboard activation. */
(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');if(!host)return;
 const reduce=matchMedia('(prefers-reduced-motion: reduce)'),active=new Map();
 const enabled=()=>!reduce.matches&&document.body.dataset.journeyMotion!=='paused'&&!document.hidden;
 const details=[...host.querySelectorAll('.faq-item,.package-details details,.studio-notes')];
 function settle(el,open){el.open=open;el.style.height='';el.style.overflow='';active.delete(el);}
 function toggle(el,open){
  const from=el.getBoundingClientRect().height,previous=active.get(el);
  if(previous){previous.animation.onfinish=null;previous.animation.cancel();active.delete(el);}
  el.dataset.expanded=String(open);el.style.height='';el.style.overflow='';
  el.open=true;
  const to=open?el.offsetHeight:el.querySelector('summary').offsetHeight+2;
  if(!enabled()){settle(el,open);return;}
  el.style.overflow='hidden';
  const animation=el.animate([{height:from+'px'},{height:to+'px'}],{duration:340,easing:'cubic-bezier(.22,.7,.2,1)'});
  active.set(el,{animation,open});animation.onfinish=()=>settle(el,open);
 }
 details.forEach(el=>{el.dataset.expanded=String(el.open);el.querySelector('summary').addEventListener('click',event=>{event.preventDefault();toggle(el,el.dataset.expanded!=='true');});});
 function finish(){for(const [el,item] of active){item.animation.onfinish=null;item.animation.cancel();settle(el,item.open);}}
 const state=new MutationObserver(()=>{if(!enabled())finish();});state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 reduce.addEventListener('change',finish);document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 addEventListener('pagehide',()=>{finish();state.disconnect();reduce.removeEventListener('change',finish);},{once:true});
})();
