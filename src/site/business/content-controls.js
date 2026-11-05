export function initializeBusinessContent(root){
 const reduce=matchMedia('(prefers-reduced-motion:reduce)'),mobile=matchMedia('(max-width:700px)'),abort=new AbortController(),options={signal:abort.signal};
 const paused=()=>reduce.matches||document.body.dataset.businessMotion==='paused'||document.body.dataset.journeyMotion==='paused';
 // Native details and the shared CSS own disclosure motion.

 const contactLinks=[...root.querySelectorAll('[data-business-contact]')],offers=root.querySelector('.business-offers'),halo=root.querySelector('.business-halo'),defaultWhatsApp=halo?.href;
 let haloFrame=0;
 function resetHalo(){cancelAnimationFrame(haloFrame);haloFrame=0;halo?.style.removeProperty('--contact-x');halo?.style.removeProperty('--contact-y');}
 function contact(){
  const offer=[...offers.querySelectorAll('[data-offer]')].find(item=>item.dataset.offer===offers.dataset.selectedOffer);
  const name=offer?.dataset.offerName,packageId=offer?.dataset.offer||'not_selected';
  const en=document.documentElement.lang==='en';
  const subject=en?'My website project · '+(name||'Nordra Studio'):name?'Mi proyecto web · '+name:'Mi proyecto web · Nordra Studio';
  const body=en?(name?'Hi, I’m interested in the '+name+' package.\nMy business is…':'Hi, I’d like to talk about a website for my business.\nMy business is…'):name?'Hola, me interesa el paquete '+name+'.\nMi negocio es…':'Hola, me gustaría platicar de una página web para mi negocio.\nMi negocio es…';
  const mobileContact = root.querySelector('.mobile-route [data-analytics-whatsapp="mobile_bar"]');
  if (mobileContact) mobileContact.href = offer?.href || defaultWhatsApp;
  for(const link of contactLinks){link.dataset.businessPackage=packageId;link.href=link.dataset.businessContact==='email'?'mailto:hola@nordrastudio.mx?subject='+encodeURIComponent(subject)+'&body='+encodeURIComponent(body):offer?.href||defaultWhatsApp;}
 }
 offers.addEventListener('offerchange',contact,options);contact();
 halo?.addEventListener('pointermove',event=>{if(paused()||event.pointerType==='touch')return;cancelAnimationFrame(haloFrame);const {clientX,clientY}=event;haloFrame=requestAnimationFrame(()=>{const box=halo.getBoundingClientRect();halo.style.setProperty('--contact-x',(clientX-box.left)+'px');halo.style.setProperty('--contact-y',(clientY-box.top)+'px');haloFrame=0;});},options);
 halo?.addEventListener('pointerleave',resetHalo,options);halo?.addEventListener('blur',resetHalo,options);
 function sync(){if(paused()||document.hidden){resetHalo();}}
 const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-business-motion','data-journey-motion']});reduce.addEventListener('change',sync,options);mobile.addEventListener('change',sync,options);document.addEventListener('visibilitychange',sync,options);sync();root.dataset.businessContentReady='true';
 addEventListener('pagehide',e=>{if(e.persisted)return;state.disconnect();resetHalo();abort.abort();},{once:true});
}
