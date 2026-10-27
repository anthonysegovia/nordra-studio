import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
export function WeddingSyncStatus({ at, syncing, offline, english, onRefresh }: {at:number;syncing:boolean;offline:boolean;english:boolean;onRefresh:()=>void}) {
  const [now,setNow]=useState(Date.now());
  useEffect(()=>{const timer=setInterval(()=>setNow(Date.now()),15000);return()=>clearInterval(timer);},[]);
  if(!at)return null;
  const minutes=Math.max(0,Math.floor((now-at)/60000));
  const message=offline?(english?'Connection interrupted':'Conexión interrumpida'):minutes===0?(english?'Updated just now':'Actualizado hace unos segundos'):(english?`Updated ${minutes} min ago`:`Actualizado hace ${minutes} min`);
  return <div className={`wedding-sync-status${offline?' is-offline':''}`}><span>{message}</span><button disabled={syncing} onClick={onRefresh} aria-label={english?'Refresh data':'Actualizar datos'}><RefreshCw size={13} className={syncing?'is-syncing':''}/></button></div>;
}
