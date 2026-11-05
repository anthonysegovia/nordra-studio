import { panelTerms } from '../lib/panelTerms';
import { BirthdayThemeButton } from '../components/BirthdayThemeButton';
import { SampleGuide } from '../components/SampleGuide';
import { PanelExperience, defaultPanelExperience } from '../lib/panelExperience';
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

export function WeddingWorkspace({ wedding, adminView = false, experience: requestedExperience = defaultPanelExperience, onBack, onSignOut }: { experience?: typeof defaultPanelExperience; wedding?: WeddingEvent; adminView?: boolean; onBack?: () => void; onSignOut?: () => void }) {
  const experience = wedding || adminView ? defaultPanelExperience : requestedExperience;
  const {identity}=experience;
  const language = useLanguage();
  const english = !wedding && language === "en";
  const { localSample, management, managementAction, lastSyncedAt, syncing, changedIds, invitations, saveInvitation, deleteInvitation, reset, resetKey, loading, syncError, refresh, event: latestEvent, errorCode, boreal, borealAction } = useWeddingCloud(wedding?.id, adminView, experience.key);
  const lang=english?1:0;
  const text=panelTerms(experience.key,english);
  const real = latestEvent ?? wedding;
  const readOnly=localSample || !!real?.archived;
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
  const couple = real?.couple || identity.name;
  const invitationPath = real ? real.invitationPath : identity.invitation;
  const welcome = useRef<HTMLElement>(null);
  const [compact,setCompact] = useState(false);
  useEffect(()=>{
    const observer = new IntersectionObserver(([entry])=>setCompact(entry.boundingClientRect.bottom < 1));
    if (welcome.current) observer.observe(welcome.current);
    return ()=>observer.disconnect();
  },[]);
  const dateLabel = real ? weddingDate(real.eventDate) : experience.sample.date[english?1:0];
  const listFocus = useRef<HTMLDivElement>(null);
  const resetDialog = useRef<HTMLDialogElement>(null);
  const [operation,setOperation]=useState<'import'|'history'|null>(null);
  const [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState<WeddingInvitationAction | null>(null);
  const [notice, setNotice] = useState<{ kind: "added" | "updated" | "deleted" | "reset" | "storage"; name?: string } | null>(null);
  useEffect(() => { document.title = `${identity.panel[lang]} | Nordra Studio`; }, [identity,lang]);

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

  return <PanelExperience.Provider value={experience}><div className="wedding-workspace" data-occasion={experience.key} style={{ '--panel-accent': experience.accent, '--panel-paper':experience.paper, '--panel-ink':experience.ink } as React.CSSProperties}>
    <a className="workspace-skip" href="#workspace-main">{english ? "Skip to content" : "Saltar al contenido"}</a>
    <aside className="workspace-sidebar">
      <a className="workspace-brand" href={identity.back} aria-label={'Nordra Studio · '+identity.brandLabel[lang]}>NORDRA<span>{identity.brand[lang]}</span></a>
      <div className="workspace-couple"><span className="workspace-monogram" aria-hidden="true">{real ? <Heart size={34} strokeWidth={1}/> : <>{identity.mark[0]}{identity.mark[1] && <em>{identity.mark[1]}</em>}{identity.mark[2]}</>}</span><p>{couple}</p><span>{identity.badge[lang]}</span></div>
      <nav className="workspace-navigation" aria-label={identity.panel[lang]}>
        <button className={activeTab === 'guests' ? 'workspace-nav-current' : ''} aria-current={activeTab === 'guests' ? 'page' : undefined} onClick={() => navigate('guests')}><UsersRound size={18} strokeWidth={1.5} aria-hidden="true" /><span>{identity.nav[lang]}</span></button>
        {hasBoreal && <><button className={activeTab === 'tables' ? 'workspace-nav-current' : ''} aria-current={activeTab === 'tables' ? 'page' : undefined} onClick={() => navigate('tables')}><CircleDot size={18} strokeWidth={1.5} aria-hidden="true"/><span>{english ? 'Tables' : 'Mesas'}</span></button><button className={activeTab === 'reception' ? 'workspace-nav-current' : ''} aria-current={activeTab === 'reception' ? 'page' : undefined} onClick={() => navigate('reception')}><QrCode size={18} strokeWidth={1.5} aria-hidden="true"/><span>{english ? 'Reception' : 'Recepción'}</span></button></>}
        {invitationPath && <a href={invitationPath} target="_blank" rel="noopener noreferrer" title={english ? 'Open your invitation in a new tab' : experience.key==='wedding'?'Abrir su invitación en otra pestaña':'Abrir tu invitación en otra pestaña'}><Mail size={18} strokeWidth={1.5} aria-hidden="true" /><span>{identity.ours[lang]}</span><ArrowUpRight className="workspace-nav-external" size={14} aria-hidden="true" /></a>}
      </nav>
      <div className="workspace-sidebar-bottom"><Heart size={19} strokeWidth={1.2} aria-hidden="true" /><p>{identity.motto[lang]}</p><a href={identity.back+'#'+identity.anchor}><ArrowLeft size={15} aria-hidden="true" />{identity.backLabel[lang]}</a></div>
    </aside>

    <div className="workspace-body">
      <header className="workspace-topbar"><span>{identity.space[lang]}</span><div><span className="workspace-sample-label">{real ? (adminView ? "Administración de Nordra" : "Panel privado") : (english ? "Sample data" : "Datos de muestra")}</span>{!real && experience.key === 'birthday' && <BirthdayThemeButton english={english}/>}{real ? <>{adminView ? <a href="/?panel=pagos&seccion=bodas">Volver a bodas</a> : <><button type="button" onClick={onBack}>Mis bodas</button><button type="button" onClick={onSignOut}>Salir</button></>}</> : <button type="button" className="workspace-language" onClick={() => setLanguage(english ? "es" : "en")} aria-label={english ? "Cambiar a español" : "Switch to English"}>{english ? "ES" : "EN"}</button>}</div></header>
      <main id="workspace-main" tabIndex={-1}>
        {compact && <div className="panel-compact-bar" aria-hidden="true"><strong>{couple}</strong><span>{dateLabel}</span></div>}
        <section ref={welcome} className={`workspace-welcome${!real ? " workspace-welcome-editorial" : ""}`} aria-labelledby="workspace-title">
          <div><p className="workspace-eyebrow">{identity.kicker[lang]}</p><h1 id="workspace-title">{real ? couple : <>{identity.title[0]}{identity.title[1] && <em>{identity.title[1]}</em>}{identity.title[2]}</>}</h1><p className="workspace-date"><CalendarDays size={15} aria-hidden="true" />{dateLabel}<span>·</span>{real ? real.city : identity.place[lang]}</p><p className="workspace-welcome-note">{identity.note[lang]}</p></div>
          {real ? real.coverPath && <img className="workspace-portrait" src={real.coverPath} width={1600} height={1068} alt={`La boda de ${couple}`} /> : <div className="workspace-welcome-art" aria-hidden="true"><img src={identity.photo} srcSet={identity.srcSet || undefined} sizes="(max-width:760px) 76vw, (max-width:1250px) 43vw, 510px" width={1200} height={1200} decoding="async" alt="" /></div>}
        </section>

        <div className="workspace-quick-links">{!wedding && !real && !adminView && location.pathname===experience.sample.path && <SampleGuide english={english} link={replyInvitation?.link} onGuests={()=>navigate('guests')}/>}{invitationPath && <a href={invitationPath} target="_blank" rel="noopener noreferrer"><Mail size={15} aria-hidden="true" />{english ? 'Open invitation' : 'Abrir invitación'}<ArrowUpRight size={14} aria-hidden="true" /></a>}{!real && replyInvitation?.link && <a href={replyInvitation.link} target="_blank" rel="noopener noreferrer">{text('asGuest')}<ArrowUpRight size={14} aria-hidden="true" /></a>}{real && <span>{real.archived ? 'Solo consulta · ' : ''}Disponible hasta el {lastWeddingDay(real.expiresAt)}{real.replyUntil ? ' · Confirmaciones hasta el ' + weddingDate(real.replyUntil) : ''}</span>}</div>

        {localSample && <p className="workspace-sync" role="status">{english ? 'Explore this sample in read-only mode for now. You can try editing later.' : 'Por ahora, explora esta muestra en modo de solo lectura. Puedes probar los cambios más tarde.'}</p>}
        <div ref={sectionContent} className="workspace-section-content" tabIndex={-1} role="region" aria-label={activeTab === 'tables' ? (english ? 'Tables' : 'Mesas') : activeTab === 'reception' ? (english ? 'Reception' : 'Recepción') : identity.nav[lang]}>
        {activeTab !== 'guests' && <><p className={`workspace-sync${syncError ? ' is-offline' : ''}`} role="status">{localSample ? (english ? 'Sample data · Read only' : 'Datos de muestra · Solo lectura') : loading ? (english ? 'Preparing your space…' : 'Preparando su espacio…') : syncError ? (english ? 'Connection interrupted · Changes are paused' : 'Conexión interrumpida · Los cambios están en pausa') : (english ? 'Boreal · Synced with your invitations' : 'Boreal · Sincronizado con sus invitaciones')}{syncError && <button onClick={() => void refresh()}>{english ? 'Retry' : 'Reintentar'}</button>}</p>{errorCode && <p role="alert">{weddingError(new Error(errorCode))}</p>}{!loading && (activeTab === 'tables' ? <WeddingTables invitations={invitations} state={boreal} action={borealAction} english={english} disabled={syncError} readOnly={readOnly} couple={couple}/> : <WeddingReception invitations={invitations} state={boreal} action={borealAction} english={english} disabled={syncError} readOnly={readOnly}/>)}</>}

        <div className="workspace-content-grid" hidden={activeTab !== 'guests'}>
          <div className="workspace-confirmations" id="confirmaciones" ref={listFocus} tabIndex={-1}>
            {loading && <p role="status">{english?'Loading invitations…':'Cargando invitaciones…'}</p>}
            {syncError && loading && <button onClick={()=>void refresh()}>{english?'Retry':'Reintentar'}</button>}
            {real && errorCode && <p role="alert">{weddingError(new Error(errorCode))}{errorCode === "signed_out" && <a href="/mi-boda.html"> · Iniciar sesión</a>}</p>}
            {!loading && <div className="workspace-live-list"><WeddingInvitationPanel syncStatus={localSample ? <span>{english?'Sample data · Read only':'Datos de muestra · Solo lectura'}</span> : <WeddingSyncStatus at={lastSyncedAt} syncing={syncing} offline={syncError} english={english} onRefresh={()=>void refresh()} />} onTables={()=>navigate('tables')} management={management} managementAction={managementAction} changedIds={changedIds} onImport={()=>setOperation('import')} onHistory={()=>setOperation('history')} key={resetKey} invitations={invitations} english={english} boreal={hasBoreal ? boreal : undefined} disabled={busy || syncError} readOnly={readOnly} onAdd={() => setEditor({ mode: "add" })} onEdit={(invitation, personId) => setEditor({ mode: "edit", invitation, personId })} onCorrect={(invitation, personId) => setEditor({ mode: "attendance", invitation, personId })} onDelete={invitation => setEditor({ mode: "delete", invitation })} /></div>}
            <div className="workspace-list-footer"><span><Check size={14} aria-hidden="true" />{english ? "Replies arrive from each personal invitation" : "Las respuestas llegan desde cada invitación personal"}</span>{!real && <button type="button" disabled={loading || busy || syncError || readOnly} onClick={() => resetDialog.current?.showModal()}><RotateCcw size={14} aria-hidden="true" />{english ? "Reset preview" : "Reiniciar vista"}</button>}</div>
            <p className="workspace-reset-notice" role="status">{noticeText}</p>
          </div>

        </div>
        </div>
      </main>
      <footer className="workspace-footer"><span>{real ? `Nordra Studio · ${real.plan}` : identity.footer[lang]}</span><span>{real?.archived ? "Archivo de Nordra · Solo consulta" : real ? `Panel privado · Disponible hasta ${lastWeddingDay(real.expiresAt)}` : english ? "Sample space · Links and replies available for 24 hours · Use fictional names" : "Espacio de muestra · Enlaces y respuestas disponibles por 24 horas · Usa nombres ficticios"}</span></footer>
    </div>

    {operation==='import'&&<WeddingImport invitations={invitations} english={english} action={managementAction} disabled={syncError||readOnly} onClose={()=>setOperation(null)}/>}
    {operation==='history'&&<WeddingHistory management={management} action={managementAction} english={english} readOnly={readOnly} disabled={syncError} onClose={()=>setOperation(null)}/>}
    {editor && <WeddingInvitationEditor action={editor} english={english} realEvent={!!real} onSave={saveSampleInvitation} onDelete={deleteSampleInvitation} onClose={() => setEditor(null)} fallbackFocus={listFocus} />}
    <dialog ref={resetDialog} className="workspace-dialog workspace-guest-editor" aria-labelledby="reset-title" onCancel={event => { if (busy) event.preventDefault(); }}><div className="workspace-dialog-inner"><h2 id="reset-title">{english ? "Start again" : "Volver a empezar"}</h2><p className="workspace-delete-description">{english ? "Your sample list will be restored. Current personal links and their replies will be replaced." : "Se restaurará la lista de muestra. Los enlaces personales actuales y sus respuestas serán reemplazados."}</p><div className="workspace-editor-actions"><button type="button" className="workspace-editor-cancel" disabled={busy} onClick={() => resetDialog.current?.close()}>{english ? "Cancel" : "Cancelar"}</button><button type="button" className="workspace-button" disabled={busy} onClick={() => void resetPreview()}>{busy ? (english ? "Resetting…" : "Reiniciando…") : (english ? "Reset sample" : "Reiniciar muestra")}</button></div>{notice?.kind === "storage" && <p role="alert">{noticeText}</p>}</div></dialog>
  </div></PanelExperience.Provider>;
}

