import test from "node:test";
import assert from "node:assert/strict";
import { getPaymentRequest } from "./payment-requests.js";
const token = "a".repeat(64);
const item = { reference: "NDR-001", concept: "Anticipo 50%", project: "Página", amountCents: 149950,
  expiresAt: "2099-01-01T00:00:00Z", state: "open", checkoutUrl: "https://www.mercadopago.com.mx/checkout/start?pref_id=test" };
const lookup = patch => getPaymentRequest(token, JSON.stringify({ [token]: { ...item, ...patch } }));
test("uses server amount and omits private configuration fields", () => {
  const result = lookup({ clientEmail: "private@example.com" });
  assert.equal(result.amountCents, 149950); assert.equal(result.clientEmail, undefined);
});
test("unknown or malformed token cannot retrieve another quote", () => {
  assert.equal(getPaymentRequest("demo", "{}"), null);
  assert.equal(getPaymentRequest([token], "{}"), null);
  assert.equal(getPaymentRequest("b".repeat(64), JSON.stringify({ [token]: item })), null);
});
test("expired, paid and closed requests hide checkout", () => {
  for (const patch of [{ expiresAt: "2020-01-01T00:00:00Z" }, { state: "paid" }, { state: "closed" }]) assert.equal(lookup(patch).checkoutUrl, null);
});
test("rejects malformed amounts, state and non-Mercado Pago redirects", () => {
  for (const patch of [{ amountCents: -1 }, { amountCents: 1.5 }, { state: "unknown" }, { checkoutUrl: "https://www.mercadopago.com.mx.attacker.test/" }, { checkoutUrl: "javascript:alert(1)" }]) assert.throws(() => lookup(patch));
});
