const small=matchMedia('(max-width:700px)');
document.querySelectorAll('.showcase-live, [data-phone-live]').forEach(art=>{
 const link=art.querySelector('.phone-open'),screen=art.querySelector('.live-screen,.phone-screen');
 if(!link||!screen||art.dataset.phoneReady)return;
 art.dataset.phoneReady="true";
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
  if(event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button||frame||small.matches)return;
  event.preventDefault();
  frame=document.createElement('iframe');
  frame.title=link.dataset.liveTry||link.getAttribute('aria-label');frame.src=link.href;
  frame.addEventListener('load',()=>{contain(frame.contentWindow);art.classList.add('is-live');link.hidden=true;const full=document.createElement('a');full.className='phone-fullscreen';full.href=link.href;full.target='_blank';full.rel='noopener';full.textContent=document.documentElement.lang==='en'?'Open full screen ↗':'Abrir en pantalla completa ↗';art.querySelector('.live-actions') ? art.querySelector('.live-actions').append(full) : art.matches('.season-card') ? art.append(full) : art.after(full);frame.focus({preventScroll:true});},{once:true});
  screen.prepend(frame);fit();
  sizes=new ResizeObserver(fit);sizes.observe(screen);

 });
 addEventListener('pagehide',()=>sizes?.disconnect(),{once:true});
});
