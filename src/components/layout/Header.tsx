import { useEffect, useState } from "react";
import { ThemeToggle } from "../ui/ThemeToggle";

const navigation = [
  { id: "inicio", label: "Inicio" },
  { id: "nosotros", label: "Quiénes somos" },
  { id: "paquetes", label: "Paquetes" },
  { id: "eventos", label: "Eventos" },
  { id: "contacto", label: "Contacto" },
];

function currentSection() {
  const id = window.location.hash.slice(1);
  return navigation.some((item) => item.id === id) ? id : "inicio";
}

export function Header() {
  const [activeSection, setActiveSection] = useState(currentSection);

  useEffect(() => {
    const syncSection = () => setActiveSection(currentSection());
    window.addEventListener("hashchange", syncSection);
    return () => window.removeEventListener("hashchange", syncSection);
  }, []);

  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <a href="#inicio" className="brand-approved" aria-label="Nordra Studio">
          <img
            src="/nordra-header-approved.png"
            alt="Nordra Studio"
            className="brand-approved-image"
            data-theme="dark"
            width={2172}
            height={724}
          />
          <img
            src="/nordra-header-approved-light.png"
            alt="Nordra Studio"
            className="brand-approved-image"
            data-theme="light"
            width={2172}
            height={724}
          />
        </a>

        <nav className="main-nav" aria-label="Navegación principal">
          {navigation.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link${activeSection === id ? " nav-active" : ""}`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setActiveSection(id)}
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <ThemeToggle />
          <a href="#contacto" className="outline-cta">
            Contáctanos <span>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
