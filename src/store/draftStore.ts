import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CardData } from '../gameData';
import { MOCK_DECK } from '../gameData';

interface DraftState {
  collection: CardData[];
  startingXI: CardData[];
  moveCard: (cardId: string, destination: 'collection' | 'startingXI') => void;
  autoFill: () => void;
}

export const useDraftStore = create<DraftState>()(
  persist(
    (set) => ({
      collection: MOCK_DECK.filter((c) => c.owner === 'player'),
      startingXI: [],

      moveCard: (cardId, destination) =>
        set((state) => {
          const cardInCollection = state.collection.find((c) => c.id === cardId);
          const cardInXI = state.startingXI.find((c) => c.id === cardId);
          const cardToMove = cardInCollection || cardInXI;

          if (!cardToMove) return state;
          if (destination === 'startingXI' && cardInXI) return state;
          if (destination === 'collection' && cardInCollection) return state;

          if (destination === 'startingXI' && state.startingXI.length >= 11) {
            alert('¡Tu 11 titular ya está completo!');
            return state;
          }

          const cleanCollection = state.collection.filter((c) => c.id !== cardId);
          const cleanXI = state.startingXI.filter((c) => c.id !== cardId);

          if (destination === 'startingXI') {
            return { collection: cleanCollection, startingXI: [...cleanXI, cardToMove] };
          } else {
            return { collection: [...cleanCollection, cardToMove], startingXI: cleanXI };
          }
        }),

      autoFill: () =>
        set((state) => {
          if (state.startingXI.length >= 11) return state;
          
          const slotsToFill = 11 - state.startingXI.length;
          // Ordenar colección por Ataque (mayor a menor)
          const sortedCollection = [...state.collection].sort((a, b) => b.atk - a.atk);
          const bestCards = sortedCollection.slice(0, slotsToFill);
          const idsToAdd = bestCards.map(c => c.id);

          const newCollection = state.collection.filter(c => !idsToAdd.includes(c.id));
          const newStartingXI = [...state.startingXI, ...bestCards];

          return { collection: newCollection, startingXI: newStartingXI };
        }),
    }),
    {
      name: 'futarena-draft-storage',
    }
  )
);