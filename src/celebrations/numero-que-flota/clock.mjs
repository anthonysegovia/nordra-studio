export function eventStamp({date,hour,zone}){
  const local=date+'T'+hour+':00';
  const parts=new Intl.DateTimeFormat('en-GB',{timeZone:zone,timeZoneName:'longOffset',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  function offsetAt(instant){
    return parts.formatToParts(instant).find(p=>p.type==='timeZoneName').value.replace('GMT','')||'+00:00';
  }
  const guess=new Date(local+offsetAt(new Date(local+'Z')));
  const stamp=local+offsetAt(guess);
  const resolved=parts.formatToParts(new Date(stamp));
  if(resolved.filter(p=>p.type==='hour'||p.type==='minute').map(p=>p.value).join(':')!==hour)throw Error('The local event time does not exist in '+zone);
  return stamp;
}
export function countdown(config, now=new Date(),target=new Date(eventStamp(config))){
  const remaining=Math.ceil((target-now)/1000);
  if(remaining>0)return {digits:[Math.floor(remaining/86400),Math.floor(remaining/3600)%24,Math.floor(remaining/60)%60,remaining%60]};
  const day=new Intl.DateTimeFormat('en-US',{timeZone:config.zone,year:'numeric',month:'2-digit',day:'2-digit'});
  return {message:day.format(now)===day.format(target)?config.copy.today:config.copy.past};
}
