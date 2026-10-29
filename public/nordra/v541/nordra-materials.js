/* 5.38 — Light, frosted glass and composition. Scroll owns the playhead. */
(()=>{
 const host=document.querySelector('[data-view]:not([hidden])');if(!host)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 const small=matchMedia('(max-width:700px)');
 const paused=()=>reduced.matches||document.body.dataset.journeyMotion==='paused';
 const clamp=x=>Math.max(0,Math.min(1,x));
 const smooth=x=>{x=clamp(x);return x*x*(3-2*x);};
 const top=el=>{let y=0;for(let n=el;n;n=n.offsetParent)y+=n.offsetTop;return y;};
 const items=[];
 // Keep the original image, link, alt text and film. The extra layers are decorative.
 host.querySelectorAll('.feature-stage').forEach(stage=>{
  const screen=stage.querySelector('.feature-screen'),source=screen?.querySelector('img');if(!source)return;
  stage.classList.add('nordra-composition');screen.classList.add('nordra-assembled');
  const track=document.createElement('div');track.className='composition-track';stage.before(track);track.append(stage);
  const layer=document.createElement('div');layer.className='composition-layers';layer.setAttribute('aria-hidden','true');
  for(let i=0;i<3;i++){
   const piece=document.createElement('div');piece.className='composition-piece';piece.style.setProperty('--piece',i);
   const img=document.createElement('img');img.src=source.getAttribute('src');img.alt='';img.draggable=false;
   piece.append(img);layer.append(piece);
  }
  screen.append(layer);items.push({el:stage,anchor:track,kind:'build'});
 });
 host.querySelectorAll('.nordra-assembled,.studio-desk,#temporada-navidad .seasonal-cover').forEach(el=>{
  el.classList.add('nordra-frost');const frost=document.createElement('div');frost.className='frost-surface';frost.setAttribute('aria-hidden','true');el.append(frost);
  items.push({el,kind:'frost',anchor:el.closest('.composition-track')||el});
 });
 host.querySelectorAll('.home-paths .service-path').forEach((el,i)=>{el.classList.add('light-path');el.style.setProperty('--path-direction',i%2?1:-1);items.push({el,kind:'path'});});
 host.querySelectorAll('.travel-closing').forEach(el=>{el.classList.add('light-gathering');items.push({el,kind:'contact'});});
 const wedding=host.querySelector('.showcase-envelope');
 if(wedding){wedding.classList.add('scroll-envelope');items.push({el:wedding,anchor:wedding.closest('.showcase-stage'),kind:'envelope'});}
 const fields=[...host.querySelectorAll('.aurora-field')].filter(field=>!(host.dataset.view==='entrada'&&field.parentElement===host&&!field.classList.contains('travel-ambient')));
 let frame=0;
 function paint(){
  frame=0;if(document.hidden)return;
  const still=paused(),h=innerHeight;
  // Read geometry together before writing styles; skip settled offscreen items.
  const positions=items.map(item=>{const el=item.anchor||item.el;return {y:top(el)-scrollY,height:el.offsetHeight};});
  const fieldPositions=fields.map(field=>{const anchor=field.closest('.home-continuation,.showcase-stage,.seasonal-chapter');return anchor?{top:top(anchor),height:anchor.offsetHeight}:null;});
  host.classList.toggle('materials-still',still);
  let itemIndex=0;
  for(const item of items){
   const {y,height}=positions[itemIndex++];
   if(!still&&item.painted&&(y>h*1.25||y+height<-h*.25))continue;
   item.painted=true;
   // A full, legible transformation across most of the viewport, rather than a short reveal.
   const composition=item.anchor?.classList.contains('composition-track');
   const p=still?1:composition?clamp((h*.25-y)/(h*.65)):clamp((h*.98-y)/(h*(small.matches?.72:.78)));
   const e=smooth(p),style=item.el.style;
   item.el.dataset.materialProgress=p.toFixed(4);
   if(item.kind==='build'){
    style.setProperty('--assembly',e.toFixed(4));
    style.setProperty('--assembly-gap',`${((1-e)*(small.matches?48:130)).toFixed(2)}px`);
    style.setProperty('--assembly-angle',`${((1-e)*12).toFixed(2)}deg`);
    style.setProperty('--assembly-scale',(.82+.18*e).toFixed(4));
    style.setProperty('--assembly-original',smooth((p-.88)/.12).toFixed(4));
   }
   if(item.kind==='frost'){
    const clear=still?1:smooth((p-.06)/.78);
    style.setProperty('--thaw',`${(clear*145).toFixed(2)}%`);
    style.setProperty('--frost-alpha',(1-smooth((p-.7)/.2)).toFixed(4));
   }
   if(item.kind==='path'){
    style.setProperty('--path-x',`${((1-e)*(small.matches?24:80)).toFixed(2)}px`);
    style.setProperty('--path-angle',`${((1-e)*7).toFixed(2)}deg`);
   }
   if(item.kind==='contact'){
    style.setProperty('--gather-scale',(.45+.55*e).toFixed(4));
    style.setProperty('--gather-alpha',(.12+.5*e).toFixed(4));
   }
   if(item.kind==='envelope'){
    style.setProperty('--flap-angle',`${(-180*smooth(p/.35)).toFixed(2)}deg`);
    style.setProperty('--letter-y',`${(-32*smooth((p-.25)/.65)).toFixed(2)}%`);
    style.setProperty('--letter-clip',`${(40*(1-smooth((p-.25)/.65))).toFixed(2)}%`);
    style.setProperty('--flap-layer',p<.18?'4':'1');
   }
  }
  let fieldIndex=0;
  for(const field of fields){
   const anchor=fieldPositions[fieldIndex++];
   const ambient=field.classList.contains('travel-ambient');
   const p=still?1:ambient?.55+.4*Math.sin(scrollY/h*1.35):anchor?clamp((h-anchor.top+scrollY)/(h+Math.min(anchor.height,h))):clamp(scrollY/(h*1.15));
   field.dataset.unfold=p.toFixed(4);
   dispatchEvent(new CustomEvent('nordra-aurora-unfold',{detail:{field,progress:p,still}}));
  }
 }
 function queue(){if(!frame&&!document.hidden)frame=requestAnimationFrame(paint);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue,{passive:true});
 addEventListener('nordra-showcase-select',queue);reduced.addEventListener('change',queue);
 document.addEventListener('visibilitychange',queue);
 const state=new MutationObserver(queue);state.observe(document.body,{attributes:true,attributeFilter:['data-journey-motion']});
 const sizes=new ResizeObserver(queue);sizes.observe(host);
 host.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',queue,{once:true});});
 document.fonts.ready.then(queue);queue();
 addEventListener('pagehide',()=>{cancelAnimationFrame(frame);state.disconnect();sizes.disconnect();removeEventListener('scroll',queue);removeEventListener('resize',queue);},{once:true});
})();
