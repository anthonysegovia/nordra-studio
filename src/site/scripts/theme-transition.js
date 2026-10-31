(()=>{
 const button=document.querySelector('.theme-button');
 const root=document.documentElement;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let desired=document.body.classList.contains('dark'),active=null,preparing=false,revision=0,timer;
 button.addEventListener('click',async()=>{
  desired=active||preparing?!desired:!document.body.classList.contains('dark');
  const dark=desired,ticket=++revision;
  active?.skipTransition();
  clearTimeout(timer);
  root.classList.remove('theme-color-fade');
  // Pages with theme-specific imagery can prepare it before the new snapshot.
  // With no listener, the existing transition still starts synchronously.
  const pending=[];
  dispatchEvent(new CustomEvent('nordra-theme-prepare',{detail:{dark,waitUntil:promise=>pending.push(promise)}}));
  if(pending.length){
   preparing=true;
   await Promise.allSettled(pending);
   if(ticket!==revision)return;
  }
  preparing=false;
  const update=()=>{
   if(ticket!==revision)return;
   document.body.classList.toggle('dark',dark);
   button.setAttribute('aria-label',dark?'Activar tema claro':'Activar tema oscuro');
   dispatchEvent(new Event('nordra-theme'));
  };
  const finish=()=>{
   if(ticket!==revision)return;
   active=null;
   root.classList.remove('theme-changing','theme-color-fade');
  };
  if(reduced.matches||document.body.dataset.journeyMotion==='paused'){
   update();finish();return;
  }
  if(document.startViewTransition){
   // Keep the old frame underneath the new one: no blank frame or bright flash.
   root.classList.add('theme-changing');
   active=document.startViewTransition(update);
   active.ready.catch(()=>{});
   active.finished.then(finish,finish);
  }else{
   root.classList.add('theme-color-fade');
   // Establish the previous colors before changing the theme in older browsers.
   void getComputedStyle(document.body).backgroundColor;
   update();
   timer=setTimeout(finish,560);
  }
 });
})();
