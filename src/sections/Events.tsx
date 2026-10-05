import { t, useLanguage } from "../language";
import { ArrowUpRight, Heart, Sparkles, Users } from "lucide-react";

const celebrations = [
  { title: "Bodas", subtitle: "El comienzo de una historia juntos.", description: "Un espacio para compartir la ilusión de ese día y reunir los detalles que quieres contar a tus invitados.", image: "/demo-wedding-v2.jpg", Icon: Heart, message: "una página para mi boda" },
  { title: "Cumpleaños y celebraciones", subtitle: "Hay momentos que merecen algo especial.", description: "Una invitación con tu personalidad, para que la emoción de celebrar empiece desde el primer vistazo.", image: "/demo-birthday-v2.jpg", Icon: Sparkles, message: "una página para mi celebración" },
  { title: "Eventos y encuentros", subtitle: "Buenas ideas. Personas que conectan.", description: "Dale a tu encuentro un lugar propio en la web para presentar su esencia y compartir la información del evento.", image: "/demo-creative-v2.jpg", Icon: Users, message: "una página para mi evento" },
];

export function Events() {
  const language = useLanguage();
  return (
    <section id="eventos" className="section celebrations-section" aria-labelledby="celebrations-title">
      <div className="site-shell">
        <div className="celebrations-heading"><p className="eyebrow">{t("EVENTOS Y CELEBRACIONES")}</p><h2 id="celebrations-title">{t("Hay días que se esperan.")}<br /><span>{t("Y se recuerdan para siempre.")}</span></h2><p>{t("Antes de la primera foto y del primer abrazo, hay una invitación. Hagamos que la tuya se sienta tan especial como lo que estás por celebrar.")}</p></div>
        <div className="celebrations-grid">
          {celebrations.map(({ title, subtitle, description, image, Icon, message }) => (
            <article className="celebration-card" key={t(title)}>
              <div className="celebration-photo"><img src={image} alt="" loading="lazy" width={1024} height={1536} /><span>{t("INSPIRACIÓN DE DISEÑO")}</span></div>
              <div className="celebration-copy"><span className="celebration-icon"><Icon size={22} aria-hidden="true" /></span><h3>{t(title)}</h3><p className="celebration-subtitle">{t(subtitle)}</p><p>{t(description)}</p><a href={`https://wa.me/528111197607?text=${encodeURIComponent(language === "en" ? `Hi! I am interested in ${title === "Bodas" ? "a wedding website" : title === "Cumpleaños y celebraciones" ? "a celebration website" : "an event website"} from Nordra Studio. I would like to discuss the details.` : `¡Hola! Me interesa ${message} de Nordra Studio. Me gustaría platicar sobre los detalles.`)}`} target="_blank" rel="noopener noreferrer" aria-label={`${language === "en" ? "Ask about" : "Consultar"} ${t(title)} ${language === "en" ? "on WhatsApp" : "por WhatsApp"}`}>{t("Planeemos algo especial")}<ArrowUpRight size={17} aria-hidden="true" /></a></div>
            </article>
          ))}
        </div>
        <div className="celebrations-note"><p><strong>{t("Tu historia marca el diseño.")}</strong>{" "}{t("Platiquemos sobre el estilo, los detalles y las funciones que necesitas; con eso preparamos una propuesta para tu celebración.")}</p><span>{t("Fotografías de ejemplo · Cada proyecto se personaliza")}</span></div>
      </div>
    </section>
  );
}
