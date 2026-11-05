import {warmContext} from './warmup.js';

// A shared queue gives every field its own idle callback, including across controllers.
const jobs=[];let busy=false;
function drain(){
 if(busy||!jobs.length)return;busy=true;
 const run=async()=>{try{await jobs.shift()();}finally{busy=false;drain();}};
 if(globalThis.requestIdleCallback)requestIdleCallback(run,{timeout:1200});else setTimeout(run,16);
}
export function lazyAurora(element,initialize){
 const controller=new AbortController();let near=false,queued=false,started=false;
 const sized=()=>element.clientWidth>0&&element.clientHeight>0;
 function schedule(){
  if(controller.signal.aborted||started||queued||!near||!sized())return;
  queued=true;jobs.push(async()=>{
   try{
    if(controller.signal.aborted||!near||!sized())return;
    await warmContext(controller.signal);
    if(controller.signal.aborted||!near||!sized())return;
    started=true;await initialize(controller.signal);
   }catch(error){if(error.name!=='AbortError')element.dataset.renderer='fallback';}
   finally{queued=false;}
  });drain();
 }
 const intersection=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;schedule();},{rootMargin:`${innerHeight}px 0px`});
 const size=new ResizeObserver(schedule);intersection.observe(element);size.observe(element);
 const dispose=()=>{controller.abort();intersection.disconnect();size.disconnect();};
 addEventListener('pagehide',dispose,{once:true});return dispose;
}

function nextFrame(signal){return new Promise((resolve,reject)=>{
 const abort=()=>{cancelAnimationFrame(id);reject(new DOMException('Preparation cancelled','AbortError'));};
 if(signal.aborted){reject(new DOMException('Preparation cancelled','AbortError'));return;}
 const id=requestAnimationFrame(()=>{signal.removeEventListener('abort',abort);resolve();});signal.addEventListener('abort',abort,{once:true});
});}

export async function compileAurora(gl,vertex,fragment,signal){
 const shaders=[],program=gl.createProgram();
 try{
  for(const [type,source] of [[gl.VERTEX_SHADER,vertex],[gl.FRAGMENT_SHADER,fragment]]){
   const shader=gl.createShader(type);shaders.push(shader);gl.shaderSource(shader,source);gl.compileShader(shader);gl.attachShader(program,shader);
  }
  const parallel=gl.getExtension('KHR_parallel_shader_compile');gl.linkProgram(program);
  // Never force completion through COMPILE_STATUS or LINK_STATUS in the submit task.
  do{await nextFrame(signal);}while(parallel&&!gl.getProgramParameter(program,parallel.COMPLETION_STATUS_KHR));
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Aurora shader link failed');
  return program;
 }catch(error){gl.deleteProgram(program);throw error;}
 finally{shaders.forEach(shader=>gl.deleteShader(shader));}
}

export function revealAurora(canvas){
 canvas.style.transition=matchMedia('(prefers-reduced-motion: reduce)').matches?'none':'opacity 600ms ease';
 canvas.style.opacity='1';
}
