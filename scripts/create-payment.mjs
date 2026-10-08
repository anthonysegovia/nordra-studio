import { randomBytes } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { getPaymentRequest } from "../server/payment-requests.js";

// Ejecutar solo después de aceptar la cotización. No incluye datos personales.
const [inputFile] = process.argv.slice(2);
if (!inputFile || !process.env.MERCADO_PAGO_ACCESS_TOKEN || !process.env.NORDRA_SITE_URL ||
    !["test", "live"].includes(process.env.NORDRA_PAYMENT_MODE)) {
  throw new Error("Indica archivo de cotización y configura MERCADO_PAGO_ACCESS_TOKEN, NORDRA_SITE_URL y NORDRA_PAYMENT_MODE (test/live).");
}
const site = new URL(process.env.NORDRA_SITE_URL);
if (site.protocol !== "https:" || site.username || site.password || site.search || site.hash || site.pathname !== "/") {
  throw new Error("NORDRA_SITE_URL debe ser el origen HTTPS de Nordra.");
}
const item = JSON.parse(await readFile(inputFile, "utf8"));
const token = randomBytes(32).toString("hex");
const candidate = { ...item, state: "open", checkoutUrl: "https://www.mercadopago.com.mx/checkout" };
getPaymentRequest(token, JSON.stringify({ [token]: candidate }));
if (Date.parse(item.expiresAt) <= Date.now()) throw new Error("La fecha de vencimiento debe ser futura.");
const outputFile = "payment-requests.private.json";
let requests = {};
try { requests = JSON.parse(await readFile(outputFile, "utf8")); }
catch (error) { if (error.code !== "ENOENT") throw error; }
if (Object.values(requests).some(existing => existing.reference === item.reference && existing.concept === item.concept)) {
  throw new Error("Ya existe una solicitud para esta referencia y concepto. Revisa el archivo antes de duplicar un cobro.");
}
const link = new URL(`/?pago=${token}`, site);
const returnLink = new URL(link); returnLink.searchParams.set("retorno", "1");
// En Checkout Pro las pruebas usan init_point y cuentas de prueba.
// Verificar la cuenta antes de crear preferencias evita confundir test/live.
const accountResponse = await fetch("https://api.mercadopago.com/users/me", {
  signal: AbortSignal.timeout(15000),
  headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}` },
});
if (!accountResponse.ok) throw new Error("No se pudo verificar el entorno de la cuenta de Mercado Pago.");
const account = await accountResponse.json();
const testAccount = Array.isArray(account.tags) && account.tags.includes("test_user");
if ((process.env.NORDRA_PAYMENT_MODE === "test") !== testAccount) {
  throw new Error("La cuenta no corresponde al modo elegido. Para test utiliza una cuenta vendedora de prueba; para live, una cuenta real.");
}
const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
  method: "POST", signal: AbortSignal.timeout(15000),
  headers: { Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify({
    items: [{ id: item.reference, title: `${item.project} · ${item.concept}`, quantity: 1, currency_id: "MXN", unit_price: item.amountCents / 100 }],
    external_reference: token,
    back_urls: { success: returnLink.href, pending: returnLink.href, failure: returnLink.href },
    auto_return: "approved", expires: true, expiration_date_to: item.expiresAt,
  }),
});
if (!response.ok) throw new Error(`Mercado Pago rechazó crear el cobro (${response.status}). No se guardó ni se cobró dinero.`);
const preference = await response.json();
candidate.checkoutUrl = preference.init_point;
getPaymentRequest(token, JSON.stringify({ [token]: candidate }));
requests[token] = candidate;
await writeFile(outputFile, JSON.stringify(requests, null, 2), { mode: 0o600 });
console.log(`Solicitud creada. Publica el contenido de ${outputFile} en NORDRA_PAYMENT_REQUESTS_JSON antes de compartir el enlace.`);
console.log(link.href);
