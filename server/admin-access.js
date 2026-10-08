import { createClient } from "@supabase/supabase-js";

export function adminConfigured(env = process.env) {
  return Boolean(env.SUPABASE_URL && env.SUPABASE_PUBLISHABLE_KEY && env.SUPABASE_SECRET_KEY &&
    /^[a-f0-9-]{36}$/i.test(env.NORDRA_ADMIN_USER_ID || "") && env.NORDRA_SITE_URL);
}
export function authClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export function databaseClient() {
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
export function validAdmin(user, env = process.env) {
  return Boolean(user && user.id === env.NORDRA_ADMIN_USER_ID && user.email_confirmed_at);
}
export function sameOrigin(req, site = process.env.NORDRA_SITE_URL) {
  try { return new URL(site).protocol === "https:" && req.headers.origin === new URL(site).origin; }
  catch { return false; }
}
export function sessionCookie(req) {
  const match = (req.headers.cookie || "").split(";").map(value => value.trim()).find(value => value.startsWith("__Host-nordra_admin="));
  if (!match) return null;
  const value = match.slice("__Host-nordra_admin=".length);
  return /^[A-Za-z0-9._-]{20,6000}$/.test(value) ? value : null;
}
export function setSessionCookie(res, value, maxAge) {
  res.setHeader("Set-Cookie", `__Host-nordra_admin=${value}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${Math.max(0, Math.min(3600, Math.floor(maxAge)))}`);
}
export async function authorizeAdmin(req) {
  if (!adminConfigured()) return false;
  const token = sessionCookie(req);
  if (!token) return false;
  const { data, error } = await authClient().auth.getUser(token);
  return !error && validAdmin(data.user);
}
export function jsonBody(req) {
  if (!(req.headers["content-type"] || "").startsWith("application/json")) throw new Error("Invalid content type");
  if (Number(req.headers["content-length"] || 0) > 8192) throw new Error("Body too large");
  const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  if (!body || typeof body !== "object" || Array.isArray(body) || JSON.stringify(body).length > 8192) throw new Error("Invalid body");
  return body;
}
