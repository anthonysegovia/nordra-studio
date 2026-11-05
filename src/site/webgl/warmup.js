const backends=new Map();
export async function warmContext(signal,type='webgl2'){
 if(signal.aborted)throw new DOMException('Preparation cancelled','AbortError');
 if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined')return;
 if(!backends.has(type))backends.set(type,new Promise(resolve=>{
  const worker=new Worker(new URL('./warmup.worker.js',import.meta.url),{type:'module'});
  const finish=()=>{clearTimeout(timeout);worker.terminate();removeEventListener('pagehide',finish);resolve();};
  const timeout=setTimeout(finish,10000);
  worker.onmessage=finish;worker.onerror=finish;
  addEventListener('pagehide',finish,{once:true});worker.postMessage(type);
 }));
 await new Promise((resolve,reject)=>{
  const abort=()=>{signal.removeEventListener('abort',abort);reject(new DOMException('Preparation cancelled','AbortError'));};
  signal.addEventListener('abort',abort,{once:true});
  backends.get(type).then(()=>{signal.removeEventListener('abort',abort);if(!signal.aborted)resolve();});
 });
}
