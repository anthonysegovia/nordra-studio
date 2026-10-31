import { useEffect, useState, type FormEvent } from 'react';
import { ArrowUpRight, CalendarDays, Check, Heart, MapPin, QrCode } from 'lucide-react';
import { weddingApi, weddingDate, weddingError, type WeddingEvent } from '../lib/weddingClient';
import { invitationLabel, type WeddingInvitation, type WeddingPerson, type WeddingAttendance } from '../lib/weddingInvitations';

type Reply={event:WeddingEvent;invitation:WeddingInvitation;repliesClosed:boolean};
export function PrivateWeddingInvitation() {
  const [capability]=useState(()=>{const [eventId,id,token]=(new URLSearchParams(location.hash.slice(1)).get('boda') || '').split('~');return {eventId,id,token};});
  const [data,setData]=useState<Reply|null>(null),[people,setPeople]=useState<WeddingPerson[]>([]);
  const [error,setError]=useState(''),[loading,setLoading]=useState(true),[busy,setBusy]=useState(false),[saved,setSaved]=useState(false),[stale,setStale]=useState(false);
  async function load(){setLoading(true);setError('');try{const result=await weddingApi<Reply>({action:'guest-load',...capability});setData(result);setPeople(result.invitation.people);setStale(false);document.title=`${result.event.couple} · Nuestra boda`;}catch(reason){setError(weddingError(reason));}finally{setLoading(false);}}
  useEffect(()=>{void load();const change=()=>location.reload();window.addEventListener('hashchange',change);return()=>window.removeEventListener('hashchange',change);},[]);
  function update(id:string,patch:Partial<WeddingPerson>){setPeople(current=>current.map(person=>person.id===id?{...person,...patch}:person));setSaved(false);}
  async function submit(event:FormEvent){event.preventDefault();if(!data)return;setBusy(true);setError('');try{const result=await weddingApi<Reply>({action:'guest-reply',...capability,people,updatedAt:data.invitation.updated_at});setData(result);setPeople(result.invitation.people);setSaved(true);}catch(reason){setError(weddingError(reason));if(['response_changed','replies_closed','link_unavailable'].includes((reason as Error).message))setStale(true);}finally{setBusy(false);}}
  return <div className="wedding-workspace real-wedding-invitation"><header><a className="workspace-brand" href="/bodas">NORDRA<span>WEDDINGS</span></a></header>
    <main>{loading && !data?<p className="personal-loading" role="status">Preparando tu invitación…</p>:data?<>
      <section className={`real-invitation-hero${data.event.coverPath?' has-photo':''}`}>
        {data.event.coverPath && <img src={data.event.coverPath} alt={`La boda de ${data.event.couple}`}/>}
        <div><span className="real-invitation-heart"><Heart size={28} strokeWidth={1}/></span><p className="workspace-eyebrow">CON AMOR, TE INVITAMOS A NUESTRA BODA</p><h1>{data.event.couple}</h1><p className="personal-recipient">Una invitación para <strong>{invitationLabel(data.invitation)}</strong></p><p className="real-invitation-date"><CalendarDays size={16}/>{weddingDate(data.event.eventDate)}</p>{data.event.city && <p className="real-invitation-date"><MapPin size={16}/>{data.event.city}</p>}{data.event.invitationPath && <a className="workspace-button" href={data.event.invitationPath} target="_blank" rel="noopener noreferrer">Descubre nuestra invitación<ArrowUpRight size={16}/></a>}</div>
      </section>
      <section className="real-invitation-response" aria-labelledby="reply-title"><p className="workspace-eyebrow">SU PRESENCIA ES PARTE DE NUESTRA HISTORIA</p><h2 id="reply-title">{data.invitation.people.length===1?'Un lugar para ti':'Un lugar para ustedes'}</h2><p>{data.invitation.people.length===1?'Hemos reservado un lugar para acompañarnos':'Hemos reservado dos lugares para acompañarnos'}</p>
        {data.repliesClosed?<p className="personal-closed">Las confirmaciones están cerradas · Gracias por ser parte de nuestra historia</p>:<form onSubmit={submit}><fieldset className="real-response-fields" disabled={busy || stale}>
          {people.map((person,index)=><div className="real-response-person" key={person.id}><p className="workspace-eyebrow">{index===0?'INVITADO PRINCIPAL':data.invitation.kind==='couple'?'PAREJA':'ACOMPAÑANTE'}</p>{data.invitation.kind==='plusOne' && index===1?<label>Nombre de tu acompañante<input minLength={2} maxLength={100} value={person.name} required={person.attendance==='yes'} placeholder="Por definir" onChange={e=>update(person.id,{name:e.target.value})}/></label>:<h3>{person.name}</h3>}<label>Asistencia<select aria-label={`Asistencia de ${person.name || 'tu acompañante'}`} value={person.attendance} onChange={e=>update(person.id,{attendance:e.target.value as WeddingAttendance})}><option value="pending">Por confirmar</option><option value="yes">Sí asistiré</option><option value="no">No podré asistir</option></select></label></div>)}
        </fieldset><button className="workspace-button" disabled={busy || stale}>{busy?'Guardando tu respuesta…':saved?'Actualizar mi respuesta':'Confirmar asistencia'}<Check size={17}/></button></form>}
        {saved && <p className="real-reply-success" role="status"><Check size={18}/>Gracias, los novios ya pueden ver tu respuesta</p>}
        {data.invitation.passLink && data.invitation.people.some(person => person.attendance === 'yes') && <a className="workspace-button boreal-guest-pass-link" href={data.invitation.passLink} target="_blank" rel="noopener noreferrer"><QrCode size={18}/>Ver mi pase QR<ArrowUpRight size={15}/></a>}
        {data.event.replyUntil && <small>Confirma antes del {weddingDate(data.event.replyUntil)}</small>}
      </section>
    </>:<section className="client-card"><Heart size={28}/><h1>Tu invitación personal</h1></section>}
      {error && <div className="real-reply-error"><p role="alert">{error}</p><button className="workspace-button" disabled={loading} onClick={()=>void load()}>Volver a cargar</button></div>}
    </main><footer>Hecho para su historia · Nordra Studio</footer>
  </div>;
}
