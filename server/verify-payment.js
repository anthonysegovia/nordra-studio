const origin = "https://api.mercadopago.com";

// Nunca confirmar con status/collection_status del navegador.
export async function verifyPayment(request, token, { accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN, paymentId, fetcher = fetch } = {}) {
  const unavailable = { ...request, state: "verification_unavailable", checkoutUrl: null };
  if (!accessToken) return unavailable;
  async function read(path) {
    const response = await fetcher(`${origin}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error("Payment verification failed");
    return response.json();
  }
  try {
    const search = `/v1/payments/search?external_reference=${encodeURIComponent(token)}&sort=date_created&criteria=desc&limit=100`;
    const [account, data, direct] = await Promise.all([read("/users/me"), read(search), paymentId ? read(`/v1/payments/${paymentId}`) : null]);
    if (!account.id) return unavailable;
    if (!Array.isArray(data.results) || data.paging?.total > 100) return unavailable;
    const payments = direct ? [...data.results.filter(payment => String(payment.id) !== String(direct.id)), direct] : data.results;
    const matches = payments.filter(payment => payment.external_reference === token &&
      String(payment.collector_id) === String(account.id) && payment.currency_id === "MXN" &&
      Number.isFinite(payment.transaction_amount) && Math.abs(payment.transaction_amount * 100 - request.amountCents) < 0.001);
    if (direct && !matches.includes(direct)) return unavailable;
    if (payments.some(payment => payment.external_reference === token && !matches.includes(payment))) return unavailable;
    // No ofrecer otro cobro si existe devolución, disputa o importe inesperado.
    if (matches.some(payment => ["refunded", "charged_back", "in_mediation"].includes(payment.status) || payment.transaction_amount_refunded > 0)) {
      return { ...request, state: "review", checkoutUrl: null };
    }
    if (matches.some(payment => payment.status === "approved")) return { ...request, state: "paid", checkoutUrl: null };
    if (matches.some(payment => ["pending", "in_process", "authorized"].includes(payment.status))) return { ...request, state: "pending", checkoutUrl: null };
    if (matches.some(payment => !["rejected", "cancelled"].includes(payment.status))) return unavailable;
    if (request.state === "paid") return unavailable;
    if (request.state !== "open") return { ...request, checkoutUrl: null };
    return { ...request, state: matches.length ? "retry" : "open" };
  } catch {
    return unavailable;
  }
}
