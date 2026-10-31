import { useEffect, useState, type FormEvent } from 'react';
import { ArrowLeft, ArrowRight, Heart, LockKeyhole, LogOut } from 'lucide-react';
import { WeddingWorkspace } from './WeddingWorkspace';
import { weddingApi, weddingDate, weddingError, lastWeddingDay, type WeddingEvent } from '../lib/weddingClient';

type Session = {signedIn:boolean;email?:string;events?:WeddingEvent[]};
export function WeddingClient() {
  const [session,setSession]=useState<Session|null>(null);
  const [events,setEvents]=useState<WeddingEvent[]>([]);
  const [selected,setSelected]=useState<WeddingEvent|null>(null);
  const [error,setError]=useState('');
  const [busy,setBusy]=useState(false);
  const [token]=useState(()=>new URLSearchParams(location.hash.slice(1)).get('acceso') || '');
  const [accessType]=useState(()=>new URLSearchParams(location.hash.slice(1)).get('tipo') || 'magiclink');
  const [activating,setActivating]=useState(!!token);
  const adminId=new URLSearchParams(location.search).get('boda');
  const adminView=new URLSearchParams(location.search).get('admin')==='1';
  useEffect(()=>{
    document.title='Mi boda | Nordra Studio';
    if(token) history.replaceState(null,'',location.pathname+location.search);
    if(activating){setSession({signedIn:false});return;}
    let live=true;
    if(adminView && adminId) {
      weddingApi<{event:WeddingEvent}>({action:'load',eventId:adminId,admin:true}).then(data=>{if(live){setSelected(data.event);setSession({signedIn:true});}}).catch(reason=>{if(live){setError(weddingError(reason));setSession({signedIn:false});}});
    } else weddingApi<Session>({action:'session'}).then(data=>{if(live){setSession(data);setEvents(data.events || []);if(data.events?.length===1)setSelected(data.events[0]);}}).catch(reason=>{if(live){setError(weddingError(reason));setSession({signedIn:false});}});
    return ()=>{live=false;};
  // Setup mode is only consumed after the explicit password submission.
  }, [adminId,adminView,token]);
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault();const form=new FormData(event.currentTarget);
    if(activating && form.get('password')!==form.get('confirmation')){setError('Las contraseñas deben coincidir');return;}
    setBusy(true);setError('');
    try {
      await weddingApi({action:activating?'activate':'login',email:form.get('email'),password:form.get('password'),token,type:accessType});
      const data=await weddingApi<Session>({action:'session'});setActivating(false);setSession(data);setEvents(data.events || []);if(data.events?.length===1)setSelected(data.events[0]);
    } catch(reason){setError(weddingError(reason));}finally{setBusy(false);}
  }
  async function logout(){setBusy(true);setError('');try{await weddingApi({action:'logout'});setSelected(null);setSession({signedIn:false});setEvents([]);}catch(reason){setError(weddingError(reason));}finally{setBusy(false);}}
  if(selected)return <WeddingWorkspace key={selected.id} wedding={selected} adminView={adminView} onBack={adminView?undefined:()=>setSelected(null)} onSignOut={adminView?undefined:logout} />;
  return <div className="wedding-workspace wedding-client-entry">
    <header><a className="workspace-brand" href="/bodas">NORDRA<span>WEDDINGS</span></a>{session?.signedIn && <button className="workspace-button" onClick={()=>void logout()} disabled={busy}><LogOut size={16}/>Salir</button>}</header>
    <main className="client-card"><span className="workspace-monogram"><Heart size={34} strokeWidth={1}/></span><p className="workspace-eyebrow">UN ESPACIO PARA SU HISTORIA</p><h1>{activating?'Bienvenidos a su boda':session?.signedIn?'Sus celebraciones':'Su boda, en sus manos'}</h1>
      {!session?<p role="status">Preparando su espacio…</p>:session.signedIn?<><p>Elige la celebración que deseas organizar</p><div className="client-event-list">{events.map(event=><button key={event.id} onClick={()=>setSelected(event)}><span><strong>{event.couple}</strong><small>{weddingDate(event.eventDate)} · Disponible hasta {lastWeddingDay(event.expiresAt)}</small></span><ArrowRight size={18}/></button>)}</div>{!events.length && <p>No hay bodas activas asignadas a esta cuenta. Contacta a Nordra para revisar tu acceso</p>}</>:<><p>{activating?'Elige tu contraseña para entrar a tu panel privado':'Entra para organizar a sus personas favoritas'}</p><form onSubmit={submit}>
        {!activating && <label>Correo<input name="email" type="email" autoComplete="username" required maxLength={254}/></label>}
        <label>{activating?'Tu nueva contraseña':'Contraseña'}<input name="password" type="password" autoComplete={activating?'new-password':'current-password'} minLength={activating?12:1} maxLength={200} required/></label>
        {activating && <><small>Al menos 12 caracteres</small><label>Repite tu contraseña<input name="confirmation" type="password" autoComplete="new-password" minLength={12} maxLength={200} required/></label></>}
        <button className="workspace-button" disabled={busy}>{busy?'Preparando su espacio…':activating?'Activar mi cuenta':'Entrar a mi boda'}<ArrowRight size={17}/></button>
      </form><p className="client-help">¿Necesitas recuperar tu acceso? Solicita a Nordra un nuevo enlace de activación con el correo de tu cuenta</p></>}
      {error && <p role="alert" className="workspace-editor-error">{error}</p>}<p className="client-privacy"><LockKeyhole size={14}/>Acceso privado · Solo sus celebraciones</p>
    </main><a className="client-back" href={adminView?'/?panel=pagos&seccion=bodas':'/bodas'}><ArrowLeft size={15}/>{adminView?'Volver a administración':'Volver a Nordra'}</a>
  </div>;
}
