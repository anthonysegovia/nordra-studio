import {invitation} from './config.mjs';
import {eventStamp} from './clock.mjs';
const escape = value => String(value).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const frame = (name,small,large,style) => `<picture class="${style}"><source media="(max-width:680px)" srcset="/artwork/birthday-caja/${name}-${small}.webp"><img loading="lazy" src="/artwork/birthday-caja/${name}-${large}.webp" alt=""></picture>`;
function photograph(p) {
  const src=escape(p.src);
  return `<figure>${frame('marco',260,514,'frame')}<img class="photo" loading="lazy" decoding="async" width="320" height="400" sizes="(max-width:680px) 235px, 300px" src="${src}-320.webp" srcset="${src}-320.webp 320w, ${src}-600.webp 600w" alt="${escape(p.alt)}"><figcaption>${escape(p.label)} · ${escape(p.caption)}</figcaption>${frame('cinta',100,220,'tape')}</figure>`;
}
export function renderInvitation(html,config=invitation) {
  if(!html.includes('{{gift:title}}'))return html;
  if(!/^[0-9XVI]{1,3}$/.test(config.balloons))throw Error('Edad de uno a tres dígitos o números romanos');
  const stamp=eventStamp(config);
  const label=new Intl.DateTimeFormat('es-MX',{timeZone:config.zone,weekday:'long',day:'numeric',month:'long'}).format(new Date(stamp)).replace(',','');
  const dateLabel=label.charAt(0).toUpperCase()+label.slice(1);
  if(!config.photos.length)html=html.replace(/<section tabindex="-1" id="camila">[\s\S]*?<\/section>/,'').replace(/<a href="#camila">.*?<\/a>/,'');
  const values={...config,...config.copy,...config.palette,stamp,dateLabel};
  return html.replace('{{gift:photos}}',config.photos.map(photograph).join('\n')).replace(/\{\{gift:(\w+)\}\}/g,(_,key)=>{
    if(!(key in values))throw Error('Campo desconocido: '+key);
    return escape(String(values[key]).replaceAll('{name}',config.name).replaceAll('{age}',config.balloons));
  });
}