import { create } from 'zustand';
import type { CardData } from '../gameData';
import { MOCK_DECK } from '../gameData';

interface GameState {
  difficulty: string;
  playerHand: CardData[];
  playerDeck: CardData[];
  playerDiscard: CardData[];
  botHand: CardData[];
  botDeck: CardData[];
  botDiscard: CardData[];
  playerBoardCard: CardData | null;
  botBoardCard: CardData | null;
  playerScore: number;
  botScore: number;
  status: 'playing' | 'resolving' | 'gameover';
  message: string;
  initGame: (diff: string) => void;
  playCard: (card: CardData) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  difficulty: 'Normal',
  playerHand: [], playerDeck: [], playerDiscard: [],
  botHand: [], botDeck: [], botDiscard: [],
  playerBoardCard: null, botBoardCard: null,
  playerScore: 0, botScore: 0,
  status: 'playing', message: '¡Tu turno!',

  initGame: (diff) => {
    const shuffle = (array: CardData[]) => [...array].sort(() => Math.random() - 0.5);
    
    // Repartimos 11 cartas aleatorias de todo el mazo para cada jugador
    const allCards = shuffle([...MOCK_DECK]);
    const shuffledPlayerCards = allCards.slice(0, 11);
    const shuffledBotCards = shuffle([...MOCK_DECK]).slice(0, 11);

    set({
      difficulty: diff,
      playerHand: shuffledPlayerCards.slice(0, 4),
      playerDeck: shuffledPlayerCards.slice(4, 11),
      playerDiscard: [],
      botHand: shuffledBotCards.slice(0, 4),
      botDeck: shuffledBotCards.slice(4, 11),
      botDiscard: [],
      playerBoardCard: null, botBoardCard: null,
      playerScore: 0, botScore: 0,
      status: 'playing', message: `¡Partido iniciado! (${diff})`,
    });
  },

  playCard: (playerCard) => {
    const { botHand, status, difficulty } = get();
    if (status !== 'playing') return;

    set((state) => ({
      playerBoardCard: playerCard,
      playerHand: state.playerHand.filter((c) => c.id !== playerCard.id),
      status: 'resolving',
      message: 'El Bot está pensando...',
    }));

    setTimeout(() => {
      let botCard: CardData;

      // Inteligencia Artificial del CPU
      if (difficulty === 'Fácil') {
        botCard = botHand[Math.floor(Math.random() * botHand.length)];
      } else if (difficulty === 'Normal') {
        if (Math.random() > 0.5) {
          const winningCards = botHand.filter(c => c.atk > playerCard.atk);
          botCard = winningCards.length > 0 ? winningCards[0] : botHand[Math.floor(Math.random() * botHand.length)];
        } else {
          botCard = botHand[Math.floor(Math.random() * botHand.length)];
        }
      } else {
        const winningCards = botHand.filter(c => c.atk > playerCard.atk).sort((a, b) => a.atk - b.atk);
        if (winningCards.length > 0) {
          botCard = winningCards[0];
        } else {
          botCard = [...botHand].sort((a, b) => a.atk - b.atk)[0];
        }
      }

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
          set((state) => ({
            playerDiscard: [...state.playerDiscard, playerCard],
            botDiscard: [...state.botDiscard, botCard],
            playerBoardCard: null, botBoardCard: null,
            message: 'Robando cartas...',
          }));

          setTimeout(() => {
            const state = get();
            let newPlayerHand = [...state.playerHand];
            let newPlayerDeck = [...state.playerDeck];
            let newBotHand = [...state.botHand];
            let newBotDeck = [...state.botDeck];

            if (newPlayerDeck.length > 0) {
              newPlayerHand.push(newPlayerDeck[0]);
              newPlayerDeck.shift();
            }
            if (newBotDeck.length > 0) {
              newBotHand.push(newBotDeck[0]);
              newBotDeck.shift();
            }

            if (newPlayerHand.length === 0 && newPlayerDeck.length === 0) {
              set({ status: 'gameover', message: 'FIN DEL PARTIDO' });
            } else {
              set({ 
                status: 'playing', message: '¡Tu turno!',
                playerHand: newPlayerHand, playerDeck: newPlayerDeck,
                botHand: newBotHand, botDeck: newBotDeck
              });
            }
          }, 600);
        }, 1500);
      }, 800);
    }, 600);
  },
}));