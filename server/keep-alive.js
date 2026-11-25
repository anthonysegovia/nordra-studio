import { databaseClient } from './admin-access.js';

// Daily touch from a Vercel cron so the Supabase Free project never looks idle and gets paused.
// It reads no rows (a head count on the sample workspaces table) and returns no data.
// When CRON_SECRET is configured in Vercel, only its own cron (Authorization: Bearer …) may call it.
export function keepAliveHandler(deps = { db: databaseClient, secret: () => process.env.CRON_SECRET }) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ ok: false }); }
    const secret = deps.secret();
    if (secret && req.headers.authorization !== `Bearer ${secret}`) return res.status(401).json({ ok: false });
    try {
      const { error } = await deps.db().from('nordra_wedding_workspaces').select('id', { count: 'exact', head: true }).limit(1);
      if (error) throw error;
      return res.status(200).json({ ok: true });
    } catch (error) {
      console.error('keep-alive: database unavailable', error?.message || error);
      return res.status(503).json({ ok: false });
    }
  };
}
