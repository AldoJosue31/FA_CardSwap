// src/components/GoalNet.tsx

const GoalNet = ({ isPlayer }: { isPlayer: boolean }) => {
  const isLeft = isPlayer;
  
  return (
    <div
      className={`absolute top-1/2 -translate-y-1/2 h-[115%] w-20 sm:w-24 md:w-32 pointer-events-none z-40 ${
        isLeft 
          // Si es el jugador (Izquierda), la portería va a la izquierda de la carta
          ? 'right-[calc(100%+0.5rem)] md:right-[calc(100%+1.5rem)]' 
          // Si es el bot (Derecha), la portería va a la derecha de la carta
          : 'left-[calc(100%+0.5rem)] md:left-[calc(100%+1.5rem)]'
      }`}
    >
      <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" className="drop-shadow-2xl overflow-visible">
        <defs>
          {/* Patrón de la red en forma de rombos (red profesional) */}
          <pattern id="net-pattern" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <path d="M 6 0 L 0 6 M 0 0 L 6 6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.5" />
          </pattern>

          {/* Gradiente metálico para darle volumen 3D al travesaño */}
          <linearGradient id="metal-bar" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#94a3b8" />
            <stop offset="30%" stopColor="#ffffff" />
            <stop offset="70%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Gradientes de profundidad (simulan el interior oscuro de la portería) */}
          <linearGradient id="depth-l" x1="1" y1="0" x2="0" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
          </linearGradient>
          
          <linearGradient id="depth-r" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(0,0,0,0)" />
            <stop offset="100%" stopColor="rgba(0,0,0,0.65)" />
          </linearGradient>

          {/* Filtro de resplandor para la línea de gol */}
          <filter id="glow-neon" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {isLeft ? (
          // ================= PORTERÍA IZQUIERDA (JUGADOR) =================
          <g>
            {/* Sombra proyectada en el césped hacia atrás */}
            <polygon points="85,92 10,78 10,22 85,8" fill="rgba(0,0,0,0.35)" filter="blur(3px)" />

            {/* Línea de gol (pintura blanca en el pasto) */}
            <line x1="88" y1="0" x2="88" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

            {/* Sombra interna para dar profundidad a la red */}
            <polygon points="88,5 15,18 15,82 88,95" fill="url(#depth-l)" />
            
            {/* Malla de la red */}
            <polygon points="88,5 15,18 15,82 88,95" fill="url(#net-pattern)" />

            {/* Marco en el suelo (Base de la portería) */}
            <polyline points="88,5 15,18 15,82 88,95" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Tensores de la red (tubos traseros en diagonal) */}
            <line x1="85" y1="10" x2="15" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="85" y1="90" x2="15" y2="82" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

            {/* Poste Superior / Travesaño (Metálico, grueso y 3D) */}
            <rect x="85" y="2" width="6" height="96" rx="3" fill="url(#metal-bar)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />

            {/* Brillo Neón Temático (Cian) en la línea de gol */}
            <line x1="88" y1="2" x2="88" y2="98" stroke="#22d3ee" strokeWidth="3" filter="url(#glow-neon)" opacity="0.9" style={{ mixBlendMode: 'screen' }} />
          </g>
        ) : (
          // ================= PORTERÍA DERECHA (RIVAL/BOT) =================
          <g>
            {/* Sombra proyectada en el césped hacia atrás */}
            <polygon points="15,92 90,78 90,22 15,8" fill="rgba(0,0,0,0.35)" filter="blur(3px)" />

            {/* Línea de gol (pintura blanca en el pasto) */}
            <line x1="12" y1="0" x2="12" y2="100" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" />

            {/* Sombra interna para dar profundidad a la red */}
            <polygon points="12,5 85,18 85,82 12,95" fill="url(#depth-r)" />

            {/* Malla de la red */}
            <polygon points="12,5 85,18 85,82 12,95" fill="url(#net-pattern)" />

            {/* Marco en el suelo (Base de la portería) */}
            <polyline points="12,5 85,18 85,82 12,95" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" strokeLinejoin="round" />

            {/* Tensores de la red (tubos traseros en diagonal) */}
            <line x1="15" y1="10" x2="85" y2="18" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />
            <line x1="15" y1="90" x2="85" y2="82" stroke="rgba(255,255,255,0.6)" strokeWidth="1" />

            {/* Poste Superior / Travesaño (Metálico, grueso y 3D) */}
            <rect x="9" y="2" width="6" height="96" rx="3" fill="url(#metal-bar)" stroke="rgba(255,255,255,0.5)" strokeWidth="0.5" />

            {/* Brillo Neón Temático (Rojo) en la línea de gol */}
            <line x1="12" y1="2" x2="12" y2="98" stroke="#ef4444" strokeWidth="3" filter="url(#glow-neon)" opacity="0.9" style={{ mixBlendMode: 'screen' }} />
          </g>
        )}
      </svg>
    </div>
  );
};

export default GoalNet;