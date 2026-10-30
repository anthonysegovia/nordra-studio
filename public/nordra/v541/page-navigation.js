(()=>{
 const pages={entrada:'index',estudio:'estudio',negocios:'negocios',invitaciones:'invitaciones',bodas:'bodas',cumpleanos:'cumpleanos',eventos:'eventos',temporada:'temporada'};
 const scene=document.body.dataset.scene;
 const initialURL=new URL(location.href);
 const root=document.documentElement;
 const readState=()=>({dark:document.body.classList.contains('dark'),paused:document.body.dataset.journeyMotion==='paused'});
 const timeout=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 async function ready(){
  const host=document.querySelector('[data-view]:not([hidden])');
  await Promise.race([document.fonts.ready,timeout(1800)]);
  const images=[...host.querySelectorAll('img')].filter(img=>{const r=img.getBoundingClientRect();return r.width&&r.bottom>0&&r.top<innerHeight;});
  await Promise.race([Promise.all(images.map(img=>img.decode?.().catch(()=>{}))),timeout(1800)]);
  if(parent!==window)dispatchEvent(new Event('nordra-page-prepared'));
  await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
  if(parent!==window)parent.postMessage({type:'nordra-page-ready',scene,...readState(),title:document.title,background:getComputedStyle(document.body).backgroundColor},'*');
 }
 ready();
 // The review viewer already owns its embedded navigation.
 if(parent!==window||!pages[scene])return;
 let current=scene,currentAnchor=initialURL.hash.slice(1),prefs=readState(),active=null,pending=null,finishFade=null;
 const status=document.createElement('div');
 status.className='page-navigation-status';status.setAttribute('role','status');
 document.body.append(status);
 function targetURL(next,anchor=''){
  const url=new URL(next==='entrada'?'/':'/'+pages[next]+'.html',initialURL);
  // journey.js restores preferences from shared storage before the page is shown.
  url.hash=anchor;return url;
 }
 function address(mode){
  const state={nordraPage:current,anchor:currentAnchor};
  const method=mode==='push'?'pushState':'replaceState';
  try{history[method](state,'',targetURL(current,currentAnchor).href);}
  catch{history[method](state,'','#pagina='+current+(currentAnchor?'&seccion='+encodeURIComponent(currentAnchor):''));}
 }
 function cancelPending(){if(!pending)return;clearTimeout(pending.timer);pending.frame.remove();pending=null;root.removeAttribute('aria-busy');}
 function restartPending(){if(pending){const {next,anchor,historyMode}=pending;go(next,anchor,historyMode);}}
 function go(next,anchor='',historyMode='push'){
  if(!Object.hasOwn(pages,next))return;
  finishFade?.();
  if(next===current&&!pending){
   if(active){active.contentWindow.postMessage({type:'nordra-anchor',id:anchor||'inicio'},'*');}
   else document.getElementById(anchor||'inicio')?.scrollIntoView({behavior:'instant'});
   return;
  }
  cancelPending();status.textContent='';
  const frame=document.createElement('iframe');
  frame.className='page-navigation-frame';frame.title='Nordra Studio';frame.setAttribute('aria-hidden','true');frame.tabIndex=-1;
  const request={frame,next,anchor,historyMode,url:targetURL(next,anchor)};
  pending=request;root.setAttribute('aria-busy','true');
  request.timer=setTimeout(()=>{if(pending!==request)return;cancelPending();status.textContent='No se pudo abrir la página. Vuelve a seleccionar el enlace.';},12000);
  frame.addEventListener('error',()=>{if(pending===request){cancelPending();status.textContent='No se pudo abrir la página. Vuelve a seleccionar el enlace.';}});
  frame.src=request.url.href;document.body.append(frame);
 }
 document.addEventListener('click',event=>{
  const link=event.target.closest('a[data-go]');
  if(!link||event.defaultPrevented||event.button!==0||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||link.hasAttribute('download')||link.target==='_blank')return;
  if(!Object.hasOwn(pages,link.dataset.go))return;
  event.preventDefault();event.stopImmediatePropagation();prefs=readState();
  go(link.dataset.go,link.dataset.anchor||new URL(link.href).hash.slice(1));
 },true);
 addEventListener('nordra-theme',()=>{if(!active){prefs=readState();restartPending();}});
 addEventListener('nordra-local-motion',()=>{if(!active){prefs=readState();restartPending();}});
 addEventListener('message',event=>{
  const data=event.data;
  if(pending&&event.source===pending.frame.contentWindow&&data?.type==='nordra-page-ready'&&data.scene===pending.next){
   const request=pending;clearTimeout(request.timer);pending=null;
   request.frame.contentWindow.postMessage({type:'nordra-motion',paused:prefs.paused,intensity:.85},'*');
   request.frame.contentWindow.postMessage({type:'nordra-anchor',id:request.anchor||'inicio'},'*');
   request.frame.removeAttribute('aria-hidden');request.frame.removeAttribute('tabindex');
   request.frame.title=data.title||'Nordra Studio';request.frame.classList.add('is-ready');
   const previous=active;active=request.frame;current=request.next;currentAnchor=request.anchor;
   document.title=data.title||document.title;document.querySelector('link[rel=canonical]')?.setAttribute('href','https://nordrastudio.mx'+(current==='entrada'?'/':'/'+pages[current]+'.html'));root.removeAttribute('aria-busy');
   address(request.historyMode);
   // Fade only the prepared destination in. Keep the previous page fully painted below it.
   const frame=request.frame;
   let animation,finished=false;
   const finish=()=>{
    if(finished)return;finished=true;
    frame.style.opacity='1';animation?.cancel();
    frame.classList.remove('is-entering');
    document.body.classList.add('has-page-frame');root.classList.add('has-page-frame');
    root.style.backgroundColor=data.background;document.body.style.backgroundColor=data.background;
    previous?.remove();
    if(finishFade===finish)finishFade=null;
    frame.focus();
   };
   finishFade=finish;
   if(!prefs.paused&&!matchMedia('(prefers-reduced-motion: reduce)').matches&&frame.animate){
    frame.classList.add('is-entering');
    animation=frame.animate([{opacity:0},{opacity:1}],{duration:420,easing:'cubic-bezier(.22,.61,.36,1)',fill:'both'});
    animation.finished.then(finish,finish);
   }else finish();
   return;
  }
  if(!active||event.source!==active.contentWindow)return;
  if(data?.type==='nordra-scene')go(data.scene,data.anchor||'');
  if(data?.type==='nordra-theme-state'){prefs.dark=!!data.dark;address('replace');restartPending();}
  if(data?.type==='nordra-motion-request'){
   prefs.paused=!!data.paused;
   active.contentWindow.postMessage({type:'nordra-motion',paused:prefs.paused,intensity:.85},'*');
   address('replace');
   restartPending();
  }
 });
 const route=()=>{
  const hash=new URLSearchParams(location.hash.slice(1));
  const fromFile=location.pathname==='/'?'entrada':Object.keys(pages).find(key=>location.pathname.endsWith('/'+pages[key]+'.html'));
  return {next:hash.get('pagina')||history.state?.nordraPage||fromFile||scene,anchor:hash.get('seccion')||history.state?.anchor||(!hash.has('pagina')?location.hash.slice(1):'')};
 };
 addEventListener('popstate',()=>{const r=route();go(r.next,r.anchor,'none');});
 const initialRoute=route();if(initialRoute.next!==scene)go(initialRoute.next,initialRoute.anchor,'none');
})();
