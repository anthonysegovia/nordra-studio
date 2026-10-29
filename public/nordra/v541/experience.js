(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const canMove=()=>!reduced.matches&&document.body.dataset.journeyMotion!=='paused'&&!document.hidden;
 const animations=new Set();
 function finish(){for(const animation of [...animations]){try{animation.finish();}catch{animation.cancel();}}}
 function animate(el,frames,options){
  if(!canMove())return;
  const animation=el.animate(frames,options);animations.add(animation);
  animation.onfinish=animation.oncancel=()=>animations.delete(animation);
 }
 addEventListener('nordra-local-motion',e=>{if(e.detail.paused)finish();});
 addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='nordra-motion'&&e.data.paused)finish();});
 reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
 document.addEventListener('visibilitychange',()=>{if(document.hidden)finish();});
 addEventListener('pagehide',finish,{once:true});
 host.querySelectorAll('[data-rsvp-demo]').forEach(demo=>{
  const cover=demo.querySelector('[data-demo-cover]');
  const form=demo.querySelector('form');
  const receipt=demo.querySelector('[data-demo-receipt]');
  const companion=demo.querySelector('[data-demo-companion]');
  const status=demo.querySelector('[data-demo-announcement]');
  const steps=[...demo.querySelectorAll('[data-demo-step]')];
  const panel=demo.querySelector('[data-demo-panel]');
  let step=0;
  function screen(next,focus=true){
   step=next;cover.hidden=step!==0;form.hidden=step!==1;receipt.hidden=step!==2;
   steps.forEach((el,i)=>{if(i===step)el.setAttribute('aria-current','step');else el.removeAttribute('aria-current');});
   const current=[cover,form,receipt][step];
   if(focus)current.querySelector('h3').focus({preventScroll:true});
   finish();animate(current,[{opacity:.7,transform:'translateY(5px)'},{opacity:1,transform:'translateY(0)'}],{duration:240});
  }
  function reset(){
   form.reset();companion.disabled=false;
   demo.querySelector('[data-count-yes]').textContent='0';
   demo.querySelector('[data-count-pending]').textContent='2';
   demo.querySelector('[data-count-no]').textContent='0';
   demo.querySelectorAll('[data-person-state]').forEach(el=>{el.textContent='Pendiente';el.dataset.state='pending';});
   demo.querySelector('[data-panel-update]').textContent='En espera de una respuesta';
   status.textContent='Muestra reiniciada. Dos personas pendientes.';
   screen(0);
  }
  demo.querySelector('[data-demo-open]').addEventListener('click',()=>screen(1));
  demo.querySelector('[data-demo-edit]').addEventListener('click',()=>screen(1));
  demo.querySelector('[data-demo-reset]').addEventListener('click',reset);
  form.addEventListener('change',()=>{companion.disabled=form.elements.attendance.value==='no';});
  form.addEventListener('submit',event=>{
   event.preventDefault();
   const yes=form.elements.attendance.value==='yes';
   const responses=[yes,yes&&companion.checked];
   const count=responses.filter(Boolean).length;
   demo.querySelector('[data-count-yes]').textContent=String(count);
   demo.querySelector('[data-count-pending]').textContent='0';
   demo.querySelector('[data-count-no]').textContent=String(2-count);
   demo.querySelectorAll('[data-person-state]').forEach((el,i)=>{
    el.textContent=responses[i]?'Asistirá':'No asistirá';el.dataset.state=responses[i]?'yes':'no';
   });
   demo.querySelector('[data-panel-update]').textContent='Respuesta actualizada en esta muestra';
   status.textContent=`Panel de muestra actualizado: ${count} personas asistirán, ${2-count} no asistirán y ninguna está pendiente.`;
   screen(2);
   animate(panel,[{opacity:.7},{opacity:1}],{duration:380});
  });
 });
 let navigationTimer;
 host.querySelectorAll('[data-plan-target]').forEach(button=>button.addEventListener('click',()=>{
  const detail=document.getElementById(button.dataset.planTarget);
  if(!detail||!host.contains(detail))return;
  clearTimeout(navigationTimer);
  const summary=detail.querySelector('summary');
  if(detail.dataset.expanded!=='true')summary.click();
  navigationTimer=setTimeout(()=>{
   summary.focus({preventScroll:true});
   detail.scrollIntoView({behavior:canMove()?'smooth':'instant',block:'start'});
  },canMove()?330:0);
 }));
 // Keep the request contextual; the user still sends it themselves in WhatsApp.
 const occasion={bodas:'Boda',cumpleanos:'Cumpleaños',eventos:'Evento'}[document.body.dataset.scene];
 if(occasion)host.querySelectorAll('.option-quote').forEach(link=>{
  const url=new URL(link.href);const message=url.searchParams.get('text');
  if(message){url.searchParams.set('text',message+'\n\nTipo de celebración: '+occasion+'.');link.href=url.href;}
 });
})();
