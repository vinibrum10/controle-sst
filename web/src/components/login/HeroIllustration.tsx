export function HeroIllustration() {
  return (
    <svg
      viewBox="0 0 480 340"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full max-w-[480px]"
      aria-label="Ilustração: painel de controle operacional com equipe em campo"
      role="img"
    >
      {/* ── Fundo do painel principal ── */}
      <rect x="20" y="20" width="440" height="300" rx="14" fill="#ffffff" stroke="#E2E8F0" strokeWidth="1.5" />

      {/* Barra superior do painel */}
      <rect x="20" y="20" width="440" height="42" rx="14" fill="#244C7C" />
      <rect x="20" y="48" width="440" height="14" fill="#244C7C" />
      {/* Dots de janela */}
      <circle cx="46" cy="41" r="5" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="64" cy="41" r="5" fill="#ffffff" fillOpacity="0.25" />
      <circle cx="82" cy="41" r="5" fill="#ffffff" fillOpacity="0.25" />
      {/* Título do painel */}
      <rect x="106" y="35" width="100" height="12" rx="3" fill="#ffffff" fillOpacity="0.4" />

      {/* ── KPI Cards (linha superior) ── */}
      {/* Card 1 — Atividades */}
      <rect x="36" y="80" width="90" height="62" rx="8" fill="#F0F6FF" stroke="#D0DFF0" strokeWidth="1" />
      <rect x="48" y="91" width="28" height="28" rx="6" fill="#244C7C" fillOpacity="0.12" />
      <rect x="54" y="97" width="16" height="16" rx="3" fill="#244C7C" fillOpacity="0.4" />
      <rect x="84" y="94" width="32" height="10" rx="3" fill="#244C7C" fillOpacity="0.35" />
      <rect x="84" y="108" width="20" height="7" rx="2" fill="#244C7C" fillOpacity="0.18" />
      <rect x="48" y="125" width="68" height="9" rx="3" fill="#3E6EA8" fillOpacity="0.25" />

      {/* Card 2 — OS Interliga */}
      <rect x="138" y="80" width="90" height="62" rx="8" fill="#F0FBF5" stroke="#C6E8D4" strokeWidth="1" />
      <rect x="150" y="91" width="28" height="28" rx="6" fill="#24784c" fillOpacity="0.12" />
      <rect x="156" y="97" width="16" height="16" rx="3" fill="#24784c" fillOpacity="0.4" />
      <rect x="186" y="94" width="28" height="10" rx="3" fill="#24784c" fillOpacity="0.35" />
      <rect x="186" y="108" width="18" height="7" rx="2" fill="#24784c" fillOpacity="0.18" />
      <rect x="150" y="125" width="68" height="9" rx="3" fill="#24784c" fillOpacity="0.2" />

      {/* Card 3 — Viagens */}
      <rect x="240" y="80" width="90" height="62" rx="8" fill="#FFFBF0" stroke="#E8DFC4" strokeWidth="1" />
      <rect x="252" y="91" width="28" height="28" rx="6" fill="#a76309" fillOpacity="0.12" />
      <rect x="258" y="97" width="16" height="16" rx="3" fill="#a76309" fillOpacity="0.4" />
      <rect x="288" y="94" width="30" height="10" rx="3" fill="#a76309" fillOpacity="0.35" />
      <rect x="288" y="108" width="18" height="7" rx="2" fill="#a76309" fillOpacity="0.18" />
      <rect x="252" y="125" width="68" height="9" rx="3" fill="#a76309" fillOpacity="0.2" />

      {/* Card 4 — Equipes */}
      <rect x="342" y="80" width="100" height="62" rx="8" fill="#F5F0FF" stroke="#D8CFF0" strokeWidth="1" />
      <rect x="354" y="91" width="28" height="28" rx="6" fill="#5B4DA8" fillOpacity="0.12" />
      <rect x="360" y="97" width="16" height="16" rx="3" fill="#5B4DA8" fillOpacity="0.4" />
      <rect x="390" y="94" width="40" height="10" rx="3" fill="#5B4DA8" fillOpacity="0.35" />
      <rect x="390" y="108" width="26" height="7" rx="2" fill="#5B4DA8" fillOpacity="0.18" />
      <rect x="354" y="125" width="76" height="9" rx="3" fill="#5B4DA8" fillOpacity="0.2" />

      {/* ── Área central: gráfico de barras (esquerda) + mapa de rotas (direita) ── */}

      {/* Gráfico de barras */}
      <rect x="36" y="160" width="196" height="140" rx="8" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
      <rect x="48" y="170" width="80" height="8" rx="2" fill="#102033" fillOpacity="0.35" />
      <rect x="48" y="182" width="50" height="6" rx="2" fill="#102033" fillOpacity="0.15" />
      {/* Eixo Y */}
      <line x1="58" y1="197" x2="58" y2="270" stroke="#E2E8F0" strokeWidth="1" />
      {/* Linhas de grade */}
      <line x1="58" y1="210" x2="218" y2="210" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="58" y1="228" x2="218" y2="228" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
      <line x1="58" y1="246" x2="218" y2="246" stroke="#E2E8F0" strokeWidth="0.8" strokeDasharray="3 3" />
      {/* Barras */}
      <rect x="68" y="220" width="18" height="50" rx="3" fill="#244C7C" fillOpacity="0.75" />
      <rect x="92" y="210" width="18" height="60" rx="3" fill="#3E6EA8" fillOpacity="0.65" />
      <rect x="116" y="230" width="18" height="40" rx="3" fill="#244C7C" fillOpacity="0.55" />
      <rect x="140" y="215" width="18" height="55" rx="3" fill="#3E6EA8" fillOpacity="0.7" />
      <rect x="164" y="205" width="18" height="65" rx="3" fill="#244C7C" fillOpacity="0.8" />
      <rect x="188" y="225" width="18" height="45" rx="3" fill="#3E6EA8" fillOpacity="0.6" />
      {/* Label eixo X */}
      <rect x="63" y="275" width="12" height="5" rx="1" fill="#102033" fillOpacity="0.2" />
      <rect x="87" y="275" width="12" height="5" rx="1" fill="#102033" fillOpacity="0.2" />
      <rect x="111" y="275" width="12" height="5" rx="1" fill="#102033" fillOpacity="0.2" />
      <rect x="135" y="275" width="12" height="5" rx="1" fill="#102033" fillOpacity="0.2" />
      <rect x="159" y="275" width="12" height="5" rx="1" fill="#102033" fillOpacity="0.2" />
      <rect x="183" y="275" width="12" height="5" rx="1" fill="#102033" fillOpacity="0.2" />

      {/* Painel de rotas / mapa */}
      <rect x="244" y="160" width="198" height="140" rx="8" fill="#F0F5FC" stroke="#D0DFF0" strokeWidth="1" />
      <rect x="256" y="170" width="70" height="8" rx="2" fill="#102033" fillOpacity="0.35" />
      <rect x="256" y="182" width="46" height="6" rx="2" fill="#102033" fillOpacity="0.15" />
      {/* Grade de mapa */}
      <line x1="256" y1="200" x2="430" y2="200" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="256" y1="220" x2="430" y2="220" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="256" y1="240" x2="430" y2="240" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="256" y1="260" x2="430" y2="260" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="276" y1="196" x2="276" y2="282" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="310" y1="196" x2="310" y2="282" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="344" y1="196" x2="344" y2="282" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="378" y1="196" x2="378" y2="282" stroke="#C8D8EE" strokeWidth="0.8" />
      <line x1="412" y1="196" x2="412" y2="282" stroke="#C8D8EE" strokeWidth="0.8" />
      {/* Rotas curvas */}
      <path d="M 272 268 Q 300 235 330 248 T 390 222" stroke="#244C7C" strokeWidth="2" strokeOpacity="0.7" fill="none" strokeLinecap="round" />
      <path d="M 272 252 Q 305 270 338 255 T 408 268" stroke="#3E6EA8" strokeWidth="1.5" strokeOpacity="0.5" fill="none" strokeLinecap="round" strokeDasharray="4 3" />
      {/* Nós de ponto */}
      <circle cx="272" cy="268" r="5" fill="#244C7C" fillOpacity="0.8" />
      <circle cx="272" cy="268" r="9" fill="#244C7C" fillOpacity="0.15" />
      <circle cx="330" cy="248" r="4" fill="#3E6EA8" fillOpacity="0.8" />
      <circle cx="330" cy="248" r="8" fill="#3E6EA8" fillOpacity="0.15" />
      <circle cx="390" cy="222" r="5" fill="#244C7C" fillOpacity="0.8" />
      <circle cx="390" cy="222" r="9" fill="#244C7C" fillOpacity="0.15" />
      <circle cx="338" cy="255" r="3.5" fill="#24784c" fillOpacity="0.8" />
      <circle cx="408" cy="268" r="3.5" fill="#24784c" fillOpacity="0.8" />
      {/* Legenda mapa */}
      <circle cx="262" cy="287" r="3" fill="#244C7C" fillOpacity="0.7" />
      <rect x="268" y="284" width="30" height="5" rx="1.5" fill="#102033" fillOpacity="0.2" />
      <circle cx="310" cy="287" r="3" fill="#24784c" fillOpacity="0.7" />
      <rect x="316" y="284" width="30" height="5" rx="1.5" fill="#102033" fillOpacity="0.2" />

      {/* ── Técnicos em campo (avatares estilizados) ── */}
      {/* Técnico 1 */}
      <circle cx="56" cy="148" r="12" fill="#244C7C" fillOpacity="0.15" stroke="#244C7C" strokeWidth="1.2" strokeOpacity="0.3" />
      <circle cx="56" cy="144" r="5" fill="#244C7C" fillOpacity="0.5" />
      <path d="M 44 158 Q 56 152 68 158" stroke="#244C7C" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      {/* Técnico 2 */}
      <circle cx="88" cy="148" r="12" fill="#3E6EA8" fillOpacity="0.12" stroke="#3E6EA8" strokeWidth="1.2" strokeOpacity="0.3" />
      <circle cx="88" cy="144" r="5" fill="#3E6EA8" fillOpacity="0.5" />
      <path d="M 76 158 Q 88 152 100 158" stroke="#3E6EA8" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      {/* Técnico 3 */}
      <circle cx="120" cy="148" r="12" fill="#244C7C" fillOpacity="0.15" stroke="#244C7C" strokeWidth="1.2" strokeOpacity="0.3" />
      <circle cx="120" cy="144" r="5" fill="#244C7C" fillOpacity="0.5" />
      <path d="M 108 158 Q 120 152 132 158" stroke="#244C7C" strokeWidth="1.5" strokeOpacity="0.4" fill="none" strokeLinecap="round" />
      {/* Label "Equipe em campo" */}
      <rect x="140" y="142" width="72" height="7" rx="2" fill="#102033" fillOpacity="0.2" />
      <rect x="140" y="153" width="52" height="5" rx="1.5" fill="#102033" fillOpacity="0.12" />

      {/* Pulso de status ao vivo */}
      <circle cx="418" cy="41" r="5" fill="#24784c" fillOpacity="0.9" />
      <circle cx="418" cy="41" r="9" fill="#24784c" fillOpacity="0.25" />
      <rect x="428" y="36" width="22" height="10" rx="3" fill="#ffffff" fillOpacity="0.35" />
    </svg>
  );
}
