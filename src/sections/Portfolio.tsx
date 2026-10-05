import { ArrowUpRight } from "lucide-react";

const projects = [
  { title: "Aurora Events", type: "Sitio para evento", className: "project-a" },
  { title: "Nival Resort", type: "Sitio corporativo", className: "project-b" },
  { title: "Lumen Audio", type: "E-commerce / branding", className: "project-c" },
  { title: "Terral Outdoor", type: "Landing / estrategia digital", className: "project-d" },
];

export function Portfolio() {
  return (
    <section id="portafolio" className="section section-portfolio">
      <div className="site-shell">
        <div className="section-top section-top-portfolio">
          <div>
            <p className="eyebrow">PROYECTOS DESTACADOS</p>
            <h2>Ideas que se convierten en resultados</h2>
          </div>

          <div className="section-intro">
            <p>
              Cada proyecto es una historia. Descubre cómo transformamos ideas en experiencias digitales
              que conectan y generan valor.
            </p>
            <a href="#contacto">Ver portafolio completo →</a>
          </div>
        </div>

        <div className="project-grid">
          {projects.map((project) => (
            <article key={project.title} className="project-card">
              <div className={`project-image ${project.className}`}>
                <div className="project-glow" />
              </div>
              <div className="project-meta-row">
                <div>
                  <h3>{project.title}</h3>
                  <p>{project.type}</p>
                </div>
                <ArrowUpRight size={18} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
