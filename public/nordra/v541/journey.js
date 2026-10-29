(()=>{
 const key='nordra-journey';
 // Keep the mobile studio notes optional; all original content stays in place.
 if(matchMedia('(max-width:700px)').matches)document.querySelector('.studio-notes')?.removeAttribute('open');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const query=new URLSearchParams(location.search);
 let saved={};
 try{saved=JSON.parse(sessionStorage.getItem(key)||'{}')||{}; const theme=localStorage.getItem('nordra-theme'); if(theme) saved.dark=theme==='dark';}catch{}
 let dark=query.has('theme')?query.get('theme')==='dark':saved.dark===true;
 let paused=reduced.matches||(query.has('motion')?query.get('motion')==='paused':saved.paused===true);
 const themeButton=document.querySelector('.theme-button');
 const menuButton=document.querySelector('.menu-button');
 const menuPanel=document.getElementById('mobile-menu');
 function save(){try{sessionStorage.setItem(key,JSON.stringify({dark,paused}));localStorage.setItem('nordra-theme',dark?'dark':'light');}catch{}}
 function links(){
  document.querySelectorAll('a[data-go]').forEach(link=>{
   // Carry preferences between portable file:// pages, where storage may be unavailable.
   const url=new URL(link.getAttribute('href'),document.baseURI);
   url.searchParams.set('theme',dark?'dark':'light');
   url.searchParams.set('motion',paused?'paused':'playing');
   link.href=url.href;
  });
 }
 function paint(){
  document.body.classList.toggle('dark',dark);
  document.body.dataset.journeyMotion=paused?'paused':'playing';
  document.documentElement.dataset.journeyMotion=document.body.dataset.journeyMotion;
  document.documentElement.style.backgroundColor=getComputedStyle(document.body).getPropertyValue('--bg');
  document.documentElement.style.colorScheme=dark?'dark':'light';
  themeButton.setAttribute('aria-label',dark?'Activar tema claro':'Activar tema oscuro');
  links();save();
 }
 // A return from an occasion lands on the choice, not at the top of the hub.
 const occasion=['bodas','cumpleanos','eventos','temporada'].includes(document.body.dataset.scene);
 if(occasion)document.querySelectorAll('.occasion-path [data-go="invitaciones"],.footer-layout [data-go="invitaciones"]').forEach(link=>{
  link.href='invitaciones.html#tipos-invitacion';link.dataset.anchor='tipos-invitacion';
 });
 const section=occasion?'invitaciones':document.body.dataset.scene;
 document.querySelectorAll('.desktop-nav [data-go],#mobile-menu [data-go]').forEach(link=>{
  if(link.dataset.go===section&&!new URL(link.href).hash)link.setAttribute('aria-current',occasion?'true':'page');
 });
 paint();
 addEventListener('nordra-theme',()=>{
  dark=document.body.classList.contains('dark');paint();
  if(parent!==window)parent.postMessage({type:'nordra-theme-state',dark},'*');
 });
 addEventListener('nordra-local-motion',event=>{paused=!!event.detail.paused;paint();});
 addEventListener('message',event=>{
  if(event.source!==parent)return;
  if(event.data?.type==='nordra-motion'){paused=!!event.data.paused;paint();}
  if(event.data?.type==='nordra-theme-restore'){
   dark=!!event.data.dark;paint();dispatchEvent(new Event('nordra-theme'));
  }
 });
 reduced.addEventListener('change',event=>{paused=event.matches;paint();});
 function closeMenu(){menuPanel.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label','Abrir menú');}
 document.addEventListener('click',event=>{
  if(!menuPanel.hidden&&!menuPanel.contains(event.target)&&!menuButton.contains(event.target))closeMenu();
 });
 matchMedia('(min-width:701px)').addEventListener('change',event=>{if(event.matches)closeMenu();});
 if(parent!==window)parent.postMessage({type:'nordra-journey-ready',dark},'*');
})();
