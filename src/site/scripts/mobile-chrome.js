/* Phones: the header steps aside while reading down and returns on the first move up.
   The bottom route bar stays, so navigation is always one tap away. */
(()=>{
 const header=document.querySelector('.site-header');if(!header)return;
 const small=matchMedia('(max-width:700px)');
 const menu=document.getElementById('mobile-menu');
 let last=scrollY,queued=false;
 const tuck=hidden=>header.classList.toggle('header-tucked',hidden);
 function update(){
  const y=scrollY,delta=y-last;
  // Keep it visible near the top, with the menu open, or while it holds focus.
  if(!small.matches||y<120||(menu&&!menu.hidden)||header.contains(document.activeElement)){tuck(false);last=y;return;}
  if(Math.abs(delta)<8)return;
  tuck(delta>0);last=y;
 }
 // The flag clears before measuring, so a late or skipped frame can never leave it stuck.
 addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;update();});},{passive:true});
 small.addEventListener('change',update);
 header.addEventListener('focusin',()=>tuck(false));
 if(menu)new MutationObserver(update).observe(menu,{attributes:true,attributeFilter:['hidden']});
 addEventListener('pageshow',()=>{last=scrollY;tuck(false);});
 // A cross-document fade may be skipped (hidden tab, quick second tap); that is expected, not an error.
 const quiet=event=>{const t=event.viewTransition;if(!t)return;t.ready.catch(()=>{});t.finished.catch(()=>{});};
 addEventListener('pagereveal',quiet);addEventListener('pageswap',quiet);
})();
