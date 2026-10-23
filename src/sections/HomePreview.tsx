import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Pause, Play } from "lucide-react";
import { useLanguage } from "../language";
import { sectionHref } from "../navigation";
import "../styles/home-paths.css";

function BusinessLight({ english }: { english: boolean }) {
  return <svg viewBox="0 0 520 320" fill="none" className="path-illustration" focusable="false">
    <defs>
      <linearGradient id="path-web-glass" x1="100" y1="60" x2="400" y2="260" gradientUnits="userSpaceOnUse"><stop stopColor="var(--path-glass-light)" /><stop offset="1" stopColor="var(--path-glass)" /></linearGradient>
      <linearGradient id="path-web-light" x1="170" y1="110" x2="338" y2="237" gradientUnits="userSpaceOnUse"><stop stopColor="#79fff1" /><stop offset=".5" stopColor="#28b9ec" /><stop offset="1" stopColor="#8c75ff" /></linearGradient>
      <linearGradient id="path-web-edge"><stop stopColor="#6be5ed" /><stop offset="1" stopColor="#5585c9" stopOpacity=".3" /></linearGradient>
    </defs>
    <g className="path-orbits" stroke="currentColor">
      <ellipse cx="260" cy="181" rx="218" ry="104" transform="rotate(-18 260 181)" opacity=".18" />
      <ellipse cx="260" cy="181" rx="200" ry="118" transform="rotate(20 260 181)" opacity=".09" />
      <path d="M38 274H482M260 30V302" opacity=".08" />
      <circle cx="71" cy="185" r="3" fill="currentColor" stroke="none" /><circle cx="433" cy="88" r="2" fill="currentColor" stroke="none" />
    </g>
    <g className="path-web-back" stroke="currentColor">
      <rect x="112" y="69" width="292" height="176" rx="9" transform="rotate(6 258 157)" opacity=".22" />
      <rect x="119" y="57" width="292" height="176" rx="9" transform="rotate(11 265 145)" opacity=".1" />
    </g>
    <g className="path-web-main">
      <rect x="100" y="75" width="304" height="178" rx="10" fill="url(#path-web-glass)" stroke="url(#path-web-edge)" />
      <path d="M100 101H404" stroke="currentColor" opacity=".2" />
      <g fill="currentColor"><circle cx="115" cy="88" r="2" /><circle cx="123" cy="88" r="2" opacity=".6" /><circle cx="131" cy="88" r="2" opacity=".3" /></g>
      <rect x="222" y="85" width="61" height="5" rx="2.5" fill="currentColor" opacity=".16" />
      <text x="122" y="128" className="path-svg-label">{english ? "YOUR BRAND" : "TU MARCA"}</text>
      <path d="M122 146H206M122 158H186" stroke="var(--path-art-ink)" strokeWidth="5" strokeLinecap="round" />
      <path d="M122 179H193M122 187H177" stroke="var(--path-art-ink)" strokeWidth="2" strokeLinecap="round" opacity=".3" />
      <rect x="122" y="209" width="58" height="16" rx="8" fill="currentColor" opacity=".18" />
      <path d="M157 217H166M163 214L166 217L163 220" stroke="currentColor" strokeWidth="1.3" />
      <rect x="228" y="118" width="154" height="115" rx="5" fill="currentColor" opacity=".06" />
      <path d="M241 212L278 169Q284 162 290 168L306 181L331 146Q336 138 342 146L375 212Z" fill="url(#path-web-light)" opacity=".22" />
      <path d="M241 212L278 169Q284 162 290 168L306 181L331 146Q336 138 342 146L375 212" stroke="url(#path-web-light)" strokeWidth="2" />
      <path d="M270 212L302 187L322 201L337 182L366 212" stroke="url(#path-web-light)" opacity=".5" />
      <circle cx="254" cy="144" r="8" fill="url(#path-web-light)" opacity=".8" />
    </g>
    <g className="path-web-tile">
      <rect x="350" y="193" width="73" height="67" rx="9" fill="url(#path-web-glass)" stroke="currentColor" strokeOpacity=".5" />
      <path d="M365 241V229M377 241V220M389 241V225M401 241V210" stroke="url(#path-web-light)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="408" cy="200" r="9" fill="var(--path-glass)" stroke="currentColor" strokeOpacity=".6" />
      <path d="M404 200L407 203L412 197" stroke="currentColor" strokeWidth="1.4" />
    </g>
    <g className="path-art-star" fill="currentColor"><path d="M83 82L86 92L96 95L86 98L83 108L80 98L70 95L80 92Z" /><circle cx="452" cy="228" r="2" /><circle cx="150" cy="281" r="1.5" /></g>
  </svg>;
}

