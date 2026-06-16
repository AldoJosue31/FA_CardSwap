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
  const isLegend = card.isLegend; 

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

  // =======================================================================================
  // ANIMACIONES DINÁMICAS (Aquí ocurre la magia de oscurecerse y hundirse en el turno del rival)
  // =======================================================================================
  const animateProps = isBoardCard 
    ? { rotateX: [0, 180, 360], z: [0, 120, 0], scale: [1, 1.15, 1], opacity: 1, rotate: 0 } 
    : isDiscardCard 
    ? { rotateX: 0, z: 0, scale: 0.5, opacity: 0.9, rotate: getGraveyardRotation(card.id) } 
    : { 
        x: 0, 
        y: disabled ? 40 : 0,                                                    // Se hunde 40px si no es tu turno
        scale: disabled ? 0.92 : 1,                                              // Se encoge un 8%
        filter: disabled ? "grayscale(1) brightness(0.5)" : "grayscale(0) brightness(1)", // Se pone gris y oscura
        opacity: 1, 
        rotateX: 0, 
        z: 0, 
        rotate: 0 
      };

  const cardLayoutId = isGalleryCard ? undefined : `card-${card.id}`;

  const bgClass = isLegend 
    ? 'bg-gradient-to-br from-slate-700 via-slate-800 to-[#111]' 
    : isBot 
      ? 'bg-gradient-to-br from-red-950 via-black to-black' 
      : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black';

  const borderClass = isLegend 
    ? 'border-2 border-slate-300' 
    : isBot 
      ? 'border border-red-800/40' 
      : 'border border-slate-700/50';

  const shadowClass = isLegend 
    ? 'shadow-[0_0_20px_rgba(255,255,255,0.25)]' 
    : isBot 
      ? 'shadow-[0_8px_25px_rgba(0,0,0,0.5)]' 
      : 'shadow-[0_8px_25px_rgba(0,0,0,0.4)]';

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
        willChange: "transform, opacity, filter" // <-- Añadimos 'filter' para optimizar gráficos de la GPU
      }}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-28 h-40 md:w-40 md:h-56 rounded-2xl flex flex-col justify-between p-2.5 select-none overflow-hidden
        ${bgClass} ${borderClass} ${shadowClass}
        ${disabled ? 'cursor-default pointer-events-none' : 'ring-1 ring-white/10 cursor-pointer'}`}
    >
      
      {/* ANIMACIÓN LEYENDA */}
      {isLegend && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-slate-300/10 via-transparent to-slate-100/20"
            animate={{ opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{ willChange: 'opacity' }}
          />
          <motion.div
            className="absolute inset-y-0 w-[150%] bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-[-35deg]"
            initial={{ x: '-150%' }}
            animate={{ x: '150%' }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            style={{ willChange: 'transform' }}
          />
        </div>
      )}

      <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-0 rounded-t-2xl"></div>

      <div className={`relative z-10 w-full text-center rounded-lg py-1 px-2 flex justify-between items-center backdrop-blur-sm ${isLegend ? 'bg-slate-900/40 border border-slate-400/50' : isBot ? 'bg-red-950/40 border border-red-800/30' : 'bg-slate-900/50 border border-slate-700/50'}`}>
        <span className="text-white font-bold text-[10px] sm:text-xs truncate max-w-[70%] tracking-wide">{card.name}</span>
        <span className={`${isLegend ? 'text-slate-300' : isBot ? 'text-red-400' : 'text-cyan-400'} font-black text-[10px]`}>{card.pos}</span>
      </div>

      {/* ================= CONTENEDOR FOTO + BANDERA ================= */}
      <div className="relative z-20 flex-1 my-2.5 w-full flex items-center justify-center">
        
        {/* 1. CAJA DE LA BANDERA */}
        <div className={`absolute inset-0 rounded-lg overflow-hidden ${isLegend ? 'bg-slate-800/50' : isBot ? 'bg-red-900/20' : 'bg-slate-800/30'}`}>
          {card.nationality && flagCode !== 'xx' && (
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-overlay z-0"
              style={{ backgroundImage: `url(${flagUrl})` }}
            ></div>
          )}
        </div>

        {/* 2. IMAGEN DEL JUGADOR */}
        {card.image && card.image.trim() !== '' ? (
          <img 
            src={getSupabaseImageUrl(card.image)} 
            alt={card.name} 
            loading={isGalleryCard ? "lazy" : "eager"}
            className="absolute bottom-0 inset-x-0 mx-auto w-[125%] h-[112%] object-contain object-bottom drop-shadow-[0_-3px_12px_rgba(0,0,0,0.5)] z-20 pointer-events-none" 
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
             <span className="text-4xl sm:text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">⚽</span>
          </div>
        )}

        {/* 3. DEGRADADO INFERIOR */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] rounded-b-lg bg-gradient-to-t from-black/90 via-black/40 to-transparent z-30 pointer-events-none"></div>
        
      </div>
      {/* ============================================================= */}

      <div className={`relative z-30 flex justify-between w-full font-black text-sm sm:text-lg p-1.5 rounded-lg backdrop-blur-sm ${isLegend ? 'bg-slate-900/50 border border-slate-400/40' : isBot ? 'bg-red-950/50 border border-red-900/30' : 'bg-slate-900/60 border border-slate-700/40'}`}>
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-slate-400 tracking-widest font-medium">ATK</span>
          <span className={`${isLegend ? 'text-slate-100' : 'text-red-400'} drop-shadow-[0_0_5px_rgba(248,113,113,0.4)]`}>{card.atk}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[8px] text-slate-400 tracking-widest font-medium">DEF</span>
          <span className={`${isLegend ? 'text-slate-100' : 'text-blue-400'} drop-shadow-[0_0_5px_rgba(96,165,250,0.4)]`}>{card.def}</span>
        </div>
      </div>
    </motion.div>
  );
}