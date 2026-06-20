import { create } from 'zustand';
import type { CardData } from '../gameData';
import { MOCK_DECK } from '../gameData';

const HAND_SIZE = 4;

export interface GameState {
  difficulty: string;
  introState: 'vs' | 'coin_spin' | 'coin_result' | 'none'; // AÑADIDO: Fases separadas
  hasPossession: 'player' | 'bot';
  currentTurn: 'player' | 'bot' | null;
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
  status: 'playing' | 'bot_thinking' | 'revealing' | 'resolving' | 'gameover';
  message: string;
  initGame: (diff: string) => void;
  playCard: (card: CardData) => void;
  triggerBotPlay: () => void;
  advanceIntro: () => void;
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

const createMatchDeck = (cards: CardData[], prefix: 'player' | 'bot') =>
  cards.map((card, index) => ({ ...card, id: `${prefix}-${card.id}-${index}`, owner: prefix as 'player' | 'bot' }));

export const useGameStore = create<GameState>((set, get) => ({
  difficulty: 'Normal',
  introState: 'vs',
  hasPossession: 'player',
  currentTurn: 'player',
  playerHand: [], playerDeck: [], playerDiscard: [],
  botHand: [], botDeck: [], botDiscard: [],
  playerBoardCard: null, botBoardCard: null,
  playerScore: 0, botScore: 0,
  status: 'playing', message: 'Calculando inicio...',

  initGame: (diff) => {
    const shuffle = (array: CardData[]) => [...array].sort(() => Math.random() - 0.5);
    const allShuffled = shuffle([...MOCK_DECK]);
    const shuffledPlayerCards = createMatchDeck(allShuffled.slice(0, 11), 'player');
    const shuffledBotCards = createMatchDeck(allShuffled.slice(11, 22), 'bot');

    set({
      difficulty: diff,
      introState: 'vs',
      hasPossession: 'player',
      currentTurn: 'player',
      playerHand: shuffledPlayerCards.slice(0, HAND_SIZE),
      playerDeck: shuffledPlayerCards.slice(HAND_SIZE, 11),
      playerDiscard: [],
      botHand: shuffledBotCards.slice(0, HAND_SIZE),
      botDeck: shuffledBotCards.slice(HAND_SIZE, 11),
      botDiscard: [],
      playerBoardCard: null, botBoardCard: null,
      playerScore: 0, botScore: 0,
      status: 'playing', message: '',
    });
  },

  advanceIntro: () => {
    const { introState } = get();
    if (introState === 'vs') {
      // 1. Pasa a moneda girando
      set({ introState: 'coin_spin' });

      setTimeout(() => {
        const winner = Math.random() > 0.5 ? 'player' : 'bot';

        // 2. Muestra el resultado por 3 segundos
        set({ introState: 'coin_result', hasPossession: winner });

        setTimeout(() => {
          // 3. Empieza el juego y libera el tablero
          set({
            introState: 'none',
            currentTurn: winner,
            status: 'playing',
            message: winner === 'player' ? '¡Ganas el volado! Tu atacas' : 'El Bot gana el volado. ¡Defiende!'
          });

          if (winner === 'bot') {
            get().triggerBotPlay();
          }
        }, 3000);
      }, 2000); // Gira por 2 segundos
    }
  },

  triggerBotPlay: () => {
    const { botHand, difficulty, playerBoardCard, hasPossession } = get();

    set({ status: 'bot_thinking', message: 'El Rival está pensando...' });

    setTimeout(() => {
      let botCard: CardData;
      const isBotAttacking = hasPossession === 'bot';

      if (difficulty === 'Fácil') {
        botCard = botHand[Math.floor(Math.random() * botHand.length)];
      } else {
        if (isBotAttacking) {
           botCard = [...botHand].sort((a, b) => b.atk - a.atk)[0];
        } else {
           const pCard = playerBoardCard!;
           const winningDefenders = botHand.filter(c => c.def > pCard.atk).sort((a,b) => a.def - b.def);
           if (winningDefenders.length > 0) {
              botCard = winningDefenders[0];
           } else {
              botCard = [...botHand].sort((a, b) => a.def - b.def)[0];
           }
        }
      }

      if (!botCard) {
        set({ status: 'gameover', message: 'FIN DEL PARTIDO' });
        return;
      }

      set((state) => ({
        botBoardCard: botCard,
        botHand: state.botHand.filter((c) => c.id !== botCard.id),
        status: state.playerBoardCard ? 'revealing' : 'playing',
        currentTurn: state.playerBoardCard ? null : 'player',
        message: state.playerBoardCard ? '¡TENSIÓN EN LA CANCHA!' : 'Tu turno',
      }));

      if (get().playerBoardCard) {
         setTimeout(() => {
            set({ status: 'resolving', message: 'Calculando...' });

            setTimeout(() => {
              const pCard = get().playerBoardCard!;
              const bCard = get().botBoardCard!;
              const pPossession = get().hasPossession === 'player';

              const pScoreVal = pPossession ? pCard.atk : pCard.def;
              const bScoreVal = pPossession ? bCard.def : bCard.atk;

              let winnerMsg = '';
              let newPossession: 'player' | 'bot' = get().hasPossession;

              if (pScoreVal > bScoreVal) {
                winnerMsg = pPossession ? '¡Golazo! Retienes el balón' : '¡Robo! Tu atacas';
                newPossession = 'player';
                set((state) => ({ playerScore: state.playerScore + 1 }));
              } else if (bScoreVal > pScoreVal) {
                winnerMsg = pPossession ? 'Te robaron el balón' : 'Gol del Bot.';
                newPossession = 'bot';
                set((state) => ({ botScore: state.botScore + 1 }));
              } else {
                winnerMsg = '¡Empate! Balón dividido';
                newPossession = pPossession ? 'bot' : 'player';
              }

              set({ message: winnerMsg, hasPossession: newPossession });

              setTimeout(() => {
                set((state) => ({
                  playerDiscard: [...state.playerDiscard, pCard],
                  botDiscard: [...state.botDiscard, bCard],
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
                      playerHand: playerRefill.hand,
                      playerDeck: playerRefill.deck,
                      botHand: botRefill.hand,
                      botDeck: botRefill.deck,
                      status: 'playing',
                      currentTurn: state.hasPossession,
                      message: state.hasPossession === 'player' ? '¡Atacas tú!' : '¡Defiende!'
                    });
                    if (state.hasPossession === 'bot') get().triggerBotPlay();
                  }
                }, 600);
              }, 1800);
            }, 400);
         }, 1000);
      }
    }, 800);
  },

  playCard: (playerCard) => {
    const { status, playerHand, playerBoardCard, botBoardCard, currentTurn, introState } = get();
    const cardInHand = playerHand.find((card) => card.id === playerCard.id);

    // SEGURIDAD: Solo puedes tirar si es tu turno y no hay intro
    if (status !== 'playing' || introState !== 'none' || currentTurn !== 'player' || playerBoardCard || !cardInHand) return;

    set((state) => ({
      playerBoardCard: cardInHand,
      playerHand: state.playerHand.filter((c) => c.id !== cardInHand.id),
      status: botBoardCard ? 'revealing' : 'bot_thinking',
      currentTurn: botBoardCard ? null : 'bot',
      message: botBoardCard ? '¡TENSIÓN EN LA CANCHA!' : 'El Rival está pensando...',
    }));

    if (!botBoardCard) {
      get().triggerBotPlay();
    } else {
       setTimeout(() => {
            set({ status: 'resolving', message: 'Calculando...' });

            setTimeout(() => {
              const pCard = get().playerBoardCard!;
              const bCard = get().botBoardCard!;
              const pPossession = get().hasPossession === 'player';

              const pScoreVal = pPossession ? pCard.atk : pCard.def;
              const bScoreVal = pPossession ? bCard.def : bCard.atk;

              let winnerMsg = '';
              let newPossession: 'player' | 'bot' = get().hasPossession;

              if (pScoreVal > bScoreVal) {
                winnerMsg = pPossession ? '¡Golazo! Retienes el balón' : '¡Robo! Tu atacas';
                newPossession = 'player';
                set((state) => ({ playerScore: state.playerScore + 1 }));
              } else if (bScoreVal > pScoreVal) {
                winnerMsg = pPossession ? 'Te robaron el balón' : 'Gol del Bot.';
                newPossession = 'bot';
                set((state) => ({ botScore: state.botScore + 1 }));
              } else {
                winnerMsg = '¡Empate! Balón dividido';
                newPossession = pPossession ? 'bot' : 'player';
              }

              set({ message: winnerMsg, hasPossession: newPossession });

              setTimeout(() => {
                set((state) => ({
                  playerDiscard: [...state.playerDiscard, pCard],
                  botDiscard: [...state.botDiscard, bCard],
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
                      playerHand: playerRefill.hand,
                      playerDeck: playerRefill.deck,
                      botHand: botRefill.hand,
                      botDeck: botRefill.deck,
                      status: 'playing',
                      currentTurn: state.hasPossession,
                      message: state.hasPossession === 'player' ? '¡Atacas tú!' : '¡Defiende!'
                    });
                    if (state.hasPossession === 'bot') get().triggerBotPlay();
                  }
                }, 600);
              }, 1800);
            }, 400);
         }, 1000);
    }
  },
}));
