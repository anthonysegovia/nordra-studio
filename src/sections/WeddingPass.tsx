import { useEffect, useState } from 'react';
import { CalendarDays, Check, Download, Heart, MapPin, RefreshCw } from 'lucide-react';
import { invitationLabel, type WeddingInvitation } from '../lib/weddingInvitations';
import { weddingDate, weddingError } from '../lib/weddingClient';
import { borealPublicApi, readBorealCapability } from '../lib/weddingBorealPublic';

type Pass = { couple: string; eventDate: string; city: string; sample: boolean; expiresAt: string; invitation: Omit<WeddingInvitation, 'people'> & { people: (WeddingInvitation['people'][number] & { table: string; enteredAt: string | null })[] }; link: string };
export function WeddingPass() {
  const [capability] = useState(() => readBorealCapability('pase'));
  const [data, setData] = useState<Pass | null>(null), [qr, setQr] = useState(''), [error, setError] = useState(''), [loading, setLoading] = useState(true), [retry, setRetry] = useState(0);
  useEffect(() => {
    let live = true; setLoading(true); setError('');
    const load = async () => {
      try {
        const result = await borealPublicApi<Pass>(capability, { action: 'public-pass' });
        const { default: QRCode } = await import('qrcode');
        const image = await QRCode.toDataURL(result.link, { width: 720, margin: 4, errorCorrectionLevel: 'M', color: { dark: '#302a25', light: '#ffffff' } });
        if (live) { setData(result); setQr(image); document.title = `Su pase · ${result.couple}`; }
      } catch (reason) { if (live) { setError(weddingError(reason)); setData(null); setQr(''); } }
      finally { if (live) setLoading(false); }
    };
    void load(); const focus = () => { void load(); }; window.addEventListener('focus', focus);
    return () => { live = false; window.removeEventListener('focus', focus); };
  }, [capability, retry]);
  useEffect(() => { const changed = () => location.reload(); window.addEventListener('hashchange', changed); return () => window.removeEventListener('hashchange', changed); }, []);
  const valid = data?.invitation.people.some(person => person.attendance === 'yes');
  return <div className="wedding-workspace boreal-pass-page"><header><a className="workspace-brand" href="/bodas.html">NORDRA<span>WEDDINGS</span></a></header><main className="boreal-pass-card"><Heart size={26} strokeWidth={1}/><p className="workspace-eyebrow">SU PASE PARA CELEBRAR</p><h1>{data?.couple || 'Un día para recordar'}</h1>{data && <><p className="boreal-pass-date"><CalendarDays size={15}/>{weddingDate(data.eventDate)}{data.city && <><MapPin size={15}/>{data.city}</>}</p><div className="boreal-pass-recipient"><small>CON CARIÑO, PARA</small><h2>{invitationLabel(data.invitation)}</h2></div>{valid && qr ? <><img className="boreal-pass-qr" src={qr} alt="Código QR de su pase personal" width={280} height={280}/><p>Muestra este pase al llegar<br/><span>Cada persona registra su entrada por separado</span></p></> : <p className="boreal-pass-pending">Su pase estará disponible al confirmar la asistencia desde la invitación personal</p>}<div className="boreal-pass-people">{data.invitation.people.map(person => <div key={person.id}><strong>{person.name || 'Acompañante por definir'}</strong><span>{person.attendance === 'yes' ? person.enteredAt ? <><Check size={14}/>Entrada registrada</> : person.table || 'Mesa por asignar' : person.attendance === 'no' ? 'No asistirá' : 'Por confirmar'}</span></div>)}</div>{valid && qr && <a className="workspace-button" href={qr} download="pase-boda.png"><Download size={16}/>Guardar QR</a>}{data.sample && <small className="boreal-pass-sample">Pase de muestra · No corresponde a un evento real</small>}</>}{loading && !data && <p role="status">Preparando su pase…</p>}{error && <><p role="alert" className="boreal-error">{error}</p><button className="workspace-button" disabled={loading} onClick={() => setRetry(value => value + 1)}><RefreshCw size={16}/>Volver a cargar</button></>}</main><footer>Hecho para su historia · Nordra Studio</footer></div>;
}
