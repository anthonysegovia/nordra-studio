import { createContext } from 'react';
import { invitationLabel, type WeddingInvitation } from './weddingInvitations';

export const defaultPanelExperience = {
  key: 'wedding', accent: '#67533e',
  tasks: {
    title: ['Qué sigue','What’s next'], done: ['Todo al día','All caught up'],
    followup: ['personas sin responder','people awaiting a reply'],
    unsent: ['invitaciones sin enviar','invitations without a recorded send'],
    unseated: ['confirmados sin mesa','confirmed guests without a table'],
    remind: ['Enviar recordatorio','Send reminder'],
  },
  reminder: (name: string, en: boolean) => en ? `Hello, ${name}. Please complete the pending replies in your invitation` : `Hola, ${name}. Completen las respuestas pendientes en su invitación`,
};
export const PanelExperience = createContext(defaultPanelExperience);
export function reminderUrl(invitation: WeddingInvitation, english: boolean, settings = defaultPanelExperience) {
  return invitation.link ? 'https://wa.me/?text=' + encodeURIComponent(settings.reminder(invitationLabel(invitation),english) + ': ' + invitation.link) : '';
}

