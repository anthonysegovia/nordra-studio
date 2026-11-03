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
export function countdown(config, now=new Date(), target=new Date(eventStamp(config))) {
  const date = new Intl.DateTimeFormat('en-CA',{timeZone:config.zone,year:'numeric',month:'2-digit',day:'2-digit'});
  if (date.format(now)===date.format(target)) return config.copy.today;
  const minutes=Math.ceil((target-now)/60000);
  if(minutes<=0) return config.copy.past;
  if(minutes<1440) return config.copy.hours.replace('{h}',Math.floor(minutes/60)).replace('{m}',minutes%60);
  return config.copy.days.replace('{n}',Math.ceil(minutes/1440));
}