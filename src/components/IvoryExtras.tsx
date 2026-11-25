import { useEffect, useId, useRef, useState } from 'react';
import type React from 'react';
import { CalendarPlus, Clock3, Plus } from 'lucide-react';

// Client configuration: leave sample destinations empty; never route samples to a real service.
export const ivoryExtrasConfig: { giftsHref: string | null; albumHref: string | null; albumOpensAt: string } = {
  giftsHref: null, albumHref: null, albumOpensAt: '2027-06-20T00:00:00-06:00',
};
const moments = [
  ['2019', 'Ella llegó tarde a una cena de amigos. Él le había guardado el último tamal'],
  ['2021', 'Primer departamento en la Narvarte: un colchón en el piso y dos sillas que no combinaban'],
  ['2024', 'Oaxaca, una lluvia que no salía en el pronóstico y un «¿te casas conmigo?» empapado'],
  ['2027', 'Ciudad de México, 19 de junio. Aquí entras tú'],
];
export function IvoryStory() {
  return <section id="iv-story" className="iv-story iv-extra iv-wrap" tabIndex={-1} aria-labelledby="iv-story-title"><p className="iv-kicker">ANTES DE ESTA CARTA</p><h2 id="iv-story-title">Ocho años en <em>cuatro líneas</em></h2><ol className="iv-story-line">{moments.map(([year, text], index) => <li key={year} style={{ '--i': index } as React.CSSProperties}><time dateTime={year}>{year}</time><p>{text}</p></li>)}</ol></section>;
}

export function IvoryTravelNotes() {
  return <div className="iv-travel-notes"><div><h3>Cómo llegar</h3><p>Es sábado en la Ciudad de México: sal con una hora de margen. Hay valet en la entrada. La dirección exacta llegará a este mismo enlace cuando la sede esté confirmada</p></div><div><h3>Dónde quedarte</h3><p>Si vienes de fuera, apartamos habitaciones con tarifa especial cerca de la sede. Escríbenos y te pasamos el código</p></div></div>;
}

