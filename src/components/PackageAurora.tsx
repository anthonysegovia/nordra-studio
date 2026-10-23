export function PackageAurora({ scope, index, face }: { scope: "business" | "invitation"; index: number; face: "front" | "back" }) {
  const id = `${scope}-aurora-${index}-${face}`;
  return <svg className="package-aurora" viewBox="0 0 400 180" preserveAspectRatio="none" fill="none" aria-hidden="true" focusable="false">
    <defs><linearGradient id={id} x1="40" y1="20" x2="360" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="var(--package-tint)" stopOpacity=".06"/><stop offset=".45" stopColor="var(--package-tint)" stopOpacity=".3"/><stop offset=".8" stopColor="var(--package-companion)" stopOpacity=".2"/><stop offset="1" stopColor="var(--package-companion)" stopOpacity="0"/></linearGradient></defs>
    <g className="package-aurora-response">
      <g className="package-aurora-drift">
        <path d="M-20 125C65 149 99 19 175 43S284 148 420 41V-20H-20Z" fill={`url(#${id})`}/>
        <path d="M-20 125C65 149 99 19 175 43S284 148 420 41" stroke="var(--package-tint)" strokeOpacity=".38"/>
        <circle cx="340" cy="38" r="2" fill="var(--package-accent)" opacity=".65"/>
      </g>
      <g className="package-aurora-trail">
        <path d="M-20 144C65 168 99 38 175 62S284 167 420 60" stroke="var(--package-tint)" strokeOpacity=".15"/>
        <path d="M-20 164C65 188 99 58 175 82S284 187 420 80" stroke="var(--package-companion)" strokeOpacity=".09"/>
      </g>
    </g>
  </svg>;
}
