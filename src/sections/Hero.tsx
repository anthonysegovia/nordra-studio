import { t, useLanguage } from "../language";
import { BarChart3, Box, Zap, ArrowUpRight } from "lucide-react";

export function Hero() {
  const language = useLanguage();
  return (
    <section id="inicio" className="hero-section hero-section-v6">
      <div className="hero-backdrop hero-backdrop-v6" aria-hidden="true">
        <div className="aurora aurora-one" />
        <div className="aurora aurora-two" />
        <div className="aurora aurora-three" />
        <div className="hero-stars" />
        <div className="mountain-silhouette mountain-back" />
        <div className="mountain-silhouette mountain-front" />
      </div>

      <div className="site-shell hero-grid hero-grid-v6">
        <div className="hero-copy hero-copy-v6">
          <p className="eyebrow">{t("IDEAS · DISEÑO · EXPERIENCIAS · RESULTADOS")}</p>

          <h1>{t("Creamos experiencias web")}<br />{t("para")}{" "}<span className="gradient-text">{t("negocios y eventos")}</span>
          </h1>

          <p className="hero-description">{t("Diseño, desarrollo y estrategia digital que conectan marcas con personas. En Nordra Studio creamos sitios modernos, experiencias memorables y soluciones digitales con propósito.")}</p>

          <div className="hero-actions">
            <a href="#paquetes" className="primary-cta">{t("Ver paquetes")}<span>→</span>
            </a>
            <a href="#contacto" className="secondary-cta">{t("Contáctanos")}</a>
          </div>

          <div className="hero-benefits">
            <div className="benefit-item">
              <Zap size={18} />
              <div>
                <strong>{t("Diseño moderno")}</strong>
                <span>{t("con propósito")}</span>
              </div>
            </div>

            <div className="benefit-item">
              <Box size={18} />
              <div>
                <strong>{t("Desarrollo a medida")}</strong>
                <span>{t("para tu proyecto")}</span>
              </div>
            </div>

            <div className="benefit-item">
              <BarChart3 size={18} />
              <div>
                <strong>{t("Resultados reales")}</strong>
                <span>{t("que generan valor")}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-visual nordra-vision">
          <div className="vision-art" aria-hidden="true">
            <span className="vision-orbit vision-orbit-one" />
            <span className="vision-orbit vision-orbit-two" />
            <span className="vision-star vision-star-one" />
            <span className="vision-star vision-star-two" />
            <img src="/nordra-isotype-transparent.png" alt="" width={1536} height={807} />
          </div>
          <div className="vision-caption"><span>NORDRA STUDIO</span><p>{language === "en" ? "Ideas with their own light." : "Ideas con luz propia."}</p></div>
          <div className="vision-paths">
            <a href="#paquetes"><span className="vision-path-number">01</span><div><span>{language === "en" ? "YOUR BUSINESS" : "TU NEGOCIO"}</span><strong>{language === "en" ? "A presence that feels like you." : "Una presencia que se siente tuya."}</strong></div><ArrowUpRight size={20} /></a>
            <a href="#eventos"><span className="vision-path-number">02</span><div><span>{language === "en" ? "YOUR CELEBRATION" : "TU CELEBRACIÓN"}</span><strong>{language === "en" ? "A moment worth sharing." : "Un momento que merece compartirse."}</strong></div><ArrowUpRight size={20} /></a>
          </div>
        </div>
      </div>
    </section>
  );
}