function InvitationLight({ english }: { english: boolean }) {
  return <svg viewBox="0 0 520 320" fill="none" className="path-illustration" focusable="false">
    <defs>
      <linearGradient id="path-envelope" x1="146" y1="160" x2="369" y2="277" gradientUnits="userSpaceOnUse"><stop stopColor="var(--path-glass-light)" /><stop offset="1" stopColor="var(--path-glass)" /></linearGradient>
      <linearGradient id="path-paper" x1="176" y1="80" x2="333" y2="234" gradientUnits="userSpaceOnUse"><stop stopColor="var(--path-paper-light)" /><stop offset="1" stopColor="var(--path-paper)" /></linearGradient>
      <linearGradient id="path-letter-edge"><stop stopColor="#d8beff" /><stop offset="1" stopColor="#8d78bb" stopOpacity=".3" /></linearGradient>
    </defs>
    <g className="path-orbits" stroke="currentColor">
      <ellipse cx="260" cy="170" rx="179" ry="123" transform="rotate(-27 260 170)" opacity=".17" />
      <ellipse cx="260" cy="170" rx="218" ry="88" transform="rotate(-27 260 170)" opacity=".1" />
      <path d="M38 274H482" opacity=".08" />
      <circle cx="93" cy="210" r="2.5" fill="currentColor" stroke="none" /><circle cx="414" cy="85" r="2" fill="currentColor" stroke="none" />
    </g>
    <g className="path-envelope-body">
      <path d="M150 163L247 87Q260 77 273 87L370 163V252Q370 260 362 260H158Q150 260 150 252Z" fill="url(#path-envelope)" stroke="url(#path-letter-edge)" />
      <path d="M159 162L252 94Q260 88 268 94L361 162" stroke="currentColor" opacity=".18" />
      <g className="path-letter">
        <rect x="177" y="100" width="166" height="146" rx="4" fill="url(#path-paper)" stroke="url(#path-letter-edge)" />
        <rect x="185" y="108" width="150" height="130" rx="2" stroke="currentColor" opacity=".22" />
        <path d="M260 114L262 121L269 123L262 125L260 132L258 125L251 123L258 121Z" fill="currentColor" />
        <text x="260" y="158" textAnchor="middle" className="path-svg-script">{english ? "For you" : "Para ti"}</text>
        <text x="260" y="180" textAnchor="middle" className="path-svg-small">{english ? "A DAY TO REMEMBER" : "UN DÍA PARA RECORDAR"}</text>
        <path d="M240 198H280M249 205H271" stroke="currentColor" opacity=".35" />
      </g>
      <path d="M150 163L248 219Q260 226 272 219L370 163V252Q370 260 362 260H158Q150 260 150 252Z" fill="url(#path-envelope)" stroke="url(#path-letter-edge)" />
      <path d="M151 256L224 207M369 256L296 207" stroke="currentColor" opacity=".25" />
      <circle cx="260" cy="224" r="16" fill="var(--path-glass)" stroke="currentColor" strokeOpacity=".6" />
      <path d="M250 228L257 219L261 223L265 217L271 228" stroke="currentColor" strokeWidth="1.5" />
    </g>
    <g className="path-letter-sparks" fill="currentColor">
      <path d="M374 81L377 92L388 95L377 98L374 109L371 98L360 95L371 92Z" />
      <path d="M140 114L142 121L149 123L142 125L140 132L138 125L131 123L138 121Z" opacity=".65" />
      <circle cx="314" cy="51" r="2" /><circle cx="406" cy="169" r="1.5" /><circle cx="185" cy="73" r="1.5" />
    </g>
  </svg>;
}

