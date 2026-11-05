// A cached document stays mounted; only a permanent departure releases resources.
export function pageLifecycle({pause,resume,dispose}){
 let parked=false,disposed=false;
 function close(){if(disposed)return;disposed=true;removeEventListener('pagehide',hide);removeEventListener('pageshow',show);dispose();}
 function hide(event){if(disposed)return;if(event.persisted){parked=true;pause();}else close();}
 function show(event){if(!disposed&&parked&&event.persisted){parked=false;resume();}}
 addEventListener('pagehide',hide);addEventListener('pageshow',show);
 return close;
}
