import test from "node:test";
import assert from "node:assert/strict";
import { validAdmin, sameOrigin, sessionCookie, setSessionCookie, jsonBody } from "./admin-access.js";
import { createCheckout, validatePaymentInput } from "./create-checkout.js";
import { adminRow, storedRequest } from "./payment-store.js";
import handler from "../api/admin-payments.js";

const adminId = "11111111-1111-4111-8111-111111111111";
const token = "a".repeat(64);
const future = new Date(Date.now() + 86400000).toISOString();
const item = { requestId: adminId, reference: "NDR-001", project: "Página", concept: "Anticipo", amountCents: 149950, expiresAt: future };
const row = { token, reference: item.reference, project: item.project, concept: item.concept, amount_cents: item.amountCents, expires_at: future, created_at: new Date().toISOString(), state: "open", checkout_url: "https://www.mercadopago.com.mx/checkout/start?pref_id=test" };

test("only configured confirmed user is an administrator", () => {
  const env = { NORDRA_ADMIN_USER_ID: adminId };
  assert.equal(validAdmin({ id: adminId, email_confirmed_at: "2026-01-01" }, env), true);
  assert.equal(validAdmin({ id: adminId }, env), false);
  assert.equal(validAdmin({ id: "another", email_confirmed_at: "2026-01-01" }, env), false);
  assert.equal(validAdmin(null, env), false);
});
test("mutations require exact configured HTTPS origin", () => {
  for (const origin of [undefined, "null", "https://attacker.test", "https://nordrastudio.mx.attacker.test"]) assert.equal(sameOrigin({ headers: { origin } }, "https://nordrastudio.mx"), false);
  assert.equal(sameOrigin({ headers: { origin: "https://nordrastudio.mx" } }, "https://nordrastudio.mx"), true);
});
test("session cookie is secure, HttpOnly and scoped to host", () => {
  let cookie;
  setSessionCookie({ setHeader(_key, value) { cookie = value; } }, "a".repeat(50), 10000);
  assert.match(cookie, /HttpOnly; Secure; SameSite=Strict; Max-Age=3600/);
  assert.match(cookie, /^__Host-nordra_admin=/); assert.doesNotMatch(cookie, /Domain=/);
  assert.equal(sessionCookie({ headers: { cookie: `other=value; __Host-nordra_admin=${"a".repeat(50)}` } }), "a".repeat(50));
  assert.equal(sessionCookie({ headers: { cookie: "__Host-nordra_admin=bad%0Avalue" } }), null);
});
test("payment amounts and expiration come from validated server input", () => {
  assert.equal(validatePaymentInput(item).amountCents, 149950);
  for (const patch of [{ amountCents: -1 }, { amountCents: 10.5 }, { amountCents: 100000001 }, { expiresAt: "2000-01-01" }, { requestId: "arbitrary" }, { concept: "\nInjected" }]) assert.throws(() => validatePaymentInput({ ...item, ...patch }));
  assert.throws(() => jsonBody({ headers: { "content-type": "text/plain" }, body: item }));
  assert.throws(() => jsonBody({ headers: { "content-type": "application/json", "content-length": "99999" }, body: item }));
});
test("checkout rejects wrong account mode before creating a preference", async () => {
  let creates = 0;
  await assert.rejects(createCheckout(item, token, { accessToken: "placeholder", site: "https://nordrastudio.mx", mode: "test", fetcher: async url => {
    if (url.endsWith("/checkout/preferences")) creates++;
    return { ok: true, json: async () => ({ tags: [] }) };
  } }));
  assert.equal(creates, 0);
});
test("checkout uses agreed cents, matching reference, test seller and HTTPS return", async () => {
  let sent;
  const result = await createCheckout(item, token, { accessToken: "placeholder", site: "https://nordrastudio.mx", mode: "test", fetcher: async (url, options) => {
    if (url.endsWith("/users/me")) return { ok: true, json: async () => ({ tags: ["test_user"] }) };
    sent = JSON.parse(options.body);
    return { ok: true, json: async () => ({ id: "pref-1", init_point: row.checkout_url }) };
  } });
  assert.equal(sent.items[0].unit_price, 1499.5); assert.equal(sent.items[0].currency_id, "MXN");
  assert.equal(sent.statement_descriptor, "NORDRA STUDIO");
  assert.equal(sent.external_reference, token); assert.match(sent.back_urls.success, /^https:\/\/nordrastudio.mx\//);
  assert.equal(result.preferenceId, "pref-1");
});
test("stored request never exposes incomplete checkout or database fields", () => {
  assert.equal(storedRequest({ ...row, state: "creating", checkout_url: null }), null);
  const publicRequest = storedRequest({ ...row, created_by: adminId });
  assert.equal(publicRequest.amountCents, 149950); assert.equal(publicRequest.created_by, undefined);
  const summary = adminRow({ ...row, checkout_url: "private", last_verified_state: "pending" }, "https://nordrastudio.mx");
  assert.equal(summary.state, "pending"); assert.equal(summary.checkout_url, undefined);
});
test("admin API refuses cross-origin requests and unconfigured access", async () => {
  let status, body;
  const res = { setHeader() {}, status(value) { status = value; return this; }, json(value) { body = value; return this; } };
  await handler({ method: "POST", headers: { origin: "https://attacker.test" } }, res);
  assert.equal(status, 403); assert.ok(body.error);
  const old = process.env.NORDRA_ADMIN_USER_ID; delete process.env.NORDRA_ADMIN_USER_ID;
  try { await handler({ method: "GET", headers: {} }, res); assert.equal(status, 503); }
  finally { if (old !== undefined) process.env.NORDRA_ADMIN_USER_ID = old; }
});
