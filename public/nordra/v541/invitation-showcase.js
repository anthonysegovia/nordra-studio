/* 5.32 — Celebration chooser; selection and navigation are separate actions. */
(()=>{
 const root=document.querySelector('[data-view="invitaciones"]:not([hidden]) .invitation-showcase');
 if(!root)return;
 const tabs=[...root.querySelectorAll('[role="tab"]')];
 const panels=[...root.querySelectorAll('[role="tabpanel"]')];
 const list=root.querySelector('[role="tablist"]');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const mobile=matchMedia('(max-width:700px)');
 const palettes=[1,2,3,6];
 let selected=0,visible=false,transition=null,palette=1,targetPalette=1,paletteFrame=0;
 const paused=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 function orientation(){list.setAttribute('aria-orientation',mobile.matches?'horizontal':'vertical');}
 orientation();mobile.addEventListener('change',orientation);
 function paintPalette(from,to,blend){dispatchEvent(new CustomEvent('nordra-showcase-palette',{detail:{from,to,blend}}));}
 function shiftPalette(){
  if(paletteFrame)return;
  if(paused()){palette=targetPalette;paintPalette(palette,palette,0);return;}
  const from=palette,to=targetPalette;let start;
  function step(time){
   if(paused()){palette=targetPalette;paintPalette(palette,palette,0);paletteFrame=0;return;}
   start??=time;const p=Math.min((time-start)/650,1);paintPalette(from,to,p*p*(3-2*p));
   if(p<1)paletteFrame=requestAnimationFrame(step);
   else{palette=to;paletteFrame=0;if(palette!==targetPalette)shiftPalette();}
  }
  paletteFrame=requestAnimationFrame(step);
 }
 function sync(){
  root.classList.toggle('showcase-still',paused());
  root.classList.toggle('showcase-running',visible&&!document.hidden&&!paused());
  if(paused()){transition?.finish();cancelAnimationFrame(paletteFrame);paletteFrame=0;palette=targetPalette;paintPalette(palette,palette,0);}
 }
 function select(index,focus=false){
  if(focus)tabs[index].focus();
  if(index===selected)return;
  transition?.cancel();selected=index;
  tabs.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;panels[i].hidden=i!==index;panels[i].inert=i!==index;});
  root.dataset.celebration=tabs[index].dataset.celebration;
  dispatchEvent(new CustomEvent('nordra-showcase-select',{detail:{celebration:root.dataset.celebration}}));
  targetPalette=palettes[index];shiftPalette();
  if(!paused())transition=panels[index].animate([{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'translateY(0)'}],{duration:420,easing:'cubic-bezier(.22,.61,.36,1)'});
 }
 tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>select(index));
  tab.addEventListener('keydown',event=>{
   if(event.ctrlKey||event.metaKey||event.altKey)return;
   let next;
   if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%tabs.length;
   if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+tabs.length-1)%tabs.length;
   if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
   if(next!==undefined){event.preventDefault();select(next,true);}
  });
 });
 const snow=root.querySelector('.showcase-snow');
 for(let i=0;i<28;i++){
  const flake=document.createElement('i');flake.style.cssText=`--x:${(i*37.7)%100}%;--delay:-${i*.73}s;--duration:${7+i%6}s;--size:${1.5+i%3}px`;snow.append(flake);
 }
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();},{threshold:.08});observer.observe(root);
 const stateObserver=new MutationObserver(sync);stateObserver.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 addEventListener('nordra-local-motion',sync);reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);
 addEventListener('pagehide',()=>{observer.disconnect();stateObserver.disconnect();cancelAnimationFrame(paletteFrame);transition?.cancel();},{once:true});
 sync();
})();
