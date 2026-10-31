import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowUpRight, CalendarDays, Check, CircleDot, Heart, Mail, QrCode, RotateCcw, UsersRound } from "lucide-react";
import { WeddingInvitationPanel } from "../components/WeddingInvitationPanel";
import { WeddingInvitationEditor, type WeddingInvitationAction } from "../components/WeddingInvitationEditor";
import { invitationLabel, type WeddingInvitation } from "../lib/weddingInvitations";
import { useWeddingCloud } from "../lib/weddingCloud";
import { setLanguage, useLanguage } from "../language";
import { weddingDate, lastWeddingDay, weddingError, type WeddingEvent } from "../lib/weddingClient";
import { WeddingTables } from '../components/WeddingTables';
import { WeddingReception } from '../components/WeddingReception';

import '../styles/wedding-boreal.css';
import '../styles/wedding-records.css';
import '../styles/wedding-operations.css';
import '../styles/wedding-mobile-navigation.css';
import { WeddingImport } from '../components/WeddingImport';
import { WeddingHistory } from '../components/WeddingHistory';
import { WeddingSyncStatus } from '../components/WeddingSyncStatus';

export function WeddingWorkspace({ wedding, adminView = false, onBack, onSignOut }: { wedding?: WeddingEvent; adminView?: boolean; onBack?: () => void; onSignOut?: () => void }) {
  const language = useLanguage();
  const english = !wedding && language === "en";
  const { management, managementAction, lastSyncedAt, syncing, changedIds, invitations, saveInvitation, deleteInvitation, reset, resetKey, loading, syncError, refresh, event: latestEvent, errorCode, boreal, borealAction } = useWeddingCloud(wedding?.id, adminView);
  const real = latestEvent ?? wedding;
  const hasBoreal = !real || real.plan === 'Boreal';
  const [tab, setTab] = useState(location.hash === '#mesas' ? 'tables' : location.hash === '#recepcion' ? 'reception' : 'guests');
  const activeTab = hasBoreal ? tab : 'guests';
  const sectionContent = useRef<HTMLDivElement>(null);
  const navigationPending = useRef(false);
  function showMobileSection() {
    if (!matchMedia('(max-width:760px)').matches) return;
    sectionContent.current?.focus({ preventScroll: true });
    sectionContent.current?.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }
  function navigate(value: string) {
    if (value === activeTab) showMobileSection();
    else navigationPending.current = true;
    setTab(value);
    history.replaceState(null, '', location.pathname + location.search + (value === 'tables' ? '#mesas' : value === 'reception' ? '#recepcion' : '#confirmaciones'));
  }
  useEffect(() => {
    if (!navigationPending.current) return;
    navigationPending.current = false;
    showMobileSection();
  }, [activeTab]);
  const couple = real?.couple || "Valentina & Sebastián";
  const invitationPath = real ? real.invitationPath : "/invitaciones/valentina-y-sebastian/";
  const listFocus = useRef<HTMLDivElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const [operation,setOperation]=useState<'import'|'history'|null>(null);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<WeddingInvitationAction | null>(null);
  const [notice, setNotice] = useState<{ kind: "added" | "updated" | "deleted" | "reset" | "storage"; name?: string } | null>(null);
  useEffect(() => { document.title = `${english ? "Wedding panel" : "Panel de boda"} | Nordra Studio`; }, [english]);

  async function resetPreview() {
    setBusy(true);
    try { await reset(); setNotice({ kind: "reset" }); resetDialog.current?.close(); }
    catch { setNotice({ kind: "storage" }); }
    finally { setBusy(false); }
  }
  async function saveSampleInvitation(invitation: WeddingInvitation, mode: "add" | "edit") {
    await saveInvitation(invitation, mode);

    setNotice({ kind: mode === "edit" ? "updated" : "added", name: invitationLabel(invitation) });
  }
  async function deleteSampleInvitation(invitation: WeddingInvitation) {
    await deleteInvitation(invitation.id,invitation.updated_at);
    setNotice({ kind: "deleted", name: invitationLabel(invitation) });
  }
  const replyInvitation = invitations.find(invitation => invitation.kind === "plusOne") ?? invitations[0];
  const noticeText = !notice ? "" : notice.kind === "reset" ? (english ? "The original sample list has been restored" : "La lista de muestra volvió a su estado inicial")
    : notice.kind === "storage" ? (english ? "The change could not be saved. Please try again." : "No se pudo guardar el cambio. Intenta nuevamente.")
    : `${notice.name} · ${notice.kind === "added" ? (english ? "added to the list" : "se agregó a la lista") : notice.kind === "updated" ? (english ? "changes saved" : "cambios guardados") : (english ? "removed from the list" : "se eliminó de la lista")}`;

  return <div className="wedding-workspace">
    <a className="workspace-skip" href="#workspace-main">{english ? "Skip to content" : "Saltar al contenido"}</a>
    <aside className="workspace-sidebar">
      <a className="workspace-brand" href="/bodas" aria-label={english ? "Nordra Studio · Weddings" : "Nordra Studio · Bodas"}>NORDRA<span>WEDDINGS</span></a>
      <div className="workspace-couple"><span className="workspace-monogram" aria-hidden="true">{real ? <Heart size={34} strokeWidth={1}/> : <>V<em>&</em>S</>}</span><p>{couple}</p><span>{english ? "OUR WEDDING" : "NUESTRA BODA"}</span></div>
      <nav className="workspace-navigation" aria-label={english ? "Wedding panel" : "Panel de boda"}>
        <button className={activeTab === 'guests' ? 'workspace-nav-current' : ''} aria-current={activeTab === 'guests' ? 'page' : undefined} onClick={() => navigate('guests')}><UsersRound size={18} strokeWidth={1.5} aria-hidden="true" /><span>{english ? "Guests" : "Invitados"}</span></button>
        {hasBoreal && <><button className={activeTab === 'tables' ? 'workspace-nav-current' : ''} aria-current={activeTab === 'tables' ? 'page' : undefined} onClick={() => navigate('tables')}><CircleDot size={18} strokeWidth={1.5} aria-hidden="true"/><span>{english ? 'Tables' : 'Mesas'}</span></button><button className={activeTab === 'reception' ? 'workspace-nav-current' : ''} aria-current={activeTab === 'reception' ? 'page' : undefined} onClick={() => navigate('reception')}><QrCode size={18} strokeWidth={1.5} aria-hidden="true"/><span>{english ? 'Reception' : 'Recepción'}</span></button></>}
        {invitationPath && <a href={invitationPath} target="_blank" rel="noopener noreferrer" title={english ? 'Open your invitation in a new tab' : 'Abrir su invitación en otra pestaña'}><Mail size={18} strokeWidth={1.5} aria-hidden="true" /><span>{english ? "Our invitation" : "Nuestra invitación"}</span><ArrowUpRight className="workspace-nav-external" size={14} aria-hidden="true" /></a>}
      </nav>
      <div className="workspace-sidebar-bottom"><Heart size={19} strokeWidth={1.2} aria-hidden="true" /><p>{english ? "Made for your story" : "Hecho para su historia"}</p><a href="/bodas#panel-boda"><ArrowLeft size={15} aria-hidden="true" />{english ? "Back to Weddings" : "Volver a Bodas"}</a></div>
    </aside>

    <div className="workspace-body">
      <header className="workspace-topbar"><span>{english ? "Your wedding space" : "Su espacio de boda"}</span><div><span className="workspace-sample-label">{real ? (adminView ? "Administración de Nordra" : "Panel privado") : (english ? "Sample data" : "Datos de muestra")}</span>{real ? <>{adminView ? <a href="/?panel=pagos&seccion=bodas">Volver a bodas</a> : <><button type="button" onClick={onBack}>Mis bodas</button><button type="button" onClick={onSignOut}>Salir</button></>}</> : <button type="button" className="workspace-language" onClick={() => setLanguage(english ? "es" : "en")} aria-label={english ? "Cambiar a español" : "Switch to English"}>{english ? "ES" : "EN"}</button>}</div></header>
      <main id="workspace-main" tabIndex={-1}>
        <section className={`workspace-welcome${!real ? " workspace-welcome-editorial" : ""}`} aria-labelledby="workspace-title">
          <div><p className="workspace-eyebrow">{english ? "THE START OF FOREVER" : "EL COMIENZO DE SU PARA SIEMPRE"}</p><h1 id="workspace-title">{real ? couple : <>Valentina <em>&</em> Sebastián</>}</h1><p className="workspace-date"><CalendarDays size={15} aria-hidden="true" />{real ? weddingDate(real.eventDate) : english ? "June 19, 2027" : "19 de junio de 2027"}<span>·</span>{real ? real.city : english ? "Mexico City" : "Ciudad de México"}</p><p className="workspace-welcome-note">{english ? "Every reply brings your favorite people a little closer" : "Cada respuesta acerca a sus personas favoritas"}</p></div>
          {real ? real.coverPath && <img className="workspace-portrait" src={real.coverPath} width={1600} height={1068} alt={`La boda de ${couple}`} /> : <div className="workspace-welcome-art" aria-hidden="true"><img src="/artwork/invitation-editorial/wedding-v2-640.webp" srcSet="/artwork/invitation-editorial/wedding-v2-400.webp 400w, /artwork/invitation-editorial/wedding-v2-640.webp 640w, /artwork/invitation-editorial/wedding-v2-1200.webp 1200w" sizes="(max-width:760px) 76vw, (max-width:1250px) 43vw, 510px" width={1200} height={1200} decoding="async" alt="" /></div>}
        </section>

        <div className="workspace-quick-links">{invitationPath && <a href={invitationPath} target="_blank" rel="noopener noreferrer"><Mail size={15} aria-hidden="true" />{english ? 'Open invitation' : 'Abrir invitación'}<ArrowUpRight size={14} aria-hidden="true" /></a>}{!real && replyInvitation?.link && <a href={replyInvitation.link} target="_blank" rel="noopener noreferrer">{english ? 'Try it as a guest' : 'Vívelo como invitado'}<ArrowUpRight size={14} aria-hidden="true" /></a>}{real && <span>{real.archived ? 'Solo consulta · ' : ''}Disponible hasta el {lastWeddingDay(real.expiresAt)}{real.replyUntil ? ' · Confirmaciones hasta el ' + weddingDate(real.replyUntil) : ''}</span>}</div>

        <div ref={sectionContent} className="workspace-section-content" tabIndex={-1} role="region" aria-label={activeTab === 'tables' ? (english ? 'Tables' : 'Mesas') : activeTab === 'reception' ? (english ? 'Reception' : 'Recepción') : (english ? 'Guests' : 'Invitados')}>
        {activeTab !== 'guests' && <><p className={`workspace-sync${syncError ? ' is-offline' : ''}`} role="status">{loading ? (english ? 'Preparing your space…' : 'Preparando su espacio…') : syncError ? (english ? 'Connection interrupted · Changes are paused' : 'Conexión interrumpida · Los cambios están en pausa') : (english ? 'Boreal · Synced with your invitations' : 'Boreal · Sincronizado con sus invitaciones')}{syncError && <button onClick={() => void refresh()}>{english ? 'Retry' : 'Reintentar'}</button>}</p>{errorCode && <p role="alert">{weddingError(new Error(errorCode))}</p>}{!loading && (activeTab === 'tables' ? <WeddingTables invitations={invitations} state={boreal} action={borealAction} english={english} disabled={syncError} readOnly={!!real?.archived} couple={couple}/> : <WeddingReception invitations={invitations} state={boreal} action={borealAction} english={english} disabled={syncError} readOnly={!!real?.archived}/>)}</>}
        <WeddingSyncStatus at={lastSyncedAt} syncing={syncing} offline={syncError} english={english} onRefresh={()=>void refresh()} />
        <div className="workspace-content-grid" hidden={activeTab !== 'guests'}>
          <div className="workspace-confirmations" id="confirmaciones" ref={listFocus} tabIndex={-1}>
            <p className={`workspace-sync${syncError ? " is-offline" : ""}`} role="status">{loading ? (real ? "Preparando su boda…" : english ? "Preparing your sample space…" : "Preparando su espacio de muestra…") : syncError ? (english ? "Unable to sync right now" : "No pudimos sincronizar en este momento") : (english ? "Connected to your invitations · Updates automatically" : "Conectado a sus invitaciones · Actualización automática")}{syncError && <button type="button" onClick={() => void refresh()}>{english ? "Retry" : "Reintentar"}</button>}</p>
            {real && errorCode && <p role="alert">{weddingError(new Error(errorCode))}{errorCode === "signed_out" && <a href="/mi-boda.html"> · Iniciar sesión</a>}</p>}
            {!loading && <div className="workspace-live-list"><WeddingInvitationPanel management={management} managementAction={managementAction} changedIds={changedIds} onImport={()=>setOperation('import')} onHistory={()=>setOperation('history')} key={resetKey} invitations={invitations} english={english} boreal={hasBoreal ? boreal : undefined} disabled={busy || syncError} readOnly={real?.archived} onAdd={() => setEditor({ mode: "add" })} onEdit={(invitation, personId) => setEditor({ mode: "edit", invitation, personId })} onCorrect={(invitation, personId) => setEditor({ mode: "attendance", invitation, personId })} onDelete={invitation => setEditor({ mode: "delete", invitation })} /></div>}
            <div className="workspace-list-footer"><span><Check size={14} aria-hidden="true" />{english ? "Replies arrive from each personal invitation" : "Las respuestas llegan desde cada invitación personal"}</span>{!real && <button type="button" disabled={loading || busy || syncError} onClick={() => resetDialog.current?.showModal()}><RotateCcw size={14} aria-hidden="true" />{english ? "Reset preview" : "Reiniciar vista"}</button>}</div>
            <p className="workspace-reset-notice" role="status">{noticeText}</p>
          </div>

        </div>
        </div>
      </main>
      <footer className="workspace-footer"><span>{real ? `Nordra Studio · ${real.plan}` : english ? "Boreal sample · Tables and QR arrivals" : "Muestra Boreal · Mesas y entradas QR"}</span><span>{real?.archived ? "Archivo de Nordra · Solo consulta" : real ? `Panel privado · Disponible hasta ${lastWeddingDay(real.expiresAt)}` : english ? "Sample space · Links and replies available for 24 hours · Use fictional names" : "Espacio de muestra · Enlaces y respuestas disponibles por 24 horas · Usa nombres ficticios"}</span></footer>
    </div>

    {operation==='import'&&<WeddingImport invitations={invitations} english={english} action={managementAction} disabled={syncError||!!real?.archived} onClose={()=>setOperation(null)}/>}
    {operation==='history'&&<WeddingHistory management={management} action={managementAction} english={english} readOnly={real?.archived} disabled={syncError} onClose={()=>setOperation(null)}/>}
    {editor && <WeddingInvitationEditor action={editor} english={english} realEvent={!!real} onSave={saveSampleInvitation} onDelete={deleteSampleInvitation} onClose={() => setEditor(null)} fallbackFocus={listFocus} />}
    <dialog ref={resetDialog} className="workspace-dialog workspace-guest-editor" aria-labelledby="reset-title" onCancel={event => { if (busy) event.preventDefault(); }}><div className="workspace-dialog-inner"><h2 id="reset-title">{english ? "Start again" : "Volver a empezar"}</h2><p className="workspace-delete-description">{english ? "Your sample list will be restored. Current personal links and their replies will be replaced." : "Se restaurará la lista de muestra. Los enlaces personales actuales y sus respuestas serán reemplazados."}</p><div className="workspace-editor-actions"><button type="button" className="workspace-editor-cancel" disabled={busy} onClick={() => resetDialog.current?.close()}>{english ? "Cancel" : "Cancelar"}</button><button type="button" className="workspace-button" disabled={busy} onClick={() => void resetPreview()}>{busy ? (english ? "Resetting…" : "Reiniciando…") : (english ? "Reset sample" : "Reiniciar muestra")}</button></div>{notice?.kind === "storage" && <p role="alert">{noticeText}</p>}</div></dialog>
  </div>;
}

