import { useEffect, useRef, useState, type FormEvent } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Check, MapPin, Pause, Play, RotateCcw, X } from 'lucide-react';
import { GuestResponsePanel } from '../components/GuestResponsePanel';
import { invitationQuote } from '../data/invitationOccasions';
import { updateDemoResponse, type GuestResponse } from '../lib/guestResponses';
import '../styles/birthday-journey.css';

const ribbon = '/artwork/birthday-afterglow/chrome-ribbon-v1.png';
const initialReplies: GuestResponse[] = [
  { id: 'birthday-ana', guest_name: 'Ana Torres', attendance: 'yes', updated_at: '2026-10-25T12:00:00.000Z' },
  { id: 'birthday-diego', guest_name: 'Diego Ruiz', attendance: 'yes', updated_at: '2026-10-25T12:10:00.000Z' },
  { id: 'birthday-lucia', guest_name: 'Lucía Reyes', attendance: 'no', updated_at: '2026-10-25T12:20:00.000Z' },
];
const designs = ['afterglow', 'pop', 'studio'] as const;
type BirthdayDesign = typeof designs[number];
const designNames = { afterglow: 'Afterglow', pop: 'Pop Club', studio: 'Studio' };

function Poster({ design, english, compact = false }: { design: BirthdayDesign; english: boolean; compact?: boolean }) {
  return <div className={`bday-poster bday-poster-${design}${compact ? ' is-compact' : ''}`} aria-hidden="true">
    <div className="bday-poster-top"><span>NORDRA INVITES</span><span>24 / JUL / 27</span></div>
    <div className="bday-poster-name">SOFÍA</div><div className="bday-poster-age">25</div>
    {design === 'pop' ? <div className="bday-pop-flower"><i /><i /><i /><i /><i /><i /><span /></div> : <img className="bday-ribbon-art" src={ribbon} width={1280} height={1280} alt="" loading={compact ? 'lazy' : 'eager'} />}
    <div className="bday-poster-bottom"><strong>{design === 'afterglow' ? (english ? 'SEE YOU ON THE DANCE FLOOR' : 'NOS VEMOS EN LA PISTA') : design === 'pop' ? (english ? 'MORE COLOR, MORE PARTY' : 'MÁS COLOR, MÁS FIESTA') : (english ? 'DINNER, FRIENDS & ONE MORE YEAR' : 'CENA, AMIGOS Y UN AÑO MÁS')}</strong><span>{english ? 'SATURDAY · 7 PM' : 'SÁBADO · 19:00 H'}</span></div>
  </div>;
}

type ReplyProps = { english: boolean; name: string; attendance: 'yes' | 'no'; saved: boolean; error: string; onName: (name: string) => void; onAttendance: (attendance: 'yes' | 'no') => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; idPrefix: string };
function ReplyForm({ english, name, attendance, saved, error, onName, onAttendance, onSubmit, idPrefix }: ReplyProps) {
  return <form className="bday-reply-form" onSubmit={onSubmit}>
    <label htmlFor={`${idPrefix}-name`}>{english ? 'Sample guest name' : 'Nombre de invitado de prueba'}<input id={`${idPrefix}-name`} required minLength={2} maxLength={100} autoComplete="off" placeholder={english ? 'e.g. Alex López' : 'Ej. Alex López'} value={name} onChange={event => onName(event.target.value)} /></label>
    <fieldset><legend>{english ? 'Are you coming?' : '¿Te apuntas?'}</legend><label><input type="radio" name={`${idPrefix}-attendance`} checked={attendance === 'yes'} onChange={() => onAttendance('yes')} /><span>{english ? 'Count me in' : 'Sí voy'}</span></label><label><input type="radio" name={`${idPrefix}-attendance`} checked={attendance === 'no'} onChange={() => onAttendance('no')} /><span>{english ? 'I can’t make it' : 'Esta vez no puedo'}</span></label></fieldset>
    <button className="bday-button" type="submit">{saved ? (english ? 'Update my sample reply' : 'Actualizar mi respuesta') : (english ? 'Try RSVP' : 'Probar confirmación')}<ArrowUpRight size={18} aria-hidden="true" /></button>
    {error && <p role="alert" className="bday-form-error">{error}</p>}
    <p role="status" className="bday-reply-status">{saved && <><Check size={16} aria-hidden="true" />{english ? 'Done! Your sample reply is in the panel below' : '¡Listo! Tu respuesta de prueba ya aparece en el panel'}</>}</p>
  </form>;
}

