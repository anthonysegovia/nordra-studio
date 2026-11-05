export async function warmContext(signal){
 if(typeof Worker==='undefined'||typeof OffscreenCanvas==='undefined')return;
 await new Promise((resolve,reject)=>{
  const worker=new Worker(new URL('./context-warmup.worker.js',import.meta.url),{type:'module'});
  const finish=()=>{worker.terminate();signal.removeEventListener('abort',abort);resolve();};
  const abort=()=>{worker.terminate();signal.removeEventListener('abort',abort);reject(new DOMException('Preparation cancelled','AbortError'));};
  worker.onmessage=finish;worker.onerror=finish;
  if(signal.aborted){abort();return;}
  signal.addEventListener('abort',abort,{once:true});worker.postMessage('prepare');
 });
}
