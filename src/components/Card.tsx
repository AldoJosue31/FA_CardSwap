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
      whileHover={!disabled && !isBot ? { scale: 1.05, translateY: -10 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`w-32 h-48 sm:w-40 sm:h-56 rounded-xl border-2 flex flex-col justify-between p-2 shadow-lg select-none 
        ${isBot ? 'bg-gradient-to-b from-red-800 to-red-950 border-red-500' : 'bg-gradient-to-b from-slate-700 to-slate-800 border-cyan-500 cursor-pointer'} 
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <div className={`w-full text-center rounded py-1 px-1 flex justify-between items-center shadow-inner ${isBot ? 'bg-red-950' : 'bg-slate-900'}`}>
        <span className="text-white font-bold text-[10px] sm:text-xs truncate max-w-[60%]">{card.name}</span>
        <span className={`${isBot ? 'text-red-400' : 'text-cyan-400'} font-black text-[10px]`}>{card.pos}</span>
      </div>

      <div className={`flex-1 my-2 rounded flex items-center justify-center border overflow-hidden ${isBot ? 'bg-red-900 border-red-700' : 'bg-slate-600 border-slate-500'}`}>
        <span className="text-3xl">⚽</span>
      </div>

      <div className={`flex justify-between w-full font-black text-sm sm:text-base p-1 rounded ${isBot ? 'bg-red-950/50' : 'bg-slate-900/50'}`}>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400">ATK</span>
          <span className="text-red-500">{card.atk}</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-[10px] text-slate-400">DEF</span>
          <span className="text-blue-500">{card.def}</span>
        </div>
      </div>
    </motion.div>
  );
}
