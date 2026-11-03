import { PanelExperience, reminderUrl } from '../lib/panelExperience';
import { useContext, useEffect, useMemo, useId, useRef, useState } from 'react';
import { ArrowRight, Check, ChevronLeft, ChevronRight, Clock3, Download, Plus, Search, Share2, X } from 'lucide-react';
import { invitationKindLabel, invitationLabel, invitationsCsv, summarizeInvitations, type WeddingInvitation } from '../lib/weddingInvitations';
import { invitationProgress, pendingTasks, selectDashboardInvitations, type GuestFilter, type GuestOrder } from '../lib/weddingDashboard';
import type { BorealState } from '../lib/weddingBoreal';
import type { ManagementAction, WeddingManagement } from '../lib/weddingManagement';
import { AttendanceBadge, WeddingRecordDetail, type RecordActions } from './WeddingRecordDetail';

function ResponseSummary({ invitation, english }: { invitation: WeddingInvitation; english: boolean }) {
  const progress = invitationProgress(invitation);
  return <span className="ledger-response"><span className="ledger-badges">{progress.yes > 0 && <AttendanceBadge status="yes" english={english}>{progress.yes} {english ? 'confirmed' : progress.yes === 1 ? 'confirmado' : 'confirmados'}</AttendanceBadge>}{progress.pending > 0 && <AttendanceBadge status="pending" english={english}>{progress.pending} {english ? 'pending' : progress.pending === 1 ? 'pendiente' : 'pendientes'}</AttendanceBadge>}{progress.no > 0 && <AttendanceBadge status="no" english={english}>{progress.no} {english ? 'not attending' : progress.no === 1 ? 'no asistirá' : 'no asistirán'}</AttendanceBadge>}</span>{invitation.people.length > 1 && <span className="ledger-completion">{progress.complete ? <Check size={13} aria-hidden="true" /> : <Clock3 size={13} aria-hidden="true" />}{progress.complete ? (english ? 'All replies received' : 'Respuestas completas') : (english ? 'Awaiting replies' : 'Faltan respuestas')}</span>}</span>;
}

