import { getPaymentRequest } from "../server/payment-requests.js";
import { verifyPayment } from "../server/verify-payment.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido." });
  }
  try {
    const item = getPaymentRequest(req.query.token);
    if (!item) return res.status(404).json({ error: "No encontramos este enlace de pago." });
    const paymentId = req.query.paymentId;
    if (paymentId !== undefined && (typeof paymentId !== "string" || !/^\d{1,20}$/.test(paymentId))) {
      return res.status(400).json({ error: "Identificador de pago no válido." });
    }
    const verified = await verifyPayment(item, req.query.token, { paymentId });
    return res.status(200).json(verified);
  } catch {
    return res.status(503).json({ error: "No podemos mostrar el pago en este momento. Contacta a Nordra." });
  }
}
