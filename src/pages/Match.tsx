import { useEffect } from 'react';
import Card from '../components/Card';
import { useDraftStore } from '../store/draftStore';
import { useGameStore } from '../store/gameStore';

export default function Match() {
  const { startingXI } = useDraftStore();
  const { playerHand, botHand, playerBoardCard, botBoardCard, playerScore, botScore, status, message, initGame, playCard } = useGameStore();

  useEffect(() => {
    initGame(startingXI);
  }, [initGame, startingXI]);

  return (
    <div className="min-h-screen bg-green-900 flex flex-col font-sans relative overflow-hidden text-white">
      {/* Fondo estilo cancha */}
      <div className="absolute inset-0 border-[16px] border-green-800 opacity-30 pointer-events-none"></div>
      <div className="absolute top-1/2 left-0 right-0 h-1 bg-white/20 -translate-y-1/2 pointer-events-none"></div>
      <div className="absolute top-1/2 left-1/2 w-32 h-32 border-4 border-white/20 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

      {/* Marcador Superior */}
      <header className="bg-black/50 p-4 text-center z-10 flex justify-between items-center px-10">
        <div className="text-2xl font-black text-cyan-400">TU: {playerScore}</div>
        <div className="text-xl font-bold">{message}</div>
        <div className="text-2xl font-black text-red-500">BOT: {botScore}</div>
      </header>

      {/* Zona del Bot (Arriba) */}
      <div className="flex justify-center gap-2 p-4 overflow-x-auto z-10 opacity-70 scale-90 -mt-4">
        {botHand.map((card) => (
          <div key={card.id} className="w-20 h-28 bg-red-950 border-2 border-red-800 rounded-lg flex items-center justify-center">
            <span className="text-xs text-red-800">?</span>
          </div>
        ))}
      </div>

      {/* El Tablero / Arena de Batalla (Centro) */}
      <div className="flex-1 flex items-center justify-center gap-8 z-10">
        <div className="w-40 h-56 border-2 border-dashed border-cyan-500/50 rounded-xl flex items-center justify-center bg-cyan-900/20">
          {playerBoardCard && <Card card={playerBoardCard} disabled />}
        </div>
        <div className="text-4xl font-black text-white/30">VS</div>
        <div className="w-40 h-56 border-2 border-dashed border-red-500/50 rounded-xl flex items-center justify-center bg-red-900/20">
          {botBoardCard && <Card card={botBoardCard} disabled />}
        </div>
      </div>

      {/* Zona del Jugador (Abajo) */}
      <div className="flex justify-center gap-2 p-4 overflow-x-auto z-10 pb-8">
        {playerHand.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={() => playCard(card)}
            disabled={status !== 'playing'}
          />
        ))}
      </div>

      {/* Pantalla de Fin de Juego */}
      {status === 'gameover' && (
        <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50">
          <h1 className="text-6xl font-black mb-4">{message}</h1>
          <h2 className="text-3xl mb-8">TU {playerScore} - {botScore} BOT</h2>
          <button
            onClick={() => initGame(startingXI)}
            className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-xl font-bold transition-colors"
          >
            Jugar de nuevo
          </button>
        </div>
      )}
    </div>
  );
}
