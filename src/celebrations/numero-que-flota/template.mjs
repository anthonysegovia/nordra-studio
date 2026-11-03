import {eventStamp} from './clock.mjs';
import {invitation} from './config.mjs';
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
function album(config){
  if(!config.photos?.length)return '';
  const photos=config.photos.map((p,i)=>`<figure style="--i:${i};--tilt:${(i-(config.photos.length-1)/2)*4}deg"><img loading="lazy" decoding="async" width="320" height="400" sizes="(max-width:700px) 62vw, 170px" src="${escape(p.src)}-320.webp" srcset="${escape(p.src)}-320.webp 320w, ${escape(p.src)}-600.webp 600w" alt="${escape(p.alt)}"><figcaption><b>${escape(p.label)}</b><span>${escape(p.caption)}</span></figcaption></figure>`).join('');
  return `<section id="camila" tabindex="-1" class="album-section"><h2>${escape(config.copy.album)}</h2><div class="album-fan" tabindex="0" role="group" aria-label="${escape(config.copy.album)}">${photos}</div></section>`;
}
function cards(config){
  return config.cards.map((card,i)=>{
    const colors=(card.colors??[]).map(color=>{
      if(!/^#[a-f0-9]{6}$/i.test(color))throw Error('Use hexadecimal swatch colors.');
      return `<i style="background:${color}"></i>`;
    }).join('');
    return `<article class="note-card" style="--i:${i}"><button type="button" aria-expanded="false" aria-controls="note-${i}"><span class="card-front"><small>${escape(card.label)}</small><i class="card-motif" aria-hidden="true">${['✧','◇','✴'][i%3]}</i><strong>${escape(card.title)}</strong><span class="card-sign" aria-hidden="true">+</span></span></button><div class="card-back" id="note-${i}" hidden><small>${escape(card.label)} · −</small><p>${escape(card.detail)}</p>${colors?'<span class="swatches" aria-hidden="true">'+colors+'</span>':''}</div></article>`;
  }).join('');
}
export function renderInvitation(html,config=invitation){
  if(!html.includes('{{float:name}}'))return html;
  if(!/^[0-9XVI]{1,3}$/.test(config.balloons))throw Error('Use one to three digits or Roman numerals X, V, I.');
  const [year,month,day]=config.date.split('-');
  const stamp=eventStamp(config);
  const dateLong=new Intl.DateTimeFormat('es-MX',{timeZone:config.zone,weekday:'long',year:'numeric',month:'long',day:'numeric'}).format(new Date(stamp));
  const values={...config,...config.copy,...config.palette,dateLabel:day+' · '+month+' · '+year,dateLong,stamp};
  const nav=['inicio','cuando','camila','saber','confirmacion'].map((id,i)=>id==='camila'&&!config.photos?.length?'':`<a href="#${id}"${id==='inicio'?' data-cover':''}>${escape(config.copy.nav[i])}</a>`).join('');
  const clock=config.copy.units.map(unit=>`<span><b>00</b><small>${escape(unit)}</small></span>`).join('');
  return html.replace('{{float:albumSection}}',album(config)).replace('{{float:cards}}',cards(config)).replace('{{float:nav}}',nav).replace('{{float:clock}}',clock)
    .replace(/\{\{float:(\w+)\}\}/g,(_,key)=>{if(!(key in values))throw Error('Unknown invitation field '+key);return escape(values[key])});
}
