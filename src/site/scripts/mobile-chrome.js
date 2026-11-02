/* Phones: the header steps aside while reading down and returns on the first move up.
   The bottom route bar stays, so navigation is always one tap away. */
(()=>{
 const en=document.documentElement?.lang==='en';
 const header=document.querySelector('.site-header');if(!header)return;
 const small=matchMedia('(max-width:700px)');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const menu=document.getElementById('mobile-menu');
 const menuButton=document.querySelector('.menu-button');
 const routes=[...document.querySelectorAll('.mobile-route a[href^="#"]')];
 let last=scrollY,queued=false;
 const tuck=hidden=>header.classList.toggle('header-tucked',hidden);

 // Back to top: a quiet control once the reader is about two screens down.
 const topButton=document.createElement('button');
 topButton.type='button';topButton.className='back-to-top';topButton.hidden=true;
 topButton.setAttribute('aria-label',en?'Back to top':'Volver arriba');topButton.textContent='↑';
 topButton.addEventListener('click',()=>{
  scrollTo({top:0,behavior:reduced.matches?'auto':'smooth'});
  header.querySelector('a')?.focus({preventScroll:true});
 });
 document.body.append(topButton);

 // The bottom bar marks the section in view, the way the desktop nav marks the page.
 function mark(){
  const line=innerHeight*.4;let active=null;
  for(const link of routes){
   const target=document.getElementById(decodeURIComponent(link.hash.slice(1)));if(!target)continue;
   const box=target.getBoundingClientRect();
   if(box.top<=line&&box.bottom>0)active=link;
  }
  for(const link of routes)link===active?link.setAttribute('aria-current','location'):link.removeAttribute('aria-current');
 }

 function update(){
  const y=scrollY,delta=y-last;
  topButton.hidden=!small.matches||y<innerHeight*2;
  mark();
  // Keep it visible near the top, with the menu open, or while it holds focus.
  if(!small.matches||y<120||(menu&&!menu.hidden)||header.contains(document.activeElement)){tuck(false);last=y;return;}
  if(Math.abs(delta)<8)return;
  tuck(delta>0);last=y;
 }
 // The flag clears before measuring, so a late or skipped frame can never leave it stuck.
 addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update();});},{passive:true});
 small.addEventListener('change',update);
 header.addEventListener('focusin',()=>tuck(false));
 addEventListener('pageshow',()=>{last=scrollY;tuck(false);update();});

 // The menu opens as a sheet near the thumb: the page behind dims and holds still.
 if(menu&&menuButton){
  const backdrop=document.createElement('div');
  backdrop.className='mobile-menu-backdrop';backdrop.hidden=true;
  menu.before(backdrop);
  let byLink=false;
  const close=()=>{menu.hidden=true;menuButton.setAttribute('aria-expanded','false');menuButton.setAttribute('aria-label',en?'Open menu':'Abrir menú');};
  backdrop.addEventListener('click',close);
  menu.addEventListener('click',event=>{if(event.target.closest('a')){byLink=true;close();}});
  new MutationObserver(()=>{
   const open=!menu.hidden;
   backdrop.hidden=!open;
   document.documentElement.classList.toggle('menu-open',open&&small.matches);
   if(open&&small.matches)menu.querySelector('a')?.focus({preventScroll:true});
   // A link moves focus with the page; any other close hands it back to the button.
   else if(!open&&!byLink&&(menu.contains(document.activeElement)||document.activeElement===document.body))menuButton.focus({preventScroll:true});
   byLink=false;
   update();
  }).observe(menu,{attributes:true,attributeFilter:['hidden']});
 }

 // A sample invitation opened in this tab can offer the way back (return-to-site.js).
 document.addEventListener('click',event=>{
  const link=event.target.closest?.('a[href^="/invitaciones/"]');
  if(!link||link.target==='_blank')return;
  // Back to the section that showed the sample, not the top of the page.
  const section=link.closest('section[id]');
  try{sessionStorage.setItem('nordra-return',location.pathname+(section?'#'+section.id:location.hash));}catch{}
 });

 // A cross-document fade may be skipped (hidden tab, quick second tap); that is expected, not an error.
 const quiet=event=>{const t=event.viewTransition;if(!t)return;t.ready.catch(()=>{});t.finished.catch(()=>{});};
 addEventListener('pagereveal',quiet);addEventListener('pageswap',quiet);
})();
