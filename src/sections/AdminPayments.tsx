import { useEffect, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, LogOut, Plus, RefreshCw, ShieldCheck, WalletCards } from "lucide-react";

type PaymentRow = { token: string; reference: string; project: string; concept: string; amountCents: number; expiresAt: string; state: string; createdAt: string; link: string };
const labels: Record<string, string> = { open: "Por pagar", paid: "Confirmado", pending: "Pendiente", retry: "Reintento disponible", closed: "Cerrado", expired: "Vencido", creating: "Preparando enlace", verification_unavailable: "Sin verificar", review: "Revisión necesaria", creation_failed: "Creación incompleta" };
const demoRows: PaymentRow[] = [
  { token: "demo-1", reference: "NDR-001", project: "Página informativa", concept: "Anticipo del 50%", amountCents: 149950, expiresAt: "2030-10-15", createdAt: "2026-10-08", state: "paid", link: "/?pago=demo" },
  { token: "demo-2", reference: "NDR-002", project: "Celebración · Aurora", concept: "Saldo del 50%", amountCents: 149950, expiresAt: "2030-10-20", createdAt: "2026-10-08", state: "open", link: "/?pago=demo" },
];
async function api(path: string, options?: RequestInit) {
  const response = await fetch(path, { ...options, credentials: "same-origin", cache: "no-store", headers: { "Content-Type": "application/json", ...options?.headers } });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "No pudimos completar la solicitud.");
  return data;
}

