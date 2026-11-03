import {invitation} from './config.mjs';

const escape = value => String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function renderInvitation(html, config=invitation) {
  if(!html.includes('{{float:name}}'))return html;
  if(!/^[0-9XVI]{1,3}$/.test(config.balloons))throw Error('Use one to three digits or Roman numerals X, V, I.');
  const [year,month,day]=config.date.split('-');
  const monthName=new Intl.DateTimeFormat('es-MX',{month:'short',timeZone:'UTC'}).format(new Date(config.date+'T12:00:00Z')).replace('.','').toUpperCase();
  const values={...config,...config.copy,...config.palette,dateLabel:`${day} · ${month} · ${year}`,dayLabel:day+' '+monthName,year,stamp:config.date+'T'+config.hour+':00'+config.offset};
  return html.replace('{{float:moments}}',config.copy.moments.map(text=>'<li>'+escape(text)+'</li>').join(''))
    .replace(/\{\{float:(\w+)\}\}/g,(_,key)=>{
      if(!(key in values))throw Error('Unknown invitation field '+key);
      return escape(values[key]);
    });
}
