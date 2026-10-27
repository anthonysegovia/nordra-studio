import { useEffect, useState } from 'react';
import { ArrowLeft, Download, LogOut, RefreshCw, ShieldCheck } from 'lucide-react';
import './admin-posada.css';

type Guest = { id: string; guest_name: string; attendance: 'yes' | 'no'; created_at: string; updated_at: string };
async function api(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, credentials: 'same-origin', cache: 'no-store', headers: { 'Content-Type': 'application/json', ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw Object.assign(new Error(data.error || 'No pudimos completar la solicitud'), { status: response.status });
  return data;
}
export function AdminPosada() {
  const [ready, setReady] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const [configured, setConfigured] = useState(true);
  const [rows, setRows] = useState<Guest[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [loaded, setLoaded] = useState(false);
  const [refreshed, setRefreshed] = useState('');
  const [page, setPage] = useState(1);
  async function load() {
    try {
      const guests: Guest[] = [];
      let index = 0;
      let total = 0;
      do {
        const data = await api(`/api/admin-posada?page=${index++}`);
        guests.push(...data.responses); total = data.total;
        if (!data.responses.length) break;
      } while (guests.length < total);
      setRows([...new Map(guests.map(guest => [guest.id, guest])).values()]);
      setSignedIn(true); setLoaded(true); setRefreshed(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }));
    } catch (reason) {
      if ((reason as { status?: number }).status === 401) { setSignedIn(false); setRows([]); setLoaded(false); }
      throw reason;
    }
  }
  useEffect(() => {
    const previous = document.title;
    document.title = 'Lista privada · Posada | Nordra Studio';
    const robots = document.createElement('meta'); robots.name = 'robots'; robots.content = 'noindex, nofollow'; document.head.appendChild(robots);
    api('/api/admin-session').then(async data => { setConfigured(data.configured); setSignedIn(data.signedIn); if (data.signedIn) await load(); })
      .catch(() => setError('No pudimos consultar la lista. Intenta nuevamente.')).finally(() => setReady(true));
    return () => { document.title = previous; robots.remove(); };
  }, []);
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError('');
    const form = event.currentTarget; const data = new FormData(form);
    try { await api('/api/admin-session', { method: 'POST', body: JSON.stringify({ email: data.get('email'), password: data.get('password') }) }); form.reset(); setSignedIn(true); await load(); }
    catch (reason) { setError((reason as Error).message); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try { await api('/api/admin-session', { method: 'DELETE' }); setSignedIn(false); setRows([]); setLoaded(false); }
    catch { setError('No pudimos cerrar la sesión. Intenta nuevamente.'); }
    finally { setBusy(false); }
  }
  async function refresh() { setBusy(true); setError(''); try { await load(); } catch (reason) { setError((reason as Error).message); } finally { setBusy(false); } }
  function download() {
    const cell = (value: string) => `"${(/^[=+\-@\t\r]/.test(value) ? "'" : '') + value.replaceAll('"', '""')}"`;
    const csv = '\uFEFF' + [['Nombre', 'Asistencia', 'Última actualización'], ...rows.map(row => [row.guest_name, row.attendance === 'yes' ? 'Sí asistirá' : 'No podrá ir', new Date(row.updated_at).toLocaleString('es-MX', { timeZone: 'America/Monterrey' })])].map(row => row.map(cell).join(',')).join('\r\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a'); a.href = url; a.download = 'posada-covadonga-confirmaciones.csv'; a.click(); setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
  const visible = rows.filter(row => row.guest_name.toLocaleLowerCase('es-MX').includes(query.toLocaleLowerCase('es-MX')) && (filter === 'all' || row.attendance === filter));
  const pages = Math.max(1, Math.ceil(visible.length / 20));
  const currentPage = Math.min(page, pages);
  return <main className="admin-page posada-admin">
    <header className="admin-header"><a href="/" className="payment-logo" aria-label="Nordra Studio · Inicio"><img src="/nordra-header-approved.png" alt="Nordra Studio" width={2172} height={724} /></a><span><ShieldCheck size={17} /> Lista privada</span>{signedIn ? <button onClick={logout} disabled={busy}><LogOut size={16} /> Salir</button> : <a href="/"><ArrowLeft size={16} /> Inicio</a>}</header>
    {error && <p className="admin-alert" role="alert">{error}</p>}
    {!ready ? <p className="posada-loading" role="status">Comprobando acceso…</p> : !signedIn ? <section className="admin-login"><ShieldCheck size={28} /><h1>La lista de la posada</h1><p>Usa tu acceso de administrador de Nordra para ver las confirmaciones.</p>{configured ? <form onSubmit={login}><label>Correo<input name="email" type="email" autoComplete="username" required maxLength={254} /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label><button className="payment-submit" disabled={busy}>{busy ? 'Ingresando…' : 'Entrar a la lista'}</button></form> : <p>El acceso no está disponible por el momento.</p>}</section> : <>
      <div className="admin-title"><div><span className="payment-eyebrow">LA COVADONGA · 19 DIC 2026</span><h1>Se viene la posada</h1><p>Nombre, respuesta y todo listo para organizar.</p></div><div className="posada-admin-actions"><button className="admin-primary" onClick={refresh} disabled={busy}><RefreshCw size={16} className={busy ? 'posada-refreshing' : ''} /> {busy ? 'Actualizando…' : 'Actualizar'}</button><button onClick={download} disabled={!loaded || busy || !rows.length}><Download size={16} /> Descargar lista</button></div></div>
      <div className="admin-stats"><article><span>Sí asistirán</span><strong>{loaded ? rows.filter(row => row.attendance === 'yes').length : '—'}</strong></article><article><span>No podrán ir</span><strong>{loaded ? rows.filter(row => row.attendance === 'no').length : '—'}</strong></article><article><span>Respuestas recibidas</span><strong>{loaded ? rows.length : '—'}</strong></article></div>
      <section className="admin-list" aria-busy={busy}><div className="admin-list-heading"><h2>Confirmaciones</h2><div className="posada-admin-filters"><label>Buscar por nombre<input type="search" value={query} onChange={event => { setQuery(event.target.value); setPage(1); }} placeholder="Escribe un nombre" /></label><label>Asistencia<select value={filter} onChange={event => { setFilter(event.target.value); setPage(1); }}><option value="all">Todas</option><option value="yes">Sí asistirán</option><option value="no">No podrán ir</option></select></label></div></div>
        {!loaded ? <p className="admin-empty">Actualiza para cargar las respuestas</p> : !visible.length ? <p className="admin-empty">{rows.length ? 'No hay respuestas con este filtro' : 'La primera respuesta aparecerá aquí cuando alguien confirme'}</p> : visible.slice((currentPage - 1) * 20, currentPage * 20).map(row => <article className="posada-guest" key={row.id}><div><h3>{row.guest_name}</h3><p>Actualizado el {new Date(row.updated_at).toLocaleString('es-MX', { timeZone: 'America/Monterrey', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</p></div><span className={`admin-badge ${row.attendance === 'yes' ? 'admin-badge-paid' : ''}`}>{row.attendance === 'yes' ? 'Sí asistirá' : 'No podrá ir'}</span></article>)}
        {pages > 1 && <nav className="posada-pagination" aria-label="Páginas de confirmaciones"><button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>Anterior</button><span>{currentPage} / {pages}</span><button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>Siguiente</button></nav>}
      </section><div className="posada-admin-footer"><p role="status">{refreshed && `Última consulta: ${refreshed}`}</p><a href="/?panel=admin">Ir a cobros <span aria-hidden="true">↗</span></a></div>
    </>}
  </main>;
}
