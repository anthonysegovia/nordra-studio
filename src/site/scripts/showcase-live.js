/* Invitaciones · Bodas: «Pruébala aquí» loads the real invitation inside the phone, only on request.
   Without JavaScript the same link simply opens the invitation. */
(()=>{
 const art=document.querySelector('[data-view="invitaciones"]:not([hidden]) .showcase-live');
 const link=art?.querySelector('[data-live-try]'),screen=art?.querySelector('.live-screen');
 if(!art||!link||!screen)return;
 const small=matchMedia('(max-width:700px)');
 let frame=null,sizes=null;
 // The invitation is laid out at a real phone width and scaled to the screen, so it reads as a phone.
 function fit(){if(!frame)return;const scale=screen.clientWidth/390;frame.style.transform=`scale(${scale})`;frame.style.height=`${screen.clientHeight/scale}px`;}
 // The invitation's own navigation uses scrollIntoView, which would also scroll this page.
 // Same origin, so keep those scrolls inside the phone.
 function contain(win){
  try{
   win.Element.prototype.scrollIntoView=function(options){
    const top=this.getBoundingClientRect().top+win.scrollY-(parseFloat(win.getComputedStyle(this).scrollMarginTop)||0),block=typeof options==='object'?options.block:options===false?'end':'start';
    const offset=block==='center'?(win.innerHeight-this.offsetHeight)/2:block==='end'?win.innerHeight-this.offsetHeight:0;
    win.scrollTo({top:Math.max(0,top-offset),behavior:typeof options==='object'?options.behavior:'auto'});
   };
  }catch{}
 }
 link.addEventListener('click',event=>{
  // On a phone the showcase is too small to read inside; the link opens the invitation itself.
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.button||frame||small.matches)return;
  event.preventDefault();
  frame=document.createElement('iframe');
  frame.title='Invitación de Valentina y Sebastián';frame.src=link.href;
  frame.addEventListener('load',()=>{contain(frame.contentWindow);art.classList.add('is-live');frame.focus({preventScroll:true});},{once:true});
  screen.prepend(frame);fit();
  sizes=new ResizeObserver(fit);sizes.observe(screen);
  // Once open, the same control leads to the full-screen invitation.
  link.firstChild.textContent='Abrir en pantalla completa ';link.target='_blank';link.rel='noopener';
 });
 addEventListener('pagehide',()=>sizes?.disconnect(),{once:true});
})();
