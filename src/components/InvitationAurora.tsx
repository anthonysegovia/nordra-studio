const occasions = ["wedding", "birthday", "gathering"] as const;

export function InvitationAurora({ occasion }: { occasion: string }) {
  return <div className="event-explorer-aurora" aria-hidden="true">
    {occasions.map(theme => {
      const id = `explorer-aurora-${theme}`;
      // Keep every palette mounted so rapid selections blend from the current light.
      return <div className={`event-aurora-palette event-aurora-${theme}`} data-active={occasion === theme} key={theme}>
        <div className="event-aurora-drift">
          <div className="event-aurora-halo" />
          <svg viewBox="0 0 1000 700" preserveAspectRatio="none" fill="none" focusable="false">
            <defs><linearGradient id={id} x1="40" y1="500" x2="920" y2="150" gradientUnits="userSpaceOnUse"><stop stopColor="var(--occasion-light)" stopOpacity="0"/><stop offset=".3" stopColor="var(--occasion-light)" stopOpacity=".17"/><stop offset=".65" stopColor="var(--occasion-companion)" stopOpacity=".11"/><stop offset="1" stopColor="var(--occasion-companion)" stopOpacity="0"/></linearGradient></defs>
            <path d="M-80 480C130 590 240 185 440 270S760 445 1080 130L1080 245C770 535 625 430 430 345S130 650-80 560Z" fill={`url(#${id})`}/>
            <path d="M-80 480C130 590 240 185 440 270S760 445 1080 130" stroke={`url(#${id})`} strokeWidth="1.2"/>
            <path d="M-80 505C130 615 240 210 440 295S760 470 1080 155" stroke={`url(#${id})`} strokeOpacity=".5"/>
          </svg>
        </div>
      </div>;
    })}
  </div>;
}
