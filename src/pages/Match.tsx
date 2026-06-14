import { useEffect } from 'react';
import { motion } from 'framer-motion'; // <-- Importación añadida
import Card from '../components/Card';
import { useDraftStore } from '../store/draftStore';
import { useGameStore } from '../store/gameStore';

export default function Match() {
  const { startingXI } = useDraftStore();
  const { playerHand, playerDeck, botHand, botDeck, playerBoardCard, botBoardCard, playerScore, botScore, status, message, initGame, playCard } = useGameStore();

  useEffect(() => {
    initGame(startingXI);
  }, [initGame, startingXI]);

  return (
    <div className="h-screen w-full bg-[#143d22] flex flex-col justify-between font-sans relative overflow-hidden text-white selection:bg-cyan-500/30">
      
      {/* 1. Fondos y Texturas */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 40px, transparent 40px, transparent 80px), radial-gradient(circle at center, #26733a 0%, #143d22 100%)` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.35] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, #3f2a14 0%, transparent 15%), radial-gradient(circle at 80% 70%, #3f2a14 0%, transparent 20%)`, filter: 'blur(30px)' }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.7)] pointer-events-none z-0"></div>

      {/* 2. Dibujo de la Cancha */}
      <div className="absolute inset-x-3 inset-y-4 md:inset-x-8 md:inset-y-6 border-[2px] border-white/20 rounded-lg pointer-events-none flex flex-col items-center z-0 overflow-hidden shadow-[0_0_10px_rgba(255,255,255,0.1)]">
        <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-white/20 -translate-y-1/2"></div>
        <div className="absolute top-1/2 left-1/2 w-28 h-28 md:w-40 md:h-40 border-[2px] border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 backdrop-blur-[1px]"></div>
        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-white/40 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute top-0 w-[55%] max-w-[350px] h-[15%] min-h-[70px] border-x-[2px] border-b-[2px] border-white/20 rounded-b-sm backdrop-blur-[1px]"></div>
        <div className="absolute top-0 w-[20%] max-w-[120px] h-[6%] min-h-[30px] border-x-[2px] border-b-[2px] border-white/20 rounded-b-sm"></div>
        <div className="absolute top-[15%] w-[18%] max-w-[100px] h-[5%] min-h-[25px] border-b-[2px] border-x-[2px] border-transparent !border-b-white/20 rounded-b-full"></div>
        <div className="absolute bottom-0 w-[55%] max-w-[350px] h-[15%] min-h-[70px] border-x-[2px] border-t-[2px] border-white/20 rounded-t-sm backdrop-blur-[1px]"></div>
        <div className="absolute bottom-0 w-[20%] max-w-[120px] h-[6%] min-h-[30px] border-x-[2px] border-t-[2px] border-white/20 rounded-t-sm"></div>
        <div className="absolute bottom-[15%] w-[18%] max-w-[100px] h-[5%] min-h-[25px] border-t-[2px] border-x-[2px] border-transparent !border-t-white/20 rounded-t-full"></div>
      </div>

      {/* MAZOS */}
      <div className="absolute right-6 md:right-16 bottom-[calc(50%+0.5rem)] w-16 h-24 md:w-20 md:h-28 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-red-500/60 font-bold shadow-2xl z-20">
        <span className="text-[8px] md:text-[10px] tracking-widest font-medium opacity-70">MAZO</span>
        <span className="text-xl md:text-3xl font-black drop-shadow-md">{botDeck?.length || 0}</span>
      </div>
      <div className="absolute right-6 md:right-16 top-[calc(50%+0.5rem)] w-16 h-24 md:w-20 md:h-28 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-cyan-500/60 font-bold shadow-2xl z-20">
        <span className="text-[8px] md:text-[10px] tracking-widest font-medium opacity-70">MAZO</span>
        <span className="text-xl md:text-3xl font-black text-white drop-shadow-md">{playerDeck?.length || 0}</span>
      </div>

      {/* Marcador Superior */}
      <header className="relative z-10 flex justify-center pt-4 shrink-0 pointer-events-none">
        <div className="bg-black/60 backdrop-blur-lg border border-white/10 px-6 md:px-10 py-2 md:py-3 rounded-full flex gap-8 md:gap-16 items-center shadow-[0_15px_35px_rgba(0,0,0,0.5)] pointer-events-auto">
          <div className="text-xl md:text-3xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.3)] tracking-tighter">TÚ: {playerScore}</div>
          <div className="text-[10px] md:text-xs font-medium tracking-[0.2em] md:tracking-[0.3em] text-slate-300 uppercase whitespace-nowrap">{message}</div>
          <div className="text-xl md:text-3xl font-black text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.3)] tracking-tighter">BOT: {botScore}</div>
        </div>
      </header>

      {/* Zona del Bot (Convertidas a motion.div para que vuelen también) */}
      <div className="flex justify-center items-start mt-2 md:mt-4 z-10 opacity-90 origin-top shrink-0">
        <div className="flex justify-center gap-2 md:gap-3.5 overflow-x-auto px-4 md:px-10 pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {botHand.map((card) => (
            <motion.div 
              key={card.id} 
              layoutId={`card-${card.id}`}
              className="w-16 h-24 md:w-20 md:h-28 bg-black/80 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group"
            >
               <div className="absolute inset-0 bg-gradient-to-br from-red-950/30 to-black opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-2xl md:text-3xl opacity-20 group-hover:opacity-30 transition-opacity">⚽</span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Arena de Batalla (Se agregó isBoardCard) */}
      <div className="flex-1 min-h-0 flex items-center justify-center gap-6 md:gap-16 z-10 perspective-1000 my-2">
        <div className="relative w-28 h-40 md:w-40 md:h-56 flex items-center justify-center transform-gpu">
          {!playerBoardCard && (
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-cyan-500/30 bg-black/50 backdrop-blur-md shadow-[inset_0_0_40px_rgba(0,0,0,0.4),0_25px_50px_rgba(0,0,0,0.6)]"></div>
          )}
          {playerBoardCard && <Card card={playerBoardCard} disabled isBoardCard />}
        </div>
        
        <div className="flex flex-col items-center justify-center pointer-events-none">
           <div className="text-3xl md:text-6xl font-black italic text-white/20 tracking-tighter drop-shadow-2xl">VS</div>
        </div>

        <div className="relative w-28 h-40 md:w-40 md:h-56 flex items-center justify-center transform-gpu">
          {!botBoardCard && (
            <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-red-500/30 bg-black/50 backdrop-blur-md shadow-[inset_0_0_40px_rgba(0,0,0,0.4),0_25px_50px_rgba(0,0,0,0.6)]"></div>
          )}
          {botBoardCard && <Card card={botBoardCard} disabled isBoardCard />}
        </div>
      </div>

      {/* Zona del Jugador */}
      <div className="flex justify-center items-end pb-4 md:pb-6 z-10 relative shrink-0 origin-bottom">
        <div className="flex justify-center gap-2 md:gap-5 overflow-x-auto px-4 md:px-10 pt-10 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {playerHand.map((card) => (
            <Card 
              key={card.id} 
              card={card} 
              onClick={() => playCard(card)} 
              disabled={status !== 'playing'}
            />
          ))}
        </div>
      </div>

      {/* Pantalla de Fin de Juego */}
      {status === 'gameover' && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50">
          <h1 className={`text-5xl md:text-8xl font-black mb-4 uppercase tracking-tighter ${playerScore > botScore ? 'text-cyan-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.6)]' : playerScore < botScore ? 'text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.6)]' : 'text-slate-200'}`}>
            {message}
          </h1>
          
          <div className="flex items-center gap-6 md:gap-12 mb-10 md:mb-16 bg-black/50 p-6 md:p-8 rounded-full border border-white/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
            <div className="text-5xl md:text-7xl font-black text-cyan-400 tracking-tighter">{playerScore}</div>
            <div className="text-2xl md:text-3xl text-slate-600 font-light">VS</div>
            <div className="text-5xl md:text-7xl font-black text-red-500 tracking-tighter">{botScore}</div>
          </div>

          <button 
            onClick={() => initGame(startingXI)}
            className="px-8 md:px-12 py-3 md:py-4 bg-white text-black rounded-full text-lg md:text-xl font-bold transition-all hover:scale-105 hover:bg-slate-200 shadow-[0_15px_40px_rgba(255,255,255,0.3)]"
          >
            VOLVER A JUGAR
          </button>
        </div>
      )}
    </div>
  );
}