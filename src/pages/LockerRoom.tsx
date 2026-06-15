import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraftStore } from '../store/draftStore';
import Card from '../components/Card';

export default function LockerRoom() {
  const { collection, startingXI, moveCard, autoFill } = useDraftStore();
  const navigate = useNavigate();

  const handleDragStart = (e: React.DragEvent, cardId: string) => {
    e.dataTransfer.setData('cardId', cardId);
  };

  const handleDrop = (e: React.DragEvent, destination: 'collection' | 'startingXI') => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    moveCard(cardId, destination);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necesario para permitir el "Drop"
  };

return (
    <div className="min-h-screen bg-slate-900 text-white p-8 flex flex-col">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-black text-cyan-400">VESTUARIO TÁCTICO</h1>
        
        <div className="flex gap-4">
          <button 
            onClick={autoFill}
            disabled={startingXI.length >= 11}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-500 disabled:bg-slate-600 rounded-lg font-bold transition-colors"
          >
            Autocompletar
          </button>
          <button 
            onClick={() => navigate('/match')}
            disabled={startingXI.length !== 11}
            className="px-6 py-2 bg-cyan-600 disabled:bg-slate-600 rounded-lg font-bold transition-colors"
          >
            {startingXI.length === 11 ? 'ENTRAR A LA CANCHA' : `Faltan ${11 - startingXI.length}`}
          </button>
        </div>
      </header>

      {/* Zona: 11 Titular */}
      <div 
        className="flex-1 bg-green-900/30 border-2 border-dashed border-green-500 rounded-xl p-4 mb-8"
        onDrop={(e) => handleDrop(e, 'startingXI')}
        onDragOver={handleDragOver}
      >
        <h2 className="text-xl font-bold mb-4 text-green-400">Tu 11 Titular ({startingXI.length}/11)</h2>
        <div className="flex flex-wrap gap-4">
          {startingXI.map(card => (
            <Card key={card.id} card={card} draggable onDragStart={(e) => handleDragStart(e, card.id)} />
          ))}
        </div>
      </div>

      {/* Zona: Colección / Suplentes */}
      <div 
        className="flex-1 bg-slate-800/50 border-2 border-dashed border-slate-500 rounded-xl p-4"
        onDrop={(e) => handleDrop(e, 'collection')}
        onDragOver={handleDragOver}
      >
        <h2 className="text-xl font-bold mb-4 text-slate-400">Tu Colección (Arrastra hacia arriba)</h2>
        <div className="flex flex-wrap gap-4">
          {collection.map(card => (
            <Card key={card.id} card={card} draggable onDragStart={(e) => handleDragStart(e, card.id)} />
          ))}
        </div>
      </div>
    </div>
  );
}