function InvitationDialog({ english, design, reply, onClose }: { english: boolean; design: BirthdayDesign; reply: Omit<ReplyProps, 'idPrefix' | 'english'>; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [opened, setOpened] = useState(false);
  const [opening, setOpening] = useState(false);
  const invitation = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = dialog.current;
    const overflow = document.body.style.overflow;
    element?.showModal(); document.body.style.overflow = 'hidden';
    return () => { element?.close(); document.body.style.overflow = overflow; };
  }, []);
  useEffect(() => {
    if (!opening) return;
    const timer = window.setTimeout(() => { setOpened(true); setOpening(false); }, window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 550);
    return () => window.clearTimeout(timer);
  }, [opening]);
  useEffect(() => { if (opened) { invitation.current?.focus({ preventScroll: true }); if (dialog.current) dialog.current.scrollTop = 0; } }, [opened]);
  return <dialog className={`bday-dialog bday-design-${design}`} ref={dialog} aria-labelledby="bday-dialog-title" onCancel={onClose} onClose={event => { if (!event.currentTarget.open) onClose(); }}>
    <button className="bday-dialog-close" type="button" onClick={onClose} aria-label={english ? 'Close invitation' : 'Cerrar invitación'}><X size={22} aria-hidden="true" /></button>
    {!opened ? <div className={`bday-envelope${opening ? ' is-opening' : ''}`}><p className="bday-label">{english ? 'SOMETHING TO CELEBRATE' : 'TENEMOS ALGO QUE CELEBRAR'}</p><h2 id="bday-dialog-title">{english ? 'You’re on the list' : 'Estás en la lista'}</h2><div className="bday-envelope-art">{design === "pop" ? <div className="bday-pop-flower"><i /><i /><i /><i /><i /><i /><span /></div> : <img src={ribbon} width={1280} height={1280} alt="" />}</div><p>{english ? 'Sofía’s 25th · A Nordra sample invitation' : 'Los 25 de Sofía · Invitación de muestra de Nordra'}</p><button className="bday-button" type="button" disabled={opening} onClick={() => setOpening(true)}>{english ? 'Open invitation' : 'Abrir invitación'}<ArrowRight size={18} aria-hidden="true" /></button></div> : <div className="bday-invitation" ref={invitation} tabIndex={-1}>
      <nav className="bday-invitation-nav" aria-label={english ? 'Invitation navigation' : 'Navegación de la invitación'}><a href="#bday-invite-party">{english ? 'Party' : 'La fiesta'}</a><a href="#bday-invite-details">{english ? 'Details' : 'Detalles'}</a><a href="#bday-invite-reply">{english ? 'RSVP' : 'Asistencia'}</a></nav>
      <section id="bday-invite-party" className="bday-invite-cover"><Poster design={design} english={english} /><div><p className="bday-label">{english ? 'SOFÍA’S BIRTHDAY' : 'EL CUMPLE DE SOFÍA'}</p><h2 id="bday-dialog-title">{english ? '25 calls' : 'Los 25'}<br />{english ? 'for a party' : 'se celebran'}</h2><p>{english ? 'A long night, our favorite songs and the people who always show up. You’re invited.' : 'Una noche larga, nuestras canciones favoritas y la gente que siempre está. Tú estás invitado.'}</p></div></section>
      <section id="bday-invite-details" className="bday-invite-details"><h3>{english ? 'The plan' : 'El plan'}</h3><div><CalendarDays size={22} aria-hidden="true" /><p><strong>{english ? 'Saturday, July 24, 2027' : 'Sábado 24 de julio de 2027'}</strong><span>{english ? 'Starting at 7 pm' : 'A partir de las 19:00 h'}</span></p></div><div><MapPin size={22} aria-hidden="true" /><p><strong>{english ? 'Venue to be confirmed' : 'Lugar por confirmar'}</strong><span>{english ? 'Sample invitation · no actual venue' : 'Invitación de muestra · Sin sede real'}</span></p></div><p>{english ? 'Dress code: your favorite party outfit' : 'Vestimenta: tu mejor look de fiesta'}</p></section>
      <section id="bday-invite-reply" className="bday-invite-reply"><p className="bday-label">{english ? 'SAVE YOUR SPOT' : 'GUARDA TU LUGAR'}</p><h3>{english ? 'Are you in?' : '¿Te vemos ahí?'}</h3><p>{english ? 'This is a sample. Replies are not sent and disappear when the page reloads.' : 'Esta es una muestra. Las respuestas no se envían y se borran al recargar la página.'}</p><ReplyForm {...reply} english={english} idPrefix="birthday-dialog" /></section>
      <div className="bday-invitation-signature">SOFÍA × NORDRA</div>
    </div>}
    {opening && <button className="bday-skip" type="button" onClick={() => { setOpening(false); setOpened(true); }}>{english ? "Skip animation" : "Saltar animación"}</button>}
  </dialog>;
}

