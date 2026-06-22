import type { SVGProps } from 'react';

export default function AnimatedBall({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={`w-10 h-10 md:w-14 md:h-14 ${className}`}
      {...props}
    >
      <defs>
        {/* 1. Base metálica brillante con volumen esférico */}
        <radialGradient id="ball-base" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="35%" stopColor="#f8fafc" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#64748b" />
        </radialGradient>

        {/* 2. Textura oscura tipo fibra de carbono para los parches */}
        <radialGradient id="carbon-patch" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#334155" />
          <stop offset="70%" stopColor="#0f172a" />
          <stop offset="100%" stopColor="#020617" />
        </radialGradient>

        {/* 3. Sombra volumétrica global (Da la sensación de esfera 3D) */}
        <radialGradient id="ball-shadow" cx="50%" cy="50%" r="50%">
          <stop offset="50%" stopColor="transparent" />
          <stop offset="90%" stopColor="rgba(0,0,0,0.5)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.85)" />
        </radialGradient>

        {/* 4. Filtro de resplandor para los acentos de energía */}
        <filter id="neon-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* 5. Desenfoque suave para los brillos de luz */}
        <filter id="light-blur">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>

      {/* --- CAPA 1: Carcasa Blanca Esférica --- */}
      <circle cx="50" cy="50" r="48" fill="url(#ball-base)" />

      {/* --- CAPA 2: Parches Geométricos Curvos --- */}
      <g strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">
        
        {/* Panel Central Dinámico */}
        <path 
          d="M35,25 Q50,18 65,25 L75,45 Q50,60 25,45 Z" 
          fill="url(#carbon-patch)" 
          stroke="#0f172a" 
          strokeWidth="2.5"
        />
        {/* Borde Neón Naranja (Detalle Energético) */}
        <path 
          d="M35,25 Q50,18 65,25 L75,45 Q50,60 25,45 Z" 
          fill="none" 
          stroke="#f97316" 
          strokeWidth="1.2" 
          filter="url(#neon-glow)"
          opacity="0.9"
        />

        {/* Núcleo interno del panel central */}
        <circle cx="50" cy="38" r="8" fill="none" stroke="#38bdf8" strokeWidth="1" filter="url(#neon-glow)" opacity="0.8" />
        <circle cx="50" cy="38" r="3" fill="#38bdf8" filter="url(#neon-glow)" />

        {/* Parches oscuros perimetrales (Simulando la envoltura 3D) */}
        {/* Superior Izquierdo */}
        <path d="M5,35 Q15,18 35,10 L25,2 Z" fill="url(#carbon-patch)" stroke="#f97316" strokeWidth="0.75" />
        {/* Superior Derecho */}
        <path d="M95,35 Q85,18 65,10 L75,2 Z" fill="url(#carbon-patch)" stroke="#38bdf8" strokeWidth="0.75" />
        {/* Inferior Central */}
        <path d="M20,70 Q50,90 80,70 L70,95 Q50,100 30,95 Z" fill="url(#carbon-patch)" stroke="#38bdf8" strokeWidth="0.75" filter="url(#neon-glow)" opacity="0.7"/>

        {/* --- CAPA 3: Surcos Aerodinámicos --- */}
        {/* Canales profundos en la carcasa */}
        <path d="M35,25 Q20,30 5,35" fill="none" stroke="#475569" strokeWidth="2.5" />
        <path d="M65,25 Q80,30 95,35" fill="none" stroke="#475569" strokeWidth="2.5" />
        <path d="M25,45 Q15,60 20,70" fill="none" stroke="#475569" strokeWidth="2.5" />
        <path d="M75,45 Q85,60 80,70" fill="none" stroke="#475569" strokeWidth="2.5" />
        <path d="M50,21.5 Q50,10 50,2" fill="none" stroke="#475569" strokeWidth="2.5" />

        {/* Detalles de termosellado (Patrón de micropuntos a lo largo de los surcos) */}
        <path d="M32,27 Q20,32 7,36" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="1,4" />
        <path d="M68,27 Q80,32 93,36" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="1,4" />
        <path d="M28,47 Q17,60 22,68" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="1,4" />
        <path d="M72,47 Q83,60 78,68" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="1,4" />
      </g>

      {/* --- CAPA 4: Iluminación y Relieve Final --- */}
      {/* Sombra esférica base multiplicada sobre todo el diseño */}
      <circle cx="50" cy="50" r="48" fill="url(#ball-shadow)" pointerEvents="none" />
      
      {/* Reflejo de la iluminación del estadio (Efecto cristalino superior) */}
      <ellipse 
        cx="32" cy="22" 
        rx="18" ry="8" 
        fill="#ffffff" 
        opacity="0.6" 
        transform="rotate(-35 32 22)" 
        filter="url(#light-blur)" 
        pointerEvents="none" 
      />
      <path 
        d="M 18,20 Q 38,5 58,12 Q 40,22 18,20 Z" 
        fill="#ffffff" 
        opacity="0.3" 
        filter="url(#light-blur)" 
        pointerEvents="none"
      />

      {/* Borde exterior sutil para que recorte bien sobre cualquier fondo */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#0f172a" strokeWidth="2" opacity="0.8" />
    </svg>
  );
}