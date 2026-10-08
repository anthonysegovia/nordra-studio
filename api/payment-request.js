import { getPaymentRequest } from "../server/payment-requests.js";

export default function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Método no permitido." });
  }
  try {
    const item = getPaymentRequest(req.query.token);
    if (!item) return res.status(404).json({ error: "No encontramos este enlace de pago." });
    return res.status(200).json(item);
  } catch {
    return res.status(503).json({ error: "No podemos mostrar el pago en este momento. Contacta a Nordra." });
  }
}