export function WeddingInvitationPanel({ invitations, english, syncStatus, onTables, onAdd, onImport, onHistory, management, managementAction, changedIds, boreal, disabled = false, readOnly = false, ...actions }: RecordActions & { invitations: WeddingInvitation[]; english: boolean; syncStatus: React.ReactNode; onTables: () => void; onAdd: () => void; onImport:()=>void; onHistory:()=>void; management:WeddingManagement; managementAction:ManagementAction; changedIds:string[]; boreal?: BorealState }) {
  const id = useId();
  const [query, setQuery] = useState(''), [filter, setFilter] = useState<GuestFilter>('all'), [order, setOrder] = useState<GuestOrder>('name');
  const [page, setPage] = useState(1), [pageSize, setPageSize] = useState(10);
  const [selection, setSelection] = useState<{ id: string; sharing: boolean } | null>(null);
  const [more,setMore] = useState(false);
  const moreButton = useRef<HTMLButtonElement>(null);
  const toolbar = useRef<HTMLDivElement>(null);
  const config = useContext(PanelExperience), lang = english ? 1 : 0;
  const tasks = useMemo(()=>pendingTasks(invitations,management,boreal),[invitations,management,boreal]);
  const summary = useMemo(()=>summarizeInvitations(invitations),[invitations]);
  const visible = useMemo(()=>selectDashboardInvitations(invitations, query, filter, order, boreal, management),[invitations,query,filter,order,boreal,management]);
  const selected = invitations.find(item => item.id === selection?.id);
  if (selection && !selected) setSelection(null);
  const pages = Math.max(1, Math.ceil(visible.length / pageSize)), currentPage = Math.min(page, pages), start = (currentPage - 1) * pageSize;
  const counts = useMemo(()=>{
    let partial=0, unnamed=0, followup=0;
    for(const item of invitations){
      const p=invitationProgress(item);
      if(p.partial)partial++;
      if(p.unnamed)unnamed++;
      if(p.pending && management.delivery[item.id]?.sentAt)followup++;
    }
    return {partial,unnamed,followup,unsent:tasks.unsent,unseated:tasks.unseated};
  },[invitations,management,tasks]);
  const sheet = useRef<HTMLDialogElement>(null);
  useEffect(()=>{
    const desktop=matchMedia('(min-width:761px)');
    const resize=()=>{if(desktop.matches)sheet.current?.close();};
    desktop.addEventListener('change',resize);return ()=>desktop.removeEventListener('change',resize);
  },[]);
  const labels={unsent:english?'No recorded send':'Sin envío registrado', followup:english?'Sent with pending replies':'Enviadas con pendientes',partial:english?'Partial replies':'Respuestas parciales',unnamed:english?'Unnamed companions':'Acompañantes sin nombre',unseated:english?'Confirmed without a table':'Confirmados sin mesa'};
  function filters(){
    return <><label>{english?'Sort by':'Ordenar por'} <select value={order} onChange={event=>{setOrder(event.target.value as GuestOrder);setPage(1);}}><option value="name">{english?'Name A–Z':'Nombre A–Z'}</option><option value="recent">{english?'Recent activity':'Actividad reciente'}</option></select></label>
      <div className="ledger-quick-filters">{(Object.keys(labels) as (keyof typeof labels)[]).filter(key=>key!=='unseated'||boreal).map(key=><button key={key} aria-pressed={filter===key} onClick={()=>chooseFilter(filter===key?'all':key)}>{labels[key]} <span>{counts[key]}</span></button>)}
      {(filter!=='all'||query) && <button onClick={()=>{setQuery('');chooseFilter('all');}}>{english?'Clear':'Limpiar'} <X size={13}/></button>}</div></>;
  }
  function chooseFilter(value: GuestFilter) { setFilter(value); setPage(1); }
  function changePage(value: number) { setPage(value); toolbar.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' }); toolbar.current?.focus({ preventScroll: true }); }
  function download() {
    const url = URL.createObjectURL(new Blob([invitationsCsv(invitations, english)], { type: 'text/csv;charset=utf-8' }));
    const link = document.createElement('a'); link.href = url; link.download = config.identity.download+'-invitados.csv'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  const addButton = !readOnly && <button className="ledger-add" aria-label={english?'Add invitation':'Agregar invitación'} onClick={onAdd} disabled={disabled}><Plus size={17} aria-hidden="true" /><span>{english ? 'Add invitation' : 'Agregar invitación'}</span></button>;
  return <section className="guest-ledger" aria-labelledby="ledger-title">
    <div className="ledger-heading"><div><h2 id="ledger-title" tabIndex={-1}>{config.identity.guests[lang]}</h2>{syncStatus}<p>{summary.invitations} {english ? 'invitations' : 'invitaciones'}<span> · </span>{summary.total} {english ? 'places in invitations' : 'lugares en invitaciones'}</p></div><div><div className="panel-more" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setMore(false);}} onKeyDown={e=>{if(e.key==='Escape'){setMore(false);moreButton.current?.focus();}}}>
      <button ref={moreButton} aria-expanded={more} aria-controls={id+'more'} onClick={()=>setMore(!more)}>⋯ {english?'More':'Más'}</button>
      <div id={id+'more'} hidden={!more}><div className="ledger-secondary-tools">{!readOnly&&<button disabled={disabled} onClick={()=>{setMore(false);onImport();}}>{english?'Import list':'Importar lista'}</button>}<button onClick={()=>{setMore(false);onHistory();}}>{english?'Activity and recovery':'Historial y recuperación'}</button><button className="ledger-export" onClick={()=>{setMore(false);download();}} disabled={!invitations.length}><Download size={16} aria-hidden="true" />{english ? 'Download list' : 'Descargar lista'}</button></div></div></div>{addButton}</div></div>

    <aside className="panel-tasks" aria-label={config.tasks.title[lang]}><strong>{config.tasks.title[lang]}</strong>
      {(['followup','unsent','unseated'] as const).filter(key=>tasks[key]>0).map(key=><button key={key} onClick={()=>{if(key==='unseated')onTables();else {setQuery('');chooseFilter(key);}}}>{tasks[key]} {(tasks[key]===1?config.tasks.singular[key]:config.tasks[key])[lang]}</button>)}
      {!tasks.followup && !tasks.unsent && !tasks.unseated && <span>{config.tasks.done[lang]}</span>}
    </aside>
    <div className="ledger-stats" aria-label={english ? 'Filter by RSVP' : 'Filtrar por asistencia'}>{(['yes','pending','no'] as const).map(status => <button key={status} className={`ledger-stat is-${status}`} aria-pressed={filter === status} onClick={() => chooseFilter(filter === status ? 'all' : status)}><span className="ledger-stat-value">{summary[status]}</span><span>{status === 'yes' ? (english ? 'Confirmed people' : 'Personas confirmadas') : status === 'pending' ? (english ? 'Pending people' : 'Personas pendientes') : (english ? 'Not attending' : 'No asistirán')}</span><ArrowRight size={16} aria-hidden="true" /></button>)}</div>
    <div className="ledger-tools" ref={toolbar} tabIndex={-1}>
      <div className="ledger-controls"><label htmlFor={id+'search'}><span>{english ? 'Search by name' : 'Buscar por nombre'}</span><span className="ledger-search"><Search size={17} aria-hidden="true" /><input id={id+'search'} type="search" value={query} placeholder={english ? 'Guest or companion' : 'Invitado o acompañante'} onChange={event => { setQuery(event.target.value); setPage(1); }} /></span></label><button className="panel-filter-trigger" aria-haspopup="dialog" onClick={()=>sheet.current?.showModal()}>{english?'Filters':'Filtros'} ({filter==='all'?0:1})</button>{config.key!=='wedding' && <div className="occasion-add-slot">{addButton}</div>}</div>
      <div className="panel-desktop-filters">{filters()}</div>
    </div>
    <dialog ref={sheet} className="workspace-dialog panel-filter-sheet" aria-labelledby={id+'filter-title'}><h3 id={id+'filter-title'}>{english?'Filters':'Filtros'}</h3>{filters()}<button className="workspace-button" onClick={()=>sheet.current?.close()}>{english?'Show results':'Ver resultados'}</button></dialog>
    <div className="ledger-results"><p role="status">{visible.length ? `${start+1}–${Math.min(start+pageSize,visible.length)} ${english ? 'of' : 'de'} ` : ''}{visible.length} {english ? 'invitations' : 'invitaciones'}{filter !== 'all' && <span> · {english ? 'Groups stay together' : 'Se conserva cada grupo'}</span>}</p><label>{english ? 'Per page' : 'Por página'}<select aria-label={english ? 'Invitations per page' : 'Invitaciones por página'} value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10,25,50].map(size => <option key={size} value={size}>{size}</option>)}</select></label></div>
    <div className="ledger-columns" aria-hidden="true"><span>{english ? 'Invitation' : 'Invitación'}</span><span>{english ? 'Replies' : 'Respuestas'}</span><span>{english ? 'Actions' : 'Acciones'}</span></div>
    {visible.length ? <ul className="ledger-list" aria-label={english ? 'Guest invitations' : 'Invitaciones de invitados'}>{visible.slice(start,start+pageSize).map(invitation => <li className={`ledger-row${changedIds.includes(invitation.id)?' is-updated':''}`} key={invitation.id}>
      <button className="ledger-record" onClick={() => setSelection({ id: invitation.id, sharing: false })} aria-label={`${english ? 'View details for' : 'Ver detalle de'} ${invitationLabel(invitation)}`}><span className="ledger-identity"><span className="ledger-kind">{invitationKindLabel(invitation.kind,english)} · {invitation.people.length} {english ? (invitation.people.length === 1 ? 'place' : 'places') : invitation.people.length === 1 ? 'lugar' : 'lugares'}</span><span className="ledger-name">{invitationLabel(invitation)}</span><span className="ledger-mobile-people">{invitation.people.map(person => <span key={person.id}><span>{person.name || (english ? 'Companion to be named' : 'Acompañante por definir')}</span><AttendanceBadge status={person.attendance} english={english} /></span>)}</span></span><ResponseSummary invitation={invitation} english={english} /><ChevronRight className="ledger-record-arrow" size={17} aria-hidden="true" /></button>
      <div className="ledger-row-actions">{filter==='followup' && !readOnly && !disabled && invitation.link && <a href={reminderUrl(invitation,english,config)} target="_blank" rel="noopener noreferrer" onClick={()=>setSelection({id:invitation.id,sharing:true})}>{config.tasks.remind[lang]}</a>}{!readOnly && invitation.link ? <button onClick={() => setSelection({ id: invitation.id, sharing: true })} aria-label={`${english ? 'Share invitation for' : 'Compartir invitación de'} ${invitationLabel(invitation)}`}><Share2 size={15} aria-hidden="true" /><span>{english ? 'Share' : 'Compartir'}</span></button> : <button onClick={() => setSelection({ id: invitation.id, sharing: false })}>{english ? 'Details' : 'Detalle'}<ChevronRight size={15} /></button>}</div>
    </li>)}</ul> : <div className="ledger-empty"><Search size={24} aria-hidden="true" /><h3>{english ? 'No matching invitations' : 'No hay invitaciones que coincidan'}</h3><p>{invitations.length ? (english ? 'Try another name or clear the filters' : 'Prueba con otro nombre o limpia los filtros') : (english ? 'Add your first invitation to begin' : config.key==='wedding'?'Agreguen su primera invitación para comenzar':'Agrega tu primera invitación para comenzar')}</p></div>}
    {pages > 1 && <nav className="ledger-pagination" aria-label={english ? 'Invitation pages' : 'Páginas de invitaciones'}><button disabled={currentPage === 1} onClick={() => changePage(currentPage-1)}><ChevronLeft size={16} />{english ? 'Previous' : 'Anterior'}</button><span>{english ? 'Page' : 'Página'} {currentPage} {english ? 'of' : 'de'} {pages}</span><button disabled={currentPage === pages} onClick={() => changePage(currentPage+1)}>{english ? 'Next' : 'Siguiente'}<ChevronRight size={16} /></button></nav>}
    {selected && <WeddingRecordDetail management={management} managementAction={managementAction} key={selected.id} invitation={selected} english={english} boreal={boreal} sharing={!!selection?.sharing} disabled={disabled} readOnly={readOnly} {...actions} onClose={() => setSelection(null)} />}
  </section>;
}
