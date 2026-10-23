/** Nordra's identity becoming a website, with independent response layers. */
export function BusinessScene({ id, english }: { id: string; english: boolean }) {
  return <svg viewBox="0 0 800 560" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-horizon`} x1="30" y1="460" x2="750" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#54dccb" stopOpacity="0"/><stop offset=".3" stopColor="#54dccb"/><stop offset=".6" stopColor="#56aaff"/><stop offset=".85" stopColor="#b38bea"/><stop offset="1" stopColor="#b38bea" stopOpacity="0"/></linearGradient>
      <linearGradient id={`${id}-glass`} x1="110" y1="115" x2="680" y2="440" gradientUnits="userSpaceOnUse"><stop stopColor="var(--canvas-top)"/><stop offset="1" stopColor="var(--canvas-bottom)"/></linearGradient>
      <linearGradient id={`${id}-ink`}><stop stopColor="#6de0d6"/><stop offset="1" stopColor="#b5a0ed"/></linearGradient>
      <mask id={`${id}-symbol`}><image href="/nordra-isotype-transparent.webp" x="0" y="0" width="1000" height="526"/></mask>
    </defs>
    <g className="business-wire-response" stroke={`url(#${id}-horizon)`}>
      <ellipse cx="417" cy="285" rx="352" ry="211" transform="rotate(-17 417 285)" strokeOpacity=".2"/>
      <path d="M26 363C138 353 173 291 259 197S386 39 458 90S589 257 773 232" strokeOpacity=".35"/>
      <path d="M24 385C143 374 183 316 268 224S386 72 458 122S586 283 774 257" strokeOpacity=".12"/>
    </g>
    <g className="service-scene-drift">
      <g className="business-page-response">
        <rect x="91" y="126" width="596" height="336" rx="15" stroke={`url(#${id}-horizon)`} strokeOpacity=".18"/>
        <rect x="108" y="108" width="596" height="336" rx="15" fill={`url(#${id}-glass)`} stroke={`url(#${id}-horizon)`}/>
        <path d="M109 146H703" className="service-rule"/>
        <g fill="var(--intro-accent)"><circle cx="128" cy="127" r="2.5" opacity=".8"/><circle cx="139" cy="127" r="2.5" opacity=".4"/><circle cx="150" cy="127" r="2.5" opacity=".25"/></g>
        <text x="406" y="131" textAnchor="middle" className="business-canvas-micro">{english ? "A SPACE OF YOUR OWN" : "UN ESPACIO PROPIO"}</text>
        <text x="145" y="185" className="business-canvas-brand">{english ? "your brand" : "tu marca"}<tspan fill="var(--intro-accent)">.</tspan></text>
        <path d="M576 178H597M610 178H631M645 178H666" className="service-rule" strokeWidth="2" strokeLinecap="round"/>
        <text x="145" y="253" className="business-canvas-title">{english ? "Made" : "Hecho"}<tspan x="145" dy="44">{english ? "for you." : "para ti."}</tspan></text>
        <path d="M147 320H295M147 332H263" className="service-text-line" strokeOpacity=".45"/>
        <rect x="145" y="357" width="118" height="32" rx="16" fill={`url(#${id}-ink)`}/>
        <text x="164" y="378" fontSize="10" fill="#0c2537">{english ? "Discover" : "Descubrir"}</text>
        <path d="M238 377L246 369M238 369H246V377" stroke="#0c2537" strokeWidth="1.2"/>
        <svg x="324" y="182" width="354" height="200" viewBox="0 0 1000 526"><image href="/nordra-isotype-transparent.webp" width="1000" height="526" mask={`url(#${id}-symbol)`}/></svg>
        <path d="M145 414H561" className="service-rule"/>
        <circle cx="661" cy="415" r="2" fill="var(--intro-accent)"/>
      </g>
      <g className="business-phone-response">
        <rect x="594" y="307" width="116" height="201" rx="20" fill="var(--canvas-bottom)" stroke={`url(#${id}-horizon)`}/>
        <path d="M636 319H667" stroke="var(--intro-accent)" strokeOpacity=".4" strokeWidth="3" strokeLinecap="round"/>
        <text x="611" y="346" className="business-canvas-micro">{english ? "YOUR BRAND" : "TU MARCA"}</text>
        <svg x="603" y="350" width="99" height="75" viewBox="0 0 1000 526"><image href="/nordra-isotype-transparent.webp" width="1000" height="526" mask={`url(#${id}-symbol)`}/></svg>
        <path d="M612 432H681M612 443H664" className="service-text-line"/>
        <rect x="612" y="461" width="80" height="20" rx="10" fill={`url(#${id}-ink)`} fillOpacity=".75"/>
        <path d="M638 496H666" className="service-rule" strokeWidth="2" strokeLinecap="round"/>
      </g>
      <g className="business-palette-response">
        <path d="M485 85H545" className="service-rule"/>
        <text x="485" y="66" className="business-canvas-micro">{english ? "IDENTITY" : "IDENTIDAD"}</text>
        <circle cx="568" cy="82" r="12" fill="#71d6ce"/><circle cx="598" cy="82" r="12" fill="#78a8e4"/><circle cx="628" cy="82" r="12" fill="#b398df"/>
        <circle cx="568" cy="82" r="16" stroke="#71d6ce" strokeOpacity=".35"/>
      </g>
    </g>
    <path className="service-thread" d="M739 176C779 358 643 524 415 509C228 498 180 436 40 466" stroke={`url(#${id}-horizon)`}/>
    <path className="service-thread-trace" pathLength="100" d="M739 176C779 358 643 524 415 509C228 498 180 436 40 466"/>
    <path className="service-journey-thread" pathLength="100" d="M739 176C779 358 643 524 415 509C228 498 180 436 40 466"/>
    <circle cx="739" cy="176" r="3" fill="var(--intro-accent)"/>
  </svg>;
}

export function InvitationScene({ id, english }: { id: string; english: boolean }) {
  return <svg viewBox="0 0 900 610" fill="none" aria-hidden="true" focusable="false">
    <defs>
      <linearGradient id={`${id}-paper`} x1="310" y1="65" x2="584" y2="452" gradientUnits="userSpaceOnUse"><stop stopColor="#f4eee6"/><stop offset="1" stopColor="#dcd2e3"/></linearGradient>
      <linearGradient id={`${id}-envelope`} x1="240" y1="296" x2="674" y2="536" gradientUnits="userSpaceOnUse"><stop stopColor="var(--intro-envelope)"/><stop offset="1" stopColor="var(--intro-depth)"/></linearGradient>
      <linearGradient id={`${id}-ribbon`} x1="20" y1="500" x2="870" y2="140" gradientUnits="userSpaceOnUse"><stop stopColor="#a8ccdc" stopOpacity="0"/><stop offset=".45" stopColor="var(--intro-accent)"/><stop offset="1" stopColor="var(--intro-accent)" stopOpacity="0"/></linearGradient>
      <clipPath id={`${id}-photo`}><path d="M0 285V100A100 100 0 0 1 200 100V285Z"/></clipPath>
    </defs>
    <path d="M52 463C4 299 195 110 420 72C660 32 826 128 857 271" stroke={`url(#${id}-ribbon)`} strokeOpacity=".3"/>
    <g className="service-scene-drift">
      <g className="invitation-echo-response"><g transform="translate(78 146) rotate(-13 100 150)">
        <path d="M-8 316V100A108 108 0 0 1 208 100V316Z" fill="#e6ded4"/>
        <image href="/demos/boda-jardin/photos/ceremony-beach-640.jpg" width="200" height="285" preserveAspectRatio="xMidYMid slice" clipPath={`url(#${id}-photo)`}/>
        <text x="100" y="304" textAnchor="middle" fill="#6a5e58" fontSize="7" letterSpacing="2">{english ? "THE PLACE. THE MOMENT." : "EL LUGAR. EL MOMENTO."}</text>
      </g></g>
      <g className="invitation-photo-response"><g transform="translate(677 204) rotate(12 80 110)">
        <rect x="-8" y="-8" width="184" height="254" fill="#e8e2de"/>
        <svg width="168" height="210" viewBox="0 0 168 210"><image href="/demos/boda-jardin/photos/recuerdo-1-800.jpg" width="168" height="210" preserveAspectRatio="xMidYMid slice"/></svg>
        <text x="84" y="233" textAnchor="middle" fill="#6a5e58" fontSize="7" letterSpacing="2">{english ? "YOUR STORY" : "SU HISTORIA"}</text>
      </g></g>
      <path d="M248 300L434 172Q450 160 466 172L662 300V509H248Z" fill="var(--intro-envelope)" className="service-panel-edge"/>
      <g className="invitation-letter-response"><g transform="rotate(-5 448 274)">
        <path d="M310 473V203A138 138 0 0 1 586 203V473Z" fill={`url(#${id}-paper)`}/>
        <path d="M323 460V205A125 125 0 0 1 573 205V460Z" stroke="#998594" strokeOpacity=".35"/>
        <path d="M419 151L440 123Q448 113 456 123L477 151M432 151L448 133L464 151" stroke="#928196" strokeWidth="1.2"/>
        <text x="448" y="195" textAnchor="middle" className="invitation-paper-kicker">{english ? "THE FIRST CHAPTER" : "EL PRIMER CAPÍTULO"}</text>
        <text x="448" y="250" textAnchor="middle" className="invitation-paper-title">{english ? "It starts here." : "Empieza aquí."}</text>
        <path d="M402 278H432M464 278H494M448 269Q449 277 457 278Q449 279 448 287Q447 279 439 278Q447 277 448 269Z" stroke="#99849d" strokeOpacity=".65"/>
        <text x="448" y="315" textAnchor="middle" className="invitation-paper-small">{english ? "YOUR DAY. YOUR PEOPLE. YOUR STYLE." : "TU DÍA. TU GENTE. TU ESTILO."}</text>
        <path d="M394 350Q424 347 429 381M409 355Q393 343 395 332Q410 331 409 355M505 350Q475 347 470 381M490 355Q506 343 504 332Q489 331 490 355" stroke="#99849d" strokeOpacity=".55"/>
      </g></g>
      <g className="invitation-envelope-response">
        <path d="M248 300L450 405L662 300V511Q662 520 653 520H257Q248 520 248 511Z" fill={`url(#${id}-envelope)`} className="service-panel-edge"/>
        <path d="M250 517L404 382M660 517L500 382" className="service-rule"/>
        <path d="M248 301L450 406L662 301" stroke="var(--intro-accent)" strokeOpacity=".45"/>
        <circle cx="450" cy="408" r="29" fill="var(--intro-envelope)" stroke="var(--intro-accent)" strokeOpacity=".5"/>
        <circle cx="450" cy="408" r="23" stroke="var(--intro-accent)" strokeOpacity=".2"/>
        <path d="M433 415L446 397Q450 392 454 397L467 415M441 415L450 403L459 415" className="service-accent-stroke"/>
        <text x="450" y="490" textAnchor="middle" className="service-art-micro">NORDRA STUDIO</text>
      </g>
    </g>
    <path className="service-thread" d="M27 446C190 618 579 601 766 430C864 341 882 228 853 161" stroke={`url(#${id}-ribbon)`}/>
    <path className="service-thread-trace" pathLength="100" d="M27 446C190 618 579 601 766 430C864 341 882 228 853 161"/>
    <path className="service-journey-thread" pathLength="100" d="M853 161C882 228 864 341 766 430C579 601 190 618 27 446"/>
    <circle cx="853" cy="161" r="3" fill="var(--intro-accent)"/>
  </svg>;
}
