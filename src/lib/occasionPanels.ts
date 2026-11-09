import { defaultPanelExperience as base } from './panelExperience';
import type { WeddingInvitation } from './weddingInvitations';

function greeting(invitation:WeddingInvitation, en:boolean) {
  const names=invitation.people.map(p=>p.name.trim().split(/\s+/)[0]).filter(Boolean);
  return (en?'Hi':'Hola')+(names.length?', '+new Intl.ListFormat(en?'en':'es-MX').format(names):'')+'. ';
}
export const birthdayPanel:typeof base = {
  ...base,key:'birthday',accent:'var(--o-accent)',ink:'var(--o-text)',paper:'var(--o-surface)',
  sample:{path:'/panel-cumple.html',date:['24 de julio de 2027','July 24, 2027'],iso:'2027-07-24'},
  kinds:{individual:['Una persona','One person'],couple:['Dos personas','Two people'],plusOne:['Con +1','With +1']},
  meter:(yes:number,total:number,en:boolean)=>en?`${yes} of ${total} coming`:`Ya vienen ${yes} de ${total}`,
  identity:{
    name:'Camila 30',title:['Camila 30'],mark:['C','30'],back:'/cumpleanos',anchor:'cumpleanos-panel-muestra',
    invitation:'/invitaciones/camila-30/',download:'cumpleanos',photo:'/artwork/birthday-caja/cerrada-660.webp',srcSet:'/artwork/birthday-caja/cerrada-360.webp 360w, /artwork/birthday-caja/cerrada-660.webp 660w',
    place:['Terraza Aurora','Terraza Aurora'],brand:['BIRTHDAYS','BIRTHDAYS'],brandLabel:['Cumpleaños','Birthdays'],
    badge:['MI CUMPLEAÑOS','MY BIRTHDAY'],panel:['Panel de cumpleaños','Birthday dashboard'],space:['Tu espacio de cumpleaños','Your birthday space'],
    backLabel:['Volver a Cumpleaños','Back to Birthdays'],kicker:['LA FIESTA DE CAMILA','CAMILA’S PARTY'],note:['Reúne a tus personas favoritas.','Bring your favorite people together.'],
    motto:['Hecho para tu fiesta','Made for your party'],guests:['Quién viene','Who’s coming'],nav:['Quién viene','Who’s coming'],ours:['La invitación','The invitation'],
    footer:['Muestra Boreal · Mesas y entrada a tu fiesta','Boreal sample · Tables and party check-in'],
    history:'Recupera invitaciones durante la vigencia de esta muestra. Después, vuelve a asignar sus mesas.',
    remove:'Su enlace quedará inactivo. Puedes recuperar la invitación desde Historial durante la vigencia del cumpleaños.',
  },
  tasks:{...base.tasks,
    singular:{...base.tasks.singular,followup:['persona sin responder','person without a reply'],unseated:['ya viene y no tiene mesa','coming without a table']},
    followup:['personas sin responder','people without a reply'],
    unseated:['ya vienen y no tienen mesa','coming without a table'],
  },
  guide:{...base.guide,steps:[
    {...base.guide.steps[0],detail:['Abre la invitación personal de Camila 30 en otra pestaña.','Open a personal Camila 30 invitation in another tab.']},
    base.guide.steps[1],{...base.guide.steps[2],detail:['Vuelve a Quién viene para ver si ya respondió.','Return to Who’s coming to see the reply.']},
  ]},
  reminder(inv,en){return greeting(inv,en)+(en?"I’d love to know if you can come to my birthday party. Here’s your invitation:":inv.kind==='individual'?'Me encantaría saber si podrás venir a mi cumple. Aquí está tu invitación:':'Me encantaría saber si podrán venir a mi cumple. Aquí está su invitación:')},
};
// Each birthday style dresses the panel with its own invitation. Caja de regalo, also the sample
// for Neón, is the base. These styles have no public invitation yet, so their panels link to none.
function styledBirthday(style:string,name:string,kicker:readonly [string,string],place:string,photo:string,badge:readonly [string,string]):typeof base {
  return {...birthdayPanel,style,identity:{...birthdayPanel.identity,name,title:[name],mark:[name],invitation:'',photo,srcSet:'',kicker:[...kicker],place:[place,place],badge:[...badge]}};
}
const birthdayStyles:Record<string,typeof base>={
  bar:styledBirthday('bar','Andrés 40',['EL BAR DE ANDRÉS','ANDRÉS’S BAR'],'El Sótano','/artwork/birthday-panel/bar-lampara.webp',['BAR CLANDESTINO','SPEAKEASY']),
  xv:styledBirthday('xv','Ximena XV',['LA GALA DE XIMENA','XIMENA’S GALA'],'Salón Cristal','/artwork/birthday-panel/xv-tiara.webp',['GALA DE XV','QUINCE GALA']),
  espacio:styledBirthday('espacio','Iker 6',['LA MISIÓN DE IKER','IKER’S MISSION'],'Base Planetario','/artwork/birthday-panel/espacio-cohete.webp',['MISIÓN ESPACIAL','SPACE MISSION']),
};
export function birthdayPanelFor(style:string|null) {
  return (style && Object.hasOwn(birthdayStyles,style)) ? birthdayStyles[style] : birthdayPanel;
}
export const eventPanel:typeof base = {
  ...base,key:'event',accent:'var(--o-accent)',ink:'var(--o-text)',paper:'var(--o-surface)',
  sample:{path:'/panel-evento.html',date:['12 de junio de 2027','June 12, 2027'],iso:'2027-06-12'},
  kinds:{individual:['Individual','Individual'],couple:['Dos asistentes','Two attendees'],plusOne:['Con acompañante','With a companion']},
  meter:(yes:number,total:number,en:boolean)=>en?`${yes} of ${total} places confirmed`:`${yes} de ${total} lugares confirmados`,
  identity:{
    name:'Conexión 27',title:['Conexión 27'],mark:['C27'],back:'/eventos',anchor:'eventos-panel-muestra',
    invitation:'/invitaciones/conexion-27/',download:'evento',photo:'/artwork/event-gafete/reverso-live-480.webp',srcSet:'/artwork/event-gafete/reverso-live-480.webp 480w, /artwork/event-gafete/reverso-live-960.webp 960w',
    place:['Espacio Nodo · Monterrey','Espacio Nodo · Monterrey'],brand:['EVENTS','EVENTS'],brandLabel:['Eventos','Events'],
    badge:['MI EVENTO','MY EVENT'],panel:['Panel del evento','Event dashboard'],space:['Tu espacio del evento','Your event space'],
    backLabel:['Volver a Eventos','Back to Events'],kicker:['PUNTO DE ENCUENTRO','MEETING POINT'],note:['Consulta quién viene al encuentro.','See who is coming to the event.'],
    motto:['Hecho para tu encuentro','Made for your gathering'],guests:['Asistentes','Attendees'],nav:['Asistentes','Attendees'],ours:['Invitación','Invitation'],
    footer:['Muestra Boreal · Zonas y registro del evento','Boreal sample · Zones and event check-in'],
    history:'Recupera invitaciones durante la vigencia de esta muestra. Después, vuelve a asignar sus zonas.',
    remove:'Su enlace quedará inactivo. Puedes recuperar la invitación desde Historial durante la vigencia del evento.',
  },
  tasks:{...base.tasks,
    singular:{...base.tasks.singular,followup:['asistente sin responder','attendee without a reply'],unseated:['confirmado sin zona','confirmed without a zone']},
    followup:['asistentes sin responder','attendees without a reply'],
    unseated:['confirmados sin zona','confirmed without a zone'],
  },
  guide:{...base.guide,steps:[
    {...base.guide.steps[0],detail:['Abre un enlace personal de Conexión 27 en otra pestaña.','Open a personal Conexión 27 invitation in another tab.']},
    {...base.guide.steps[1],title:['Confirma como asistente','RSVP as an attendee']},{...base.guide.steps[2],detail:['Vuelve a Asistentes para consultar la respuesta.','Return to Attendees to see the reply.']},
  ]},
  reminder(inv,en){return greeting(inv,en)+(en?'We’d appreciate your RSVP for Conexión 27. Here is your personal invitation:':inv.kind==='individual'?'Nos gustaría contar contigo en Conexión 27. ¿Podrías confirmar tu asistencia? Esta es tu invitación:':'Nos gustaría contar con ustedes en Conexión 27. ¿Podrían confirmar su asistencia? Esta es su invitación:')},
};
export function sampleExperience(key?:string) {
  return key==='birthday'?birthdayPanel:key==='event'?eventPanel:base;
}

