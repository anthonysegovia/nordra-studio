// Local-only browser fixture: real frontend + API handler, disposable memory data.
// No credentials, production requests, or persistent guest records.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { guestHandler } from '../server/posada-rsvp.js';

const root = fileURLToPath(new URL('../public/', import.meta.url));
const rows = new Map();
const key = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().replace(/\s+/g, ' ').toLowerCase();
const api = guestHandler({ configured: () => true, bucket: () => 'f'.repeat(64), database: () => ({ rpc: async (fn, args) => {
  const row = rows.get(args.p_id);
  if (fn === 'nordra_read_posada_response') return { data: row && row.hash === args.p_token_hash ? { status: 'found', name: row.name, attendance: row.attendance, updatedAt: row.updatedAt } : { status: 'missing' } };
  if (row && row.hash !== args.p_token_hash) return { data: { status: 'conflict' } };
  if ([...rows.entries()].some(([id, value]) => id !== args.p_id && key(value.name) === key(args.p_name))) return { data: { status: 'duplicate' } };
  const updatedAt = new Date().toISOString();
  rows.set(args.p_id, { name: args.p_name, attendance: args.p_attendance, hash: args.p_token_hash, updatedAt });
  return { data: { status: 'saved', updatedAt } };
} }) });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.png': 'image/png', '.jpg': 'image/jpeg', '.ico': 'image/x-icon' };
const server = createServer(async (req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (path === '/fixture-state') { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify({ count: rows.size, responses: [...rows.values()].map(({name,attendance}) => ({name,attendance})) })); return; }
  if (path === '/api/posada-rsvp') {
    let body = ''; for await (const chunk of req) { body += chunk; if (body.length > 8192) { res.writeHead(413).end(); return; } }
    req.body = body; req.headers.origin = 'https://posadacovadonga.nordrastudio.mx';
    res.status = code => { res.statusCode = code; return res; }; res.json = data => { res.setHeader('Content-Type','application/json'); res.end(JSON.stringify(data)); };
    await api(req, res); return;
  }
  try {
    const file = resolve(root, '.' + decodeURIComponent(path));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(403).end(); return; }
    let content = await readFile(file);
    if (path.endsWith('/event-details.js')) content = Buffer.from(content.toString().replace("const endpoint = 'https://nordrastudio.mx/api/posada-rsvp'", "const endpoint = '/api/posada-rsvp'").replace("'https://posadacovadonga.nordrastudio.mx/#respuesta='", "location.origin + '/demos/posada-luz/index.html#respuesta='"));
    res.setHeader('Content-Type', types[extname(file)] || 'application/octet-stream'); res.setHeader('Cache-Control','no-store'); res.end(content);
  } catch { res.writeHead(404).end(); }
});
server.listen(5185,'127.0.0.1',()=>console.log('Disposable RSVP UI fixture: http://127.0.0.1:5185/demos/posada-luz/index.html#confirmar'));
