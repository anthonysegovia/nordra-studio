import { sectionHref } from "../../navigation";
import { t, useLanguage } from "../../language";
import { ContactInvitation } from "./ContactInvitation";
export function Footer() {
  const language = useLanguage();
  return (
    <footer id="contacto" className="footer footer-contact contact-refinement">
      <ContactInvitation />
      <div className="site-shell footer-inner">
        <div className="footer-brand-block">
        <a href={sectionHref("inicio")} className="brand-approved" aria-label={t("Nordra Studio, ir al inicio")}>
          <img
            src="/nordra-header-approved.webp"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="dark"
            width={2172}
            height={724}
            loading="lazy"
          />
          <img
            src="/nordra-header-approved-light.webp"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="light"
            width={2172}
            height={724}
            loading="lazy"
          />
        </a>

        <p className="footer-tagline">{t("Tu idea merece un lugar en el mundo digital.")}</p>

        </div>
        <nav className="footer-explore" aria-label={language === "en" ? "Explore demos" : "Explorar demos"}>
          <span>{language === "en" ? "EXPLORE" : "EXPLORA"}</span>
          <a href={sectionHref("universos")}>{language === "en" ? "Bruma & Lumina demos" : "Demos Bruma y Lúmina"}</a>
          <a href={sectionHref("event-experience")}>{language === "en" ? "Invitation examples" : "Ejemplos de invitaciones"}</a>
          <a href={sectionHref("temporada")}>{language === "en" ? "Seasonal invitations" : "Invitaciones de temporada"}</a>
          <a href={sectionHref("nosotros")}>{language === "en" ? "About Nordra" : "Conoce Nordra"}</a>
        </nav>
        <nav className="footer-explore" aria-label={language === "en" ? "Packages and contact" : "Paquetes y contacto"}>
          <span>{language === "en" ? "YOUR NEXT STEP" : "TU SIGUIENTE PASO"}</span>
          <a href={sectionHref("opciones-negocio")}>{language === "en" ? "Web packages" : "Paquetes web"}</a>
          <a href={sectionHref("planes-eventos")}>{language === "en" ? "Invitation packages" : "Paquetes de invitaciones"}</a>
          <a href={sectionHref("proceso")}>{language === "en" ? "How to get started" : "Cómo empezar"}</a>
          <a href={sectionHref("contacto")}>{language === "en" ? "Contact Nordra" : "Contactar a Nordra"}</a>
        </nav>
        <div className="footer-meta">
          <span className="footer-column-label">{language === "en" ? "LET’S CONNECT" : "CERCA DE TU IDEA"}</span>

          <span>{t("Monterrey, Nuevo León")}</span>
          <span>{language === "en" ? "Monday–Friday · 9 a.m.–6 p.m." : "Lunes a viernes · 9 a.m.–6 p.m."}</span>
          <span>{language === "en" ? "Saturday · 10 a.m.–4 p.m." : "Sábados · 10 a.m.–4 p.m."}</span>
          <span>{language === "en" ? "Mexico City time" : "Hora de Ciudad de México"}</span>
        </div>
      </div>
      <div className="site-shell">
        <div className="payment-notice">
          <span className="payment-notice-icon" aria-hidden="true"><img src="/mercado-pago-icon.svg" alt="" width={40} height={40} /></span>
          <div>
            <h3>{t("Aceptamos pagos con Mercado Pago")}</h3>
            <p>{t("Al confirmar tu cotización, te enviamos un link para pagar con tarjeta de crédito o débito.")}</p>
          </div>
        </div>
      </div>
      <div className="site-shell footer-bottom"><span>© {new Date().getFullYear()} Nordra Studio</span><a href="/aviso-de-privacidad.html" hrefLang="es">{language === "en" ? "Privacy notice (Spanish)" : "Aviso de privacidad"}</a><a href="/terminos-del-servicio.html" hrefLang="es">{language === "en" ? "Terms of service (Spanish)" : "Términos del servicio"}</a><a href={sectionHref("page-top")}>{language === "en" ? "Back to top ↑" : "Volver arriba ↑"}</a></div>
    </footer>
  );
}
