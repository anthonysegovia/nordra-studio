import { useId, useState, type CSSProperties, type KeyboardEvent } from "react";
import { Check, Flower2, Footprints, Layers } from "lucide-react";

const fabrics = {
  dress: [{ name: "Rosa palo", color: "#b8868c" }, { name: "Salvia", color: "#7c8976" }, { name: "Vino", color: "#824859" }, { name: "Azul noche", color: "#3f5268" }],
  suit: [{ name: "Azul noche", color: "#3f5268" }, { name: "Grafito", color: "#57575b" }, { name: "Topo", color: "#8b7a69" }, { name: "Olivo", color: "#6d735c" }],
} as const;
const advice = [
  { label: "La tela", title: "Caída y movimiento", text: "Un vestido de tela fluida o un traje bien cortado. Una capa ligera puede acompañarte a la salida", Icon: Layers },
  { label: "El calzado", title: "Para seguir bailando", text: "Zapatos de vestir que ya hayas usado. Elige un tacón o una suela con los que puedas disfrutar toda la celebración", Icon: Footprints },
  { label: "El blanco", title: "Un color para la novia", text: "Reservamos el blanco y el marfil para la novia. Los demás tonos son inspiración, no una paleta obligatoria", Icon: Flower2 },
] as const;

function moveChoice(event: KeyboardEvent<HTMLButtonElement>, index: number, count: number, choose: (index: number) => void) {
  const next = event.key === "ArrowRight" ? (index + 1) % count : event.key === "ArrowLeft" ? (index + count - 1) % count : event.key === "Home" ? 0 : event.key === "End" ? count - 1 : undefined;
  if (next === undefined) return;
  event.preventDefault(); choose(next);
  event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")[next]?.focus({ preventScroll: true });
}

