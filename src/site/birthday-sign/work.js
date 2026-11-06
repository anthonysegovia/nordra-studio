// Give first paint/input a turn between independent scene-building jobs.
export function idleTask(job, timeout=120){
  return new Promise((resolve,reject)=>{
    const run=()=>{try{resolve(job());}catch(error){reject(error);}};
    if(globalThis.requestIdleCallback)requestIdleCallback(run,{timeout});
    else setTimeout(run,0);
  });
}
export async function runSteps(iterator){
  let step;
  do {step=await idleTask(()=>iterator.next());} while(!step.done);
  return step.value;
}