export function AdminPayments({ demoMode }: { demoMode: boolean }) {
  const [signedIn, setSignedIn] = useState(demoMode);
  const [ready, setReady] = useState(demoMode);
  const [configured, setConfigured] = useState(true);
  const [rows, setRows] = useState<PaymentRow[]>(demoMode ? demoRows : []);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [creating, setCreating] = useState(false);
  const [filter, setFilter] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  const [createdLink, setCreatedLink] = useState("");
  const [form, setForm] = useState({ reference: "", project: "", concept: "Anticipo del 50%", amount: "", expiresAt: "" });
  const money = (cents: number) => new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" }).format(cents / 100);
  async function load() {
    const data = await api("/api/admin-payments");
    setRows(data.requests); setSignedIn(true);
  }
  useEffect(() => {
    const previous = document.title;
    document.title = "Administración | Nordra Studio";
    const robots = document.createElement("meta"); robots.name = "robots"; robots.content = "noindex, nofollow"; document.head.appendChild(robots);
    if (!demoMode) api("/api/admin-session").then(async data => {
      setConfigured(data.configured); setSignedIn(data.signedIn);
      if (data.signedIn) await load();
    }).catch(() => setError("No pudimos consultar el acceso. Intenta nuevamente más tarde.")).finally(() => setReady(true));
    return () => { document.title = previous; robots.remove(); };
  }, [demoMode]);
  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    try {
      await api("/api/admin-session", { method: "POST", body: JSON.stringify({ email: data.get("email"), password: data.get("password") }) });
      formElement.reset(); await load();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos iniciar sesión."); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError("");
    try { if (!demoMode) await api("/api/admin-session", { method: "DELETE" }); setSignedIn(false); setRows([]); setCreatedLink(""); }
    catch { setError("No pudimos cerrar la sesión. Intenta nuevamente."); }
    finally { setBusy(false); }
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const amountCents = Math.round(Number(form.amount) * 100);
    try {
      if (!Number.isSafeInteger(amountCents) || amountCents <= 0) throw new Error("Indica un importe válido.");
      if (demoMode) {
        const row = { token: crypto.randomUUID(), reference: form.reference, project: form.project, concept: form.concept, amountCents, expiresAt: form.expiresAt, createdAt: new Date().toISOString(), state: "open", link: "/?pago=demo" };
        setRows(previous => [row, ...previous]); setCreatedLink(row.link); setMessage("Solicitud de demostración creada. No se generó ningún cobro.");
      } else {
        const data = await api("/api/admin-payments", { method: "POST", body: JSON.stringify({ requestId, reference: form.reference, project: form.project, concept: form.concept, amountCents, expiresAt: new Date(form.expiresAt).toISOString() }) });
        setCreatedLink(data.link); await load(); setMessage("Enlace listo para compartir con el cliente.");
      }
      setRequestId(crypto.randomUUID()); setCreating(false); setForm({ reference: "", project: "", concept: "Anticipo del 50%", amount: "", expiresAt: "" });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos crear el enlace."); }
    finally { setBusy(false); }
  }
  async function refresh(row: PaymentRow) {
    setBusy(true); setError(""); setMessage("");
    try {
      if (demoMode) setMessage("Los estados de esta demostración son ficticios.");
      else { await api("/api/admin-payments", { method: "PATCH", body: JSON.stringify({ token: row.token }) }); await load(); setMessage("Estado consultado con Mercado Pago."); }
    } catch (reason) { setError(reason instanceof Error ? reason.message : "No pudimos consultar el estado."); }
    finally { setBusy(false); }
  }
  async function copy(link: string) {
    try { await navigator.clipboard.writeText(new URL(link, window.location.origin).href); setMessage(demoMode ? "Enlace de demostración copiado." : "Enlace copiado."); }
    catch { setError("No pudimos copiarlo. Abre el enlace y cópialo desde la barra del navegador."); }
  }
  const visible = rows.filter(row => `${row.reference} ${row.project} ${row.concept}`.toLocaleLowerCase().includes(filter.toLocaleLowerCase()));
  return <main className="admin-page">
    <header className="admin-header"><a href="/" className="payment-brand">NORDRA<span>STUDIO</span></a><span><ShieldCheck size={17} /> Administración</span>{signedIn ? <button onClick={logout} disabled={busy}><LogOut size={16} /> Salir</button> : <a href="/"><ArrowLeft size={16} /> Inicio</a>}</header>
    {demoMode && <div className="admin-demo">Demostración · Datos ficticios · Los cambios se pierden al recargar y no crean pagos reales.</div>}
    {error && <p className="admin-alert" role="alert">{error}</p>}{message && <p className="admin-message" role="status">{message}</p>}
    {!ready ? <p role="status">Comprobando acceso…</p> : !signedIn ? <section className="admin-login"><ShieldCheck size={28} /><h1>Tu espacio de trabajo.</h1><p>Inicia sesión para gestionar los cobros de Nordra.</p>{configured ? <form onSubmit={login}><label>Correo<input name="email" type="email" autoComplete="username" required maxLength={254} /></label><label>Contraseña<input name="password" type="password" autoComplete="current-password" required maxLength={200} /></label><button className="payment-submit" disabled={busy}>{busy ? "Ingresando…" : "Entrar al panel"}</button></form> : <p className="admin-alert">El acceso todavía requiere configurar la base de datos y el usuario administrador.</p>}</section> : <>
      <div className="admin-title"><div><span className="payment-eyebrow">GESTIÓN DE COBROS</span><h1>Cada proyecto, en orden.</h1><p>Anticipos, saldos y renovaciones en un mismo lugar.</p></div><button className="admin-primary" onClick={() => { setCreating(value => !value); setCreatedLink(""); }} disabled={busy}><Plus size={18} /> Crear solicitud</button></div>
      <div className="admin-stats"><article><span>Solicitudes mostradas</span><strong>{rows.length}</strong></article><article><span>Por pagar</span><strong>{rows.filter(row => row.state === "open" || row.state === "retry").length}</strong></article><article><span>Confirmado en esta lista</span><strong>{money(rows.filter(row => row.state === "paid").reduce((sum, row) => sum + row.amountCents, 0))}</strong></article></div>
      {createdLink && <div className="admin-created"><div><strong>Tu enlace está listo</strong><a href={createdLink} target="_blank" rel="noopener noreferrer">Abrir página de pago <ExternalLink size={15} /></a></div><button onClick={() => copy(createdLink)}><Copy size={16} /> Copiar enlace</button></div>}
      {creating && <section className="admin-form-panel"><h2>Nueva solicitud de pago</h2><p>Usa el importe final con IVA incluido y la cotización que el cliente ya aceptó.</p><form onSubmit={submit}><label>Referencia de cotización<input required maxLength={80} value={form.reference} onChange={event => setForm({ ...form, reference: event.target.value })} placeholder="NDR-003" /></label><label>Proyecto<input required maxLength={160} value={form.project} onChange={event => setForm({ ...form, project: event.target.value })} placeholder="Página informativa" /></label><label>Concepto<select value={form.concept} onChange={event => setForm({ ...form, concept: event.target.value })}><option>Anticipo del 50%</option><option>Saldo del 50%</option><option>Alojamiento mensual</option><option>Alojamiento semestral</option><option>Alojamiento anual</option><option>Servicio adicional</option></select></label><label>Importe final en MXN · IVA incluido<input type="number" min="0.01" max="1000000" step="0.01" required value={form.amount} onChange={event => setForm({ ...form, amount: event.target.value })} placeholder="1499.50" /></label><label>Fecha y hora de vencimiento<input type="datetime-local" required value={form.expiresAt} onChange={event => setForm({ ...form, expiresAt: event.target.value })} /><small>Hora local de este dispositivo.</small></label><div className="admin-form-actions"><button type="button" disabled={busy} onClick={() => setCreating(false)}>Cancelar</button><button className="admin-primary" disabled={busy}>{busy ? "Preparando enlace…" : demoMode ? "Crear demostración" : "Crear enlace de pago"}</button></div></form></section>}
      <section className="admin-list"><div className="admin-list-heading"><h2><WalletCards size={21} /> Solicitudes</h2><label><span className="sr-only">Buscar solicitud</span><input type="search" placeholder="Buscar referencia o proyecto" value={filter} onChange={event => setFilter(event.target.value)} /></label></div>{!visible.length ? <p className="admin-empty">No hay solicitudes para mostrar.</p> : visible.map(row => <article key={row.token} className="admin-row"><div><span className="admin-reference">{row.reference}</span><h3>{row.project}</h3><p>{row.concept}</p></div><div className="admin-row-amount"><strong>{money(row.amountCents)} <small>MXN</small></strong><span>IVA incluido</span></div><span className={`admin-badge admin-badge-${row.state}`}>{labels[row.state] || "Sin verificar"}</span><div className="admin-row-actions"><button disabled={busy} onClick={() => refresh(row)} aria-label={`Consultar estado de ${row.reference} ${row.concept}`}><RefreshCw size={16} /></button>{row.state === "open" || row.state === "retry" ? <button onClick={() => copy(row.link)} aria-label={`Copiar enlace de ${row.reference} ${row.concept}`}><Copy size={16} /></button> : null}<a href={row.link} target="_blank" rel="noopener noreferrer" aria-label={`Abrir pago de ${row.reference} ${row.concept}`}><ExternalLink size={16} /></a></div></article>)}<p className="admin-list-note">Se muestran hasta 100 solicitudes recientes. Consultar el estado no realiza cargos ni activa servicios.</p></section>
    </>}
  </main>;
}
