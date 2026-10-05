import { ArrowUpRight, Compass, Layers, Sparkles } from "lucide-react";

export function About() {
  return (
    <section id="nosotros" className="section about-section" aria-labelledby="about-title">
      <div className="site-shell about-grid">
        <div className="about-copy">
          <p className="eyebrow">QUIÉNES SOMOS</p>
          <h2 id="about-title">Tu idea tiene<br /><span className="about-title-accent">una historia.</span><span className="about-title-note">Nos gustaría conocerla.</span></h2>
          <p>Detrás de un negocio hay esfuerzo, ilusión y mucho por contar. Detrás de un evento, personas y momentos que merecen algo especial. En Nordra Studio queremos ayudarte a llevar esa historia a la web.</p>
          <p>Desde Monterrey, Nuevo León, creamos páginas para negocios y eventos en México. Nos gusta escuchar lo que tienes en mente, cuidar los detalles y construir contigo un sitio que se sienta tuyo, ya sea para dar a conocer tu negocio, abrir una tienda o compartir una celebración.</p>
          <a href="#contacto" className="about-link">Platiquemos de tu idea <ArrowUpRight size={17} aria-hidden="true" /></a>
        </div>
        <div className="about-principles">
          <p className="about-principles-label">LO QUE GUÍA NUESTRO TRABAJO</p>
          <div className="about-principle"><Compass size={21} aria-hidden="true" /><div><h3>Empezamos escuchándote</h3><p>Queremos conocer tu idea y lo que la hace especial para encontrar juntos cómo contarla.</p></div></div>
          <div className="about-principle"><Sparkles size={21} aria-hidden="true" /><div><h3>Cuidamos lo que te representa</h3><p>Los colores, las palabras y cada detalle deben sentirse como parte de tu historia.</p></div></div>
          <div className="about-principle"><Layers size={21} aria-hidden="true" /><div><h3>Lo hacemos fácil de disfrutar</h3><p>Un sitio bonito y sencillo de recorrer, para que las personas conecten con lo que haces.</p></div></div>
        </div>
      </div>
    </section>
  );
}
