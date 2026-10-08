import { useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, LockKeyhole, MessageCircle } from "lucide-react";

type PaymentRequest = {
  reference: string; concept: string; project: string; amountCents: number;
  expiresAt: string; state: "open" | "paid" | "closed" | "expired" | "pending" | "retry" | "review" | "verification_unavailable"; checkoutUrl: string | null;
};
const demo: PaymentRequest = {
  reference: "NDR-DEMO-001", project: "Página para un negocio", concept: "Anticipo del 50% · Desarrollo de página",
  amountCents: 149950, expiresAt: "2030-12-31T23:59:59-06:00", state: "open", checkoutUrl: null,
};

export function Payment({ token }: { token: string }) {
  const isDemo = token === "demo";
  const [request, setRequest] = useState<PaymentRequest | null>(isDemo ? demo : null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const returned = new URLSearchParams(window.location.search).has("retorno");
  useEffect(() => {
    const previous = document.title;
    document.title = "Tu pago | Nordra Studio";
    const robots = document.createElement("meta");
    robots.name = "robots"; robots.content = "noindex, nofollow";
    document.head.appendChild(robots);
    const referrer = document.createElement("meta");
    referrer.name = "referrer"; referrer.content = "no-referrer";
    document.head.appendChild(referrer);
    const controller = new AbortController();
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (!isDemo) {
      if (!/^[a-f0-9]{64}$/.test(token)) setError("Este enlace de pago no es válido. Solicita uno nuevo a Nordra.");
      else {
        setChecking(true);
        const params = new URLSearchParams({ token });
        const paymentId = new URLSearchParams(window.location.search).get("payment_id");
        if (paymentId && /^\d{1,20}$/.test(paymentId)) params.set("paymentId", paymentId);
        fetch(`/api/payment-request?${params}`, { signal: controller.signal, cache: "no-store" })
        .then(async response => {
          const data = await response.json();
          if (!response.ok) throw new Error(data.error || "No pudimos cargar el pago.");
          setRequest(data);
          setError("");
          if (data.state === "pending" && refresh < 4) timer = setTimeout(() => setRefresh(value => value + 1), 15000);
        }).catch(reason => { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "No pudimos cargar el pago."); })
        .finally(() => { if (!controller.signal.aborted) setChecking(false); });
      }
    }
    return () => { controller.abort(); clearTimeout(timer); robots.remove(); referrer.remove(); document.title = previous; };
  }, [token, isDemo, refresh]);
  const contact = `https://wa.me/528129022231?text=${encodeURIComponent(`Hola, necesito ayuda con mi pago${request ? ` de la cotización ${request.reference}` : ""}.`)}`;
  const money = new Intl.NumberFormat("es-MX", { style: "currency", currency: "MXN" });
  return <main className="payment-page">
    <nav className="payment-nav"><a href="/" className="payment-brand">NORDRA<span>STUDIO</span></a><a href="/"><ArrowLeft size={16} /> Volver al inicio</a></nav>
    <div className="payment-layout">
      <section className="payment-intro"><span className="payment-eyebrow">UN PASO MÁS CERCA</span><h1>Tu proyecto,<br /><em>a punto de comenzar.</em></h1><p>Consulta el concepto y el importe acordado en tu cotización. Nos encargamos de acompañarte en lo que sigue.</p><a href={contact} target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> ¿Tienes alguna duda?</a></section>
      <section className="payment-card" aria-label="Detalle del pago" aria-busy={checking}>
        {isDemo && <p className="payment-demo">Demostración · Sin cargos reales</p>}
        {error ? <div role="alert"><h2>No pudimos abrir tu pago</h2><p>{error}</p><a href={contact}>Contactar a Nordra</a></div> : !request ? <p role="status">Cargando tu pago…</p> : <>
          <span className="payment-eyebrow">COTIZACIÓN {request.reference}</span><h2>{request.project}</h2><p className="payment-concept">{request.concept}</p>
          <div className="payment-total"><span>{request.state === "paid" ? "Total pagado" : "Total a pagar"}</span><strong>{money.format(request.amountCents / 100)} <small>MXN</small></strong><span>IVA incluido</span></div>
          <p className="payment-validity">Enlace válido hasta el {new Intl.DateTimeFormat("es-MX", { dateStyle: "long", timeZone: "America/Mexico_City" }).format(new Date(request.expiresAt))}.</p>
          {checking ? <p className="payment-notice" role="status">Verificando tu pago con Mercado Pago…</p> : request.state === "paid" ? <p className="payment-notice payment-notice-success" role="status"><CheckCircle2 size={18} /> Pago confirmado. Gracias por confiar en Nordra. Te acompañaremos con el siguiente paso de tu proyecto.</p> : request.state === "pending" ? <p className="payment-notice" role="status">Mercado Pago está procesando tu pago. No necesitas pagar nuevamente. Puedes consultar el estado más adelante.</p> : request.state === "verification_unavailable" ? <p className="payment-notice" role="status">No pudimos verificar el estado de tu pago. Si ya pagaste, no lo repitas; vuelve a consultar o contacta a Nordra.</p> : request.state === "review" ? <p className="payment-notice" role="status">Este pago necesita revisión. Contacta a Nordra para conocer su estado.</p> : request.state === "closed" || request.state === "expired" ? <p className="payment-notice">Este enlace {request.state === "expired" ? "ha vencido" : "está cerrado"}. Contacta a Nordra para continuar.</p> : <>
            {returned && <p className="payment-notice" role="status">{request.state === "retry" ? "El intento de pago fue rechazado o cancelado. Puedes intentarlo nuevamente." : "Aún no encontramos un pago para esta solicitud. Si acabas de pagar, consulta nuevamente antes de repetirlo."}</p>}
            {request.checkoutUrl && !isDemo && !(returned && request.state === "open") ? <a className="payment-submit" href={request.checkoutUrl} rel="noreferrer">{request.state === "retry" ? "Intentar nuevamente" : "Pagar con Mercado Pago"} <ArrowUpRight size={18} /></a> : isDemo ? <button className="payment-submit" disabled>Vista previa del botón de pago <ArrowUpRight size={18} /></button> : null}
          </>}
          {!isDemo && !["paid", "closed", "expired"].includes(request.state) && <button className="payment-refresh" disabled={checking} onClick={() => setRefresh(value => value + 1)}>Consultar estado del pago</button>}
          <p className="payment-security"><LockKeyhole size={15} /> {request.state === "paid" ? "Estado verificado con Mercado Pago." : "Completarás tu pago en Mercado Pago."}</p><p className="payment-fine">Este pago corresponde a la cotización aceptada. No activa cargos automáticos. La confirmación se realiza tras verificar el pago recibido.</p>
        </>}
      </section>
    </div><p className="payment-bottom">Nordra Studio · Atención de lunes a viernes, de 9:00 a 18:00, hora de Ciudad de México.</p>
  </main>;
}
