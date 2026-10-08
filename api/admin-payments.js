import { randomBytes } from "node:crypto";
import { adminConfigured, authorizeAdmin, databaseClient, jsonBody, sameOrigin } from "../server/admin-access.js";
import { adminRow, saveObservedState, storedRequest } from "../server/payment-store.js";
import { createCheckout, validatePaymentInput } from "../server/create-checkout.js";
import { verifyPayment } from "../server/verify-payment.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  if (!["GET", "POST", "PATCH"].includes(req.method)) { res.setHeader("Allow", "GET, POST, PATCH"); return res.status(405).json({ error: "Método no permitido." }); }
  if (req.method !== "GET" && !sameOrigin(req)) return res.status(403).json({ error: "Solicitud no permitida." });
  try {
    if (!adminConfigured()) return res.status(503).json({ error: "El panel todavía requiere configuración." });
    if (!await authorizeAdmin(req)) return res.status(401).json({ error: "Inicia sesión con tu usuario administrador." });
    const db = databaseClient();
    if (req.method === "GET") {
      const { data, error } = await db.from("nordra_payment_requests").select("*").order("created_at", { ascending: false }).limit(100);
      if (error) throw error;
      return res.status(200).json({ requests: data.map(row => adminRow(row)) });
    }
    let body;
    try { body = jsonBody(req); } catch { return res.status(400).json({ error: "Solicitud no válida." }); }
    if (req.method === "PATCH") {
      if (typeof body.token !== "string" || !/^[a-f0-9]{64}$/.test(body.token)) return res.status(400).json({ error: "Solicitud de pago no válida." });
      const { data, error } = await db.from("nordra_payment_requests").select("*").eq("token", body.token).maybeSingle();
      if (error) throw error;
      if (!data) return res.status(404).json({ error: "No encontramos esta solicitud." });
      const request = storedRequest(data);
      if (!request) return res.status(409).json({ error: "El enlace no está listo. Revisa la solicitud antes de crear otro cobro." });
      const result = await verifyPayment(request, body.token);
      await saveObservedState(body.token, result.state);
      return res.status(200).json({ state: result.state });
    }
    let item;
    try { item = validatePaymentInput(body); } catch { return res.status(400).json({ error: "Revisa referencia, proyecto, concepto, importe y vencimiento futuro (máximo un año)." }); }
    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN || !["test", "live"].includes(process.env.NORDRA_PAYMENT_MODE)) return res.status(503).json({ error: "Falta configurar la cuenta y el modo de Mercado Pago." });
    // Reservar antes de llamar a Mercado Pago; el índice único evita duplicar envíos.
    const token = randomBytes(32).toString("hex");
    const { data: reserved, error: reservationError } = await db.from("nordra_payment_requests").insert({
      token, request_id: item.requestId, reference: item.reference, project: item.project, concept: item.concept,
      amount_cents: item.amountCents, expires_at: item.expiresAt, state: "creating", created_by: process.env.NORDRA_ADMIN_USER_ID,
    }).select("*").single();
    if (reservationError) {
      if (reservationError.code !== "23505") throw reservationError;
      const { data: existing, error } = await db.from("nordra_payment_requests").select("*").eq("request_id", item.requestId).maybeSingle();
      if (error) throw error;
      if (existing?.checkout_url && existing.state === "open" && existing.reference === item.reference && existing.concept === item.concept && existing.project === item.project && existing.amount_cents === item.amountCents && Date.parse(existing.expires_at) === Date.parse(item.expiresAt)) {
        return res.status(200).json({ link: adminRow(existing).link });
      }
      return res.status(409).json({ error: "Ya existe una solicitud con esta referencia y concepto, o sigue en preparación. Revísala antes de crear otro cobro." });
    }
    try {
      const checkout = await createCheckout(item, token);
      const { data: saved, error } = await db.from("nordra_payment_requests").update({ checkout_url: checkout.checkoutUrl, preference_id: checkout.preferenceId, state: "open" }).eq("token", reserved.token).eq("state", "creating").select("*").single();
      if (error) throw error;
      return res.status(201).json({ link: adminRow(saved).link });
    } catch {
      // Puede existir una preferencia si falló la respuesta o el guardado. No reintentar automáticamente.
      await db.from("nordra_payment_requests").update({ state: "creation_failed" }).eq("token", token).eq("state", "creating");
      return res.status(503).json({ error: "No pudimos completar el enlace. La solicitud quedó registrada para revisar; no crees otro cobro igual sin comprobar Mercado Pago." });
    }
  } catch { return res.status(503).json({ error: "No pudimos completar la operación. Intenta más tarde." }); }
}
