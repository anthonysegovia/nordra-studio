import { usePanelTerms, useZoneText } from '../lib/panelTerms';
import {useContext} from 'react';
import {PanelExperience} from '../lib/panelExperience';
import { SeatGuests } from './SeatGuests';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, ChevronDown, Download, Pencil, Plus, Search, Trash2, UsersRound, X } from 'lucide-react';
import { invitationLabel, type WeddingInvitation } from '../lib/weddingInvitations';
import { downloadBoreal, type BorealAction, type BorealState, type WeddingTable } from '../lib/weddingBoreal';
import { WeddingSeatingPlan } from './WeddingSeatingPlan';
import { weddingError } from '../lib/weddingClient';

type Props = { invitations: WeddingInvitation[]; state: BorealState; action: BorealAction; english: boolean; disabled: boolean; readOnly: boolean; couple:string };
type Edit = { table: WeddingTable; isNew: boolean; deleting?: boolean };
export function WeddingTables({ invitations, state, action, english, disabled, readOnly, couple }: Props) {
  const text=usePanelTerms(english);
  const z = useZoneText();
  const config=useContext(PanelExperience);
  const [adding,setAdding]=useState('');
  const target=state.tables.find(table=>table.id===adding);
  const [moving,setMoving]=useState('');
  const [menuSpace,setMenuSpace]=useState({up:false,height:280});
  useEffect(()=>{
    if(!moving)return;
    const close=(event:PointerEvent)=>{if(!(event.target instanceof Element)||!event.target.closest('.seat-move'))setMoving('');};
    document.addEventListener('pointerdown',close);
    return()=>document.removeEventListener('pointerdown',close);
  },[moving]);
  function openSeats(id:string,button:HTMLButtonElement){
    const box=button.getBoundingClientRect();
    const navigation=document.querySelector<HTMLElement>('.workspace-navigation');
    const edge=navigation && getComputedStyle(navigation).position==='fixed' ? navigation.getBoundingClientRect().top : window.innerHeight;
    const bottom=edge-box.bottom-12, top=box.top-20;
    const up=bottom<Math.min(280,(state.tables.length+1)*44+10)&&top>bottom;
    setMenuSpace({up,height:Math.max(44,Math.min(280,up?top:bottom))});
    setMoving(moving===id?'':id);
  }
  const [showPlan,setShowPlan]=useState(false);
  const [query, setQuery] = useState(''), [filter, setFilter] = useState('all'), [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [editing, setEditing] = useState<Edit | null>(null), [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState('');
  const heading = useRef<HTMLHeadingElement>(null);
  const people = invitations.flatMap(invitation => invitation.people);
  const eligible = people.filter(person => person.attendance !== 'no');
  const assigned = eligible.filter(person => state.seats[person.id]).length;
  const confirmed = eligible.filter(person => person.attendance === 'yes');
  const selectedTable = state.tables.find(table => table.id === filter);
  const normalized = (value: string) => value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  const visible = invitations.filter(invitation => invitation.people.some(person => person.attendance !== 'no' && normalized(person.name || invitation.people[0].name).includes(normalized(query)) && (filter === 'all' || (filter === 'unassigned' ? !state.seats[person.id] : state.seats[person.id] === filter))));
  const pages = Math.max(1, Math.ceil(visible.length / pageSize)), currentPage = Math.min(page, pages);
  const locked = disabled || readOnly || busy;
  async function assign(personIds: string[], tableId: string) {
    setBusy(true); setError(''); setNotice('');
    try { await action({ action: 'seat-assign', personIds, tableId: tableId || null }); setNotice(english ? 'Seating updated' : 'Distribución actualizada'); }
    catch (reason) { setError(z(weddingError(reason))); }
    finally { setBusy(false); }
  }
  function chooseFilter(value: string) { setFilter(value); setPage(1); }
  return <section className="boreal-section boreal-tables" aria-labelledby="tables-title">
    <div className="boreal-heading"><div><p className="workspace-eyebrow">{text('seatingHeading')}</p><h2 id="tables-title" ref={heading} tabIndex={-1}>{text('tablesTitle')}</h2><p>{config.key==='wedding' && !english ? 'Junten a sus personas favoritas' : text('tableIntro')}</p></div><div className="boreal-heading-actions"><button className="boreal-quiet" onClick={() => downloadBoreal(invitations, state, english, config.identity.download, z(english ? 'Table' : 'Mesa'))} disabled={disabled}><Download size={16}/>{english ? 'Download' : 'Descargar'}</button><button className="workspace-button" disabled={locked} onClick={() => setEditing({ isNew: true, table: { id: `table-${crypto.randomUUID()}`, name: nextTableName(state.tables, z(english ? 'Table' : 'Mesa')), capacity: 8 } })}><Plus size={17}/>{z(english ? 'New table' : 'Nueva mesa')}</button></div></div>
    <div className="boreal-summary"><div><strong key={state.tables.length}>{state.tables.length}</strong><span>{z(english ? 'Tables' : 'Mesas')}</span></div><div><strong key={assigned}>{assigned}<small> / {eligible.length}</small></strong><span>{english ? 'Places assigned' : 'Lugares distribuidos'}</span></div><div><strong key={confirmed.filter(person => !state.seats[person.id]).length}>{confirmed.filter(person => !state.seats[person.id]).length}</strong><span>{text('summaryUnseated')}</span></div></div>
    <div className="boreal-plan-entry"><button onClick={()=>setShowPlan(true)}>{z(english?'View seating arrangement':'Ver distribución de mesas')}</button><span>{z(english?'Names, capacity and a printable version':'Nombres, capacidad y versión para imprimir')}</span></div>
    <div className="boreal-table-grid">
      {state.tables.map(table => {
        const members = eligible.filter(person => state.seats[person.id] === table.id);
        return <article className={`boreal-table-card${filter === table.id ? ' is-selected' : ''}`} key={table.id}>
          <button className="boreal-table-select" aria-pressed={filter === table.id} onClick={() => chooseFilter(filter === table.id ? 'all' : table.id)}>
            {config.key === 'wedding' ? <span className="boreal-table-drawing" aria-hidden="true"><span className="boreal-table-center"><UsersRound size={24} strokeWidth={1}/><span>{members.length}<small> / {table.capacity}</small></span></span>{Array.from({ length: table.capacity }, (_, index) => <i key={index} className={index < members.length ? members[index].attendance === 'yes' ? 'is-filled' : 'is-reserved' : ''} style={{ transform: `rotate(${index * 360 / table.capacity}deg) translateY(-67px)` }}/>)}</span> : <span className="occasion-seats" aria-hidden="true" style={{ '--seats': Math.max(...state.tables.map(item => item.capacity)) } as React.CSSProperties}>{Array.from({ length: table.capacity }, (_, index) => <i key={index} className={index < members.length ? members[index].attendance === 'yes' ? 'is-filled' : 'is-reserved' : ''}/>)}</span>}
            <h3>{table.name}</h3><p>{table.capacity - members.length} {english ? 'places available' : 'lugares disponibles'}</p>{config.key !== 'wedding' && <span className="occasion-members">{members.length ? <b>{members.map(person => person.name || (english ? 'Companion' : 'Acompañante')).join(', ')}</b> : text('ready')}</span>}
          </button>
          <div className="boreal-table-actions"><button className="boreal-quiet" disabled={locked||members.length>=table.capacity} onClick={()=>setAdding(table.id)}>{text('add')}</button><button className="boreal-quiet" disabled={locked} aria-label={`${z(english ? 'Edit table' : 'Editar mesa')} ${table.name}`} onClick={() => setEditing({ table, isNew: false })}><Pencil size={14}/>{english ? 'Edit' : 'Editar'}</button><button className="boreal-icon" disabled={locked} aria-label={`${z(english ? 'Delete table' : 'Eliminar mesa')} ${table.name}`} onClick={() => setEditing({ table, isNew: false, deleting: true })}><Trash2 size={15}/></button></div>
        </article>;
      })}
      {!state.tables.length && <div className="boreal-empty"><UsersRound size={32} strokeWidth={1}/><h3>{text('firstTable')}</h3><p>{english ? 'Give it a name and choose how many places it has' : config.key==='wedding'?'Elijan un nombre y cuántos lugares tendrá':'Elige un nombre y cuántos lugares tendrá'}</p></div>}
    </div>
    <p className="boreal-legend"><span><i className="is-filled"/>{english ? 'Confirmed' : 'Confirmado'}</span><span><i className="is-reserved"/>{english ? 'Reserved · reply pending' : 'Reservado · por confirmar'}</span></p>
    <div className="boreal-assignment-panel">
      <div className="boreal-list-heading"><h3>{selectedTable ? selectedTable.name : text('places')}</h3><span>{z(english ? 'Declined invitations are not seated' : 'Quienes no asistirán quedan fuera de las mesas')}</span></div>
      <div className="boreal-filters"><label><span>{text('find')}</span><span className="boreal-search"><Search size={16}/><input type="search" value={query} placeholder={english ? 'Name or companion' : 'Nombre o acompañante'} onChange={event => { setQuery(event.target.value); setPage(1); }}/></span></label><label><span>{english ? 'Show' : 'Mostrar'}</span><select value={selectedTable ? filter : filter === 'unassigned' ? filter : 'all'} onChange={event => chooseFilter(event.target.value)}><option value="all">{text('everyone')}</option><option value="unassigned">{z(english ? 'Without a table' : 'Sin mesa')}</option>{state.tables.map(table => <option key={table.id} value={table.id}>{table.name}</option>)}</select></label></div>
      <div className="boreal-feedback" aria-live="polite">{error ? <p role="alert" className="boreal-error">{error}</p> : notice ? <p><Check size={15}/>{notice}</p> : null}</div>
      <div className="boreal-list-meta"><p role="status">{visible.length} {english ? 'invitations' : 'invitaciones'}</p><label>{english ? 'Per page' : 'Por página'}<select aria-label={z(english ? 'Seating invitations per page' : 'Invitaciones por página en mesas')} value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10,25,50].map(size => <option key={size} value={size}>{size}</option>)}</select></label></div>{visible.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(invitation => {
        const group = invitation.people.filter(person => person.attendance !== 'no');
        return <div className={`boreal-seating-group${group.some(person=>person.id===moving)?' has-seat-menu':''}`} key={invitation.id}>
          {invitation.people.length>1 && <div className="boreal-group-heading"><span>{invitationLabel(invitation)}</span></div>}
          {group.map(person => <div className="boreal-seating-person" key={person.id}><div><strong>{person.name || (english ? 'Companion to be named' : 'Acompañante por definir')}</strong><small>{person.attendance === 'yes' ? (english ? 'Confirmed' : 'Confirmado') : (english ? 'Reply pending' : 'Por confirmar')}</small></div><div className="seat-move" onBlur={e=>{if(!e.currentTarget.contains(e.relatedTarget))setMoving('')}} onKeyDown={e=>{if(e.key==='Escape'){setMoving('');e.currentTarget.querySelector('button')?.focus()}}}>
              <button aria-expanded={moving===person.id} disabled={locked} onClick={event=>openSeats(person.id,event.currentTarget)}>{z(english?'Table':'Mesa')}: {state.tables.find(t=>t.id===state.seats[person.id])?.name||(z(english?'Unassigned':'Sin mesa'))} ▾</button>
              {moving===person.id && <div className={`seat-options${menuSpace.up?' opens-up':''}`} style={{maxHeight:menuSpace.height}}>{[{id:'',name:z(english?'No table':'Sin mesa'),capacity:Infinity},...state.tables].map(t=><button key={t.id} aria-current={t.id===(state.seats[person.id]||'')?'true':undefined} disabled={locked||t.id===(state.seats[person.id]||'')||Object.values(state.seats).filter(id=>id===t.id).length>=t.capacity} onClick={()=>{setMoving('');void assign([person.id],t.id)}}>{t.name}</button>)}</div>}
            </div></div>)}
        </div>;
      })}
      {!visible.length && <p className="boreal-empty-note">{text('emptyView')}</p>}
      {pages > 1 && <div className="boreal-pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{english ? 'Previous' : 'Anterior'}</button><span>{currentPage} / {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>{english ? 'Next' : 'Siguiente'}<ChevronDown size={14}/></button></div>}
    </div>
    {target && <SeatGuests table={target} state={state} invitations={invitations} action={action} english={english} disabled={locked} onClose={()=>setAdding('')}/>}
    {showPlan&&<WeddingSeatingPlan invitations={invitations} state={state} action={action} english={english} couple={couple} disabled={disabled} readOnly={readOnly} onClose={()=>setShowPlan(false)}/>}
    {editing && <TableEditor edit={editing} english={english} disabled={disabled || readOnly} occupied={Object.values(state.seats).filter(id => id === editing.table.id).length} onClose={() => setEditing(null)} onSave={async body => { await action(body); setEditing(null); setNotice(z(english ? 'Tables updated' : 'Mesas actualizadas')); }} fallback={heading}/>} 
  </section>;
}

// New tables start numbered; the name stays editable and never repeats an existing one.
function nextTableName(tables: WeddingTable[], label: string) {
  const used = new Set(tables.map(table => table.name.trim().toLowerCase()));
  let number = tables.length + 1;
  while (used.has(`${label} ${number}`.toLowerCase())) number += 1;
  return `${label} ${number}`;
}

function TableEditor({ edit, english, disabled, occupied, onClose, onSave, fallback }: { edit: Edit; english: boolean; disabled: boolean; occupied: number; onClose: () => void; onSave: (body: Record<string, unknown>) => Promise<void>; fallback: React.RefObject<HTMLHeadingElement | null> }) {
  const text=usePanelTerms(english);
  const z = useZoneText();
  const dialog = useRef<HTMLDialogElement>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { const previous = document.activeElement as HTMLElement; dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input')?.focus(); return () => { if (previous?.isConnected) previous.focus(); else fallback.current?.focus(); }; }, [fallback]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError('');
    try { await onSave(edit.deleting ? { action: 'table-delete', id: edit.table.id } : { action: 'table-save', edit: !edit.isNew, previous: edit.table, table: { id: edit.table.id, name: form.get('name'), capacity: Number(form.get('capacity')) } }); }
    catch (reason) { setError(z(weddingError(reason))); setBusy(false); }
  }
  return <dialog ref={dialog} className="workspace-dialog boreal-table-editor" aria-labelledby="table-editor-title" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }}><div className="workspace-dialog-inner"><button className="boreal-dialog-close boreal-icon" aria-label={english ? 'Close' : 'Cerrar'} disabled={busy} onClick={onClose}><X size={20}/></button><p className="workspace-eyebrow">{english ? 'MADE TO GATHER' : 'HECHO PARA REUNIRSE'}</p><h2 id="table-editor-title">{edit.deleting ? (z(english ? 'Remove this table' : 'Eliminar esta mesa')) : edit.isNew ? (z(english ? 'A new table' : 'Una nueva mesa')) : (z(english ? 'Edit table' : 'Editar mesa'))}</h2><form onSubmit={submit}>{edit.deleting ? <p>{edit.table.name} · {occupied ? (z(english ? `${occupied} people will be left without a table. Their invitations stay in your list.` : `${occupied} personas quedarán sin mesa. Sus invitaciones se conservan en la lista.`)) : (text('emptyTable'))}</p> : <fieldset disabled={busy || disabled}><label>{z(english ? 'Table name' : 'Nombre de la mesa')}<input name="name" defaultValue={edit.table.name} placeholder={z(english ? 'For example, Table 1' : 'Por ejemplo, Mesa 1')} required minLength={2} maxLength={50} autoFocus onFocus={event => event.currentTarget.select()}/></label><label>{english ? 'Places' : 'Lugares'}<input name="capacity" type="number" inputMode="numeric" defaultValue={edit.table.capacity} min={Math.max(1, occupied)} max={30} required/></label><small>{text('reserves')}</small></fieldset>}<div className="workspace-editor-actions"><button className="workspace-editor-cancel" type="button" disabled={busy} onClick={onClose}>{english ? 'Cancel' : 'Cancelar'}</button><button className="workspace-button" disabled={busy || disabled}>{busy ? (english ? 'Saving…' : 'Guardando…') : edit.deleting ? (z(english ? 'Remove table' : 'Eliminar mesa')) : (z(english ? 'Save table' : 'Guardar mesa'))}</button></div>{error && <p role="alert" className="boreal-error">{error}</p>}</form></div></dialog>;
}
