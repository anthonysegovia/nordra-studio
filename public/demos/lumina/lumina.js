(() => {
const $ = s => document.querySelector(s);
let lang = new URLSearchParams(location.search).get('lang') === 'en' ? 'en' : 'es';
const t = (es,en) => lang === 'en' ? en : es;
const services = {
 general:{name:['Consulta general','Primary care'],title:['Un primer paso, con perspectiva.','A first step, with perspective.'],copy:['Una consulta para hablar de tu salud, revisar tus preguntas y conocer las opciones de atención.','A consultation to discuss your health, review your questions and explore care options.'],items:[['Conversación inicial y valoración general','Initial conversation and general assessment'],['Espacio para tus dudas','Time for your questions'],['Orientación sobre los siguientes pasos','Guidance on next steps']],price:650,duration:40},
 skin:{name:['Dermatología','Dermatology'],title:['Un espacio para hablar de tu piel.','A space to talk about your skin.'],copy:['Una consulta enfocada en tus inquietudes sobre la piel y en comprender las opciones disponibles.','A consultation focused on your skin concerns and understanding available options.'],items:[['Conversación sobre tus inquietudes','Discussion of your concerns'],['Valoración dermatológica','Dermatological assessment'],['Explicación de opciones de seguimiento','Explanation of follow-up options']],price:950,duration:30},
 nutrition:{name:['Nutrición','Nutrition'],title:['Tus hábitos, en contexto.','Your habits, in context.'],copy:['Un encuentro para conversar sobre tu alimentación, tus rutinas y tus objetivos personales.','A conversation about your eating habits, routines and personal goals.'],items:[['Revisión de hábitos y objetivos','Review of habits and goals'],['Valoración nutricional inicial','Initial nutritional assessment'],['Conversación sobre próximos pasos','Discussion of next steps']],price:700,duration:50}
};
const pick = a => a[lang === 'en' ? 1 : 0];
let selected='general',chosenDay=0,chosenTime='',opener=null,paused=false;
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
let entryVisible=false;
const daylightSections=[];
let daylightTarget=null;
const transitions=new WeakMap();
function arrive(element,distance=8){
 transitions.get(element)?.cancel();
 if(reduced.matches||document.hidden)return;
 const animation=element.animate([{opacity:.55,transform:`translateY(${distance}px)`},{opacity:1,transform:'translateY(0)'}],{duration:360,easing:'cubic-bezier(.22,1,.36,1)'});
 transitions.set(element,animation);
}

const dates=[1,2,3].map(offset=>{const date=new Date();date.setHours(12,0,0,0);date.setDate(date.getDate()+offset);return date});
const dateLabel = i => new Intl.DateTimeFormat(lang==='en'?'en-US':'es-MX',{weekday:'short',day:'numeric',month:'short'}).format(dates[i]);
const amount = () => '$'+services[selected].price+' MXN';
function renderPanel(){
 const s=services[selected];
 document.querySelectorAll('[data-service]').forEach(button=>{const active=button.dataset.service===selected;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1});
 $('#care-panel').setAttribute('aria-labelledby','tab-'+selected);
 $('#care-panel').innerHTML=`<p class="eyebrow">${t('CONSULTA PRESENCIAL · EJEMPLO','IN-PERSON VISIT · EXAMPLE')}</p><h3>${pick(s.title)}</h3><p>${pick(s.copy)}</p><ul>${s.items.map(item=>`<li>${pick(item)}</li>`).join('')}</ul><div class="care-bottom"><span class="care-price">${amount()}<small>${t('Precio ilustrativo','Illustrative price')} · ${s.duration} min</small></span><button class="text-link" data-book>${t('Ver agenda de ejemplo ↗','See sample schedule ↗')}</button></div>`;
 arrive($('#care-panel'));
}
function summary(){return `${pick(services[selected].name)} · ${services[selected].duration} min\n${dateLabel(chosenDay)}${chosenTime?' · '+chosenTime:''}\n${amount()} · ${t('precio ilustrativo','illustrative price')}`}
function updateSummary(){
 $('#booking-summary').textContent=chosenTime?summary():t('Elige un horario para revisar tu selección.','Choose a time to review your selection.');
 $('#review-booking').disabled=!chosenTime;
}
function renderSchedule(){
 $('#booking-service').innerHTML=Object.entries(services).map(([id,s])=>`<option value="${id}" ${id===selected?'selected':''}>${pick(s.name)} · $${s.price} MXN</option>`).join('');
 $('#days').innerHTML=dates.map((_,i)=>`<label><input type="radio" name="day" value="${i}" ${i===chosenDay?'checked':''}><span>${dateLabel(i)}</span></label>`).join('');
 $('#times').innerHTML=['09:00','10:30','12:00','16:00'].map(time=>`<label><input type="radio" name="time" value="${time}" ${time===chosenTime?'checked':''}><span>${time}</span></label>`).join('');
 updateSummary();
}
function syncMotion(){
 const motionAllowed=!paused&&!reduced.matches&&!document.hidden&&!$('#booking').open;
 $('.ambient').classList.toggle('active',motionAllowed);
 $('.hero').classList.toggle('entry-running',motionAllowed&&entryVisible);
 daylightSections.forEach(section=>section.classList.toggle('daylight-running',motionAllowed&&section===daylightTarget));
 $('#motion-toggle').textContent=paused?t('Activar luz','Resume light'):t('Pausar luz','Pause light');
 $('#motion-toggle').setAttribute('aria-pressed',String(paused));
}
function setLanguage(){
 document.documentElement.lang=lang;
 document.querySelectorAll('[data-es]').forEach(el=>el.textContent=el.dataset[lang].replace(/\\n/g,'\n'));
 document.querySelectorAll('[data-alt-es]').forEach(el=>el.alt=el.dataset[lang==='en'?'altEn':'altEs']);
 $('#language').textContent=lang==='en'?'ES':'EN';
 $('#language').setAttribute('aria-label',t('Switch to English','Cambiar a español'));
 $('#close-booking').setAttribute('aria-label',t('Cerrar agenda','Close schedule'));
 $('#navigation').setAttribute('aria-label',t('Principal','Main navigation'));
 $('.care-tabs').setAttribute('aria-label',t('Especialidades','Specialties'));
 $('.logo').setAttribute('aria-label',t('Lúmina, inicio','Lumina, home'));
 document.title=t('Lúmina · Centro médico — Demo de Nordra Studio','Lumina · Medical center — Nordra Studio demo');
 const message=t('¡Hola, Nordra Studio! Vi la demo de Lúmina y quiero cotizar una página para mi consultorio.','Hi Nordra Studio! I explored the Lumina demo and would like a website quote for my medical practice.');
 $('#quote').href='https://wa.me/528129022231?text='+encodeURIComponent(message);
 renderPanel();renderSchedule();syncMotion();setMenu(false);
}
const mobileNavigation=matchMedia('(max-width:900px)');
let menuOpen=false,menuAnimation=null;
function setMenu(open,instant=false){
 const nav=$('#navigation');
 open=open&&mobileNavigation.matches;
 const changed=open!==menuOpen;
 menuOpen=open;
 $('#menu-toggle').setAttribute('aria-expanded',String(open));
 $('#menu-toggle').setAttribute('aria-label',open?t('Cerrar menú','Close menu'):t('Abrir menú','Open menu'));
 nav.inert=mobileNavigation.matches&&!open;
 if(!changed&&!instant)return;
 const opacity=getComputedStyle(nav).opacity;
 const transform=getComputedStyle(nav).transform;
 const wasVisible=nav.classList.contains('open');
 menuAnimation?.cancel();
 menuAnimation=null;
 if(instant||reduced.matches||!mobileNavigation.matches){nav.classList.toggle('open',open);return}
 nav.classList.add('open');
 const animation=nav.animate([
  {opacity:wasVisible?opacity:0,transform:wasVisible?transform:'translateY(-8px)'},
  {opacity:open?1:0,transform:open?'translateY(0)':'translateY(-6px)'}
 ],{duration:open?320:180,easing:'cubic-bezier(.22,1,.36,1)',fill:'both'});
 menuAnimation=animation;
 animation.finished.then(()=>{
  if(menuAnimation!==animation)return;
  nav.classList.toggle('open',menuOpen);
  animation.cancel();menuAnimation=null;
 }).catch(()=>{});
}
mobileNavigation.addEventListener('change',()=>setMenu(false,true));
reduced.addEventListener('change',()=>setMenu(menuOpen,true));
$('#menu-toggle').addEventListener('click',event=>{setMenu(!menuOpen);if(menuOpen&&event.detail===0)$('#navigation a').focus({preventScroll:true})});
document.addEventListener('click',event=>{
 if(event.target.closest('[data-book]')){
  opener=event.target.closest('[data-book]');setMenu(false);renderSchedule();$('#booking-form').hidden=false;$('#booking-result').hidden=true;$('#booking').showModal();document.documentElement.classList.add('modal-open');syncMotion();
 }
 if(!event.target.closest('header'))setMenu(false);
 const anchor=event.target.closest('a[href^="#"]');
 if(anchor){setMenu(false);const target=document.querySelector(anchor.getAttribute('href'));if(target){target.setAttribute('tabindex','-1');target.focus({preventScroll:true})}}
});
$('#close-booking').addEventListener('click',()=>$('#booking').close());
$('#booking').addEventListener('close',()=>{document.documentElement.classList.remove('modal-open');syncMotion();const returnTarget=opener?.isConnected?opener:$('#care-panel [data-book]');returnTarget?.focus({preventScroll:true})});
$('#booking').addEventListener('click',event=>{if(event.target!==$('#booking'))return;const r=$('#booking').getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)$('#booking').close()});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&$('#menu-toggle').getAttribute('aria-expanded')==='true'){setMenu(false);$('#menu-toggle').focus()}});
$('header').addEventListener('focusout',event=>{if(event.relatedTarget&&!$('header').contains(event.relatedTarget))setMenu(false)});
document.querySelectorAll('[data-service]').forEach(button=>{
 button.addEventListener('click',()=>{selected=button.dataset.service;chosenTime='';renderPanel()});
 button.addEventListener('keydown',event=>{const tabs=[...document.querySelectorAll('[data-service]')];let index=tabs.indexOf(button);if(['ArrowRight','ArrowDown'].includes(event.key))index=(index+1)%tabs.length;else if(['ArrowLeft','ArrowUp'].includes(event.key))index=(index+tabs.length-1)%tabs.length;else if(event.key==='Home')index=0;else if(event.key==='End')index=tabs.length-1;else return;event.preventDefault();tabs[index].click();tabs[index].focus()});
});
$('#booking-service').addEventListener('change',event=>{selected=event.target.value;chosenTime='';renderPanel();renderSchedule()});
$('#days').addEventListener('change',event=>{chosenDay=Number(event.target.value);updateSummary()});
$('#times').addEventListener('change',event=>{chosenTime=event.target.value;updateSummary()});
$('#review-booking').addEventListener('click',()=>{if(!chosenTime)return;$('#result-summary').textContent=summary();$('#booking-form').hidden=true;$('#booking-result').hidden=false;$('#booking-result').focus();$('#booking').scrollTop=0;arrive($('#booking-result'),12)});
$('#edit-booking').addEventListener('click',()=>{$('#booking-result').hidden=true;$('#booking-form').hidden=false;$('#booking-service').focus();arrive($('#booking-form'))});
$('#language').addEventListener('click',()=>{lang=lang==='es'?'en':'es';const url=new URL(location.href);url.searchParams.set('lang',lang);history.replaceState(null,'',url);setLanguage()});
const atmosphere=document.createElement('div');atmosphere.className='ambient';atmosphere.setAttribute('aria-hidden','true');document.body.prepend(atmosphere);
$('.hero-copy').append($('#motion-toggle'));
$('#motion-toggle').addEventListener('click',()=>{paused=!paused;syncMotion()});
document.addEventListener('visibilitychange',syncMotion);reduced.addEventListener('change',syncMotion);
setLanguage();
const entryImage=$('.hero-photo img');
function startEntry(){
 if(entryVisible&&entryImage.complete&&entryImage.naturalWidth) $('.hero').classList.add('entry-started');
 syncMotion();
}
entryImage.addEventListener('load',startEntry,{once:true});
$('.entry-light').addEventListener('animationend',event=>{
 if(event.animationName==='threshold-wash') $('.hero').classList.add('entry-settled');
});
const entryObserver=new IntersectionObserver(entries=>{
 entryVisible=entries[0].isIntersecting;
 startEntry();
},{threshold:0});
entryObserver.observe($('.entry-stage'));
// One moving section light at a time. No scroll listener or animation loop in JS.
const daylightVisibility=new Map();
const daylightObserver=new IntersectionObserver(entries=>{
 entries.forEach(entry=>daylightVisibility.set(entry.target,entry.isIntersecting?entry.intersectionRect.height:0));
 daylightTarget=[...daylightVisibility].sort((a,b)=>b[1]-a[1]).find(([,height])=>height>0)?.[0]??null;
 syncMotion();
},{threshold:[0,.1,.25,.5,.75,1]});
daylightObserver.observe($('.hero'));
document.querySelectorAll('.specialties,.approach,.visit,.faq,.lumina-footer').forEach(section=>{
 section.classList.add('daylight-section');
 const light=document.createElement('span');light.className='section-daylight';light.setAttribute('aria-hidden','true');
 section.prepend(light);daylightSections.push(section);daylightObserver.observe(section);
});
const reveals=new Set();const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(!entry.isIntersecting)return;observer.unobserve(entry.target);if(reduced.matches)return;const animation=entry.target.animate([{opacity:.65,transform:'translateY(12px)'},{opacity:1,transform:'translateY(0)'}],{duration:600,easing:'cubic-bezier(.22,1,.36,1)'});reveals.add(animation);animation.finished.catch(()=>{}).finally(()=>reveals.delete(animation))}),{threshold:.12});
document.querySelectorAll('.section-title,.steps article,.visit-art,.visit>div:last-child,.footer-main').forEach(el=>observer.observe(el));
reduced.addEventListener('change',()=>{if(reduced.matches)document.getAnimations().forEach(a=>{if(!a.effect?.target?.closest('.ambient'))a.cancel()})});
document.addEventListener('focusin',event=>reveals.forEach(a=>{if(a.effect?.target?.contains(event.target))a.finish()}));
})();