function useMinuteClock() {
  const [now, setNow] = useState(Date.now);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 60_000); return () => window.clearInterval(timer); }, []);
  return now;
}
export function ivoryCountdown(now: number) {
  const wedding = Date.parse('2027-06-19T17:00:00-06:00');
  const end = Date.parse('2027-06-20T00:00:00-06:00');
  if (now >= end) return { message: 'Ya nos casamos. Gracias por venir' };
  if (now >= wedding) return { message: 'Hoy es el día' };
  const minutes = Math.ceil((wedding - now) / 60_000);
  return { days: Math.floor(minutes / 1440), hours: Math.floor(minutes % 1440 / 60), minutes: minutes % 60 };
}
// Counts the days up from zero the first time the countdown is seen.
function useCountUp(target: number | undefined) {
  const ref = useRef<HTMLDivElement>(null);
  const [value, setValue] = useState<number | undefined>(target);
  const started = useRef(false);
  useEffect(() => {
    const element = ref.current;
    if (target === undefined || !element || started.current) { setValue(target); return; }
    if (!window.IntersectionObserver || matchMedia('(prefers-reduced-motion: reduce)').matches || element.closest('.iv-paused')) { setValue(target); return; }
    setValue(0);
    let frame = 0;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect(); started.current = true;
      const start = performance.now();
      const step = (time: number) => {
        const progress = Math.min(1, (time - start) / 1300);
        setValue(Math.round(target * (1 - Math.pow(1 - progress, 3))));
        if (progress < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    }, { threshold: .6 });
    observer.observe(element);
    return () => { observer.disconnect(); cancelAnimationFrame(frame); };
  }, [target]);
  return [ref, value] as const;
}
export function IvoryCalendar() {
  const countdown = ivoryCountdown(useMinuteClock());
  const [countRef, shownDays] = useCountUp('days' in countdown ? countdown.days : undefined);
  const google = 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Boda%20de%20Valentina%20y%20Sebasti%C3%A1n&dates=20270619T230000Z%2F20270620T070000Z&location=Ciudad%20de%20M%C3%A9xico';
  return <div className="iv-calendar">
    <div ref={countRef} aria-live="off" className="iv-countdown"><span className="iv-sr-only">Boda de Valentina y Sebastián, 19 de junio de 2027 a las 17:00, Ciudad de México</span><p aria-hidden="true">{'message' in countdown ? countdown.message : <>Faltan <strong>{shownDays}</strong> días, <span key={`${countdown.hours}:${countdown.minutes}`} className="iv-countdown-tick">{countdown.hours} h y {countdown.minutes} min</span></>}</p></div>
    <div className="iv-calendar-actions"><a className="iv-outline-button" href={google} target="_blank" rel="noopener noreferrer"><CalendarPlus size={17} aria-hidden="true" />Agregar a Google Calendar<span className="iv-sr-only"> (abre en otra pestaña)</span></a><a className="iv-outline-button" href="/invitaciones/valentina-y-sebastian/fecha.ics" download="valentina-y-sebastian.ics">Apple u Outlook</a></div>
    <p className="iv-calendar-note">19 de junio de 2027 · Horarios de muestra</p>
  </div>;
}
const questions = [
  ['Tu invitación', 'En tu enlace personal encontrarás los lugares reservados para ti. Si incluye acompañante, podrás escribir su nombre y confirmar a cada persona por separado.'],
  ['Si cambian tus planes', 'Vuelve al mismo enlace para actualizar tu respuesta. Así podremos preparar cada lugar con cuidado.'],
  ['¿Pueden ir niños?', 'La noche es solo para adultos. Los sobrinos siguen negociando'],
  ['¿A qué hora termina?', 'La música se apaga a la 1:00. Los tacos, un poco después'],
  ['¿Y si llego tarde?', 'Entra sin pena. Alguien te espera en la puerta para llevarte a tu mesa'],
];
function Question({ title, text }: { title: string; text: string }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return <div className="iv-question"><h4><button aria-expanded={open} aria-controls={id} onClick={() => setOpen(value => !value)}>{title}<Plus size={17} aria-hidden="true" /></button></h4><div id={id} className="iv-question-answer" data-open={open} aria-hidden={!open} inert={!open}><div><p>{text}</p></div></div></div>;
}
export function IvoryQuestions() {
  return <div className="iv-invite-notes"><h3>Lo que nos han preguntado</h3>{questions.map(([title, text]) => <Question key={title} title={title} text={text} />)}</div>;
}
export function IvoryGifts() {
  const [sample, setSample] = useState(false);
  return <section id="iv-gifts" className="iv-gifts iv-extra" tabIndex={-1} aria-labelledby="iv-gifts-title"><div className="iv-wrap iv-gifts-layout"><div><p className="iv-kicker">MESA DE REGALOS</p><h2 id="iv-gifts-title">Seguimos con las <em>dos sillas</em></h2><p className="iv-extra-copy">Si quieres ayudarnos a amueblar lo que sigue, aquí está la lista. Si prefieres sobre, habrá un buzón en la entrada</p><div className="iv-gift-action">{ivoryExtrasConfig.giftsHref ? <a className="iv-outline-button" href={ivoryExtrasConfig.giftsHref} target="_blank" rel="noopener noreferrer">Ver la lista ↗<span className="iv-sr-only"> (abre en otra pestaña)</span></a> : <button className="iv-outline-button" onClick={() => setSample(true)}>Ver la lista ↗</button>}<span className="iv-gift-message" aria-live="polite">{sample && <span>Enlace de muestra</span>}</span></div></div><div className="iv-envelope" aria-hidden="true"><div className="iv-envelope-flap" /><div className="iv-envelope-card">Valentina <em>&</em> Sebastián</div><div className="iv-envelope-front" /><span className="iv-envelope-seal">V&S</span></div></div></section>;
}
export function IvoryAlbum() {
  const now = useMinuteClock();
  const open = now >= Date.parse(ivoryExtrasConfig.albumOpensAt);
  const [sample, setSample] = useState(false);
  return <section id="iv-album" className="iv-album iv-extra iv-wrap" tabIndex={-1} aria-labelledby="iv-album-title"><p className="iv-kicker">DESPUÉS DE LA FIESTA</p><h2 id="iv-album-title">El fotógrafo no va a ver <em>todo</em></h2><p className="iv-extra-copy">Lo que captures desde tu mesa, súbelo aquí al día siguiente</p>{open && ivoryExtrasConfig.albumHref ? <a className="iv-outline-button" href={ivoryExtrasConfig.albumHref} target="_blank" rel="noopener noreferrer">Abrir el álbum<span className="iv-sr-only"> (abre en otra pestaña)</span></a> : <button className="iv-outline-button iv-album-locked" aria-disabled={!open} onClick={() => { if (open) setSample(true); }}><Clock3 size={17} strokeWidth={1.3} aria-hidden="true" />{open ? 'Abrir el álbum' : 'Se abre el 20 de junio'}</button>}<span className="iv-gift-message" aria-live="polite">{sample && 'Enlace de muestra'}</span></section>;
}
