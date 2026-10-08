import { databaseClient } from "./admin-access.js";
import { getPaymentRequest } from "./payment-requests.js";

export function databaseConfigured() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SECRET_KEY); }
export function storedRequest(row) {
  if (!row.checkout_url || !["open", "paid", "closed"].includes(row.state)) return null;
  return getPaymentRequest(row.token, JSON.stringify({ [row.token]: {
    reference: row.reference, project: row.project, concept: row.concept, amountCents: row.amount_cents,
    expiresAt: row.expires_at, state: row.state, checkoutUrl: row.checkout_url,
  } }));
}
export async function lookupStoredRequest(token) {
  if (!databaseConfigured() || typeof token !== "string" || !/^[a-f0-9]{64}$/.test(token)) return null;
  const { data, error } = await databaseClient().from("nordra_payment_requests").select("*").eq("token", token).maybeSingle();
  if (error) throw new Error("Payment storage unavailable");
  return data ? storedRequest(data) : null;
}
export function adminRow(row, site = process.env.NORDRA_SITE_URL) {
  const link = new URL("/", site); link.searchParams.set("pago", row.token);
  const expired = row.state === "open" && Date.parse(row.expires_at) <= Date.now();
  const observed = row.last_verified_state;
  return { token: row.token, reference: row.reference, project: row.project, concept: row.concept,
    amountCents: row.amount_cents, expiresAt: row.expires_at, createdAt: row.created_at,
    state: observed && ["paid", "pending", "refunded", "partially_refunded", "review", "verification_unavailable"].includes(observed) ? observed : expired ? "expired" : row.state,
    link: link.href };
}
export async function saveObservedState(token, state) {
  if (!databaseConfigured()) return;
  const { error } = await databaseClient().from("nordra_payment_requests").update({ last_verified_state: state, last_verified_at: new Date().toISOString() }).eq("token", token);
  if (error) throw new Error("Payment state could not be saved");
}