export function IvoryDressCode() {
  const id = useId();
  const [model, setModel] = useState<"dress" | "suit">("dress");
  const [colors, setColors] = useState({ dress: 0, suit: 0 });
  const [length, setLength] = useState<"long" | "midi">("long");
  const [tip, setTip] = useState(0);
  const activeColor = fabrics[model][colors[model]];
  const result = `${model === "dress" ? `Vestido ${length === "long" ? "largo" : "midi"}` : "Traje formal"} · ${activeColor.name}`;
  const chooseColor = (index: number) => setColors(current => ({ ...current, [model]: index }));
  return <div className="iv-atelier" data-model={model} data-length={length} style={{ "--iv-dress": fabrics.dress[colors.dress].color, "--iv-suit": fabrics.suit[colors.suit].color } as CSSProperties}>
    <div className="iv-atelier-workspace">
      <figure className="iv-look">
        <div className="iv-look-stage" role="img" aria-label={`Ilustración de ${result.toLowerCase()}`}>
          <svg viewBox="0 0 300 390" fill="none" aria-hidden="true" focusable="false">
            <defs><linearGradient id={`${id}-sheen`} x1="70" y1="100" x2="225" y2="220" gradientUnits="userSpaceOnUse"><stop stopColor="#fff" stopOpacity=".32" /><stop offset=".5" stopColor="#fff" stopOpacity="0" /><stop offset="1" stopColor="#382b22" stopOpacity=".18" /></linearGradient></defs>
            <path d="M150 48V29Q150 15 162 17Q172 20 166 28M150 48L107 72Q150 80 193 72L150 48" stroke="#a58a65" strokeWidth="1.5" strokeLinecap="round" />
            <g className="iv-look-dress">
              <g className="iv-look-long"><path className="iv-look-fabric" d="M124 75L115 108Q120 132 137 151Q125 206 80 339Q149 364 220 339Q175 206 163 151Q180 132 185 108L176 75L159 99H141Z" /><path d="M124 75L115 108Q120 132 137 151Q125 206 80 339Q149 364 220 339Q175 206 163 151Q180 132 185 108L176 75L159 99H141Z" fill={`url(#${id}-sheen)`} /><path d="M137 151Q150 158 163 151M136 172L105 337M148 166L144 346M161 173L190 339M118 111Q150 123 182 111" stroke="#fff" strokeOpacity=".38" strokeWidth="1.2" /></g>
              <g className="iv-look-midi"><path className="iv-look-fabric" d="M124 75L115 108Q120 132 137 151Q124 207 96 279Q150 300 205 279Q176 207 163 151Q180 132 185 108L176 75L159 99H141Z" /><path d="M124 75L115 108Q120 132 137 151Q124 207 96 279Q150 300 205 279Q176 207 163 151Q180 132 185 108L176 75L159 99H141Z" fill={`url(#${id}-sheen)`} /><path d="M137 151Q150 158 163 151M136 172L115 278M148 166L147 286M161 173L184 278M118 111Q150 123 182 111" stroke="#fff" strokeOpacity=".38" strokeWidth="1.2" /></g>
              <g stroke="#a48457" strokeWidth="1.4"><ellipse cx="228" cy="115" rx="5" ry="8" /><ellipse cx="244" cy="115" rx="5" ry="8" /></g>
            </g>
            <g className="iv-look-suit">
              <path className="iv-look-fabric" d="M117 200L111 345H140L150 241L161 345H190L183 200Z" /><path d="M128 214L125 338M172 214L177 338" stroke="#fff" strokeOpacity=".3" strokeWidth="1.2" />
              <path className="iv-look-fabric" d="M126 77L94 92L75 213L97 218L115 135L109 240L143 246L151 213L160 246L193 240L185 135L203 218L225 213L207 92L175 77Z" /><path d="M126 77L94 92L75 213L97 218L115 135L109 240L143 246L151 213L160 246L193 240L185 135L203 218L225 213L207 92L175 77Z" fill={`url(#${id}-sheen)`} />
              <path d="M126 77L151 166L175 77L151 86Z" fill="#fffaf0" /><path d="M126 77L118 108L136 120L128 132L151 173L175 132L167 120L184 108L175 77M151 173V221M166 157H183M119 208H137M164 208H182" stroke="#fff" strokeOpacity=".4" strokeWidth="1.2" /><path d="M145 90L151 99L158 90L155 137L151 146L147 137L145 99" fill="#9e8870" /><circle cx="157" cy="189" r="2" fill="#cfc1ac" /><circle cx="157" cy="209" r="2" fill="#cfc1ac" />
            </g>
          </svg>
        </div>
        <figcaption>Una idea para imaginarte ahí</figcaption>
      </figure>
      <div className="iv-style-controls">
        <p className="iv-kicker">CÓDIGO DE VESTIMENTA</p><h3>Formal de tarde</h3>
        <div className="iv-outfit-switch" role="group" aria-label="Tipo de atuendo">
          {(["dress", "suit"] as const).map((value, index) => <button key={value} type="button" aria-pressed={model === value} onClick={() => setModel(value)} onKeyDown={event => moveChoice(event, index, 2, next => setModel(next === 0 ? "dress" : "suit"))}>{value === "dress" ? "Vestido" : "Traje"}</button>)}
        </div>
        <p className="iv-style-label">Explora un tono</p>
        <div className="iv-fabric-swatches" role="group" aria-label="Colores del atuendo">
          {fabrics[model].map((fabric, index) => <button key={fabric.name} type="button" aria-pressed={colors[model] === index} onClick={() => chooseColor(index)} onKeyDown={event => moveChoice(event, index, 4, chooseColor)} style={{ "--iv-fabric": fabric.color } as CSSProperties}><span className="iv-fabric-sample" aria-hidden="true"><Check size={14} /></span><span>{fabric.name}</span></button>)}
        </div>
        <div className="iv-length-space">
          {model === "dress" ? <div className="iv-length-choice"><p className="iv-style-label">El largo</p><div role="group" aria-label="Largo del vestido">{(["long", "midi"] as const).map((value, index) => <button key={value} type="button" aria-pressed={length === value} onClick={() => setLength(value)} onKeyDown={event => moveChoice(event, index, 2, next => setLength(next === 0 ? "long" : "midi"))}>{value === "long" ? "Largo" : "Midi"}</button>)}</div></div> : <p className="iv-suit-note">Traje completo, camisa y zapatos de vestir<br /><em>El detalle final lo eliges tú</em></p>}
        </div>
        <div className="iv-look-receipt"><span className="iv-style-label">Tu combinación</span><p role="status" aria-live="polite" aria-atomic="true"><span key={result}>{result}</span></p></div>
        <p className="iv-style-disclaimer">Colores sugeridos, no obligatorios<br />El blanco y el marfil son para la novia</p>
      </div>
    </div>
    <div className="iv-style-advice">
      <div className="iv-tip-tabs" role="tablist" aria-label="Consejos de vestimenta">
        {advice.map((item, index) => <button key={item.label} type="button" role="tab" id={`${id}-tip-${index}`} aria-controls={`${id}-note-${index}`} aria-selected={tip === index} tabIndex={tip === index ? 0 : -1} onClick={() => setTip(index)} onKeyDown={event => moveChoice(event, index, advice.length, setTip)}>{item.label}</button>)}
      </div>
      <div className="iv-style-notes">{advice.map(({ title, text, Icon }, index) => <div key={title} role="tabpanel" id={`${id}-note-${index}`} aria-labelledby={`${id}-tip-${index}`} hidden={tip !== index} tabIndex={0}><Icon size={34} strokeWidth={1} aria-hidden="true" /><div><h4>{title}</h4><p>{text}</p></div></div>)}</div>
    </div>
  </div>;
}