export function HomePreview() {
  const english = useLanguage() === "en";
  const root = useRef<HTMLElement>(null);
  const [paused, setPaused] = useState(false);
  const motionLabel = english ? (paused ? "Resume atmosphere" : "Pause atmosphere") : (paused ? "Activar ambiente" : "Pausar ambiente");
  useEffect(() => {
    const section = root.current;
    if (!section) return;
    // Keep ambient motion separate from entry/hover, and run only while visible.
    const observer = "IntersectionObserver" in window ? new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle("path-in-view", entry.isIntersecting);
      if (entry.isIntersecting) entry.target.classList.add("path-revealed");
    }), { threshold: .15 }) : null;
    section.querySelectorAll(".home-path").forEach(path => {
      if (observer) observer.observe(path);
      else path.classList.add("path-in-view", "path-revealed");
    });
    const visibility = () => { section.dataset.hidden = String(document.hidden); };
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => { observer?.disconnect(); document.removeEventListener("visibilitychange", visibility); };
  }, []);
  const paths = [
    {
      id: "business",
      href: sectionHref("paquetes"),
      label: english ? "A BRAND WITH ITS OWN LIGHT" : "UNA MARCA CON LUZ PROPIA",
      title: english ? "Business" : "Negocios",
      description: english
        ? "Your vision, turned into a website that feels like you."
        : "Tu visión, convertida en una web que se siente tuya.",
      action: english ? "Explore websites" : "Explorar negocios",
    },
    {
      id: "invitations",
      href: sectionHref("eventos"),
      label: english ? "THE START OF SOMETHING SPECIAL" : "EL INICIO DE ALGO ESPECIAL",
      title: english ? "Invitations" : "Invitaciones",
      description: english
        ? "The excitement of your celebration, from the very first touch."
        : "La emoción de tu celebración, desde el primer toque.",
      action: english ? "Explore invitations" : "Explorar invitaciones",
    },
  ];

  return (
    <section ref={root} id="elige-tu-camino" className="section home-paths" data-paused={paused} aria-labelledby="home-paths-title">
      <div className="site-shell">
        <div className="home-paths-heading">
          <div className="paths-heading-top">
            <p className="eyebrow">{english ? "TWO PATHS. ONE CREATIVE SPIRIT." : "DOS CAMINOS. UNA MISMA ESENCIA."}</p>
            <button type="button" className="paths-motion" aria-label={motionLabel} title={motionLabel} aria-pressed={paused} onClick={() => setPaused(value => !value)}>{paused ? <Play size={13} aria-hidden="true" /> : <Pause size={13} aria-hidden="true" />}</button>
          </div>
          <h2 id="home-paths-title">{english ? "What do you have " : "¿Qué tienes "}<span>{english ? "in mind?" : "en mente?"}</span></h2>
        </div>
        <div className="home-paths-grid">
          <svg className="paths-light-trails" viewBox="0 0 1000 260" preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs><linearGradient id="paths-split-light"><stop stopColor="#4adbe1" stopOpacity="0" /><stop offset=".3" stopColor="#4adbe1" /><stop offset=".5" stopColor="#b9dff9" /><stop offset=".7" stopColor="#b89ce9" /><stop offset="1" stopColor="#b89ce9" stopOpacity="0" /></linearGradient></defs>
            <path d="M250 253C250 98 500 164 500 32C500 164 750 98 750 253" />
          </svg>
          <div className="paths-origin" aria-hidden="true"><svg viewBox="0 0 56 56" fill="none"><path d="M28 3L33 23L53 28L33 33L28 53L23 33L3 28L23 23Z" /><path d="M15 15L41 41M41 15L15 41" /></svg></div>
          {paths.map(({ id, href, label, title, description, action }) => (
            <a
              key={id}
              className={`home-path home-path-${id}`}
              href={href}
              aria-labelledby={`home-path-${id}-title`}
              aria-describedby={`home-path-${id}-description`}
            >
              <div className="path-scene" aria-hidden="true">
                <div className="path-aura" />
                <div className="path-ambient"><div className="path-art">{id === "business" ? <BusinessLight english={english} /> : <InvitationLight english={english} />}</div></div>
                <span className="path-horizon" />
              </div>
              <div className="home-path-copy">
                <p className="home-path-label">{label}</p>
                <h3 id={`home-path-${id}-title`}>{title}</h3>
                <p id={`home-path-${id}-description`} className="home-path-description">{description}</p>
                <span className="home-path-action"><span>{action}</span><span className="path-arrow"><ArrowUpRight size={20} strokeWidth={1.4} aria-hidden="true" /></span></span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
