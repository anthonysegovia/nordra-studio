import { useContext } from 'react';
import { PanelExperience } from './panelExperience';

// Each occasion speaks in its own words. "celebration" is the wedding panel's copy and the fallback
// for a birthday term that needs no change; keep invitation records distinct from attendees.
const terms = {
  confirmed: { celebration:['Personas confirmadas','Confirmed people'], birthday:['Ya vienen','Coming'], event:['Confirmados','Confirmed'] },
  pending: { celebration:['Personas pendientes','Pending people'], birthday:['Por responder','Awaiting reply'], event:['Por confirmar','To confirm'] },
  declined: { celebration:['No asistirán','Not attending'], birthday:['No podrán ir','Can’t make it'], event:['No asistirán','Not attending'] },
  declinedOne: { celebration:['No asistirán','Not attending'], birthday:['No podrá ir','Can’t make it'], event:['No asistirá','Not attending'] },
  statusYes: { celebration:['Confirmado','Confirmed'], birthday:['Ya viene','Coming'], event:['Confirmado','Confirmed'] },
  statusPending: { celebration:['Pendiente','Pending'], birthday:['Por responder','Awaiting reply'], event:['Por confirmar','To confirm'] },
  statusNo: { celebration:['No asistirá','Not attending'], birthday:['No podrá ir','Can’t make it'], event:['No asistirá','Not attending'] },
  companionShort: { celebration:['Acompañante','Companion'], birthday:['+1','+1'], event:['Acompañante','Companion'] },
  partner: { celebration:['Pareja','Partner'], birthday:['Segunda persona','Second person'], event:['Segundo asistente','Second attendee'] },
  filterUnsent: { celebration:['Sin envío registrado','No recorded send'], birthday:['Sin enviar','Not sent'], event:['Sin enviar','Not sent'] },
  filterFollowup: { celebration:['Enviadas con pendientes','Sent with pending replies'], birthday:['Enviadas sin respuesta','Sent, no reply'], event:['Enviadas sin respuesta','Sent, no reply'] },
  filterPartial: { celebration:['Respuestas parciales','Partial replies'], birthday:['Respuesta a medias','Half answered'], event:['Respuesta parcial','Partial reply'] },
  filterUnnamed: { celebration:['Acompañantes sin nombre','Unnamed companions'], birthday:['+1 sin nombre','Unnamed +1'], event:['Acompañante sin nombre','Unnamed companion'] },
  filterUnseated: { celebration:['Confirmados sin mesa','Confirmed without a table'], birthday:['Sin mesa','No table'], event:['Sin zona','No zone'] },
  summaryUnseated: { celebration:['Confirmados sin mesa','Confirmed without a table'], birthday:['Ya vienen y no tienen mesa','Coming without a table'], event:['Confirmados sin zona','Confirmed without a zone'] },
  navTables: { celebration:['Mesas','Tables'], event:['Zonas','Zones'] },
  navReception: { celebration:['Recepción','Reception'], birthday:['La entrada','The door'], event:['Registro','Check-in'] },
  arrivalConfirmed: { celebration:['Confirmados','Confirmed'], birthday:['Ya vienen','Coming'], event:['Confirmados','Confirmed'] },
  scanAction: { celebration:['Escanear QR','Scan QR'], birthday:['Escanear pase','Scan pass'], event:['Escanear gafete','Scan badge'] },
  scanImage: { celebration:['Leer una imagen del QR','Read a QR image'], birthday:['Leer una imagen del pase','Read a pass image'], event:['Leer una imagen del gafete','Read a badge image'] },
  preparing: { celebration:['Preparando su espacio…','Preparing your space…'], birthday:['Preparando tu espacio…','Preparing your space…'], event:['Preparando tu espacio…','Preparing your space…'] },
  synced: { celebration:['Boreal · Sincronizado con sus invitaciones','Boreal · Synced with your invitations'], birthday:['Boreal · Sincronizado con tus invitaciones','Boreal · Synced with your invitations'], event:['Boreal · Sincronizado con tus invitaciones','Boreal · Synced with your invitations'] },
  yourSeating: { celebration:['Su distribución de mesas','Your seating arrangement'], birthday:['Tu distribución de mesas','Your seating arrangement'], event:['Tu distribución de zonas','Your zone arrangement'] },
  firstTable: { celebration:['Su primera mesa','Your first table'], birthday:['Tu primera mesa','Your first table'], event:['Tu primera zona','Your first zone'] },
  listReady: { celebration:['Su lista ya está en el panel','Your list is ready'], birthday:['Tu lista ya está en el panel','Your list is ready'], event:['Tu lista ya está en el panel','Your list is ready'] },
  csvSuffix: { celebration:['invitados','invitados'], event:['asistentes','attendees'] },
  search: { celebration:["Invitado o acompañante", "Guest or companion"], event:["Asistente o acompañante", "Attendee or companion"] },
  guestList: { celebration:["Invitaciones de invitados", "Guest invitations"], event:["Invitaciones de asistentes", "Attendee invitations"] },
  mainGuest: { celebration:["Invitado principal", "Main guest"], event:["Asistente principal", "Primary attendee"] },
  empty: { celebration:["No hay invitados que coincidan con tu búsqueda", "No guests match your search"], event:["No hay asistentes que coincidan con tu búsqueda", "No attendees match your search"] },
  importList: { celebration:["Importar su lista de invitados", "Import your guest list"], birthday:["Importar tu lista de invitados", "Import your guest list"], event:["Importar lista de asistentes", "Import attendee list"] },
  editorHeading: { celebration:["SUS PERSONAS FAVORITAS", "YOUR FAVORITE PEOPLE"], birthday:["TU LISTA DE LA FIESTA", "YOUR PARTY LIST"], event:["REGISTRO DE ASISTENTES", "ATTENDEE REGISTRATION"] },
  correct: { celebration:["Usa esta opción para corregir una respuesta por indicación del invitado", "Use this only to correct a reply on behalf of a guest"], event:["Usa esta opción para corregir una respuesta por indicación del asistente", "Use this only to correct a reply on behalf of an attendee"] },
  sharing: { celebration:["Nos encantará celebrar contigo", "We would love to celebrate with you"], birthday:["Me encantará celebrar contigo", "I’d love to celebrate with you"], event:["Nos dará gusto contar contigo en Conexión 27", "We look forward to seeing you at Conexión 27"] },
  asGuest: { celebration:["Vívelo como invitado", "Try it as a guest"], event:["Vívelo como asistente", "Try it as an attendee"] },
  seatingHeading: { celebration:["UN LUGAR PARA CELEBRAR", "A PLACE TO CELEBRATE"], event:["DISTRIBUCIÓN DE ASISTENTES", "ATTENDEE SEATING"] },
  tablesTitle: { celebration:["Alrededor de la mesa", "Around the table"], birthday:["Las mesas de la fiesta", "Party tables"], event:["Zonas del encuentro", "Event zones"] },
  tableIntro: { celebration:["Organiza a tus invitados por mesa", "Bring your favorite people together"], birthday:["Quién se sienta con quién", "Who sits with whom"], event:["Organiza a los asistentes por zona", "Arrange attendees by zone"] },
  add: { celebration:["Agregar invitados", "Add guests"], event:["Agregar asistentes", "Add attendees"] },
  places: { celebration:["Un lugar para cada persona", "A place for everyone"], event:["Un lugar para cada asistente", "A seat for each attendee"] },
  find: { celebration:["Buscar invitado", "Find a guest"], event:["Buscar asistente", "Find an attendee"] },
  everyone: { celebration:["Todos los invitados", "All guests"], event:["Todos los asistentes", "All attendees"] },
  emptyView: { celebration:["No hay invitados en esta vista", "No guests match this view"], event:["No hay asistentes en esta vista", "No attendees match this view"] },
  emptyTable: { celebration:["Esta mesa no tiene invitados asignados", "This table has no guests assigned"], event:["Esta zona no tiene asistentes asignados", "This zone has no attendees assigned"] },
  reserves: { celebration:["Confirmados y pendientes reservan un lugar", "Confirmed and pending guests both reserve a place"], event:["Los asistentes confirmados y pendientes reservan un lugar", "Confirmed and pending attendees both reserve a place"] },
  eligible: { celebration:["Ver todos los invitados disponibles", "Show all eligible people"], event:["Ver todos los asistentes disponibles", "Show all eligible attendees"] },
  ready: { celebration:["Lista para recibir a sus invitados", "Ready to welcome your guests"], birthday:["Lista para recibir invitados", "Ready for guests"], event:["Lista para recibir asistentes", "Ready for attendees"] },
  waiting: { celebration:["Con confirmados por llegar", "Confirmed guests still to arrive"], birthday:["Con personas por llegar", "Guests still to arrive"], event:["Con asistentes por llegar", "Attendees still to arrive"] },
  welcome: { celebration:["La bienvenida comienza aquí", "Welcome them in"], birthday:["Recibe a cada invitado con su pase", "Welcome each guest with their pass"], event:["Valida cada gafete al llegar", "Check each badge on arrival"] },
  scan: { celebration:["Acerca el pase del invitado a la cámara", "Point the camera at the guest’s pass"], event:["Acerca el gafete del asistente a la cámara", "Point the camera at the attendee’s badge"] },
  actor: { celebration:["Invitado", "Guest"], event:["Asistente", "Attendee"] },
} as const;

type Entry = { celebration: readonly [string, string]; event: readonly [string, string]; birthday?: readonly [string, string] };

export function panelTerms(occasion: string, english: boolean) {
  return (key: keyof typeof terms) => {
    const entry: Entry = terms[key];
    const words = occasion === 'event' ? entry.event : occasion === 'birthday' && entry.birthday ? entry.birthday : entry.celebration;
    return words[english ? 1 : 0];
  };
}
export function usePanelTerms(english: boolean) {
  return panelTerms(useContext(PanelExperience).key, english);
}

// Events seat people by zone. "Mesa" and "zona" share gender, so the wording carries over unchanged.
const zoneWords: [RegExp, string][] = [[/Mesas/g,'Zonas'],[/mesas/g,'zonas'],[/Mesa/g,'Zona'],[/mesa/g,'zona'],[/Tables/g,'Zones'],[/tables/g,'zones'],[/Table/g,'Zone'],[/table/g,'zone']];
export function zoneText(occasion: string) {
  return (value: string) => occasion === 'event' ? zoneWords.reduce((text, [word, zone]) => text.replace(word, zone), value) : value;
}
export function useZoneText() {
  return zoneText(useContext(PanelExperience).key);
}
