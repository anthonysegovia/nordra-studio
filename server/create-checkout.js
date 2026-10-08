import { getPaymentRequest } from "./payment-requests.js";

export function validatePaymentInput(body, now = Date.now()) {
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(body.requestId || "")) throw new Error("Invalid request ID");
  const text = value => typeof value === "string" && value.trim().length > 0 && value.length <= 160 && !/[\x00-\x1f]/.test(value);
  if (![body.reference, body.project, body.concept].every(text) || !Number.isSafeInteger(body.amountCents) || body.amountCents < 1 || body.amountCents > 100000000 ||
      typeof body.expiresAt !== "string" || !Number.isFinite(Date.parse(body.expiresAt)) || Date.parse(body.expiresAt) <= now || Date.parse(body.expiresAt) > now + 365 * 86400000) throw new Error("Invalid payment details");
  return { requestId: body.requestId, reference: body.reference.trim(), project: body.project.trim(), concept: body.concept.trim(), amountCents: body.amountCents, expiresAt: new Date(body.expiresAt).toISOString() };
}
export async function createCheckout(item, token, { accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN, site = process.env.NORDRA_SITE_URL, mode = process.env.NORDRA_PAYMENT_MODE, fetcher = fetch } = {}) {
  if (!accessToken || !["test", "live"].includes(mode)) throw new Error("Payment environment missing");
  const origin = new URL(site);
  if (origin.protocol !== "https:" || origin.username || origin.password || origin.search || origin.hash || origin.pathname !== "/") throw new Error("Invalid site origin");
  const headers = { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" };
  const accountResponse = await fetcher("https://api.mercadopago.com/users/me", { headers, signal: AbortSignal.timeout(8000) });
  if (!accountResponse.ok) throw new Error("Unable to verify payment account");
  const account = await accountResponse.json();
  if ((mode === "test") !== (Array.isArray(account.tags) && account.tags.includes("test_user"))) throw new Error("Payment account mode mismatch");
  const link = new URL(`/?pago=${token}&retorno=1`, origin);
  const response = await fetcher("https://api.mercadopago.com/checkout/preferences", {
    method: "POST", headers, signal: AbortSignal.timeout(8000), body: JSON.stringify({
      items: [{ id: item.reference, title: `${item.project} · ${item.concept}`, quantity: 1, currency_id: "MXN", unit_price: item.amountCents / 100 }],
      external_reference: token, back_urls: { success: link.href, pending: link.href, failure: link.href },
      statement_descriptor: "NORDRA STUDIO",
      auto_return: "approved", expires: true, expiration_date_to: item.expiresAt,
    }),
  });
  if (!response.ok) throw new Error("Checkout creation failed");
  const preference = await response.json();
  if (typeof preference.id !== "string" || !preference.id) throw new Error("Invalid preference response");
  getPaymentRequest(token, JSON.stringify({ [token]: { ...item, state: "open", checkoutUrl: preference.init_point } }));
  return { checkoutUrl: preference.init_point, preferenceId: preference.id };
}
