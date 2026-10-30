/* Prepared light: only transforms and opacity change on mobile. */
(()=>{
 function create(container,initial=0,{ambient=false}={}){
  const layer=document.createElement('div');layer.className='mobile-aurora'+(ambient?' mobile-aurora-ambient':'');layer.setAttribute('aria-hidden','true');
  const images=[0,1].map(()=>{const image=document.createElement('img');image.alt='';image.decoding='async';image.width=840;image.height=546;layer.append(image);return image;});
  container.append(layer);container.dataset.renderer='texture-mobile';
  let previous=-1,keys=[];
  function setPalette(from,to=from,blend=0){
   [from,to].forEach((key,i)=>{key=Math.max(0,Math.min(6,key));if(keys[i]!==key){images[i].src=`/nordra/v541/assets/aurora-mobile-${key}.webp`;keys[i]=key;}});
   images[1].style.opacity=from===to?'0':String(Math.max(0,Math.min(1,blend)));
  }
  setPalette(initial);
  const observer=new IntersectionObserver(([entry])=>{layer.classList.toggle('aurora-in-view',entry.isIntersecting);},{threshold:0});observer.observe(container);
  return {setPalette,render(progress=0){
   if(ambient)return;
   const p=Math.round(progress*240)/240;if(p===previous)return;previous=p;
   layer.style.transform=`translate3d(${(p-.5)*40}px,${(p-.5)*-24}px,0)`;
   layer.dataset.progress=p.toFixed(4);
  },dispose(){observer.disconnect();layer.remove();}};
 }
 window.NordraMobileAurora={create};
})();
