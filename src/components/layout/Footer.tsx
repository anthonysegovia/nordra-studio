import { t, useLanguage } from "../../language";
import { Mail } from "lucide-react";
export function Footer() {
  const language = useLanguage();
  return (
    <footer id="contacto" className="footer footer-contact">
      <div className="cta-bg" aria-hidden="true">
        <div className="cta-aurora" />
        <div className="cta-mountains" />
      </div>
      <div className="site-shell footer-contact-heading">
        <div className="footer-contact-copy">
        <p className="eyebrow">{t("HAGAMOS ALGO EXTRAORDINARIO")}</p>
        <h2>{t("Tu próxima gran idea empieza aquí.")}</h2>
        <p>{t("Platiquemos sobre tu proyecto y creemos juntos una experiencia digital inolvidable.")}</p>
        </div>
        <div className="footer-contact-actions">
          <a
            href={`https://wa.me/528129022231?text=${encodeURIComponent(language === "en" ? "Hi, I would love my own web experience!" : "¡Hola, quiero mi propia experiencia web!")}`}
            className="footer-phone"
            target="_blank"
            rel="noopener noreferrer"
            aria-label={t("Contactar a Nordra Studio por WhatsApp al +52 81 2902 2231")}
          >
            <span className="footer-whatsapp-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.52 3.48A11.88 11.88 0 0 0 12.04 0C5.46 0 .1 5.35.1 11.93c0 2.1.55 4.15 1.6 5.96L0 24l6.27-1.64a11.9 11.9 0 0 0 5.77 1.47h.01c6.58 0 11.94-5.35 11.94-11.93 0-3.19-1.24-6.18-3.47-8.42ZM12.05 21.8a9.9 9.9 0 0 1-5.05-1.38l-.36-.21-3.72.98.99-3.63-.24-.37a9.87 9.87 0 0 1-1.52-5.26c0-5.46 4.44-9.9 9.9-9.9a9.84 9.84 0 0 1 7 2.9 9.84 9.84 0 0 1 2.9 7c0 5.46-4.44 9.9-9.9 9.9Zm5.43-7.41c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.67-1.61-.92-2.2-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.27.3-1.04 1.02-1.04 2.48s1.07 2.88 1.22 3.08c.15.2 2.1 3.21 5.09 4.5.71.31 1.27.49 1.7.63.72.23 1.37.2 1.89.12.58-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.41-.07-.13-.27-.2-.57-.35Z" />
              </svg>
            </span>
            <span className="footer-phone-copy"><span>{t("Platiquemos por WhatsApp")}</span><strong>+52 81 2902 2231</strong></span>
            <span aria-hidden="true">↗</span>
          </a>
          <a href="mailto:hola@nordrastudio.mx" className="footer-phone footer-email">
            <span className="footer-email-icon" aria-hidden="true"><Mail size={21} /></span>
            <span className="footer-phone-copy"><span>{t("Escríbenos por correo")}</span><strong>hola@nordrastudio.mx</strong></span>
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
      <div className="site-shell footer-inner">
        <div className="footer-brand-block">
        <a href="#inicio" className="brand-approved" aria-label={t("Nordra Studio, ir al inicio")}>
          <img
            src="/nordra-header-approved.png"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="dark"
            width={2172}
            height={724}
            loading="lazy"
          />
          <img
            src="/nordra-header-approved-light.png"
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
        <nav className="footer-explore" aria-label={language === "en" ? "Explore Nordra Studio" : "Explora Nordra Studio"}>
          <span>{language === "en" ? "EXPLORE" : "EXPLORA"}</span>
          <a href="#temporada">{language === "en" ? "Seasonal invitations" : "Invitaciones de temporada"}</a>
          <a href="#nosotros">{language === "en" ? "About us" : "Quiénes somos"}</a>
          <a href="#paquetes">{language === "en" ? "For your business" : "Para tu negocio"}</a>
          <a href="#eventos">{language === "en" ? "For your celebration" : "Para tu celebración"}</a>
        </nav>
        <div className="footer-meta">
          <span className="footer-column-label">{language === "en" ? "LET’S CONNECT" : "CERCA DE TU IDEA"}</span>

          <span>{t("Monterrey, Nuevo León")}</span>
          <span>{language === "en" ? "Monday–Friday · 9 a.m.–6 p.m." : "Lunes a viernes · 9 a.m.–6 p.m."}</span>
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
      <div className="site-shell footer-bottom"><span>© {new Date().getFullYear()} Nordra Studio</span><a href="#inicio">{language === "en" ? "Back to top ↑" : "Volver al inicio ↑"}</a></div>
    </footer>
  );
}
