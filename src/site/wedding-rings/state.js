export function staticProfile(device){return device.connection?.saveData===true||(device.deviceMemory!=null&&device.deviceMemory<3)||(device.hardwareConcurrency!=null&&device.hardwareConcurrency<4);}
export function ringsPolicy(s){
 const available=!s.disposed&&!s.failed&&!s.static&&!s.reduced&&!s.paused;
 const present=!s.hidden&&!s.embeddedHidden;
 return {
  load:available&&present&&(s.near||s.visible)&&s.painted&&!s.ready,
  animate:available&&present&&s.visible&&s.ready,
  showScene:available&&s.ready&&(s.visible||s.revealed),
  offerMotion:false,
 };
}
