import { adminConfigurationIssues, adminConfigured, authClient, authorizeAdmin, jsonBody, sameOrigin, setSessionCookie, validAdmin } from "../server/admin-access.js";

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Robots-Tag", "noindex, nofollow");
  try {
    if (req.method === "GET") return res.status(200).json({ configured: adminConfigured(), configurationIssues: adminConfigurationIssues(), signedIn: await authorizeAdmin(req) });
    if (!["POST", "DELETE"].includes(req.method)) { res.setHeader("Allow", "GET, POST, DELETE"); return res.status(405).json({ error: "Método no permitido." }); }
    if (!sameOrigin(req)) return res.status(403).json({ error: "Solicitud no permitida." });
    if (req.method === "DELETE") { setSessionCookie(res, "", 0); return res.status(200).json({ signedIn: false }); }
    if (!adminConfigured()) return res.status(503).json({ error: "El acceso requiere configurar la base de datos y tu usuario administrador." });
    let body;
    try { body = jsonBody(req); } catch { return res.status(400).json({ error: "Solicitud no válida." }); }
    if (typeof body.email !== "string" || body.email.length > 254 || typeof body.password !== "string" || body.password.length > 200) return res.status(400).json({ error: "Indica correo y contraseña válidos." });
    const { data, error } = await authClient().auth.signInWithPassword({ email: body.email, password: body.password });
    if (error || !data.session || !validAdmin(data.user)) return res.status(401).json({ error: "No pudimos iniciar sesión con ese acceso." });
    setSessionCookie(res, data.session.access_token, data.session.expires_in);
    return res.status(200).json({ signedIn: true });
  } catch { return res.status(503).json({ error: "No pudimos consultar el acceso. Intenta más tarde." }); }
}
