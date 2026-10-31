import { useCallback, useEffect, useRef, useState } from 'react';
import { ShieldCheck } from 'lucide-react';
import { WeddingReception } from '../components/WeddingReception';
import { type BorealResult, type BorealState } from '../lib/weddingBoreal';
import { borealPublicApi, readBorealCapability } from '../lib/weddingBorealPublic';
import type { WeddingInvitation } from '../lib/weddingInvitations';
import { weddingError } from '../lib/weddingClient';
type ReceptionData = BorealResult & { invitations: WeddingInvitation[]; boreal: BorealState; couple: string; version: number };
export function WeddingReceptionAccess() {
  const [capability] = useState(() => readBorealCapability('acceso'));
  const [data, setData] = useState<ReceptionData | null>(null), [error, setError] = useState(''), [loading, setLoading] = useState(true);
  const version = useRef(0), active = useRef(true);
  const accept = useCallback((value: ReceptionData) => { if (active.current && value.version >= version.current) { version.current = value.version; setData(value); setError(''); } }, []);
  const refresh = useCallback(async () => {
    try { accept(await borealPublicApi<ReceptionData>(capability, { action: 'reception-load' })); }
    catch (reason) { if (active.current) { setError(weddingError(reason)); if (['reception_expired', 'event_archived', 'boreal_required', 'link_unavailable'].includes((reason as Error).message)) setData(null); } }
    finally { if (active.current) setLoading(false); }
  }, [accept, capability]);
  useEffect(() => {
    active.current = true; void refresh(); const update = () => { if (document.visibilityState === 'visible') void refresh(); };
    const timer = window.setInterval(update, 10000); window.addEventListener('focus', update); document.addEventListener('visibilitychange', update);
    const change = () => location.reload(); window.addEventListener('hashchange', change);
    return () => { active.current = false; clearInterval(timer); window.removeEventListener('focus', update); document.removeEventListener('visibilitychange', update); window.removeEventListener('hashchange', change); };
  }, [refresh]);
  async function action(body: Record<string, unknown>) {
    const action = body.action === 'pass-scan' ? 'reception-scan' : body.action === 'check-in' ? 'reception-check-in' : '';
    if (!action) throw new Error('invalid_action');
    try { const result = await borealPublicApi<ReceptionData>(capability, { ...body, action }); accept(result); return result; }
    catch (reason) { await refresh(); throw reason; }
  }
  return <div className="wedding-workspace boreal-reception-page"><header><a className="workspace-brand" href="/bodas">NORDRA<span>WEDDINGS</span></a><span><ShieldCheck size={15}/>Recepción privada</span></header><main><p className="boreal-reception-couple">{data?.couple || 'Acceso a la celebración'}</p>{capability.mode === 'sample' && <p className="boreal-demo-note">Vista de muestra · Datos ficticios</p>}{error && <div className="boreal-connection-error"><p role="alert">{error}</p><button className="boreal-quiet" onClick={() => void refresh()}>Reintentar conexión</button></div>}{loading && !data && <p role="status">Preparando recepción…</p>}{data && <WeddingReception invitations={data.invitations} state={data.boreal} action={action} english={false} disabled={!!error || loading} limited/>}</main><footer>Las entradas se sincronizan con el panel de los novios · Nordra Studio</footer></div>;
}
