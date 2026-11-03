export function giftOpening() {
  const entrance=document.querySelector('.entrance');
  const frame=entrance.querySelector('.opening');
  const stage=frame.querySelector('.balloons');
  const open=entrance.querySelector('[data-open]');
  const skip=entrance.querySelector('[data-skip]');
  const content=document.querySelector('.celebration-content');
  const menu=document.querySelector('.celebration-header');
  const reduce=matchMedia('(prefers-reduced-motion: reduce)');
  let available, scene, canvas, visible=true, loading=false, animation=0, last=0, elapsed=0, duration=2500;
  const phase=()=>document.body.dataset.phase;
  function finish(){
    cancelAnimationFrame(animation);
    if(phase()==='open')return;
    document.body.dataset.phase='open';
    document.body.classList.add('table');
    entrance.hidden=entrance.inert=true;
    content.hidden=content.inert=menu.hidden=menu.inert=false;
    scene?.dispose();scene=null;canvas?.remove();
    const id=location.hash.slice(1);
    const target=[...content.querySelectorAll('section')].find(s=>s.id===id)||
      content.querySelector(id.startsWith('invitacion=')?'#confirmacion':'#cuando');
    if(target.id==='cuando')window.scrollTo(0,0);else target.scrollIntoView({block:'start'});
    target.focus({preventScroll:true});
  }
  function step(now){
    animation=0;
    if(document.hidden||!visible||phase()!=='opening')return;
    if(last)elapsed+=now-last;
    last=now;
    if(elapsed>=duration){finish();return}
    if(scene && elapsed>500){
      scene.render(elapsed/1000,{x:0,y:0},Math.max(0,Math.min(1,(elapsed-850)/950)));
    }
    animation=requestAnimationFrame(step);
  }
  function sync(){
    cancelAnimationFrame(animation);animation=0;last=0;
    entrance.classList.toggle('paused',document.hidden||!visible);
    if(!document.hidden && visible && phase()==='opening')animation=requestAnimationFrame(step);
  }
  async function prepare(){
    if(available===false||loading||scene||reduce.matches||phase()==='open'||document.hidden||!visible)return;
    loading=true;
    const probe=document.createElement('canvas');probe.setAttribute('aria-hidden','true');
    const quality=new URLSearchParams(location.search).get('quality');
    const tier=['low','medium','high'].includes(quality)?quality:(navigator.connection?.saveData||navigator.deviceMemory<=4?'low':innerWidth<700?'medium':'high');
    try{
      const gl=probe.getContext('webgl2',{alpha:true,antialias:tier==='high',powerPreference:'low-power'});
      available=Boolean(gl);
      if(!gl)return;
      const {createFloatScene}=await import('../numero-que-flota/scene.js');
      if(phase()==='open'||reduce.matches||document.hidden||!visible){gl.getExtension('WEBGL_lose_context')?.loseContext();return}
      canvas=probe;scene=createFloatScene(stage,canvas,gl,tier);
      stage.append(canvas);scene.render(0,{x:0,y:0},0);
      stage.dataset.quality=tier;
      if(phase()==='opening')stage.classList.add('live');
      canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();stage.classList.remove('live');scene?.dispose();scene=null;entrance.classList.add('still');},{once:true});
    }catch{available=false;scene?.dispose();scene=null;canvas?.remove();entrance.classList.add('still');stage.classList.remove('live')}finally{loading=false}
  }
  const poster=entrance.querySelector('.gift img');
  poster.decode().then(()=>requestAnimationFrame(()=>setTimeout(prepare,220))).catch(()=>{});
  new IntersectionObserver(([e])=>{visible=e.isIntersecting;sync();}).observe(entrance);
  document.addEventListener('visibilitychange',()=>{sync();if(!document.hidden)prepare()});
  open.addEventListener('click',()=>{
    if(phase()!=='closed')return;
    prepare();
    const live=available===true&&!reduce.matches;
    duration=live?2500:650;elapsed=0;
    entrance.classList.toggle('still',!live);stage.classList.toggle('live',live&&Boolean(scene));
    frame.hidden=false;frame.removeAttribute('aria-hidden');open.disabled=true;
    document.body.dataset.phase='opening';
    skip.focus({preventScroll:true});sync();
  });
  skip.addEventListener('click',e=>{e.preventDefault();finish()});
  entrance.addEventListener('keydown',e=>{if(e.key==='Escape')finish()});
  reduce.addEventListener('change',()=>{if(reduce.matches && phase()==='opening')finish()});
  addEventListener('pageshow',sync);
  // Keep the first keyboard stop on the bow even on a section or personal URL.
  entrance.focus({preventScroll:true});
}