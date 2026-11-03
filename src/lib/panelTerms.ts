import { useContext } from 'react';
import { PanelExperience } from './panelExperience';

// Existing celebration copy and its event equivalent. Keep invitation records distinct from attendees.
const terms = {
  confirmed: { celebration:['Personas confirmadas','Confirmed people'], event:['Asistentes confirmados','Confirmed attendees'] },
  pending: { celebration:['Personas pendientes','Pending people'], event:['Asistentes pendientes','Pending attendees'] },
  csvSuffix: { celebration:['invitados','invitados'], event:['asistentes','attendees'] },
  search: { celebration:["Invitado o acompañante", "Guest or companion"], event:["Asistente o acompañante", "Attendee or companion"] },
  guestList: { celebration:["Invitaciones de invitados", "Guest invitations"], event:["Invitaciones de asistentes", "Attendee invitations"] },
  mainGuest: { celebration:["Invitado principal", "Main guest"], event:["Asistente principal", "Primary attendee"] },
  empty: { celebration:["No hay invitados que coincidan con tu búsqueda", "No guests match your search"], event:["No hay asistentes que coincidan con tu búsqueda", "No attendees match your search"] },
  importList: { celebration:["Importar su lista de invitados", "Import your guest list"], event:["Importar lista de asistentes", "Import attendee list"] },
  editorHeading: { celebration:["SUS PERSONAS FAVORITAS", "YOUR FAVORITE PEOPLE"], event:["REGISTRO DE ASISTENTES", "ATTENDEE REGISTRATION"] },
  correct: { celebration:["Usa esta opción para corregir una respuesta por indicación del invitado", "Use this only to correct a reply on behalf of a guest"], event:["Usa esta opción para corregir una respuesta por indicación del asistente", "Use this only to correct a reply on behalf of an attendee"] },
  sharing: { celebration:["Nos encantará celebrar contigo", "We would love to celebrate with you"], event:["Nos dará gusto contar contigo en Conexión 27", "We look forward to seeing you at Conexión 27"] },
  asGuest: { celebration:["Vívelo como invitado", "Try it as a guest"], event:["Vívelo como asistente", "Try it as an attendee"] },
  seatingHeading: { celebration:["UN LUGAR PARA CELEBRAR", "A PLACE TO CELEBRATE"], event:["DISTRIBUCIÓN DE ASISTENTES", "ATTENDEE SEATING"] },
  tablesTitle: { celebration:["Alrededor de la mesa", "Around the table"], event:["Mesas del encuentro", "Event seating"] },
  tableIntro: { celebration:["Organiza a tus invitados por mesa", "Bring your favorite people together"], event:["Organiza a los asistentes por mesa", "Arrange attendees by table"] },
  add: { celebration:["Agregar invitados", "Add guests"], event:["Agregar asistentes", "Add attendees"] },
  places: { celebration:["Un lugar para cada persona", "A place for everyone"], event:["Un lugar para cada asistente", "A seat for each attendee"] },
  find: { celebration:["Buscar invitado", "Find a guest"], event:["Buscar asistente", "Find an attendee"] },
  everyone: { celebration:["Todos los invitados", "All guests"], event:["Todos los asistentes", "All attendees"] },
  emptyView: { celebration:["No hay invitados en esta vista", "No guests match this view"], event:["No hay asistentes en esta vista", "No attendees match this view"] },
  emptyTable: { celebration:["Esta mesa no tiene invitados asignados", "This table has no guests assigned"], event:["Esta mesa no tiene asistentes asignados", "This table has no attendees assigned"] },
  reserves: { celebration:["Confirmados y pendientes reservan un lugar", "Confirmed and pending guests both reserve a place"], event:["Los asistentes confirmados y pendientes reservan un lugar", "Confirmed and pending attendees both reserve a place"] },
  eligible: { celebration:["Ver todos los invitados disponibles", "Show all eligible people"], event:["Ver todos los asistentes disponibles", "Show all eligible attendees"] },
  ready: { celebration:["Lista para recibir a sus invitados", "Ready to welcome your guests"], event:["Lista para recibir asistentes", "Ready for attendees"] },
  waiting: { celebration:["Con confirmados por llegar", "Confirmed guests still to arrive"], event:["Con asistentes confirmados por llegar", "Confirmed attendees still to arrive"] },
  welcome: { celebration:["La bienvenida comienza aquí", "Welcome them in"], event:["Registro de llegada", "Attendee check-in"] },
  scan: { celebration:["Acerca el pase del invitado a la cámara", "Point the camera at the guest’s pass"], event:["Acerca el pase del asistente a la cámara", "Point the camera at the attendee’s pass"] },
  actor: { celebration:["Invitado", "Guest"], event:["Asistente", "Attendee"] },
} as const;

export function panelTerms(occasion: string, english: boolean) {
  return (key: keyof typeof terms) => terms[key][occasion === 'event' ? 'event' : 'celebration'][english ? 1 : 0];
}
export function usePanelTerms(english: boolean) {
  return panelTerms(useContext(PanelExperience).key, english);
}
