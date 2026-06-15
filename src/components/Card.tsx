import { motion } from 'framer-motion';
import type { DragEvent } from 'react';
import type { CardData } from '../gameData';

interface CardProps {
  card: CardData;
  onClick?: () => void;
  disabled?: boolean;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
  isBoardCard?: boolean;
  isDiscardCard?: boolean;
  isGalleryCard?: boolean;
}

const FLAG_MAP: Record<string, string> = {
  MEX: 'mx', ARG: 'ar', BRA: 'br', ESP: 'es', FRA: 'fr',
  POR: 'pt', ITA: 'it', GER: 'de', NED: 'nl', ENG: 'gb-eng',
  URU: 'uy', COL: 'co', SWE: 'se', CHI: 'cl', USA: 'us',
  POL: 'pl'
};

const BUCKET_NAME = "card-assets";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://TU_PROJECT_ID.supabase.co";

const getSupabaseImageUrl = (filename: string) => {
  const baseUrl = SUPABASE_URL.endsWith('/') ? SUPABASE_URL.slice(0, -1) : SUPABASE_URL;
  return `${baseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filename}`;
};

export default function Card({ card, onClick, disabled, draggable, onDragStart, isBoardCard, isDiscardCard, isGalleryCard }: CardProps) {
  const isBot = card.owner === 'bot';

  const flagCode = FLAG_MAP[card.nationality] || 'xx';
  const flagUrl = `https://flagcdn.com/w320/${flagCode}.png`;

  const getGraveyardRotation = (id: string) => {
    let hash = 0;
    for (let i = 0; i < id.length; i++) {
      hash = id.charCodeAt(i) + ((hash << 5) - hash);
    }
    return (hash % 30) - 15;
  };

  const isNewDraw = !isBoardCard && !isDiscardCard && !isGalleryCard;
  const canInteract = !disabled && !isBoardCard && !isDiscardCard;
  
  const initialDrawProps = isNewDraw 
    ? { x: 300, y: isBot && !canInteract ? 200 : -200, opacity: 0, scale: 0.5, rotate: 15 } 
    : false;

  const animateProps = isBoardCard 
    ? { rotateX: [0, 180, 360], z: [0, 120, 0], scale: [1, 1.15, 1], opacity: 1, rotate: 0 } 
    : isDiscardCard 
    ? { rotateX: 0, z: 0, scale: 0.5, opacity: 0.9, rotate: getGraveyardRotation(card.id) } 
    : { x: 0, y: 0, scale: 1, opacity: 1, rotateX: 0, z: 0, rotate: 0 };

  const cardLayoutId = isGalleryCard ? undefined : `card-${card.id}`;

  return (
    <motion.div
      layoutId={cardLayoutId}
      draggable={draggable}
      onDragStartCapture={onDragStart}
      
      whileHover={canInteract ? { scale: 1.05, y: -20, zIndex: 50 } : {}}
      
      initial={initialDrawProps}
      animate={animateProps}
      
      transition={{
        layout: { duration: 0.4, ease: "easeOut" },
        rotate: { duration: 0.4, ease: "easeOut" },
        rotateX: { duration: 0.4, ease: "linear" },
        z: { duration: 0.4, ease: "easeInOut" },
        x: { type: "spring", stiffness: 300, damping: 25 },
        y: { type: "spring", stiffness: 300, damping: 25 },
        default: { type: "spring", stiffness: 500, damping: 25 }
      }}
      
      style={{ 
        transformStyle: "preserve-3d", 
        zIndex: isBoardCard ? 100 : isDiscardCard ? 10 : 1,
        transform: "translateZ(0)",
        willChange: "transform, opacity"
      }}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-28 h-40 md:w-40 md:h-56 rounded-2xl flex flex-col justify-between p-2.5 select-none overflow-hidden
        ${isBot 
          ? 'bg-gradient-to-br from-red-950 via-black to-black border border-red-800/40 shadow-[0_8px_25px_rgba(0,0,0,0.5)]' 
          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700/50 shadow-[0_8px_25px_rgba(0,0,0,0.4)]'} 
        ${disabled ? 'cursor-default pointer-events-none' : 'ring-1 ring-white/10 cursor-pointer'}`}
    >
      <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-0"></div>

      {/* HEADER DE LA CARTA */}
      {/* Nota: Redujimos a z-10 para que la cabeza del jugador (z-20) se superponga sutilmente al título */}
      <div className={`relative z-10 w-full text-center rounded-lg py-1 px-2 flex justify-between items-center backdrop-blur-sm ${isBot ? 'bg-red-950/40 border border-red-800/30' : 'bg-slate-900/50 border border-slate-700/50'}`}>
        <span className="text-white font-bold text-[10px] sm:text-xs truncate max-w-[70%] tracking-wide">{card.name}</span>
        <span className={`${isBot ? 'text-red-400' : 'text-cyan-400'} font-black text-[10px]`}>{card.pos}</span>
      </div>

      {/* ================= CONTENEDOR EFECTO POP-OUT 3D ================= */}
      {/* Quitamos el overflow-hidden de aquí para permitir que la imagen se salga */}
      <div className="relative z-20 flex-1 my-2.5 w-full flex items-center justify-center">
        
        {/* 1. CAJA DE LA BANDERA (Ésta sí lleva overflow-hidden y rounded para ser un rectángulo perfecto) */}
        <div className={`absolute inset-0 rounded-lg overflow-hidden ${isBot ? 'bg-red-900/20' : 'bg-slate-800/30'}`}>
          {card.nationality && flagCode !== 'xx' && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay z-0"
              style={{ backgroundImage: `url(${flagUrl})` }}
            ></div>
          )}
        </div>

        {/* 2. IMAGEN DEL JUGADOR (Sobresale de la caja de la bandera) */}
        {card.image && card.image.trim() !== '' ? (
          <img 
            src={getSupabaseImageUrl(card.image)} 
            alt={card.name} 
            loading={isGalleryCard ? "lazy" : "eager"}
            // LA MAGIA ESTÁ AQUÍ:
            // h-[120%] anclado al fondo (bottom-0) hace que el 20% sobrante de la imagen suba e invada la parte superior.
            // Le agregamos un drop-shadow que proyecta la sombra sobre la caja, amplificando el 3D.
            className="absolute bottom-0 inset-x-0 mx-auto w-[115%] h-[120%] object-contain object-bottom drop-shadow-[0_-5px_15px_rgba(0,0,0,0.6)] z-20 pointer-events-none" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-4xl sm:text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative z-20">⚽</span>
        )}

        {/* 3. DEGRADADO INFERIOR (Oculta el corte del pecho, lleva borde redondeado para empatar con la caja de la bandera) */}
        <div className="absolute inset-x-0 bottom-0 h-1/2 rounded-b-lg bg-gradient-to-t from-black/95 via-black/20 to-transparent z-30 pointer-events-none"></div>
      </div>
      {/* ============================================================= */}

      {/* FOOTER STATS */}
      <div className={`relative z-30 flex justify-between w-full font-black text-sm sm:text-lg p-1.5 rounded-lg backdrop-blur-sm ${isBot ? 'bg-red-950/50 border border-red-900/30' : 'bg-slate-900/60 border border-slate-700/40'}`}>
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-slate-400 tracking-widest font-medium">ATK</span>
          <span className="text-red-400 drop-shadow-[0_0_5px_rgba(248,113,113,0.4)]">{card.atk}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-slate-400 tracking-widest font-medium">DEF</span>
          <span className="text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.4)]">{card.def}</span>
        </div>
      </div>
    </motion.div>
  );
}