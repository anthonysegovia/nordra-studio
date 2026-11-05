export function staticProfile(device){return device.connection?.saveData===true||(device.deviceMemory!=null&&device.deviceMemory<3)||(device.hardwareConcurrency!=null&&device.hardwareConcurrency<4);}
export function ringsPolicy(s){
 const available=!s.disposed&&!s.failed&&!s.static&&!s.reduced&&!s.paused;
 const allowed=available&&(!s.phone||s.optedIn);
 const present=s.visible&&!s.hidden&&!s.embeddedHidden;
 return {load:allowed&&present&&s.painted&&!s.ready,animate:allowed&&present&&s.ready,showScene:allowed&&s.ready,offerMotion:s.phone&&available&&!s.optedIn};
}
