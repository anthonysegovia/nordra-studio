import { sectionHref, page } from "../../navigation";
import { t, useLanguage, setLanguage } from "../../language";
import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { ThemeToggle } from "../ui/ThemeToggle";

const navigation = [
  { id: "inicio", label: "Inicio", en: "Home" },
  { id: "paquetes", label: "Negocios", en: "Business" },
  { id: "eventos", label: "Invitaciones", en: "Invitations" },
  { id: "proceso", label: "Cómo empezar", en: "How it works" },
  { id: "contacto", label: "Contacto", en: "Contact" },
];

function currentSection() {
  const id = window.location.hash.slice(1);
  return navigation.some((item) => item.id === id) ? id : page === "business" ? "paquetes" : page === "events" ? "eventos" : "inicio";
}

export function Header() {
  const language = useLanguage();
  const [activeSection, setActiveSection] = useState(currentSection);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateMenu = (event: Event) => setMenuOpen((event as CustomEvent<boolean>).detail);
    window.addEventListener("nordra:navigation-change", updateMenu);
    return () => window.removeEventListener("nordra:navigation-change", updateMenu);
  }, []);

  useEffect(() => {
    let frame = 0;
    const syncSection = () => {
      frame = 0;
      const headerHeight = document.querySelector(".site-header")?.getBoundingClientRect().height ?? 90;
      const readingLine = headerHeight + Math.min(160, window.innerHeight * .2);
      let section = page === "business" ? "paquetes" : page === "events" ? "eventos" : "inicio";
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
        <a href={sectionHref("inicio")} className="brand-approved" aria-label={t("Nordra Studio")}>
          <img
            src="/nordra-header-approved.webp"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="dark"
            width={2172}
            height={724}
          />
          <img
            src="/nordra-header-approved-light.webp"
            alt={t("Nordra Studio")}
            className="brand-approved-image"
            data-theme="light"
            width={2172}
            height={724}
          />
        </a>

        <nav className="main-nav" aria-label={t("Navegación principal")}>
          {navigation.map(({ id, label, en }) => (
            <a
              key={id}
              href={id === "eventos" ? "/invitaciones.html" : sectionHref(id)}
              className={`nav-link${activeSection === id ? " nav-active" : ""}`}
              aria-current={activeSection === id ? "location" : undefined}
              onClick={() => setActiveSection(id)}
            >
              {language === "en" ? en : label}
            </a>
          ))}
        </nav>

        <div className="header-actions">
          <button type="button" className="language-toggle" onClick={() => setLanguage(language === "es" ? "en" : "es")} aria-label={language === "es" ? "Switch to English" : "Cambiar a español"}><span className={language === "es" ? "language-active" : ""}>ES</span><span aria-hidden="true">/</span><span className={language === "en" ? "language-active" : ""}>EN</span></button>
          <ThemeToggle />
          <button type="button" className="mobile-menu-trigger" aria-label={language === "en" ? "Open navigation menu" : "Abrir menú de navegación"} aria-haspopup="dialog" aria-expanded={menuOpen} aria-controls="mobile-explore" onClick={() => window.dispatchEvent(new Event("nordra:open-navigation"))}><Menu size={20} aria-hidden="true" /></button>
          <a href={sectionHref("contacto")} className="outline-cta">{t("Contáctanos")}{" "}<span>→</span>
          </a>
        </div>
      </div>
    </header>
  );
}
