import { services } from "../data/services";
import { ArrowUpRight } from "lucide-react";

export function Services() {
  return (
    <section id="servicios" className="section section-services">
      <div className="site-shell">
        <div className="section-top">
          <div>
            <p className="eyebrow">NUESTROS SERVICIOS</p>
            <h2>Soluciones digitales para<br />marcas que quieren más</h2>
          </div>

          <div className="section-intro">
            <p>
              Combinamos estrategia, diseño y tecnología para crear experiencias web que impulsan
              negocios y conectan con audiencias.
            </p>
            <a href="#contacto">Ver todos los servicios →</a>
          </div>
        </div>

        <div className="service-grid">
          {services.map(({ title, description, Icon, tone }) => (
            <article className="service-card" key={title}>
              <div className={`service-icon service-icon-${tone}`}>
                <Icon size={22} />
              </div>
              <div className="service-image">
                <div className="mini-aurora" />
                <div className="mini-mountains" />
              </div>
              <h3>{title}</h3>
              <p>{description}</p>
              <button className="round-arrow" aria-label={`Ver ${title}`}>
                <ArrowUpRight size={17} />
              </button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
