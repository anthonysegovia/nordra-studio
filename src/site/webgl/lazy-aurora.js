import {warmContext} from './warmup.js';
import {pageLifecycle} from './page-lifecycle.js';

// A shared queue gives every field its own idle callback, including across controllers.
const jobs=[];let busy=false;
function drain(){
 if(busy||!jobs.length)return;busy=true;
 const run=async()=>{try{await jobs.shift()();}finally{busy=false;drain();}};
 if(globalThis.requestIdleCallback)requestIdleCallback(run,{timeout:1200});else setTimeout(run,16);
}
export function lazyAurora(element,initialize){
 let controller=new AbortController(),near=false,queued=false,started=false,parked=false,disposed=false;
 const sized=()=>element.clientWidth>0&&element.clientHeight>0;
 function schedule(){
  if(disposed||parked||started||queued||!near||!sized())return;
  const attempt=controller;queued=true;warmContext(attempt.signal,'webgl').then(()=>{jobs.push(async()=>{
   try{
    if(attempt.signal.aborted||parked||!near||!sized())return;
    started=true;await initialize(attempt.signal);
   }catch(error){if(error.name!=='AbortError')element.dataset.renderer='fallback';}
   finally{if(attempt===controller){queued=false;if(!started)schedule();}}
  });drain();},error=>{if(attempt===controller)queued=false;if(error.name!=='AbortError')element.dataset.renderer='fallback';});
 }
 const intersection=new IntersectionObserver(([entry])=>{near=entry.isIntersecting;schedule();},{rootMargin:`${innerHeight}px 0px`});
 const size=new ResizeObserver(schedule);
 const observe=()=>{intersection.observe(element);size.observe(element);};
 const disconnect=()=>{intersection.disconnect();size.disconnect();};observe();
 const dispose=pageLifecycle({pause(){parked=true;near=false;disconnect();},resume(){parked=false;observe();schedule();},dispose(){disposed=true;controller.abort();disconnect();}});
 dispose.reset=()=>{if(disposed)return;controller.abort();controller=new AbortController();started=false;queued=false;schedule();};
 return dispose;
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
  do{await nextFrame(signal);if(gl.isContextLost?.())throw Error('Aurora context lost');}while(parallel&&!gl.getProgramParameter(program,parallel.COMPLETION_STATUS_KHR));
  if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error('Aurora shader link failed');
  return program;
 }catch(error){gl.deleteProgram(program);throw error;}
 finally{shaders.forEach(shader=>gl.deleteShader(shader));}
}

export function revealAurora(canvas){
 canvas.style.transition=matchMedia('(prefers-reduced-motion: reduce)').matches?'none':'opacity 600ms ease';
 canvas.style.opacity='1';
}
