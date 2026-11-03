/* Prepared light: only transforms and opacity change on mobile. */
(()=>{
 function create(container,initial=0,{ambient=false,fps=24}={}){
  const layer=document.createElement('div');layer.className='mobile-aurora'+(ambient?' mobile-aurora-ambient':'');layer.setAttribute('aria-hidden','true');
  const images=[0,1].map(()=>{const image=document.createElement('img');image.alt='';image.decoding='async';image.width=840;image.height=546;layer.append(image);return image;});
  container.append(layer);container.dataset.renderer='texture-mobile';
  let keys=[],progress=0,elapsed=0,last=0,frame=0,visible=false,enabled=true;
  function setPalette(from,to=from,blend=0){
   [from,to].forEach((key,i)=>{key=Math.max(0,Math.min(6,key));if(keys[i]!==key){images[i].src=`/nordra/v548/assets/aurora-mobile-${key}.webp`;keys[i]=key;}});
   images[1].style.opacity=from===to?'0':String(Math.max(0,Math.min(1,blend)));
  }
  setPalette(initial);
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  function paint(){
   const offset=ambient?0:progress-.5;
   const x=offset*40+18*Math.sin(elapsed*.22);
   const y=offset*-24+9*Math.sin(elapsed*.16);
   layer.style.transform=`translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0)`;
  }
  function tick(now){
   frame=requestAnimationFrame(tick);
   if(last && now-last<1000/fps-.6)return;
   if(last)elapsed+=Math.min((now-last)/1000,.1);
   last=now;paint();
  }
  function sync(){
   const active=visible && enabled && !document.hidden && !reduced.matches &&
    document.body.dataset.journeyMotion!=='paused' && document.body.dataset.businessMotion!=='paused';
   if(active && !frame)frame=requestAnimationFrame(tick);
   if(!active && frame){cancelAnimationFrame(frame);frame=0;last=0;}
  }
  const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;sync();});observer.observe(container);
  const state=new MutationObserver(sync);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion','data-business-motion']});
  document.addEventListener('visibilitychange',sync);reduced.addEventListener('change',sync);
  paint();
  return {setPalette,render(value=0){
   if(progress===value)return;
   progress=value;paint();
  },setPlaying(value){enabled=value;sync();},dispose(){
   cancelAnimationFrame(frame);observer.disconnect();state.disconnect();document.removeEventListener('visibilitychange',sync);
   reduced.removeEventListener('change',sync);layer.remove();
  }};
 }
 window.NordraMobileAurora={create};
})();
