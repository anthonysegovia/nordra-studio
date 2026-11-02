export type ClientCase = {
  id: string;
  client: string;
  displayName: string;
  authorType: 'Person' | 'Organization';
  occasion: string;
  invitationUrl: string;
  description: string;
  authorizedOn: string;
  capture: { src: string; alt: string; width: number; height: number };
  opinion: { text: string; authorizedOn: string };
  highlight?: string;
  rating: { value: 5; documentedOn: string } | null;
};

// Publication data supplied by the responsible person. Private authorization
// messages and screenshots are deliberately not stored with the public site.
export const clientCases: ClientCase[] = [
  {
    id: 'la-covadonga', client: 'La Covadonga', displayName: 'La Covadonga', authorType: 'Organization',
    highlight: 'La verdad nos encantó cómo quedó la invitación, el diseño estuvo muy bonito y fue muy fácil compartirla con todos.',
    occasion: 'Posada', invitationUrl: 'https://posadacovadonga.nordrastudio.mx/',
    description: 'Invitación de posada con confirmación de asistencia y una página para consultar quiénes confirmaron.',
    authorizedOn: '2026-11-01',
    capture: { src: '/artwork/client-cases/covadonga-cover.jpg', alt: 'Portada de la invitación de posada de La Covadonga, con una piñata de estrella', width: 375, height: 812 },
    opinion: {
      text: 'La verdad nos encantó cómo quedó la invitación, el diseño estuvo muy bonito y fue muy fácil compartirla con todos. La parte de confirmar asistencia también nos ayudó bastante para organizarnos mejor y llevar el control de los invitados. Te recomendaríamos, quedamos muy contentos con el resultado y la atención que nos diste.',
      authorizedOn: '2026-11-01',
    },
    rating: { value: 5, documentedOn: '2026-11-01' },
  },
  {
    id: 'sonia-alarcon', client: 'Sonia Alarcón', displayName: 'Sonia Alarcón', authorType: 'Person',
    highlight: 'A mis invitados también les gustó muchísimo; varios me preguntaron dónde la había hecho porque nunca habían visto una invitación así.',
    occasion: 'Fiesta de Halloween', invitationUrl: '/invitaciones/spooky-party/',
    description: 'Apertura animada, pase personalizado con el nombre que escribe cada persona y opción de guardar la invitación.',
    authorizedOn: '2026-11-01',
    capture: { src: '/artwork/client-cases/halloween-cover.png', alt: 'Portada de la invitación de Halloween de Sonia Alarcón, con una puerta ilustrada', width: 375, height: 812 },
    opinion: {
      text: 'Me encantó cómo quedó la invitación, sobre todo las animaciones y todos los detalles de Halloween. Quedó mucho mejor de lo que me imaginaba. A mis invitados también les gustó muchísimo; varios me preguntaron dónde la había hecho porque nunca habían visto una invitación así. Quedé súper contento con el resultado.',
      authorizedOn: '2026-11-01',
    },
    rating: { value: 5, documentedOn: '2026-11-01' },
  },
];
