export const STYLES=Object.freeze(['neon','caja','bar','xv','espacio']);
export const STYLE_KEY='nordra-cumple-estilo';
export function sanitizeName(value){return Array.from(String(value??'').normalize('NFC').replace(/[<>\u0000-\u001f\u007f-\u009f\u200b-\u200f\u202a-\u202e\u2066-\u2069]/g,'').trim().replace(/\s+/gu,' ')).slice(0,12).join('');}
export function sanitizeAge(value){const s=String(value??'').trim().toUpperCase();return s==='XV'?'XV':s.replace(/[^0-9]/g,'').slice(0,3);}
export function displayAge(value,style){const s=sanitizeAge(value);return style==='xv'&&s==='15'?'XV':s;}
export function daysToLiftoff(now=new Date()){return Math.max(0,Math.ceil((new Date(2027,6,24).getTime()-now.getTime())/864e5));}
export function staticProfile(device){return device.connection?.saveData===true||(device.deviceMemory!=null&&device.deviceMemory<3)||(device.hardwareConcurrency!=null&&device.hardwareConcurrency<=3);}
export function initialStyle(search,storage){let selected=new URLSearchParams(search).get('estilo');try{selected=selected||(storage??globalThis.sessionStorage)?.getItem(STYLE_KEY);}catch{}return STYLES.includes(selected)?selected:'neon';}
export function rememberStyle(style,storage){if(!STYLES.includes(style))return;try{(storage??globalThis.sessionStorage)?.setItem(STYLE_KEY,style);}catch{}}
const styleLabels={es:{neon:'Neón',caja:'Caja de regalo',bar:'Bar clandestino',xv:'Gala de XV',espacio:'Misión espacial'},en:{neon:'Neon',caja:'Gift box',bar:'Speakeasy',xv:'Quinceañera gala',espacio:'Space mission'}};
const colors={es:{rosa:'rosa',ambar:'ámbar',menta:'menta',violeta:'violeta',cielo:'cielo'},en:{rosa:'pink',ambar:'amber',menta:'mint',violeta:'violet',cielo:'sky'}};
const letters={es:{cursiva:'cursiva',bloque:'bloque',retro:'retro',motel:'motel'},en:{cursiva:'script',bloque:'block',retro:'retro',motel:'motel'}};
export function whatsappMessage({name,age,style='neon',color='rosa',lettering='cursiva',lang='es'}){
 const en=lang.startsWith('en'),l=en?'en':'es',w=STYLES.includes(style)?style:'neon',person=[sanitizeName(name),sanitizeAge(age)].filter(Boolean).join(' ');
 return en?`Hi, Nordra. I'd like an invitation with my name in lights: ${person}, in ${colors[l][color]||colors[l].rosa} with ${letters[l][lettering]||letters[l].cursiva} lettering, ${styleLabels[l][w]} style.`:`Hola, Nordra. Quiero una invitación con mi nombre en luces: ${person}, en ${colors[l][color]||colors[l].rosa} y letra ${letters[l][lettering]||letters[l].cursiva}, estilo ${styleLabels[l][w]}.`;
}
export function whatsappURL(options){return 'https://wa.me/528129022231?text='+encodeURIComponent(whatsappMessage(options)+(options.origin?'\n\n'+options.origin:''));}
