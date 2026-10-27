import { createHash, createHmac } from 'node:crypto';
import { isIP } from 'node:net';
import { adminConfigured, authorizeAdmin, databaseClient, jsonBody } from './admin-access.js';

const origins = new Set(['https://posadacovadonga.nordrastudio.mx', 'https://nordrastudio.mx']);
export function validateCapability(body) {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(body.id || '') || !/^[a-f0-9]{64}$/.test(body.editToken || '')) throw new Error('Recarga la invitación o revisa tu enlace personal.');
  return { id: body.id, tokenHash: createHash('sha256').update(body.editToken).digest('hex') };
}
export function validateResponse(body) {
  const name = typeof body.name === 'string' ? body.name.normalize('NFC').trim().replace(/\s+/gu, ' ') : '';
  if (name.length < 2 || name.length > 100 || /[\p{Cc}\p{Cf}<>]/u.test(name)) throw new Error('Escribe tu nombre, de 2 a 100 caracteres.');
  if (!['yes', 'no'].includes(body.attendance)) throw new Error('Elige si podrás asistir.');
  if (body.website) throw new Error('No pudimos procesar esta respuesta.');
  return { ...validateCapability(body), name, attendance: body.attendance };
}
export function requestBucket(req, secret, now = Date.now()) {
  // Vercel overwrites X-Forwarded-For at ingress. Never persist the raw address.
  const raw = process.env.VERCEL ? req.headers['x-forwarded-for'] : req.socket?.remoteAddress;
  const ip = typeof raw === 'string' ? raw.split(',')[0].trim() : '';
  if (!isIP(ip)) throw new Error('Missing client address');
  return createHmac('sha256', secret).update(`posada-rsvp:${Math.floor(now / 3600000)}:${ip}`).digest('hex');
}
const defaults = { configured: adminConfigured, authorize: authorizeAdmin, database: databaseClient, bucket: req => requestBucket(req, process.env.SUPABASE_SECRET_KEY) };
export function guestHandler(deps = defaults) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    res.setHeader('Vary', 'Origin');
    if (!origins.has(req.headers.origin)) return res.status(403).json({ error: 'Abre el formulario desde la invitación.' });
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();
    if (req.method !== 'POST') { res.setHeader('Allow', 'POST, OPTIONS'); return res.status(405).json({ error: 'Método no permitido.' }); }
    let input; let reading = false;
    try {
      const body = jsonBody(req);
      if (body.action !== undefined && !['save', 'load'].includes(body.action)) throw new Error('Invalid action');
      reading = body.action === 'load';
      input = reading ? validateCapability(body) : validateResponse(body);
    }
    catch (error) { return res.status(400).json({ error: error.message.startsWith('Escribe') || error.message.startsWith('Elige') || error.message.startsWith('Recarga') ? error.message : 'Revisa los datos e intenta de nuevo.' }); }
    if (!deps.configured()) return res.status(503).json({ error: 'Las confirmaciones no están disponibles por el momento. Intenta más tarde.' });
    try {
      if (reading) {
        const { data, error } = await deps.database().rpc('nordra_read_posada_response', { p_id: input.id, p_token_hash: input.tokenHash, p_bucket: deps.bucket(req) });
        if (error || !data) throw new Error('Storage unavailable');
        if (data.status === 'limited') { res.setHeader('Retry-After', '3600'); return res.status(429).json({ error: 'Espera un rato antes de volver a cargar tu respuesta.' }); }
        if (data.status === 'missing') return res.status(404).json({ code: 'response_unavailable', error: 'Este enlace no corresponde a una respuesta disponible. Revisa que esté completo o avisa al organizador.' });
        if (data.status !== 'found' || typeof data.name !== 'string' || !['yes', 'no'].includes(data.attendance) || !data.updatedAt) throw new Error('Invalid receipt');
        return res.status(200).json({ id: input.id, name: data.name, attendance: data.attendance, updatedAt: data.updatedAt });
      }
      const { data, error } = await deps.database().rpc('nordra_save_posada_response', {
        p_id: input.id, p_token_hash: input.tokenHash, p_name: input.name,
        p_attendance: input.attendance, p_bucket: deps.bucket(req),
      });
      if (error || !data) throw new Error('Storage unavailable');
      if (data.status === 'limited') { res.setHeader('Retry-After', '3600'); return res.status(429).json({ error: 'Hemos recibido muchos intentos. Espera un rato antes de volver a enviar.' }); }
      if (data.status === 'conflict') return res.status(409).json({ error: 'No pudimos actualizar esta respuesta. Contacta al organizador.' });
      if (data.status === 'duplicate') return res.status(409).json({ code: 'duplicate_name', error: 'Ya hay una respuesta con ese nombre. Si es tuya, abre tu enlace personal o recupéralo en el navegador donde confirmaste. Si no lo tienes, avisa al organizador. Si se trata de otra persona, escribe tus apellidos completos.' });
      if (data.status !== 'saved' || !data.updatedAt) throw new Error('Missing receipt');
      return res.status(200).json({ saved: true, id: input.id, updatedAt: data.updatedAt });
    } catch { return res.status(503).json({ error: reading ? 'No pudimos cargar tu respuesta. Intenta nuevamente; tu confirmación sigue guardada.' : 'No pudimos guardar tu respuesta. Conservamos tus datos aquí para que vuelvas a intentarlo.' }); }
  };
}
export function adminHandler(deps = defaults) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido.' }); }
    try {
      if (!await deps.authorize(req)) return res.status(401).json({ error: 'Inicia sesión para ver la lista privada.' });
      const page = Math.max(0, Number(new URL(req.url, 'https://nordrastudio.mx').searchParams.get('page') || 0));
      if (!Number.isSafeInteger(page) || page > 10000) return res.status(400).json({ error: 'Página inválida.' });
      const { data, error, count } = await deps.database().from('nordra_posada_responses')
        .select('id,guest_name,attendance,created_at,updated_at', { count: 'exact' }).order('created_at', { ascending: false }).order('id').range(page * 200, page * 200 + 199);
      if (error) throw error;
      return res.status(200).json({ responses: data, total: count, page });
    } catch { return res.status(503).json({ error: 'No pudimos cargar las confirmaciones. Intenta nuevamente.' }); }
  };
}

// The host explicitly chose a shared list for friends. Expose only affirmative
// names; edit capabilities, declined responses and admin data stay private.
export function sharedHandler(deps = defaults) {
  return async (req, res) => {
    res.setHeader('Cache-Control', 'private, no-store');
    res.setHeader('X-Robots-Tag', 'noindex, nofollow');
    if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido.' }); }
    const page = Number(new URL(req.url, 'https://nordrastudio.mx').searchParams.get('page') || 0);
    if (!Number.isSafeInteger(page) || page < 0 || page > 10000) return res.status(400).json({ error: 'Página inválida.' });
    try {
      if (!deps.configured()) throw new Error('Unavailable');
      const { data, error, count } = await deps.database().from('nordra_posada_responses')
        .select('guest_name', { count: 'exact' }).eq('attendance', 'yes').order('guest_name').order('id').range(page * 200, page * 200 + 199);
      if (error) throw error;
      return res.status(200).json({ names: data.map(row => row.guest_name), total: count, page });
    } catch { return res.status(503).json({ error: 'No pudimos cargar la lista. Vuelve a intentarlo en un momento.' }); }
  };
}
