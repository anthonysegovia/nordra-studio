import test from 'node:test';
import assert from 'node:assert/strict';
import { guestHandler, adminHandler, sharedHandler, validateResponse, requestBucket } from './posada-rsvp.js';

const input = { id: '16e50033-3f11-49af-9ea1-dd014ade236c', editToken: 'a'.repeat(64), name: 'Ana Pérez', attendance: 'yes', website: '' };
function response() { return { headers: {}, code: 200, setHeader(key, value) { this.headers[key] = value; }, status(code) { this.code = code; return this; }, json(data) { this.data = data; return this; }, end() { return this; } }; }
const request = (body = input, method = 'POST', origin = 'https://posadacovadonga.nordrastudio.mx') => ({ method, headers: { origin, 'content-type': 'application/json' }, body });
function dependencies(result = { status: 'saved', updatedAt: '2026-10-23T00:00:00Z' }) { return { configured: () => true, database: () => ({ rpc: async () => ({ data: result, error: null }) }), bucket: () => 'b'.repeat(64) }; }

test('normalizes names, hashes edit capabilities, rejects invalid attendance and hidden fields', () => {
  const valid = validateResponse({ ...input, name: '  Ana   Pérez  ' });
  assert.equal(valid.name, 'Ana Pérez'); assert.notEqual(valid.tokenHash, input.editToken); assert.equal(valid.tokenHash.length, 64);
  for (const body of [{ ...input, name: 'x' }, { ...input, name: '<script>' }, { ...input, name: 'A\u200bna' }, { ...input, attendance: 'maybe' }, { ...input, editToken: 'guess' }, { ...input, website: 'spam' }]) assert.throws(() => validateResponse(body));
});
test('only invitation origins receive CORS and unsupported methods cannot read guests', async () => {
  for (const origin of ['https://evil.example', undefined, 'https://posadacovadonga.nordrastudio.mx.evil.example']) {
    const res = response(); await guestHandler(dependencies())(request(input, 'POST', origin === undefined ? '' : origin), res);
    assert.equal(res.code, 403); assert.equal(res.headers['Access-Control-Allow-Origin'], undefined);
  }
  const preflight = response(); await guestHandler(dependencies())(request(input, 'OPTIONS'), preflight); assert.equal(preflight.code, 204);
  const read = response(); await guestHandler(dependencies())(request(input, 'GET'), read); assert.equal(read.code, 405);
});
test('malformed and oversized payloads never reach storage', async () => {
  const deps = { ...dependencies(), database: () => { throw new Error('Must not access database'); } };
  for (const body of [null, [], '{broken', { ...input, name: 'x'.repeat(9000) }]) {
    const res = response(); await guestHandler(deps)(request(body), res); assert.equal(res.code, 400);
  }
});
test('receipt is returned only after storage ack; no names or tokens leak', async () => {
  const res = response(); await guestHandler(dependencies())(request(), res);
  assert.equal(res.code, 200); assert.deepEqual(res.data, { saved: true, id: input.id, updatedAt: '2026-10-23T00:00:00Z' });
  const failed = response(); await guestHandler({ ...dependencies(), database: () => ({ rpc: async () => ({ error: 'failed' }) }) })(request(), failed);
  assert.equal(failed.code, 503); assert.equal(failed.data.saved, undefined);
  for (const [status, code] of [['limited', 429], ['conflict', 409]]) { const r = response(); await guestHandler(dependencies({ status }))(request(), r); assert.equal(r.code, code); }
});
test('unauthenticated private-list requests never query the database', async () => {
  let queries = 0;
  const res = response(); await adminHandler({ authorize: async () => false, database: () => { queries++; } })({ method: 'GET', headers: {}, url: '/api/admin-posada' }, res);
  assert.equal(res.code, 401); assert.equal(queries, 0); assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('a duplicate name returns an actionable conflict, never a saved receipt or someone else’s identity', async () => {
  const res = response(); await guestHandler(dependencies({ status: 'duplicate' }))(request(), res);
  assert.equal(res.code, 409); assert.equal(res.data.code, 'duplicate_name');
  assert.match(res.data.error, /Ya hay una respuesta/); assert.match(res.data.error, /organizador/);
  assert.equal(res.data.saved, undefined); assert.equal(res.data.id, undefined);
  assert.equal(res.headers['Cache-Control'], 'private, no-store');
});
test('private-list projection never returns edit tokens and is bounded', async () => {
  let projection; let range;
  const query = { select(value) { projection = value; return this; }, order() { return this; }, async range(...values) { range = values; return { data: [], count: 0 }; } };
  const res = response(); await adminHandler({ authorize: async () => true, database: () => ({ from: () => query }) })({ method: 'GET', url: '/api/admin-posada?page=1' }, res);
  assert.equal(res.code, 200); assert.ok(!projection.includes('token')); assert.deepEqual(range, [200, 399]);
});
test('rate buckets rotate hourly and contain no raw address', () => {
  const req = { headers: { 'x-forwarded-for': '192.0.2.1' }, socket: { remoteAddress: '192.0.2.1' } };
  const a = requestBucket(req, 'secret', 0); assert.equal(a.length, 64); assert.ok(!a.includes('192.0.2.1'));
  assert.notEqual(a, requestBucket(req, 'secret', 3600000)); assert.notEqual(a, requestBucket(req, 'other', 0));
});
test('shared list exposes affirmative names only, without identifiers or edit tokens', async () => {
  let projection; let condition;
  const query = { select(value) { projection = value; return this; }, eq(...values) { condition = values; return this; }, order() { return this; }, async range() { return { data: [{ guest_name: 'Ana Pérez' }], count: 1 }; } };
  const res = response(); await sharedHandler({ configured: () => true, database: () => ({ from: () => query }) })({ method: 'GET', url: '/api/posada-confirmados' }, res);
  assert.equal(res.code, 200); assert.equal(projection, 'guest_name'); assert.deepEqual(condition, ['attendance', 'yes']);
  assert.deepEqual(res.data, { names: ['Ana Pérez'], total: 1, page: 0 });
});
test('personal-link recovery requires a full capability and only calls the read RPC', async () => {
  let called;
  const deps = { ...dependencies(), database: () => ({ rpc: async (fn, args) => { called = { fn, args }; return { data: { status: 'found', name: 'Ana Pérez', attendance: 'no', updatedAt: '2026-10-23T00:00:00Z', edit_token_hash: 'must not leak' } }; } }) };
  const res = response(); await guestHandler(deps)(request({ action: 'load', id: input.id, editToken: input.editToken }), res);
  assert.equal(res.code, 200); assert.equal(called.fn, 'nordra_read_posada_response');
  assert.equal(called.args.p_id, input.id); assert.notEqual(called.args.p_token_hash, input.editToken);
  assert.deepEqual(res.data, { id: input.id, name: 'Ana Pérez', attendance: 'no', updatedAt: '2026-10-23T00:00:00Z' });
  for (const body of [{ action: 'load', name: input.name }, { action: 'load', id: input.id }, { ...input, action: 'unknown' }]) {
    called = undefined; const bad = response(); await guestHandler(deps)(request(body), bad); assert.equal(bad.code, 400); assert.equal(called, undefined);
  }
});
test('recovery failures do not expose names, tokens or a false success', async () => {
  for (const [status, code] of [['missing', 404], ['limited', 429], ['found', 503]]) {
    const res = response(); await guestHandler(dependencies({ status }))(request({ action: 'load', id: input.id, editToken: input.editToken }), res);
    assert.equal(res.code, code); assert.equal(res.data.name, undefined); assert.equal(res.data.saved, undefined); assert.equal(res.data.editToken, undefined);
    assert.equal(res.headers['Cache-Control'], 'private, no-store');
  }
});