export function BirthdayContent({ english }: { english: boolean }) {
  const [design, setDesign] = useState<BirthdayDesign>('afterglow');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [paused, setPaused] = useState(false);
  const [rows, setRows] = useState(initialReplies);
  const [name, setName] = useState('');
  const [attendance, setAttendance] = useState<'yes' | 'no'>('yes');
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [resetKey, setResetKey] = useState(0);
  const descriptions = english ? { afterglow: 'Chrome, electric blue and a night with no curfew', pop: 'Bold color, playful shapes and good energy', studio: 'Graphic, understated and ready for your next decade' } : { afterglow: 'Cromo, azul eléctrico y una noche sin prisa', pop: 'Color al máximo, formas libres y buena energía', studio: 'Gráfica, sobria y lista para tu próxima década' };
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError('');
    try {
      setRows(updateDemoResponse(rows, { id: 'birthday-your-reply', guest_name: name, attendance, updated_at: new Date().toISOString() })); setSaved(true);
    } catch (reason) {
      setError((reason as Error).message === 'duplicate_name' ? (english ? 'This name is already in the sample. Try another name.' : 'Ese nombre ya está en la muestra. Prueba con otro nombre.') : (english ? 'Enter a name with 2 to 100 characters.' : 'Escribe un nombre de 2 a 100 caracteres.'));
    }
  }
  function reset() { setRows(initialReplies); setName(''); setAttendance('yes'); setSaved(false); setError(''); setResetKey(value => value + 1); }
  const reply = { name, attendance, saved, error, onName: setName, onAttendance: setAttendance, onSubmit: submit };
  return <div className={`bday-content${paused ? ' is-paused' : ''}`}>
    <section className="bday-hero site-shell" aria-labelledby="occasion-title">
      <div className="bday-hero-copy"><p className="bday-label"><span className="bday-live-dot" />{english ? 'BIRTHDAYS, BY NORDRA' : 'CUMPLEAÑOS, POR NORDRA'}</p><h1 id="occasion-title">{english ? 'Your birthday' : 'Se viene'}<br /><span>{english ? 'is calling' : 'tu cumple'}</span><span className="bday-title-mark" aria-hidden="true">↗</span></h1><p>{english ? 'A digital invitation with your party’s attitude. Open it, explore it and start getting your people together.' : 'Una invitación digital con la actitud de tu fiesta. Ábrela, explórala y empieza a reunir a los tuyos.'}</p><div className="bday-hero-actions"><a className="bday-button" href="#event-experience">{english ? 'Find my style' : 'Encuentra tu estilo'}<ArrowDown size={18} aria-hidden="true" /></a><a className="bday-text-link" href="#planes-eventos">{english ? 'Packages & pricing' : 'Paquetes y precios'}<ArrowUpRight size={17} aria-hidden="true" /></a></div><div className="bday-hero-meta"><span>{english ? 'Designed for you' : 'Diseño personalizado'}</span><span>{english ? 'Guest panel included' : 'Panel de invitados incluido'}</span></div></div>
      <div className="bday-hero-stage"><div className="bday-orbit" aria-hidden="true" /><span className="bday-stage-caption">NORDRA BIRTHDAY SERIES — 2027</span><button type="button" className="bday-hero-invitation" onClick={() => { setDesign('afterglow'); setDialogOpen(true); }} aria-label={english ? 'Open Sofía’s Afterglow sample invitation' : 'Abrir la invitación Afterglow de Sofía'}><Poster design="afterglow" english={english} /><span className="bday-open-pill">{english ? 'Open the invitation' : 'Abre la invitación'}<ArrowUpRight size={17} aria-hidden="true" /></span></button><div className="bday-rsvp-toast" aria-hidden="true"><span>AT</span><div><strong>{english ? 'Ana’s coming!' : '¡Ana sí va!'}</strong><small>{english ? 'This is how a sample reply arrives' : 'Así llega una respuesta de muestra'}</small></div><Check size={17} /></div><button className="bday-motion" type="button" onClick={() => setPaused(value => !value)} aria-label={paused ? (english ? 'Resume ambient motion' : 'Reanudar movimiento ambiental') : (english ? 'Pause ambient motion' : 'Pausar movimiento ambiental')}>{paused ? <Play size={13} /> : <Pause size={13} />}<span>{english ? 'Ambient light' : 'Luz ambiental'}</span></button></div>
    </section>
    <div className="bday-ticker" aria-hidden="true"><div><span>{english ? 'ANOTHER YEAR' : 'UN AÑO MÁS'}</span><i>↗</i><span>{english ? 'YOUR KIND OF PARTY' : 'A TU MANERA'}</span><i>↗</i><span>NORDRA INVITES</span><i>↗</i><span>{english ? 'BRING YOUR PEOPLE' : 'CON LOS TUYOS'}</span><i>↗</i></div></div>
    <section id="event-experience" className="bday-designs site-shell" aria-labelledby="bday-design-title"><div className="bday-section-top"><div><p className="bday-label">{english ? 'DESIGN EXPLORER' : 'EXPLORA LOS DISEÑOS'}</p><h2 id="bday-design-title">{english ? 'What’s the vibe?' : '¿Qué se arma?'}</h2></div><p>{english ? 'Three styles for Sofía’s birthday. Pick one and open it to see the full experience.' : 'Tres estilos para el cumple de Sofía. Elige uno y ábrelo para vivir la experiencia completa.'}</p></div>
      <div className="bday-design-grid" role="group" aria-label={english ? 'Choose an invitation style' : 'Elige un estilo de invitación'}>{designs.map(item => <button key={item} className={`bday-design-choice${design === item ? ' is-selected' : ''}`} type="button" aria-pressed={design === item} onClick={() => setDesign(item)}><div className="bday-design-art"><Poster design={item} english={english} compact /><span className="bday-choice-check"><Check size={16} aria-hidden="true" /></span></div><span className="bday-design-choice-title">{designNames[item]}<ArrowUpRight size={21} aria-hidden="true" /></span><span className="bday-design-choice-copy">{descriptions[item]}</span></button>)}</div>
      <div className="bday-selection-bar"><span><span className="bday-live-dot" />{english ? 'Your selection' : 'Tu selección'}<strong>{designNames[design]}</strong></span><button className="bday-button" type="button" onClick={() => setDialogOpen(true)}>{english ? 'Open this invitation' : 'Abrir esta invitación'}<ArrowUpRight size={18} aria-hidden="true" /></button></div><p className="bday-footnote">{english ? 'Nordra sample designs · We adapt the name, age, theme and details to your celebration' : 'Diseños de muestra de Nordra · Adaptamos nombre, edad, temática y detalles a tu celebración'}</p>
    </section>
    <section className="bday-experience-strip" aria-labelledby="bday-experience-title"><div className="site-shell bday-experience-inner"><div className="bday-experience-statement"><p className="bday-label">{english ? 'THE INVITATION IS JUST THE START' : 'LA INVITACIÓN ES EL COMIENZO'}</p><h2 id="bday-experience-title">{english ? 'One link' : 'Un enlace'}<br /><span>{english ? 'The whole plan' : 'Todo el plan'}</span></h2></div><div className="bday-feature-flow"><div><span className="bday-feature-symbol" aria-hidden="true">↗</span><div><h3>{english ? 'Send it on WhatsApp' : 'Mándala por WhatsApp'}</h3><p>{english ? 'Your invitation opens in the browser, with nothing to install.' : 'Tu invitación se abre en el navegador, sin instalar nada.'}</p></div></div><div><CalendarDays size={27} strokeWidth={1.3} aria-hidden="true" /><div><h3>{english ? 'Keep the details together' : 'Que nadie pierda el plan'}</h3><p>{english ? 'Date, time, location and dress code, in the same place.' : 'Fecha, hora, ubicación y vestimenta, en el mismo lugar.'}</p></div></div><div><Check size={28} strokeWidth={1.3} aria-hidden="true" /><div><h3>{english ? 'See who’s coming' : 'Entérate de quién sí va'}</h3><p>{english ? 'Replies arrive in your private guest panel.' : 'Las respuestas llegan a tu panel privado de invitados.'}</p></div></div></div></div></section>
    <section id="panel-cumpleanos" className="bday-panel-section site-shell" aria-labelledby="bday-panel-title"><div className="bday-panel-intro"><p className="bday-label">{english ? 'TRY BOTH SIDES' : 'PRUÉBALO DE LOS DOS LADOS'}</p><h2 id="bday-panel-title">{english ? 'From “count me in”' : 'Del «sí voy»'}<br /><span>{english ? 'to your list' : 'a tu lista'}</span></h2><p>{english ? 'Reply as a guest. See the result as the host. Aurora and Boreal include a private panel.' : 'Responde como invitado. Mira el resultado como anfitrión. Aurora y Boreal incluyen un panel privado.'}</p><div className="bday-inline-reply"><span className="bday-label">{english ? 'YOU’RE THE GUEST' : 'TÚ ERES EL INVITADO'}</span><ReplyForm {...reply} english={english} idPrefix="birthday-page" /></div><p className="bday-footnote">{english ? 'Sample data · Replies are not sent and reset on reload' : 'Datos de muestra · Las respuestas no se envían y se reinician al recargar'}</p></div><div className="bday-live-panel"><div className="bday-panel-top"><div><span className="bday-live-dot" />SOFÍA / 25<small>{english ? 'HOST VIEW' : 'VISTA DEL ANFITRIÓN'}</small></div><button type="button" onClick={reset}><RotateCcw size={14} aria-hidden="true" />{english ? 'Reset' : 'Reiniciar'}</button></div><GuestResponsePanel key={resetKey} rows={rows} english={english} downloadName="nordra-cumpleanos-muestra.csv" title={english ? 'The guest list' : 'La lista de la fiesta'} /></div></section>
    {dialogOpen && <InvitationDialog english={english} design={design} reply={reply} onClose={() => setDialogOpen(false)} />}
  </div>;
}

