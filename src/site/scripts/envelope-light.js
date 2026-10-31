/* Signature · Invitaciones: the envelope's scroll progress (nordra-materials) drives a warm light
   that leaks through the seam, rises with the letter and travels to the phone. Decorative only. */
(()=>{
 const art=document.querySelector('[data-view="invitaciones"]:not([hidden]) .showcase-wedding');
 const envelope=art?.querySelector('.showcase-envelope');
 if(!art||!envelope)return;
 const clamp=x=>Math.max(0,Math.min(1,x)),smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const svg=(className,viewBox,inner)=>{const el=document.createElementNS('http://www.w3.org/2000/svg','svg');el.setAttribute('class',className);el.setAttribute('viewBox',viewBox);el.setAttribute('preserveAspectRatio','none');el.setAttribute('aria-hidden','true');el.innerHTML=inner;return el;};
 let observer=null,frame=0,started=false;
 function paint(){
  frame=0;
  const p=clamp(parseFloat(envelope.dataset.materialProgress??'1')||0),s=art.style;
  // Light first leaks through the closed flap, then follows the letter; it settles rather than loops.
  s.setProperty('--seam',(smooth(p/.1)*(1-smooth((p-.18)/.17))).toFixed(3));
  s.setProperty('--glow',(smooth(p/.4)*(1-.4*smooth((p-.85)/.15))).toFixed(3));
  s.setProperty('--inner',(smooth((p-.12)/.3)*(1-.35*smooth((p-.85)/.15))).toFixed(3));
  // The beam leaves once the letter has nearly risen (letter rise ends at .9).
  s.setProperty('--beam',smooth((p-.68)/.2).toFixed(3));
  s.setProperty('--beam-fade',(1-smooth((p-.93)/.07)).toFixed(3));
  s.setProperty('--screen',smooth((p-.82)/.15).toFixed(3));
  s.setProperty('--rim',(smooth((p-.82)/.1)*(1-.55*smooth((p-.94)/.06))).toFixed(3));
 }
 function queue(){if(!frame)frame=requestAnimationFrame(paint);}
 function start(){
  if(started)return;started=true;
  const inner=document.createElement('div');inner.className='envelope-inner';inner.setAttribute('aria-hidden','true');
  envelope.querySelector('.showcase-envelope-back').after(inner);
  envelope.append(svg('envelope-seam','0 0 100 100','<polyline points="0,0 50,76 100,0"/>'));
  art.append(svg('envelope-beam','0 0 100 100','<path pathLength="1" d="M 50 8 C 58 -4, 80 4, 83 34"/>'));
  paint();art.classList.add('envelope-lit');
  observer=new MutationObserver(queue);observer.observe(envelope,{attributes:true,attributeFilter:['data-material-progress']});
 }
 // Nothing is added until the showcase approaches, and never during page load.
 const near=new IntersectionObserver(entries=>{
  if(!entries.some(entry=>entry.isIntersecting))return;near.disconnect();
  const idle=window.requestIdleCallback||(callback=>setTimeout(callback,1));
  const go=()=>requestAnimationFrame(()=>requestAnimationFrame(()=>idle(start,{timeout:600})));
  if(document.readyState==='complete')go();else addEventListener('load',go,{once:true});
 },{rootMargin:'600px 0px'});
 near.observe(art);
 addEventListener('pagehide',()=>{near.disconnect();observer?.disconnect();cancelAnimationFrame(frame);},{once:true});
})();
