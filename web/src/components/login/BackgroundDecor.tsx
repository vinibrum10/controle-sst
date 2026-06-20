export function BackgroundDecor() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#EEF3FA] via-[#F5F7FA] to-[#E8EFF8]" />

      {/* SVG abstract network / route lines */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
        viewBox="0 0 1440 900"
      >
        <defs>
          <radialGradient id="blob1" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#244C7C" stopOpacity="0.09" />
            <stop offset="100%" stopColor="#244C7C" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob2" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#3E6EA8" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#3E6EA8" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="blob3" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#2c5d8a" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#2c5d8a" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Blobs abstratos */}
        <ellipse cx="200" cy="150" rx="380" ry="320" fill="url(#blob1)" />
        <ellipse cx="1280" cy="720" rx="400" ry="340" fill="url(#blob2)" />
        <ellipse cx="900" cy="400" rx="300" ry="260" fill="url(#blob3)" />

        {/* Linhas de rota / conexão */}
        <g stroke="#244C7C" strokeWidth="1" strokeOpacity="0.08" fill="none">
          <path d="M 0 200 Q 300 100 600 280 T 1200 200" />
          <path d="M 0 400 Q 400 300 720 450 T 1440 380" />
          <path d="M 0 620 Q 350 500 700 580 T 1440 520" />
          <path d="M 200 0 Q 300 250 180 500 T 220 900" />
          <path d="M 900 0 Q 950 200 880 450 T 920 900" />
          <line x1="100" y1="180" x2="340" y2="290" />
          <line x1="340" y1="290" x2="580" y2="210" />
          <line x1="580" y1="210" x2="820" y2="360" />
          <line x1="820" y1="360" x2="1100" y2="280" />
          <line x1="1100" y1="280" x2="1380" y2="420" />
          <line x1="200" y1="580" x2="480" y2="480" />
          <line x1="480" y1="480" x2="750" y2="610" />
          <line x1="750" y1="610" x2="1020" y2="520" />
          <line x1="1020" y1="520" x2="1300" y2="650" />
        </g>

        {/* Nós / pontos nas interseções */}
        <g fill="#244C7C" fillOpacity="0.14">
          <circle cx="100" cy="180" r="4" />
          <circle cx="340" cy="290" r="5" />
          <circle cx="580" cy="210" r="4" />
          <circle cx="820" cy="360" r="6" />
          <circle cx="1100" cy="280" r="4" />
          <circle cx="1380" cy="420" r="3" />
          <circle cx="200" cy="580" r="4" />
          <circle cx="480" cy="480" r="5" />
          <circle cx="750" cy="610" r="4" />
          <circle cx="1020" cy="520" r="6" />
          <circle cx="1300" cy="650" r="4" />
        </g>

        {/* Elementos geométricos discretos */}
        <g stroke="#3E6EA8" strokeWidth="1" strokeOpacity="0.06" fill="none">
          <rect x="60" y="60" width="80" height="80" rx="8" transform="rotate(15 100 100)" />
          <rect x="1300" y="80" width="60" height="60" rx="6" transform="rotate(-10 1330 110)" />
          <rect x="1100" y="750" width="70" height="70" rx="6" transform="rotate(20 1135 785)" />
          <rect x="80" y="760" width="50" height="50" rx="5" transform="rotate(-12 105 785)" />
        </g>

        {/* Hexágonos discretos */}
        <g stroke="#244C7C" strokeWidth="0.8" strokeOpacity="0.07" fill="none">
          <polygon points="1360,120 1390,103 1420,120 1420,154 1390,171 1360,154" />
          <polygon points="50,450 78,434 106,450 106,482 78,498 50,482" />
          <polygon points="680,820 705,806 730,820 730,848 705,862 680,848" />
        </g>
      </svg>
    </div>
  );
}
