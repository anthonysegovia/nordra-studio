export function CTA() {
  return (
    <section id="contacto" className="cta-section">
      <div className="cta-bg" aria-hidden="true">
        <div className="cta-aurora" />
        <div className="cta-mountains" />
      </div>

      <div className="site-shell cta-inner">
        <div>
          <p className="eyebrow">HAGAMOS ALGO EXTRAORDINARIO</p>
          <h2>Tu próxima gran idea empieza aquí.</h2>
          <p>Platiquemos sobre tu proyecto y creemos juntos una experiencia digital inolvidable.</p>
        </div>

        <a href="mailto:hola@nordrastudio.mx" className="primary-cta">
          Contáctanos ahora <span>→</span>
        </a>
      </div>
    </section>
  );
}
