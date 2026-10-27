import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';
import type { WeddingInvitation } from '../lib/weddingInvitations';
import { importNameKey, normalizedKind, readGuestCsv, reviewImport, type ImportRow } from '../lib/weddingImport';
import type { ManagementAction } from '../lib/weddingManagement';
import { weddingError } from '../lib/weddingClient';
import { WeddingOperationsDialog } from './WeddingOperationsDialog';

const messages: Record<string,string[]> = { invalid_kind:['Elige Individual, Pareja o +1','Choose Individual, Couple or +1'],individual_companion:['Una invitación individual no lleva acompañante','An individual invitation cannot include a companion'],invalid_name:['Revisa el nombre y apellido, de 2 a 100 caracteres','Check the full name, 2–100 characters'],duplicate_name:['Este nombre ya aparece en la lista o en otra fila','This name appears in the list or another row'],import_too_many:['Máximo 300 filas y 50 columnas por archivo','Maximum 300 rows and 50 columns per file'],file_too_large:['Usa un archivo de hasta 2 MB','Use a file up to 2 MB'],invalid_csv:['Revisa las comillas y separadores del CSV','Check CSV quotes and separators'],invalid_file:['Usa un archivo Excel .xlsx o CSV con encabezados','Use an Excel .xlsx or CSV file with column headers'] };
type Sheet = { name:string; data:string[][] };
export function WeddingImport({ invitations, english, action, onClose, disabled }: { invitations:WeddingInvitation[];english:boolean;action:ManagementAction;onClose:()=>void;disabled:boolean }) {
  const [sheets,setSheets]=useState<Sheet[]>([]),[sheet,setSheet]=useState(0),[rows,setRows]=useState<ImportRow[]>([]),[columns,setColumns]=useState({name:0,kind:-1,companion:-1});
  const [loading,setLoading]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[page,setPage]=useState(1),[done,setDone]=useState(false),[filename,setFilename]=useState('');
  const requestId=useRef(crypto.randomUUID());
  const review=reviewImport(rows,invitations.flatMap(item=>item.people.map(p=>p.name)),invitations.reduce((n,item)=>n+item.people.length,0));
  const pages=Math.max(1,Math.ceil(rows.length/10));
  const explain=(code:string)=>(messages[code]||[code,code])[english?1:0];
  function mapRows(data:string[][],mapping:typeof columns) {
    requestId.current=crypto.randomUUID();setPage(1);
    setRows(data.slice(1).filter(row=>row.some(v=>v.trim())).map((row,index)=>({id:`wedding-invitation-${crypto.randomUUID()}`,row:index+2,name:row[mapping.name]||'',kind:row[mapping.kind]||'',companion:row[mapping.companion]||'',included:true})));
  }
  function selectSheet(all:Sheet[],index:number) {
    setSheet(index);const data=all[index].data,header=data[0]||[];
    const find=(labels:string[])=>header.findIndex(h=>labels.includes(importNameKey(h)));
    const mapping={name:Math.max(0,find(['nombre','nombre completo','invitado','invitado principal','name','guest','main guest'])),kind:find(['tipo','tipo de invitacion','type','kind']),companion:find(['acompanante','pareja','companion','partner'])};
    setColumns(mapping);mapRows(data,mapping);
  }
  async function read(file?:File) {
    if(!file)return;setLoading(true);setError('');setDone(false);setRows([]);setSheets([]);
    try {
      if(file.size>2_000_000)throw new Error('file_too_large');
      let book:Sheet[];
      if(/\.csv$/i.test(file.name))book=[{name:file.name,data:readGuestCsv(await file.text())}];
      else if(/\.xlsx$/i.test(file.name)) {
        const {default:readExcel}=await import('read-excel-file/browser');
        const result=await readExcel(file);
        book=result.map(item=>({name:item.sheet,data:item.data.map(row=>row.map(value=>value==null?'':String(value)))}));
      } else throw new Error('invalid_file');
      book=book.filter(item=>item.data.length>1);
      if(!book.length)throw new Error('invalid_file');
      if(book.some(item=>item.data.length>301||item.data.some(row=>row.length>50)))throw new Error('import_too_many');
      setSheets(book);setFilename(file.name);selectSheet(book,0);
    }catch(reason){setError(explain((reason as Error).message in messages?(reason as Error).message:'invalid_file'));}finally{setLoading(false);}
  }
  function update(id:string,patch:Partial<ImportRow>){setRows(current=>current.map(row=>row.id===id?{...row,...patch}:row));requestId.current=crypto.randomUUID();}
  async function save(){setBusy(true);setError('');try{const items=rows.filter(row=>row.included).map(row=>{const kind=normalizedKind(row.kind,row.companion)!;return{id:row.id,kind,people:[row.name,...(kind==='individual'?[]:[row.companion])].map((name,index)=>({id:`${row.id}-person-${index}`,name:name.trim(),attendance:'pending'}))};});await action({action:'import',requestId:requestId.current,invitations:items});setDone(true);}catch(reason){setError(weddingError(reason));}finally{setBusy(false);}}
  function template(){const url=URL.createObjectURL(new Blob(['\uFEFFTipo,Nombre,Acompañante\r\nIndividual,Ana Ejemplo,\r\nPareja,Luis Ejemplo,Marta Ejemplo\r\n+1,Carlos Ejemplo,\r\n'],{type:'text/csv;charset=utf-8'}));const link=document.createElement('a');link.href=url;link.download='plantilla-invitados-nordra.csv';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  return <WeddingOperationsDialog title={english?'Import your guest list':'Importar su lista de invitados'} english={english} busy={busy||loading} onClose={onClose} wide>
    {done?<div className="operations-success"><h3>{english?'Your list is ready':'Su lista ya está en el panel'}</h3><p>{english?'Personal links are ready to share. Each person starts with RSVP pending.':'Los enlaces personales están listos para compartir. Cada persona comienza con asistencia pendiente.'}</p><button onClick={onClose}>{english?'View invitations':'Ver invitaciones'}</button></div>:<>
    <p className="operations-note">{english?'One invitation per row: individual, couple or +1. Review before saving.':'Una invitación por fila: individual, pareja o +1. Revisa los datos antes de guardar.'}</p>
    <div className="import-upload"><label><Upload size={17}/>{loading?(english?'Reading…':'Leyendo…'):(english?'Choose Excel or CSV':'Elegir Excel o CSV')}<input type="file" accept=".xlsx,.csv" disabled={loading||busy} onChange={event=>{void read(event.target.files?.[0]);event.target.value='';}}/></label><button disabled={busy} onClick={template}><Download size={16}/>{english?'Download template':'Descargar plantilla'}</button><small>{english?'Up to 2 MB · Files are read on your device':'Hasta 2 MB · El archivo se lee en tu dispositivo'}</small></div>
    {!!sheets.length&&<><div className="import-mapping">{sheets.length>1&&<label>{english?'Sheet':'Hoja'}<select value={sheet} disabled={busy} onChange={e=>selectSheet(sheets,Number(e.target.value))}>{sheets.map((item,i)=><option key={i} value={i}>{item.name}</option>)}</select></label>}{(['name','kind','companion'] as const).map(field=><label key={field}>{field==='name'?(english?'Name column':'Columna de nombre'):field==='kind'?(english?'Type column':'Columna de tipo'):(english?'Companion column':'Columna de acompañante')}<select value={columns[field]} disabled={busy} onChange={e=>{const mapping={...columns,[field]:Number(e.target.value)};setColumns(mapping);mapRows(sheets[sheet].data,mapping);}}>{field!=='name'&&<option value={-1}>{english?'Not provided':'No incluida'}</option>}{sheets[sheet].data[0].map((header,i)=><option key={i} value={i}>{header||`${english?'Column':'Columna'} ${i+1}`}</option>)}</select></label>)}</div>
    <p className="import-summary">{filename} · {review.selected} {english?'invitations':'invitaciones'} · {review.people} {english?'places':'lugares'}</p><p className="operations-note">{english?'A blank type is inferred from the companion column. Select +1 explicitly to reserve an unnamed companion.':'Si el tipo está vacío se infiere del acompañante. Elige +1 para reservar un acompañante sin nombre.'}</p>
    <div className="import-rows">{rows.slice((page-1)*10,page*10).map(row=><div className={`import-row${review.errors[row.id]?' has-error':''}`} key={row.id}><label className="import-include"><input type="checkbox" checked={row.included} disabled={busy} onChange={e=>update(row.id,{included:e.target.checked})}/>{english?'Row':'Fila'} {row.row}</label><label>{english?'Name':'Nombre'}<input value={row.name} maxLength={100} disabled={busy||!row.included} onChange={e=>update(row.id,{name:e.target.value})}/></label><label>{english?'Type':'Tipo'}<select value={normalizedKind(row.kind,row.companion)||'invalid'} disabled={busy||!row.included} onChange={e=>update(row.id,{kind:e.target.value})}>{!normalizedKind(row.kind,row.companion)&&<option value="invalid">{row.kind}</option>}<option value="individual">Individual</option><option value="couple">{english?'Couple':'Pareja'}</option><option value="plusOne">+1</option></select></label><label>{english?'Companion':'Acompañante'}<input value={row.companion} maxLength={100} disabled={busy||!row.included} placeholder={english?'Optional for +1':'Opcional para +1'} onChange={e=>update(row.id,{companion:e.target.value})}/></label>{review.errors[row.id]&&<p role="status">{explain(review.errors[row.id])}</p>}</div>)}</div>
    {pages>1&&<nav className="operations-pagination"><button disabled={page===1||busy} onClick={()=>setPage(page-1)}>{english?'Previous':'Anterior'}</button><span>{page} / {pages}</span><button disabled={page===pages||busy} onClick={()=>setPage(page+1)}>{english?'Next':'Siguiente'}</button></nav>}
    {review.overLimit&&<p className="boreal-error" role="alert">{english?'This list exceeds the 300-person limit, including companions':'Esta lista supera las 300 personas, incluyendo acompañantes'}</p>}{Object.keys(review.errors).length>0&&<p className="operations-note">{english?'Correct or exclude the flagged rows before importing':'Corrige o excluye las filas señaladas antes de importar'}</p>}<footer className="operations-actions"><button disabled={busy||disabled||!review.selected||review.overLimit||Object.keys(review.errors).length>0} onClick={()=>void save()}>{busy?(english?'Importing…':'Importando…'):(english?`Import ${review.selected} invitations`:`Importar ${review.selected} invitaciones`)}</button></footer></>}
    </>}{error&&<p className="boreal-error" role="alert">{error}</p>}
  </WeddingOperationsDialog>;
}
