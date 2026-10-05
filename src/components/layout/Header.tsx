import { t, useLanguage, setLanguage } from "../../language";
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
  const language = useLanguage();
  const [activeSection, setActiveSection] = useState(currentSection);

  useEffect(() => {
    let frame = 0;
    const syncSection = () => {
      frame = 0;
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 90;
      const readingLine = headerHeight + Math.min(160, window.innerHeight * .2);
      let section = navigation[0].id;
      for (const { id } of navigation) {
        const element = document.getElementById(id);
        if (element && element.getBoundingClientRect().top <= readingLine) section = id;
      }
      // The last section may be too short to reach the reading line.
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
        section = navigation[navigation.length - 1].id;
      }
      setActiveSection(section);
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(syncSection); };
    const observer = new ResizeObserver(schedule);
    observer.observe(document.body);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("hashchange", schedule);
    schedule();
    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("hashchange", schedule);
    };
  }, []);

  return (
    <header className="site-header">
      <div className="site-shell header-inner">
        <a href="#inicio" className="brand-approved" aria-label={t("Nordra Studio")}>
          <img
            src="/nordra-header-approved.png"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="dark"
            width={2172}
            height={724}
          />
          <img
            src="/nordra-header-approved-light.png"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="light"
            width={2172}
            height={724}
          />
        </a>

        <nav className="main-nav" aria-label={t("Navegación principal")}>
          {navigation.map(({ id, label }) => (
            <a
              key={id}
              href={`#${id}`}
              className={`nav-link${activeSection === id ? " nav-active" : ""}`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setActiveSection(id)}
            >
              {t(label)}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="language-toggle" onClick={() => setLanguage(language === "es" ? "en" : "es")} aria-label={language === "es" ? "Switch to English" : "Cambiar a español"}><span className={language === "es" ? "language-active" : ""}>ES</span><span aria-hidden="true">/</span><span className={language === "en" ? "language-active" : ""}>EN</span></button>
          <ThemeToggle />
          <a href="#contacto" className="outline-cta">{t("Contáctanos")}{" "}<span>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
