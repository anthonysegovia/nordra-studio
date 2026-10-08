export function getPaymentRequest(token, raw = process.env.NORDRA_PAYMENT_REQUESTS_JSON) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const requests = JSON.parse(raw || "{}");
  if (!Object.hasOwn(requests, token)) return null;
  const item = requests[token];
  if (!item || !["open", "paid", "closed"].includes(item.state) ||
      !Number.isSafeInteger(item.amountCents) || item.amountCents <= 0 ||
      ![item.reference, item.concept, item.project].every(value => typeof value === "string" && value.length > 0 && value.length <= 200) ||
      !Number.isFinite(Date.parse(item.expiresAt))) throw new Error("Invalid payment configuration");
  const url = new URL(item.checkoutUrl);
  if (url.protocol !== "https:" || url.username || url.password ||
      !["www.mercadopago.com.mx", "www.mercadopago.com", "sandbox.mercadopago.com"].includes(url.hostname)) {
    throw new Error("Invalid checkout URL");
  }
  const state = item.state === "open" && Date.parse(item.expiresAt) <= Date.now() ? "expired" : item.state;
  return { reference: item.reference, concept: item.concept, project: item.project,
    amountCents: item.amountCents, expiresAt: item.expiresAt, state,
    checkoutUrl: state === "open" ? url.href : null };
}
