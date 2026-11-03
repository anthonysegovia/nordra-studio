import { createContext } from 'react';
import type { WeddingInvitation } from './weddingInvitations';

export const defaultPanelExperience = {
  key: 'wedding', accent: '#67533e', paper: '#fffdf8', ink: '#43392f',
  sample: {path:'/panel-boda.html', date:['19 de junio de 2027','June 19, 2027']},
  identity:{
    name:'Valentina & Sebastián', title:['Valentina ','&',' Sebastián'], mark:['V','&','S'],
    back:'/bodas', anchor:'panel-boda', invitation:'/invitaciones/valentina-y-sebastian/', download:'boda',
    photo:'/artwork/invitation-editorial/wedding-v2-640.webp',
    srcSet:'/artwork/invitation-editorial/wedding-v2-400.webp 400w, /artwork/invitation-editorial/wedding-v2-640.webp 640w, /artwork/invitation-editorial/wedding-v2-1200.webp 1200w',
    place:['Ciudad de México','Mexico City'], brand:'WEDDINGS', brandLabel:['Bodas','Weddings'], badge:['NUESTRA BODA','OUR WEDDING'],
    panel:['Panel de boda','Wedding panel'], space:['Su espacio de boda','Your wedding space'], backLabel:['Volver a Bodas','Back to Weddings'],
    kicker:['EL COMIENZO DE SU PARA SIEMPRE','THE START OF FOREVER'], note:['Cada respuesta acerca a sus personas favoritas','Every reply brings your favorite people a little closer'],
    motto:['Hecho para su historia','Made for your story'], guests:['Sus invitados','Your guests'], nav:['Invitados','Guests'],
    ours:['Nuestra invitación','Our invitation'], footer:['Muestra Boreal · Mesas y entradas QR','Boreal sample · Tables and QR arrivals'],
    remove:'Su enlace quedará inactivo. Puedes recuperar la invitación desde Historial durante la vigencia de la boda',
  },
  tasks: {
    singular: {followup:['persona sin responder con invitación enviada','person awaiting a reply on a sent invitation'], unsent:['invitación sin enviar','invitation without a recorded send'], unseated:['confirmado sin mesa','confirmed guest without a table']},
    title: ['Qué sigue','What’s next'], done: ['Todo al día','All caught up'],
    followup: ['personas sin responder con invitación enviada','people awaiting replies on sent invitations'],
    unsent: ['invitaciones sin enviar','invitations without a recorded send'],
    unseated: ['confirmados sin mesa','confirmed guests without a table'],
    remind: ['Enviar recordatorio','Send reminder'],
  },
  guide: {
    label:['Guía de la muestra','Sample guide'],
    steps:[
      {title:['Abre un enlace personal','Open a personal link'], detail:['Vívelo como invitado abre una invitación de ejemplo en otra pestaña.','Try it as a guest opens a sample invitation in another tab.']},
      {title:['Confirma como invitado','RSVP as a guest'], detail:['En la invitación, elige quién asistirá y guarda la respuesta.','In the invitation, choose who will attend and save the reply.']},
      {title:['Regresa y mira cómo cambió tu panel','Return and see your updated dashboard'], detail:['Vuelve a esta pestaña y busca al invitado para ver su respuesta.','Return to this tab and find the guest to see the reply.']},
    ],
  },
  reminder(invitation: WeddingInvitation, english: boolean) {
    const names = invitation.people.map(person => person.name.trim().split(/\s+/)[0]).filter(Boolean);
    const addressees = new Intl.ListFormat(english ? 'en' : 'es-MX').format(names);
    const greeting = (english ? 'Hi' : 'Hola') + (addressees ? ', ' + addressees : '') + '.';
    if (english) return greeting + " We'd love to know if you can join us. Here's your invitation:";
    return greeting + (invitation.kind === 'individual'
      ? ' Nos encantaría saber si podrás acompañarnos. Aquí está tu invitación:'
      : ' Nos encantaría saber si podrán acompañarnos. Aquí está su invitación:');
  },
};
export const PanelExperience = createContext(defaultPanelExperience);
export function reminderUrl(invitation: WeddingInvitation, english: boolean, settings = defaultPanelExperience) {
  return invitation.link ? 'https://wa.me/?text=' + encodeURIComponent(settings.reminder(invitation,english) + ' ' + invitation.link) : '';
}
