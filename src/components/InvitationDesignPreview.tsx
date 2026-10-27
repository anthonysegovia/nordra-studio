import '../styles/invitation-design-preview.css';

export type BirthdayDesign = 'afterglow' | 'pop' | 'studio';
const ribbon = '/artwork/birthday-afterglow/chrome-ribbon-v2-1024.webp';

export function BirthdayPoster({ design, english, compact = false }: { design: BirthdayDesign; english: boolean; compact?: boolean }) {
  return <div className={`bday-poster bday-poster-${design}${compact ? ' is-compact' : ''}`} aria-hidden="true">
    <div className="bday-poster-top"><span>NORDRA INVITES</span><span>24 / JUL / 27</span></div>
    <div className="bday-poster-name">SOFÍA</div><div className="bday-poster-age">25</div>
    {design === 'pop' ? <div className="bday-pop-flower"><i /><i /><i /><i /><i /><i /><span /></div> : <img className="bday-ribbon-art" src={ribbon} srcSet="/artwork/birthday-afterglow/chrome-ribbon-v2-640.webp 640w, /artwork/birthday-afterglow/chrome-ribbon-v2-1024.webp 1024w" sizes="(max-width:760px) 75vw, 480px" width={1280} height={1280} alt="" loading={compact ? 'lazy' : 'eager'} />}
    <div className="bday-poster-bottom"><strong>{design === 'afterglow' ? (english ? 'SEE YOU ON THE DANCE FLOOR' : 'NOS VEMOS EN LA PISTA') : design === 'pop' ? (english ? 'MORE COLOR, MORE PARTY' : 'MÁS COLOR, MÁS FIESTA') : (english ? 'DINNER, FRIENDS & ONE MORE YEAR' : 'CENA, AMIGOS Y UN AÑO MÁS')}</strong><span>{english ? 'SATURDAY · 7 PM' : 'SÁBADO · 19:00 H'}</span></div>
  </div>;
}

export function ConnectionMark() {
  return <div className="ev-connection-mark" aria-hidden="true"><i /><i /><i /><img className="ev-crystal-art" src="/artwork/event-connection/crystal-rings-v1-1024.webp" srcSet="/artwork/event-connection/crystal-rings-v1-640.webp 640w, /artwork/event-connection/crystal-rings-v1-1024.webp 1024w" sizes="(max-width:760px) 85vw, 650px" width={1280} height={1280} alt="" loading="lazy" /></div>;
}
export function EventPoster({ english }: { english: boolean }) {
  return <div className="ev-poster" role="img" aria-label={english ? 'Conexión / 27, a Nordra sample invitation for a creative gathering' : 'Conexión / 27, invitación de muestra de Nordra para un encuentro creativo'}><div aria-hidden="true"><div className="ev-poster-top"><span>NORDRA PRESENTS</span><span>MTY / 12 JUN 2027</span></div><ConnectionMark /><div className="ev-poster-title"><span>CONE</span><span>XIÓN<small>/ 27</small></span></div><div className="ev-poster-bottom"><span>{english ? 'IDEAS BECOME CONVERSATIONS' : 'LAS IDEAS SE VUELVEN CONVERSACIÓN'}</span><span>10:00 H ↗</span></div></div></div>;
}
