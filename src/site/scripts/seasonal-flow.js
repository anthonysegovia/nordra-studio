(()=>{
 const host=document.querySelector('[data-view="temporada"]:not([hidden])');
 if(!host)return;
 const chapters=[...host.querySelectorAll('.seasonal-chapter')];
 const links=[...host.querySelectorAll('.seasonal-route a')];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)'),small=matchMedia('(max-width:700px)');
 let written='';
 const colors={
  4:{light:[252,245,241],dark:[37,27,43],accent:[149,83,52],bright:[239,183,139]},
  5:{light:[241,247,242],dark:[19,41,35],accent:[48,110,83],bright:[164,215,188]},
  6:{light:[250,247,243],dark:[36,32,44],accent:[120,85,135],bright:[222,193,236]}
 };
 let queued=0,paused=parent!==window||reduced.matches||document.body.dataset.journeyMotion==='paused';
 function update(){
  queued=0;
  let active=-1;
  chapters.forEach((chapter,i)=>{if(chapter.getBoundingClientRect().top<innerHeight*.55)active=i;});
  links.forEach((link,i)=>{if(i===active)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
  if(paused&&!reduced.matches)return;
  const palette={'temporada-halloween':4,'temporada-navidad':5,'temporada-fin-de-ano':6};
  let from=palette[chapters[0]?.id]||6,to=from,blend=0;
  if(!reduced.matches){
   for(let i=0;i<chapters.length;i++){
    const top=chapters[i].getBoundingClientRect().top;
    if(top>=innerHeight*.85)break;
    from=to;to=palette[chapters[i].id];
    const fraction=Math.min(1,Math.max(0,(innerHeight*.85-top)/(innerHeight*.7)));
    blend=fraction*fraction*(3-2*fraction);
    if(fraction<1)break;
   }
  }
  // Phones switch palette per chapter instead of recolouring the whole page on every frame.
  if(small.matches)blend=blend<.5?0:1;
  const dark=document.body.classList.contains('dark');
  const key=`${from}|${to}|${blend.toFixed(3)}|${dark}`;
  if(key===written)return;
  written=key;
  function mix(key){return colors[from][key].map((n,i)=>Math.round(n+(colors[to][key][i]-n)*blend)).join(' ');}
  document.body.style.setProperty('--seasonal-bg',`rgb(${mix(dark?'dark':'light')})`);
  document.body.style.setProperty('--seasonal-accent',`rgb(${mix(dark?'bright':'accent')})`);
  host.dataset.paletteFrom=String(from);host.dataset.paletteTo=String(to);host.dataset.paletteBlend=blend.toFixed(3);
  dispatchEvent(new CustomEvent('nordra-seasonal-palette',{detail:{from,to,blend}}));
 }
 function queue(){if(!queued)queued=requestAnimationFrame(update);}
 addEventListener('scroll',queue,{passive:true});addEventListener('resize',queue);
 addEventListener('nordra-theme',()=>{const was=paused;paused=false;written='';update();paused=was;});
 addEventListener('nordra-local-motion',e=>{paused=!!e.detail.paused;queue();});
 addEventListener('message',e=>{if(e.source===parent&&e.data?.type==='nordra-motion'){paused=!!e.data.paused;queue();}});
 reduced.addEventListener('change',()=>{paused=reduced.matches;queue();});
 // Inside the review, the iframe grows with the page: use a real inner scroll viewport.
 // The builder configures that viewport for this scene so the palette follows its own scroll.
 document.fonts.ready.then(queue);queue();
 addEventListener('pagehide',()=>cancelAnimationFrame(queued),{once:true});
})();
