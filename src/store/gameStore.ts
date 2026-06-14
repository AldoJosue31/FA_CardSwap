import { create } from 'zustand';
import type { CardData } from '../gameData';
import { MOCK_DECK } from '../gameData';

const HAND_SIZE = 4;

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

const refillHand = (hand: CardData[], deck: CardData[]) => {
  const nextHand = [...hand];
  const nextDeck = [...deck];

  while (nextHand.length < HAND_SIZE && nextDeck.length > 0) {
    const drawnCard = nextDeck.shift();
    if (drawnCard) nextHand.push(drawnCard);
  }

  return { hand: nextHand, deck: nextDeck };
};

const createMatchDeck = (cards: CardData[], prefix: string) =>
  cards.map((card, index) => ({
    ...card,
    id: `${prefix}-${card.id}-${index}`,
  }));

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
    const shuffledPlayerCards = createMatchDeck(shuffle([...MOCK_DECK]).slice(0, 11), 'player');
    const shuffledBotCards = createMatchDeck(shuffle([...MOCK_DECK]).slice(0, 11), 'bot');

    set({
      difficulty: diff,
      playerHand: shuffledPlayerCards.slice(0, HAND_SIZE),
      playerDeck: shuffledPlayerCards.slice(HAND_SIZE, 11),
      playerDiscard: [],
      botHand: shuffledBotCards.slice(0, HAND_SIZE),
      botDeck: shuffledBotCards.slice(HAND_SIZE, 11),
      botDiscard: [],
      playerBoardCard: null, botBoardCard: null,
      playerScore: 0, botScore: 0,
      status: 'playing', message: `¡Partido iniciado! (${diff})`,
    });
  },

  playCard: (playerCard) => {
    const { botHand, status, difficulty, playerHand, playerBoardCard } = get();
    const cardInHand = playerHand.find((card) => card.id === playerCard.id);
    if (status !== 'playing' || playerBoardCard || !cardInHand) return;

    set((state) => ({
      playerBoardCard: cardInHand,
      playerHand: state.playerHand.filter((c) => c.id !== cardInHand.id),
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
          const winningCards = botHand.filter(c => c.atk > cardInHand.atk);
          botCard = winningCards.length > 0 ? winningCards[0] : botHand[Math.floor(Math.random() * botHand.length)];
        } else {
          botCard = botHand[Math.floor(Math.random() * botHand.length)];
        }
      } else {
        const winningCards = botHand.filter(c => c.atk > cardInHand.atk).sort((a, b) => a.atk - b.atk);
        if (winningCards.length > 0) {
          botCard = winningCards[0];
        } else {
          botCard = [...botHand].sort((a, b) => a.atk - b.atk)[0];
        }
      }

      if (!botCard) {
        set({ status: 'gameover', message: 'FIN DEL PARTIDO' });
        return;
      }

      set((state) => ({
        botBoardCard: botCard,
        botHand: state.botHand.filter((c) => c.id !== botCard.id),
      }));

      setTimeout(() => {
        let winnerMsg = '';
        if (cardInHand.atk > botCard.atk) {
          winnerMsg = '¡Ganaste el duelo!';
          set((state) => ({ playerScore: state.playerScore + 1 }));
        } else if (botCard.atk > cardInHand.atk) {
          winnerMsg = 'El Bot gana el duelo.';
          set((state) => ({ botScore: state.botScore + 1 }));
        } else {
          winnerMsg = '¡Empate!';
        }
        set({ message: winnerMsg });

        setTimeout(() => {
          set((state) => ({
            playerDiscard: [...state.playerDiscard, cardInHand],
            botDiscard: [...state.botDiscard, botCard],
            playerBoardCard: null, botBoardCard: null,
            message: 'Robando cartas...',
          }));

          setTimeout(() => {
            const state = get();
            const playerRefill = refillHand(state.playerHand, state.playerDeck);
            const botRefill = refillHand(state.botHand, state.botDeck);

            if (playerRefill.hand.length === 0 && playerRefill.deck.length === 0) {
              set({ status: 'gameover', message: 'FIN DEL PARTIDO' });
            } else {
              set({ 
                status: 'playing', message: '¡Tu turno!',
                playerHand: playerRefill.hand, playerDeck: playerRefill.deck,
                botHand: botRefill.hand, botDeck: botRefill.deck
              });
            }
          }, 600);
        }, 1500);
      }, 800);
    }, 600);
  },
}));
