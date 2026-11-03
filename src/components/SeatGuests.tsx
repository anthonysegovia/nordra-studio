import { useEffect, useRef, useState } from 'react';
import type { WeddingInvitation } from '../lib/weddingInvitations';
import type { BorealAction, BorealState, WeddingTable } from '../lib/weddingBoreal';
import { weddingError } from '../lib/weddingClient';

export function SeatGuests({table,state,invitations,action,english,disabled,onClose}:{
  table:WeddingTable; state:BorealState; invitations:WeddingInvitation[]; action:BorealAction;
  english:boolean; disabled:boolean; onClose:()=>void;
}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [query,setQuery]=useState(''),[all,setAll]=useState(false),[ids,setIds]=useState<string[]>([]);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const eligible=invitations.map(inv=>inv.people.filter(p=>p.attendance!=='no' && state.seats[p.id]!==table.id));
  const selected=eligible.map(group=>group.filter(p=>ids.includes(p.id))).filter(group=>group.length);
  const count=selected.reduce((total,group)=>total+group.length,0);
  const free=table.capacity-Object.values(state.seats).filter(id=>id===table.id).length;
  useEffect(()=>{const trigger=document.activeElement as HTMLElement;dialog.current?.showModal();return()=>{if(trigger?.isConnected)trigger.focus()};},[]);
  function toggle(group:string[]){
    setIds(prev=>group.every(id=>prev.includes(id))?prev.filter(id=>!group.includes(id)):[...new Set([...prev,...group])]);
  }
  async function save(){
    if(busy||disabled||!count||count>free)return;
    setBusy(true);setError('');let saved=0;
    try{
      for(const group of selected){
        const personIds=group.map(p=>p.id);
        await action({action:'seat-assign',personIds,tableId:table.id});
        saved+=group.length;
        setIds(prev=>prev.filter(id=>!personIds.includes(id)));
      }
      onClose();
    }catch(reason){
      setError((saved?(english?`${saved} seated. `:`${saved} personas asignadas. `):'')+weddingError(reason));
    }finally{setBusy(false)}
  }
  return <dialog ref={dialog} className="workspace-dialog seat-picker" aria-labelledby="seat-picker-title" onCancel={e=>{e.preventDefault();if(!busy)onClose()}}>
    <h2 id="seat-picker-title">{english?'Add guests':'Agregar invitados'} · {table.name}</h2>
    <label>{english?'Search by name':'Buscar por nombre'}<input type="search" autoFocus value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <label><input type="checkbox" checked={all} onChange={e=>setAll(e.target.checked)}/>{english?'Show all eligible people':'Ver todos los invitados disponibles'}</label>
    <fieldset disabled={busy||disabled}>{eligible.map((group,index)=>{
      const choices=group.filter(p=>all || (p.attendance==='yes' && !state.seats[p.id]));
      if(!choices.length||!choices.some(p=>p.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())))return null;
      return <div key={invitations[index].id}>{choices.map(p=><label key={p.id}><input type="checkbox" checked={ids.includes(p.id)} onChange={()=>toggle([p.id])}/>{p.name||(english?'Unnamed companion':'Acompañante sin nombre')}</label>)}
        {choices.length>1 && <button type="button" onClick={()=>toggle(choices.map(p=>p.id))}>{english?'Seat together':'Sentar juntos'}</button>}</div>;
    })}</fieldset>
    <p aria-live="polite">{count} {english?'selected':'seleccionados'}{count>free && (english?' · Over capacity':' · Se supera la capacidad')}</p>
    {error&&<p role="alert">{error}</p>}
    <button disabled={busy} onClick={onClose}>{english?'Cancel':'Cancelar'}</button>
    <button className="workspace-button" disabled={disabled||busy||!count||count>free} onClick={()=>void save()}>{english?`Seat at ${table.name} (${free} places free)`:`Sentar en ${table.name} (${free} lugares libres)`}</button>
  </dialog>
}
