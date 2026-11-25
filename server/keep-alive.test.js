import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { keepAliveHandler } from './keep-alive.js';

function call(handler, req) {
  const res = { headers: {}, code: 0, body: null, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } };
  return handler({ headers: {}, ...req }, res).then(() => res);
}
const dbWith = (result, seen = []) => () => ({ from(table) { seen.push(table); return { select(col, opts) { seen.push(col, opts.head); return { limit: async () => result }; } }; } });

test('the daily touch only reads a head count and reports success', async () => {
  const seen = [];
  const res = await call(keepAliveHandler({ db: dbWith({ error: null }, seen), secret: () => '' }), { method: 'GET' });
  assert.equal(res.code, 200);
  assert.deepEqual(res.body, { ok: true });
  assert.deepEqual(seen, ['nordra_wedding_workspaces', 'id', true]);
  assert.equal(res.headers['Cache-Control'], 'private, no-store');
});

test('a database failure answers 503 without leaking details', async () => {
  const original = console.error; console.error = () => {};
  try {
    const res = await call(keepAliveHandler({ db: dbWith({ error: new Error('paused') }), secret: () => '' }), { method: 'GET' });
    assert.equal(res.code, 503);
    assert.deepEqual(res.body, { ok: false });
  } finally { console.error = original; }
});

test('with CRON_SECRET configured, only the matching bearer token is accepted', async () => {
  const handler = keepAliveHandler({ db: dbWith({ error: null }), secret: () => 's3cret' });
  assert.equal((await call(handler, { method: 'GET' })).code, 401);
  assert.equal((await call(handler, { method: 'GET', headers: { authorization: 'Bearer nope' } })).code, 401);
  assert.equal((await call(handler, { method: 'GET', headers: { authorization: 'Bearer s3cret' } })).code, 200);
});

test('only GET is allowed', async () => {
  const res = await call(keepAliveHandler({ db: dbWith({ error: null }), secret: () => '' }), { method: 'POST' });
  assert.equal(res.code, 405);
});

test('vercel.json schedules the touch once a day', () => {
  const config = JSON.parse(readFileSync(new URL('../vercel.json', import.meta.url), 'utf8'));
  const cron = (config.crons || []).find(c => c.path === '/api/keep-alive');
  assert.ok(cron, 'cron for /api/keep-alive');
  assert.match(cron.schedule, /^\d{1,2} \d{1,2} \* \* \*$/);
});
