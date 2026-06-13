import { create } from 'zustand';
import type { CardData } from '../gameData';
import { MOCK_DECK } from '../gameData';

interface GameState {
  playerHand: CardData[];
  playerDeck: CardData[];
  botHand: CardData[];
  botDeck: CardData[];
  playerBoardCard: CardData | null;
  botBoardCard: CardData | null;
  playerScore: number;
  botScore: number;
  status: 'playing' | 'resolving' | 'gameover';
  message: string;
  initGame: (customPlayerHand: CardData[]) => void;
  playCard: (card: CardData) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  playerHand: [],
  playerDeck: [],
  botHand: [],
  botDeck: [],
  playerBoardCard: null,
  botBoardCard: null,
  playerScore: 0,
  botScore: 0,
  status: 'playing',
  message: '¡Tu turno!',

  initGame: (customPlayerHand) => {
    // Función para barajar las cartas al azar
    const shuffle = (array: CardData[]) => [...array].sort(() => Math.random() - 0.5);

    const shuffledPlayerCards = shuffle(customPlayerHand);
    const botCards = MOCK_DECK.filter((c) => c.owner === 'bot');
    const shuffledBotCards = shuffle(botCards.slice(0, 11)); // Asegurar que el bot solo use 11

    set({
      // Repartimos 4 a la mano y dejamos 7 en el mazo
      playerHand: shuffledPlayerCards.slice(0, 4),
      playerDeck: shuffledPlayerCards.slice(4, 11),
      botHand: shuffledBotCards.slice(0, 4),
      botDeck: shuffledBotCards.slice(4, 11),
      playerBoardCard: null,
      botBoardCard: null,
      playerScore: 0,
      botScore: 0,
      status: 'playing',
      message: '¡Partido iniciado! Juega tu carta.',
    });
  },

  playCard: (playerCard) => {
    const { botHand, status } = get();
    if (status !== 'playing') return;

    set((state) => ({
      playerBoardCard: playerCard,
      playerHand: state.playerHand.filter((c) => c.id !== playerCard.id),
      status: 'resolving',
      message: 'El Bot está pensando...',
    }));

    setTimeout(() => {
      const randomBotIndex = Math.floor(Math.random() * botHand.length);
      const botCard = botHand[randomBotIndex];

      set((state) => ({
        botBoardCard: botCard,
        botHand: state.botHand.filter((c) => c.id !== botCard.id),
      }));

      setTimeout(() => {
        let winnerMsg = '';
        if (playerCard.atk > botCard.atk) {
          winnerMsg = '¡Ganaste el duelo!';
          set((state) => ({ playerScore: state.playerScore + 1 }));
        } else if (botCard.atk > playerCard.atk) {
          winnerMsg = 'El Bot gana el duelo.';
          set((state) => ({ botScore: state.botScore + 1 }));
        } else {
          winnerMsg = '¡Empate!';
        }

        set({ message: winnerMsg });

        setTimeout(() => {
          const state = get();
          let newPlayerHand = [...state.playerHand];
          let newPlayerDeck = [...state.playerDeck];
          let newBotHand = [...state.botHand];
          let newBotDeck = [...state.botDeck];

          // Robar carta (Jugador)
          if (newPlayerDeck.length > 0) {
            newPlayerHand.push(newPlayerDeck[0]);
            newPlayerDeck.shift(); // Quitar la primera carta del mazo
          }

          // Robar carta (Bot)
          if (newBotDeck.length > 0) {
            newBotHand.push(newBotDeck[0]);
            newBotDeck.shift();
          }

          if (newPlayerHand.length === 0) {
            const finalP = get().playerScore;
            const finalB = get().botScore;
            const finalMsg = finalP > finalB ? '¡VICTORIA!' : finalB > finalP ? 'DERROTA' : 'EMPATE TÉCNICO';
            set({ status: 'gameover', message: finalMsg, playerBoardCard: null, botBoardCard: null });
          } else {
            set({ 
              status: 'playing', 
              message: '¡Tu turno!', 
              playerBoardCard: null, 
              botBoardCard: null,
              playerHand: newPlayerHand,
              playerDeck: newPlayerDeck,
              botHand: newBotHand,
              botDeck: newBotDeck
            });
          }
        }, 1500);
      }, 1000);
    }, 800);
  },
}));