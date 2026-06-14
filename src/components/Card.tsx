import { motion } from 'framer-motion';
import type { DragEvent } from 'react';
import type { CardData } from '../gameData';

interface CardProps {
  card: CardData;
  onClick?: () => void;
  disabled?: boolean;
  draggable?: boolean;
  onDragStart?: (e: DragEvent<HTMLDivElement>) => void;
}

export default function Card({ card, onClick, disabled, draggable, onDragStart }: CardProps) {
  const isBot = card.owner === 'bot';

  return (
    <motion.div
      draggable={draggable}
      onDragStartCapture={onDragStart}
      whileHover={!disabled && !isBot ? { scale: 1.05, y: -20, zIndex: 50 } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      onClick={!disabled ? onClick : undefined}
      className={`relative w-28 h-40 md:w-40 md:h-56 rounded-2xl flex flex-col justify-between p-2.5 select-none overflow-hidden
        ${isBot 
          ? 'bg-gradient-to-br from-red-950 via-black to-black border border-red-800/40 shadow-[0_8px_25px_rgba(0,0,0,0.5)]' 
          : 'bg-gradient-to-br from-slate-800 via-slate-900 to-black border border-slate-700/50 shadow-[0_8px_25px_rgba(0,0,0,0.4)]'} 
        ${disabled ? 'cursor-default pointer-events-none' : 'ring-1 ring-white/10 cursor-pointer'}`}
    >
      <div className="absolute top-0 left-0 right-0 h-2/3 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none z-0"></div>

      <div className={`relative z-10 w-full text-center rounded-lg py-1 px-2 flex justify-between items-center backdrop-blur-sm ${isBot ? 'bg-red-950/40 border border-red-800/30' : 'bg-slate-900/50 border border-slate-700/50'}`}>
        <span className="text-white font-bold text-[10px] sm:text-xs truncate max-w-[70%] tracking-wide">{card.name}</span>
        <span className={`${isBot ? 'text-red-400' : 'text-cyan-400'} font-black text-[10px]`}>{card.pos}</span>
      </div>

      <div className={`relative z-10 flex-1 my-2.5 rounded-lg flex items-center justify-center overflow-hidden ${isBot ? 'bg-red-900/20' : 'bg-slate-800/30'}`}>
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/50 to-transparent"></div>
        <span className="text-4xl sm:text-5xl drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] relative z-20">⚽</span>
      </div>

      <div className={`relative z-10 flex justify-between w-full font-black text-sm sm:text-lg p-1.5 rounded-lg backdrop-blur-sm ${isBot ? 'bg-red-950/50 border border-red-900/30' : 'bg-slate-900/60 border border-slate-700/40'}`}>
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