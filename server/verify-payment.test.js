import test from "node:test";
import assert from "node:assert/strict";
import { verifyPayment } from "./verify-payment.js";
import handler from "../api/payment-request.js";
const token = "a".repeat(64);
const request = { reference: "NDR-001", concept: "Anticipo", project: "Página", amountCents: 10000,
  expiresAt: "2099-01-01T00:00:00Z", state: "open", checkoutUrl: "https://www.mercadopago.com.mx/checkout/start?pref_id=test" };
const payment = { id: 123, external_reference: token, collector_id: 10, currency_id: "MXN", transaction_amount: 100, transaction_amount_refunded: 0, status: "approved" };
const verify = (payments, options = {}) => verifyPayment(request, token, {
  accessToken: "test-placeholder", fetcher: async url => ({ ok: true, json: async () => url.endsWith("/users/me") ? { id: 10 } : { results: payments, paging: { total: payments.length } } }), ...options,
});
test("approved payment with matching seller, currency, reference and amount confirms and hides checkout", async () => {
  const result = await verify([payment]); assert.equal(result.state, "paid"); assert.equal(result.checkoutUrl, null);
});
test("another quote, seller, currency or amount never confirms", async () => {
  for (const patch of [{ external_reference: "other" }, { collector_id: 11 }, { currency_id: "USD" }, { transaction_amount: 99 }]) {
    assert.notEqual((await verify([{ ...payment, ...patch }])).state, "paid");
  }
});
test("pending payments suppress another payment; rejected permits retry", async () => {
  for (const status of ["pending", "in_process", "authorized"]) {
    const result = await verify([{ ...payment, status }]); assert.equal(result.state, "pending"); assert.equal(result.checkoutUrl, null);
  }
  assert.equal((await verify([{ ...payment, status: "rejected" }])).state, "retry");
});
test("refunds, disputes and unknown states do not permit paying again", async () => {
  for (const patch of [{ status: "refunded" }, { status: "charged_back" }, { status: "in_mediation" }, { transaction_amount_refunded: 50 }, { status: "new-status" }]) {
    const result = await verify([{ ...payment, ...patch }]); assert.notEqual(result.state, "paid"); assert.equal(result.checkoutUrl, null);
  }
});
test("missing secret, provider failure and malformed response fail closed", async () => {
  for (const options of [{ accessToken: "" }, { fetcher: async () => { throw new Error("offline"); } }, { fetcher: async () => ({ ok: false }) }, { fetcher: async () => ({ ok: true, json: async () => ({ id: 10 }) }) }]) {
    const result = await verify([], options); assert.equal(result.state, "verification_unavailable"); assert.equal(result.checkoutUrl, null);
  }
});
test("direct return payment works before search indexing but must match quote", async () => {
  for (const direct of [payment, { ...payment, external_reference: "other" }]) {
    const result = await verify([], { paymentId: "123", fetcher: async url => ({ ok: true, json: async () => url.endsWith("/users/me") ? { id: 10 } : url.includes("/search?") ? { results: [], paging: { total: 0 } } : direct }) });
    assert.equal(result.state, direct === payment ? "paid" : "verification_unavailable");
  }
});
test("an approved earlier payment blocks retry even when return ID is rejected", async () => {
  const rejected = { ...payment, id: 124, status: "rejected" };
  const result = await verify([], { paymentId: "124", fetcher: async url => ({ ok: true, json: async () => url.endsWith("/users/me") ? { id: 10 } : url.includes("/search?") ? { results: [payment], paging: { total: 1 } } : rejected }) });
  assert.equal(result.state, "paid"); assert.equal(result.checkoutUrl, null);
});
test("no payment leaves checkout open; expired requests stay closed; manual paid needs provider proof", async () => {
  assert.equal((await verify([])).state, "open");
  const options = { accessToken: "test-placeholder", fetcher: async url => ({ ok: true, json: async () => url.endsWith("/users/me") ? { id: 10 } : { results: [], paging: { total: 0 } } }) };
  assert.equal((await verifyPayment({ ...request, state: "expired", checkoutUrl: null }, token, options)).state, "expired");
  assert.equal((await verifyPayment({ ...request, state: "paid", checkoutUrl: null }, token, options)).state, "verification_unavailable");
});
test("HTTP handler ignores forged browser success flags without secret", async () => {
  const old = process.env.NORDRA_PAYMENT_REQUESTS_JSON;
  const oldSecret = process.env.MERCADO_PAGO_ACCESS_TOKEN;
  process.env.NORDRA_PAYMENT_REQUESTS_JSON = JSON.stringify({ [token]: request }); delete process.env.MERCADO_PAGO_ACCESS_TOKEN;
  let status, body;
  const response = { setHeader() {}, status(value) { status = value; return this; }, json(value) { body = value; return this; } };
  try {
    await handler({ method: "GET", query: { token, status: "approved", collection_status: "approved" } }, response);
    assert.equal(status, 200); assert.equal(body.state, "verification_unavailable"); assert.equal(body.checkoutUrl, null);
    await handler({ method: "GET", query: { token, paymentId: ["123"] } }, response); assert.equal(status, 400);
    await handler({ method: "POST", query: { token } }, response); assert.equal(status, 405);
  } finally {
    if (old === undefined) delete process.env.NORDRA_PAYMENT_REQUESTS_JSON; else process.env.NORDRA_PAYMENT_REQUESTS_JSON = old;
    if (oldSecret === undefined) delete process.env.MERCADO_PAGO_ACCESS_TOKEN; else process.env.MERCADO_PAGO_ACCESS_TOKEN = oldSecret;
  }
});

test("a payment with unexpected amount blocks checkout even alongside an approved payment", async () => {
  const result = await verify([payment, { ...payment, id: 999, transaction_amount: 90 }]);
  assert.equal(result.state, "verification_unavailable"); assert.equal(result.checkoutUrl, null);
});

test("a rejected payment cannot reopen an expired or closed request", async () => {
  for (const state of ["expired", "closed"]) {
    const result = await verifyPayment({ ...request, state, checkoutUrl: null }, token, {
      accessToken: "test-placeholder", fetcher: async url => ({ ok: true, json: async () => url.endsWith("/users/me") ? { id: 10 } : { results: [{ ...payment, status: "rejected" }], paging: { total: 1 } } }),
    });
    assert.equal(result.state, state); assert.equal(result.checkoutUrl, null);
  }
});

test("truncated payment history fails closed instead of assuming no prior payment", async () => {
  const result = await verify([], { fetcher: async url => ({ ok: true, json: async () => url.endsWith("/users/me") ? { id: 10 } : { results: [], paging: { total: 101 } } }) });
  assert.equal(result.state, "verification_unavailable"); assert.equal(result.checkoutUrl, null);
});
