import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Check, ChevronDown, Download, Pencil, Plus, Search, Trash2, UsersRound, X } from 'lucide-react';
import { invitationLabel, type WeddingInvitation } from '../lib/weddingInvitations';
import { downloadBoreal, type BorealAction, type BorealState, type WeddingTable } from '../lib/weddingBoreal';
import { WeddingSeatingPlan } from './WeddingSeatingPlan';
import { weddingError } from '../lib/weddingClient';

type Props = { invitations: WeddingInvitation[]; state: BorealState; action: BorealAction; english: boolean; disabled: boolean; readOnly: boolean; couple:string };
type Edit = { table: WeddingTable; isNew: boolean; deleting?: boolean };
export function WeddingTables({ invitations, state, action, english, disabled, readOnly, couple }: Props) {
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
    catch (reason) { setError(weddingError(reason)); }
    finally { setBusy(false); }
  }
  function chooseFilter(value: string) { setFilter(value); setPage(1); }
  return <section className="boreal-section boreal-tables" aria-labelledby="tables-title">
    <div className="boreal-heading"><div><p className="workspace-eyebrow">{english ? 'A PLACE TO CELEBRATE' : 'UN LUGAR PARA CELEBRAR'}</p><h2 id="tables-title" ref={heading} tabIndex={-1}>{english ? 'Around the table' : 'Alrededor de la mesa'}</h2><p>{english ? 'Bring your favorite people together' : 'Junten a sus personas favoritas'}</p></div><div className="boreal-heading-actions"><button className="boreal-quiet" onClick={() => downloadBoreal(invitations, state, english)} disabled={disabled}><Download size={16}/>{english ? 'Download' : 'Descargar'}</button><button className="workspace-button" disabled={locked} onClick={() => setEditing({ isNew: true, table: { id: `table-${crypto.randomUUID()}`, name: '', capacity: 8 } })}><Plus size={17}/>{english ? 'New table' : 'Nueva mesa'}</button></div></div>
    <div className="boreal-summary"><div><strong key={state.tables.length}>{state.tables.length}</strong><span>{english ? 'Tables' : 'Mesas'}</span></div><div><strong key={assigned}>{assigned}<small> / {eligible.length}</small></strong><span>{english ? 'Places assigned' : 'Lugares distribuidos'}</span></div><div><strong key={confirmed.filter(person => !state.seats[person.id]).length}>{confirmed.filter(person => !state.seats[person.id]).length}</strong><span>{english ? 'Confirmed without a table' : 'Confirmados sin mesa'}</span></div></div>
    <div className="boreal-plan-entry"><button onClick={()=>setShowPlan(true)}>{english?'View seating arrangement':'Ver distribución de mesas'}</button><span>{english?'Names, capacity and a printable version':'Nombres, capacidad y versión para imprimir'}</span></div>
    <div className="boreal-table-grid">
      {state.tables.map(table => {
        const members = eligible.filter(person => state.seats[person.id] === table.id);
        return <article className={`boreal-table-card${filter === table.id ? ' is-selected' : ''}`} key={table.id}>
          <button className="boreal-table-select" aria-pressed={filter === table.id} onClick={() => chooseFilter(filter === table.id ? 'all' : table.id)}>
            <span className="boreal-table-drawing" aria-hidden="true"><span className="boreal-table-center"><UsersRound size={24} strokeWidth={1}/><span>{members.length}<small> / {table.capacity}</small></span></span>{Array.from({ length: table.capacity }, (_, index) => <i key={index} className={index < members.length ? members[index].attendance === 'yes' ? 'is-filled' : 'is-reserved' : ''} style={{ transform: `rotate(${index * 360 / table.capacity}deg) translateY(-67px)` }}/>)}</span>
            <h3>{table.name}</h3><p>{table.capacity - members.length} {english ? 'places available' : 'lugares disponibles'}</p>
          </button>
          <div className="boreal-table-actions"><button className="boreal-quiet" disabled={locked} aria-label={`${english ? 'Edit table' : 'Editar mesa'} ${table.name}`} onClick={() => setEditing({ table, isNew: false })}><Pencil size={14}/>{english ? 'Edit' : 'Editar'}</button><button className="boreal-icon" disabled={locked} aria-label={`${english ? 'Delete table' : 'Eliminar mesa'} ${table.name}`} onClick={() => setEditing({ table, isNew: false, deleting: true })}><Trash2 size={15}/></button></div>
        </article>;
      })}
      {!state.tables.length && <div className="boreal-empty"><UsersRound size={32} strokeWidth={1}/><h3>{english ? 'Your first table' : 'Su primera mesa'}</h3><p>{english ? 'Give it a name and choose how many places it has' : 'Elijan un nombre y cuántos lugares tendrá'}</p></div>}
    </div>
    <p className="boreal-legend"><span><i className="is-filled"/>{english ? 'Confirmed' : 'Confirmado'}</span><span><i className="is-reserved"/>{english ? 'Reserved · reply pending' : 'Reservado · por confirmar'}</span></p>
    <div className="boreal-assignment-panel">
      <div className="boreal-list-heading"><h3>{selectedTable ? selectedTable.name : english ? 'A place for everyone' : 'Un lugar para cada persona'}</h3><span>{english ? 'Declined invitations are not seated' : 'Quienes no asistirán quedan fuera de las mesas'}</span></div>
      <div className="boreal-filters"><label><span>{english ? 'Find a guest' : 'Buscar invitado'}</span><span className="boreal-search"><Search size={16}/><input type="search" value={query} placeholder={english ? 'Name or companion' : 'Nombre o acompañante'} onChange={event => { setQuery(event.target.value); setPage(1); }}/></span></label><label><span>{english ? 'Show' : 'Mostrar'}</span><select value={selectedTable ? filter : filter === 'unassigned' ? filter : 'all'} onChange={event => chooseFilter(event.target.value)}><option value="all">{english ? 'All guests' : 'Todos los invitados'}</option><option value="unassigned">{english ? 'Without a table' : 'Sin mesa'}</option>{state.tables.map(table => <option key={table.id} value={table.id}>{table.name}</option>)}</select></label></div>
      <div className="boreal-feedback" aria-live="polite">{error ? <p role="alert" className="boreal-error">{error}</p> : notice ? <p><Check size={15}/>{notice}</p> : null}</div>
      <div className="boreal-list-meta"><p role="status">{visible.length} {english ? 'invitations' : 'invitaciones'}</p><label>{english ? 'Per page' : 'Por página'}<select aria-label={english ? 'Seating invitations per page' : 'Invitaciones por página en mesas'} value={pageSize} onChange={event => { setPageSize(Number(event.target.value)); setPage(1); }}>{[10,25,50].map(size => <option key={size} value={size}>{size}</option>)}</select></label></div>{visible.slice((currentPage - 1) * pageSize, currentPage * pageSize).map(invitation => {
        const group = invitation.people.filter(person => person.attendance !== 'no');
        return <div className="boreal-seating-group" key={invitation.id}>
          <div className="boreal-group-heading"><span>{invitationLabel(invitation)}</span>{group.length > 1 && <label className="boreal-group-seat"><span>{english ? 'Seat together' : 'Sentar juntos'}</span><select aria-label={`${english ? 'Seat together' : 'Sentar juntos a'} ${invitationLabel(invitation)}`} value="" disabled={locked || !state.tables.length} onChange={event => { if (event.target.value) void assign(group.map(person => person.id), event.target.value); }}><option value="">{english ? 'Choose table' : 'Elegir mesa'}</option>{state.tables.map(table => <option key={table.id} value={table.id} disabled={table.capacity - Object.entries(state.seats).filter(([id, seat]) => seat === table.id && !group.some(person => person.id === id)).length < group.length}>{table.name}</option>)}</select></label>}</div>
          {group.map(person => <div className="boreal-seating-person" key={person.id}><div><strong>{person.name || (english ? 'Companion to be named' : 'Acompañante por definir')}</strong><small>{person.attendance === 'yes' ? (english ? 'Confirmed' : 'Confirmado') : (english ? 'Reply pending' : 'Por confirmar')}</small></div><label><span className="boreal-sr-only">{english ? 'Table for' : 'Mesa de'} {person.name || invitation.people[0].name + ' +1'}</span><select value={state.seats[person.id] || ''} disabled={locked} onChange={event => void assign([person.id], event.target.value)}><option value="">{english ? 'No table yet' : 'Sin mesa'}</option>{state.tables.map(table => <option key={table.id} value={table.id} disabled={state.seats[person.id] !== table.id && Object.values(state.seats).filter(id => id === table.id).length >= table.capacity}>{table.name}</option>)}</select></label></div>)}
        </div>;
      })}
      {!visible.length && <p className="boreal-empty-note">{english ? 'No guests match this view' : 'No hay invitados en esta vista'}</p>}
      {pages > 1 && <div className="boreal-pagination"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{english ? 'Previous' : 'Anterior'}</button><span>{currentPage} / {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>{english ? 'Next' : 'Siguiente'}<ChevronDown size={14}/></button></div>}
    </div>
    {showPlan&&<WeddingSeatingPlan invitations={invitations} state={state} action={action} english={english} couple={couple} disabled={disabled} readOnly={readOnly} onClose={()=>setShowPlan(false)}/>}
    {editing && <TableEditor edit={editing} english={english} disabled={disabled || readOnly} occupied={Object.values(state.seats).filter(id => id === editing.table.id).length} onClose={() => setEditing(null)} onSave={async body => { await action(body); setEditing(null); setNotice(english ? 'Tables updated' : 'Mesas actualizadas'); }} fallback={heading}/>} 
  </section>;
}

