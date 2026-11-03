import { createContext } from 'react';
import { invitationLabel, type WeddingInvitation } from './weddingInvitations';

export const defaultPanelExperience = {
  key: 'wedding', accent: '#67533e', paper: '#fffdf8', ink: '#43392f',
  sample: {path:'/panel-boda.html', date:['19 de junio de 2027','June 19, 2027']},
  tasks: {
    singular: {followup:['persona sin responder','person awaiting a reply'], unsent:['invitación sin enviar','invitation without a recorded send'], unseated:['confirmado sin mesa','confirmed guest without a table']},
    title: ['Qué sigue','What’s next'], done: ['Todo al día','All caught up'],
    followup: ['personas sin responder','people awaiting a reply'],
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
  reminder: (name: string, en: boolean) => en ? `Hello, ${name}. Please complete the pending replies in your invitation` : `Hola, ${name}. Completen las respuestas pendientes en su invitación`,
};
export const PanelExperience = createContext(defaultPanelExperience);
export function reminderUrl(invitation: WeddingInvitation, english: boolean, settings = defaultPanelExperience) {
  return invitation.link ? 'https://wa.me/?text=' + encodeURIComponent(settings.reminder(invitationLabel(invitation),english) + ': ' + invitation.link) : '';
}
