export function countdown(config, now=new Date()){
  const target=new Date(config.date+'T'+config.hour+':00'+config.offset);
  const remaining=Math.ceil((target-now)/1000);
  if(remaining>0)return {digits:[Math.floor(remaining/86400),Math.floor(remaining/3600)%24,Math.floor(remaining/60)%60,remaining%60]};
  const day=new Intl.DateTimeFormat('en-US',{timeZone:config.zone,year:'numeric',month:'2-digit',day:'2-digit'});
  return {message:day.format(now)===day.format(target)?config.copy.today:config.copy.past};
}