function TableEditor({ edit, english, disabled, occupied, onClose, onSave, fallback }: { edit: Edit; english: boolean; disabled: boolean; occupied: number; onClose: () => void; onSave: (body: Record<string, unknown>) => Promise<void>; fallback: React.RefObject<HTMLHeadingElement | null> }) {
  const dialog = useRef<HTMLDialogElement>(null), [busy, setBusy] = useState(false), [error, setError] = useState('');
  useEffect(() => { const previous = document.activeElement as HTMLElement; dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input')?.focus(); return () => { if (previous?.isConnected) previous.focus(); else fallback.current?.focus(); }; }, [fallback]);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget); setBusy(true); setError('');
    try { await onSave(edit.deleting ? { action: 'table-delete', id: edit.table.id } : { action: 'table-save', edit: !edit.isNew, previous: edit.table, table: { id: edit.table.id, name: form.get('name'), capacity: Number(form.get('capacity')) } }); }
    catch (reason) { setError(weddingError(reason)); setBusy(false); }
  }
  return <dialog ref={dialog} className="workspace-dialog boreal-table-editor" aria-labelledby="table-editor-title" onCancel={event => { if (busy) event.preventDefault(); else onClose(); }}><div className="workspace-dialog-inner"><button className="boreal-dialog-close boreal-icon" aria-label={english ? 'Close' : 'Cerrar'} disabled={busy} onClick={onClose}><X size={20}/></button><p className="workspace-eyebrow">{english ? 'MADE TO GATHER' : 'HECHO PARA REUNIRSE'}</p><h2 id="table-editor-title">{edit.deleting ? (english ? 'Remove this table' : 'Eliminar esta mesa') : edit.isNew ? (english ? 'A new table' : 'Una nueva mesa') : (english ? 'Edit table' : 'Editar mesa')}</h2><form onSubmit={submit}>{edit.deleting ? <p>{edit.table.name} · {occupied ? (english ? `${occupied} people will be left without a table. Their invitations stay in your list.` : `${occupied} personas quedarán sin mesa. Sus invitaciones se conservan en la lista.`) : (english ? 'This table has no guests assigned' : 'Esta mesa no tiene invitados asignados')}</p> : <fieldset disabled={busy || disabled}><label>{english ? 'Table name' : 'Nombre de la mesa'}<input name="name" defaultValue={edit.table.name} placeholder={english ? 'For example, Jasmine' : 'Por ejemplo, Jazmín'} required minLength={2} maxLength={50} autoFocus/></label><label>{english ? 'Places' : 'Lugares'}<input name="capacity" type="number" inputMode="numeric" defaultValue={edit.table.capacity} min={Math.max(1, occupied)} max={30} required/></label><small>{english ? 'Confirmed and pending guests both reserve a place' : 'Confirmados y pendientes reservan un lugar'}</small></fieldset>}<div className="workspace-editor-actions"><button className="workspace-editor-cancel" type="button" disabled={busy} onClick={onClose}>{english ? 'Cancel' : 'Cancelar'}</button><button className="workspace-button" disabled={busy || disabled}>{busy ? (english ? 'Saving…' : 'Guardando…') : edit.deleting ? (english ? 'Remove table' : 'Eliminar mesa') : (english ? 'Save table' : 'Guardar mesa')}</button></div>{error && <p role="alert" className="boreal-error">{error}</p>}</form></div></dialog>;
}