export function BirthdayClosing({ english }: { english: boolean }) {
  return <><section id="proceso" className="bday-process site-shell"><div><p className="bday-label">{english ? 'FROM YOUR IDEA TO YOUR GROUP CHAT' : 'DE TU IDEA AL GRUPO DE WHATSAPP'}</p><h2>{english ? 'You bring the plan' : 'Tú pones el plan'}<br /><span>{english ? 'We bring the design' : 'Nosotros, el diseño'}</span></h2></div><div className="bday-process-details"><ol><li><strong>{english ? 'Tell us what you’re planning' : 'Cuéntanos qué tienes en mente'}</strong><p>{english ? 'The date, your theme and how you want it to feel.' : 'La fecha, tu temática y cómo quieres que se sienta.'}</p></li><li><strong>{english ? 'We design it with you' : 'Lo diseñamos contigo'}</strong><p>{english ? 'We work on the invitation and review the details together.' : 'Trabajamos la invitación y revisamos los detalles juntos.'}</p></li><li><strong>{english ? 'Send it to your people' : 'Se la mandas a los tuyos'}</strong><p>{english ? 'Share the link and follow replies from your panel.' : 'Compartes el enlace y sigues las respuestas desde tu panel.'}</p></li></ol><p className="bday-footnote">{english ? 'Scope and dates agreed in advance · 50% deposit, balance after approval and before publishing' : 'Alcance y fechas acordados · 50% de anticipo y el resto al aprobar, antes de publicar'}</p></div></section><footer id="contacto" className="bday-footer"><div className="site-shell"><div className="bday-footer-main"><div><p className="bday-label">NORDRA STUDIO · BIRTHDAY INVITES</p><h2>{english ? 'Let’s make' : 'Ahora sí'}<br /><span>{english ? 'some plans' : 'arma el plan'}</span></h2></div><a className="bday-footer-cta" href={invitationQuote(english, english ? 'Birthdays' : 'Cumpleaños')} target="_blank" rel="noopener noreferrer"><ArrowUpRight size={38} strokeWidth={1.2} aria-hidden="true" /><span>{english ? 'Tell us about your birthday' : 'Cuéntanos de tu cumple'}</span></a></div><nav aria-label={english ? 'More invitations' : 'Más invitaciones'}><a href="/invitaciones.html">{english ? 'All invitations' : 'Todas las invitaciones'}</a><a href="/bodas.html">{english ? 'Weddings' : 'Bodas'}</a><a href="/eventos.html">{english ? 'Events' : 'Eventos'}</a><a href="/invitaciones.html#temporada">{english ? 'Seasonal' : 'Temporada'}</a></nav><div className="bday-footer-bottom"><span>© {new Date().getFullYear()} Nordra Studio · Monterrey, México</span><a href="/aviso-de-privacidad.html">{english ? 'Privacy (Spanish)' : 'Privacidad'}</a><a href="/terminos-del-servicio.html">{english ? 'Terms (Spanish)' : 'Términos'}</a><a href="#page-top">{english ? 'Top ↑' : 'Subir ↑'}</a></div></div></footer></>;
}
