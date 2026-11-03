import { defaultPanelExperience as base } from './panelExperience';
import type { WeddingInvitation } from './weddingInvitations';

function greeting(invitation:WeddingInvitation, en:boolean) {
  const names=invitation.people.map(p=>p.name.trim().split(/\s+/)[0]).filter(Boolean);
  return (en?'Hi':'Hola')+(names.length?', '+new Intl.ListFormat(en?'en':'es-MX').format(names):'')+'. ';
}
export const birthdayPanel:typeof base = {
  ...base,key:'birthday',accent:'#7140b5',ink:'#30204f',paper:'#fbf8ff',
  sample:{path:'/panel-cumple.html',date:['24 de julio de 2027','July 24, 2027']},
  identity:{
    name:'Sofía 25',title:['Sofía 25'],mark:['Sofía 25'],back:'/cumpleanos',anchor:'cumpleanos-panel-muestra',
    invitation:'/invitaciones/sofia-25/',download:'cumpleanos',photo:'/artwork/birthday-afterglow/chrome-ribbon-v2-640.webp',srcSet:'/artwork/birthday-afterglow/chrome-ribbon-v2-640.webp 640w, /artwork/birthday-afterglow/chrome-ribbon-v2-1024.webp 1024w',
    place:['Terraza Aurora · ubicación general','Terraza Aurora · general location'],brand:['CELEBRACIONES','CELEBRATIONS'],brandLabel:['Cumpleaños','Birthdays'],
    badge:['MI CUMPLEAÑOS','MY BIRTHDAY'],panel:['Panel de cumpleaños','Birthday dashboard'],space:['Tu espacio de cumpleaños','Your birthday space'],
    backLabel:['Volver a Cumpleaños','Back to Birthdays'],kicker:['LA FIESTA DE SOFÍA','SOFÍA’S PARTY'],note:['Reúne a tus personas favoritas.','Bring your favorite people together.'],
    motto:['Hecho para tu fiesta','Made for your party'],guests:['Tus invitados','Your guests'],nav:['Invitados','Guests'],ours:['Mi invitación','My invitation'],
    footer:['Muestra Boreal · Mesas y entradas a tu fiesta','Boreal sample · Seating and party check-in'],
    history:'Recupera invitaciones durante la vigencia de esta muestra. Después, vuelve a asignar sus mesas.',
    remove:'Su enlace quedará inactivo. Puedes recuperar la invitación desde Historial durante la vigencia del cumpleaños.',
  },
  guide:{...base.guide,steps:[
    {...base.guide.steps[0],detail:['Abre la invitación personal de Sofía 25 en otra pestaña.','Open a personal Sofía 25 invitation in another tab.']},
    base.guide.steps[1],{...base.guide.steps[2],detail:['Vuelve a Tus invitados para ver quién viene a la fiesta.','Return to Your guests to see who is coming to the party.']},
  ]},
  reminder(inv,en){return greeting(inv,en)+(en?"I’d love to know if you can come to my birthday party. Here’s your invitation:":inv.kind==='individual'?'Me encantaría saber si podrás venir a mi cumple. Aquí está tu invitación:':'Me encantaría saber si podrán venir a mi cumple. Aquí está su invitación:')},
};
export const eventPanel:typeof base = {
  ...base,key:'event',accent:'#226553',ink:'#123044',paper:'#f5fbfa',
  sample:{path:'/panel-evento.html',date:['12 de junio de 2027','June 12, 2027']},
  identity:{
    name:'Conexión 27',title:['Conexión 27'],mark:['C27'],back:'/eventos',anchor:'eventos-panel-muestra',
    invitation:'/invitaciones/conexion-27/',download:'evento',photo:'/artwork/event-connection/crystal-rings-v1-640.webp',srcSet:'/artwork/event-connection/crystal-rings-v1-640.webp 640w, /artwork/event-connection/crystal-rings-v1-1024.webp 1024w',
    place:['Espacio Nodo · Monterrey','Espacio Nodo · Monterrey'],brand:['EVENTOS','EVENTS'],brandLabel:['Eventos','Events'],
    badge:['MI EVENTO','MY EVENT'],panel:['Panel del evento','Event dashboard'],space:['Tu espacio del evento','Your event space'],
    backLabel:['Volver a Eventos','Back to Events'],kicker:['PUNTO DE ENCUENTRO','MEETING POINT'],note:['Consulta quién viene al encuentro.','See who is coming to the event.'],
    motto:['Hecho para tu encuentro','Made for your gathering'],guests:['Asistentes','Attendees'],nav:['Asistentes','Attendees'],ours:['Mi invitación','My invitation'],
    footer:['Muestra Boreal · Zonas y recepción del evento','Boreal sample · Seating zones and event check-in'],
    history:'Recupera invitaciones durante la vigencia de esta muestra. Después, vuelve a asignar sus mesas.',
    remove:'Su enlace quedará inactivo. Puedes recuperar la invitación desde Historial durante la vigencia del evento.',
  },
  guide:{...base.guide,steps:[
    {...base.guide.steps[0],detail:['Abre un enlace personal de Conexión 27 en otra pestaña.','Open a personal Conexión 27 invitation in another tab.']},
    base.guide.steps[1],{...base.guide.steps[2],detail:['Vuelve a Asistentes para consultar la respuesta.','Return to Attendees to see the reply.']},
  ]},
  reminder(inv,en){return greeting(inv,en)+(en?'We’d appreciate your RSVP for Conexión 27. Here is your personal invitation:':inv.kind==='individual'?'Nos gustaría contar contigo en Conexión 27. ¿Podrías confirmar tu asistencia? Esta es tu invitación:':'Nos gustaría contar con ustedes en Conexión 27. ¿Podrían confirmar su asistencia? Esta es su invitación:')},
};

