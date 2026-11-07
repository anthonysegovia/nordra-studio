// Read geometry only after a scroll/resize, never on the ambient animation loop.
export function carousel(track, indicators, {mobile, countText, still}) {
  const cards=[...track.children], dots=[...indicators.querySelectorAll('i')], count=indicators.querySelector('span');
  let frame=0;
  function sync(){
    frame=0;if(!mobile.matches)return;
    const box=track.getBoundingClientRect(),middle=box.left+box.width/2;
    let best=0,distance=Infinity;
    cards.forEach((card,i)=>{const b=card.getBoundingClientRect(),d=Math.abs(b.left+b.width/2-middle);if(d<distance){best=i;distance=d;}});
    cards.forEach((card,i)=>card.classList.toggle('is-center',i===best));
    dots.forEach((dot,i)=>{dot.classList.toggle('on',i===best);});
    count.textContent=countText(best+1,cards.length);
  }
  const queue=()=>{if(!frame)frame=requestAnimationFrame(sync);};
  track.addEventListener('scroll',queue,{passive:true});
  new ResizeObserver(queue).observe(track);mobile.addEventListener('change',queue);queue();
}
