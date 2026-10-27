import { useCallback, useEffect, useRef, useState } from "react";
import type { WeddingAttendance, WeddingInvitation } from "./weddingInvitations";
import { weddingApi, type WeddingEvent } from "./weddingClient";
import { emptyBoreal, type BorealResult, type BorealState } from './weddingBoreal';

import { emptyManagement, type WeddingManagement } from './weddingManagement';

type Snapshot = BorealResult & { workspaceId: string; invitations: WeddingInvitation[]; expiresAt: string; version: number; event?: WeddingEvent; boreal?: BorealState; management?: WeddingManagement };
let loadingRequest: Promise<Snapshot> | null = null;
async function request(body: Record<string, unknown>): Promise<Snapshot> {
  const response = await fetch("/api/wedding-links", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), signal: AbortSignal.timeout(15000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.code || "unavailable");
  if (!Array.isArray(data.invitations) || !Number.isInteger(data.version)) throw new Error("unavailable");
  return data;
}
function load() {
  if (!loadingRequest) loadingRequest = request({ action: "load" }).finally(() => { loadingRequest = null; });
  return loadingRequest;
}

export function useWeddingCloud(eventId?: string, admin = false) {
  const [management, setManagement] = useState<WeddingManagement>(emptyManagement);
  const [lastSyncedAt, setLastSyncedAt] = useState(0), [syncing,setSyncing] = useState(false), [changedIds,setChangedIds] = useState<string[]>([]);
  const previousInvitations=useRef<WeddingInvitation[] | null>(null);
  useEffect(()=>{if(!changedIds.length)return;const timer=setTimeout(()=>setChangedIds([]),4500);return()=>clearTimeout(timer);},[changedIds]);
  const [invitations, setInvitations] = useState<WeddingInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncError, setSyncError] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");
  const [event, setEvent] = useState<WeddingEvent>();
  const [boreal, setBoreal] = useState<BorealState>(emptyBoreal);
  const [errorCode, setErrorCode] = useState("");
  const [resetKey, setResetKey] = useState(0);
  const version = useRef(0);
  const workspace = useRef("");
  const active = useRef(true);
  const accept = useCallback((snapshot: Snapshot) => {
    if (!active.current) return;
    if (workspace.current !== snapshot.workspaceId) { workspace.current = snapshot.workspaceId; version.current = 0; }
    if (snapshot.version >= version.current) { version.current = snapshot.version; const changed=previousInvitations.current ? snapshot.invitations.filter(item=>{const previous=previousInvitations.current?.find(p=>p.id===item.id);return !previous || previous.updated_at!==item.updated_at;}).map(item=>item.id) : []; if(changed.length)setChangedIds(changed); previousInvitations.current=snapshot.invitations; setLastSyncedAt(Date.now()); setManagement(snapshot.management ?? emptyManagement); setInvitations(snapshot.invitations); setExpiresAt(snapshot.expiresAt); setEvent(snapshot.event); setBoreal(snapshot.boreal ?? emptyBoreal); }
    setLoading(false); setSyncError(false); setErrorCode("");
  }, []);
  const call = useCallback((body: Record<string,unknown>) => eventId ? weddingApi<Snapshot>({...body,eventId,admin}) : request(body), [eventId,admin]);
  const refresh = useCallback(async () => {
    setSyncing(true);
    try { accept(await (eventId ? call({action:"load"}) : load())); }
    catch (error) { if (active.current) { setLoading(false); setSyncError(true); setErrorCode((error as Error).message); if(eventId) {setInvitations([]);setManagement(emptyManagement);setBoreal(emptyBoreal);} } }
    finally {if(active.current)setSyncing(false);}
  }, [accept,call,eventId]);
  useEffect(() => {
    active.current = true;
    void refresh();
    const update = () => { if (document.visibilityState === "visible") void refresh(); };
    const interval = window.setInterval(update, 10000);
    window.addEventListener("focus", update); window.addEventListener("pageshow", update); document.addEventListener("visibilitychange", update);
    return () => { active.current = false; clearInterval(interval); window.removeEventListener("focus", update); window.removeEventListener("pageshow", update); document.removeEventListener("visibilitychange", update); };
  }, [refresh]);
  async function change(body: Record<string, unknown>) {
    try { const snapshot = await call(body); accept(snapshot); return snapshot; }
    catch (error) { if ((error as Error).message === "response_changed") await refresh(); throw error; }
  }
  async function saveInvitation(invitation: WeddingInvitation, mode: "add" | "edit") { await change({ action: "save", invitation, mode }); }
  async function deleteInvitation(id: string, updatedAt?:string) { await change({ action: "delete", id, updatedAt }); }
  async function setAttendance(id: string, personId: string, attendance: WeddingAttendance) { await change({ action: "attendance", id, personId, attendance }); }
  async function recordReply(name: string, attendance: "yes" | "no") { await change({ action: "trial", name, attendance }); }
  async function reset() { await change({ action: "reset" }); setResetKey(value => value + 1); }
  async function borealAction(body: Record<string, unknown>) { return change({ ...body, version: version.current }); }
  return { management, managementAction:change, lastSyncedAt, syncing, changedIds, invitations, recordReply, saveInvitation, deleteInvitation, setAttendance, reset, resetKey, loading, syncError, refresh, expiresAt, event, errorCode, boreal, borealAction };
}
