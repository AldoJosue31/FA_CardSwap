import { useCallback, useEffect, useRef, useState } from 'react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import type { CardData } from '../gameData';
import { MOCK_DECK } from '../gameData';
import { supabase } from '../supabaseClient';

const HAND_SIZE = 4;
const MATCH_DECK_SIZE = 11;
const READY_BROADCAST_MS = 1000;
const RELIABLE_RESEND_MS = 900;

type OnlineRole = 'host' | 'guest';
type OnlineStatus = 'playing' | 'revealing' | 'resolving' | 'gameover' | 'abandoned';

export type OnlineSession = { roomCode: string; isHost: boolean; username: string };

type OnlinePayload = {
  role: OnlineRole;
  roomCode: string;
  cardId?: string;
  round?: number;
  matchIndex?: number;
  actionId?: string;
  ackId?: string;
  hasOpponentDeck?: boolean;
  username?: string;
};

type PendingPlay = { event: 'play_card'; payload: OnlinePayload; };

type OnlineGameState = {
  role: OnlineRole;
  opponentRole: OnlineRole;
  connected: boolean;
  opponentReady: boolean;
  currentTurn: OnlineRole | null;
  hasPossession: OnlineRole;
  introState: 'vs' | 'coin_spin' | 'coin_result' | 'none'; // AÑADIDO: Fases separadas
  round: number;
  playerHand: CardData[]; playerDeck: CardData[]; playerDiscard: CardData[];
  botHand: CardData[]; botDeck: CardData[]; botDiscard: CardData[];
  playerBoardCard: CardData | null; botBoardCard: CardData | null;
  playerScore: number; botScore: number; rematchIndex: number;
  status: OnlineStatus; message: string;
  playerWantsRematch: boolean; opponentWantsRematch: boolean;
  playerUsername: string; opponentUsername: string;
};

const otherRole = (role: OnlineRole): OnlineRole => (role === 'host' ? 'guest' : 'host');
const createPlayActionId = (role: OnlineRole, round: number, cardId: string, matchIndex: number) => `${matchIndex}:${role}:${round}:${cardId}`;

const hashSeed = (seed: string) => {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) { hash ^= seed.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
};
const seededRandom = (seed: string) => {
  let state = hashSeed(seed);
  return () => {
    state += 0x6d2b79f5; let next = state;
    next = Math.imul(next ^ (next >>> 15), next | 1);
    next ^= next + Math.imul(next ^ (next >>> 7), next | 61);
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
};

const shuffleWithSeed = (array: CardData[], seed: string) => {
  const random = seededRandom(seed);
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const sortCardsForShuffle = (cards: CardData[]) => [...cards].sort((first, second) => first.id.localeCompare(second.id));

const refillHand = (hand: CardData[], deck: CardData[]) => {
  const nextHand = [...hand]; const nextDeck = [...deck];
  while (nextHand.length < HAND_SIZE && nextDeck.length > 0) {
    const drawnCard = nextDeck.shift();
    if (drawnCard) nextHand.push(drawnCard);
  }
  return { hand: nextHand, deck: nextDeck };
};

const turnMessage = (state: Pick<OnlineGameState, 'role' | 'currentTurn' | 'connected' | 'opponentReady' | 'status' | 'hasPossession'>) => {
  if (state.status === 'abandoned') return 'EL RIVAL SE DESCONECTÓ';
  if (!state.connected) return 'Conectando a la sala...';
  if (!state.opponentReady) return 'Esperando al rival...';
  if (state.currentTurn === state.role) return state.hasPossession === state.role ? '¡Atacas tú!' : '¡Defiende!';
  return state.hasPossession === state.role ? 'Rival defendiendo...' : 'Rival atacando...';
};

const createInitialState = (session: OnlineSession): OnlineGameState => {
  const role: OnlineRole = session.isHost ? 'host' : 'guest';
  const opponentRole = otherRole(role);

  const globalShuffled = shuffleWithSeed(MOCK_DECK, session.roomCode);
  const myBaseCards = session.isHost ? globalShuffled.slice(0, MATCH_DECK_SIZE) : globalShuffled.slice(MATCH_DECK_SIZE, MATCH_DECK_SIZE * 2);

  const playerCards = myBaseCards.map((card, index) => ({ ...card, id: `${role}-${card.id}-${index}`, owner: 'player' as 'player' | 'bot' }));

  return {
    role, opponentRole, connected: false, opponentReady: false,
    introState: 'vs', hasPossession: 'host', currentTurn: 'host',
    round: 1, playerHand: playerCards.slice(0, HAND_SIZE), playerDeck: playerCards.slice(HAND_SIZE), playerDiscard: [],
    botHand: [], botDeck: [], botDiscard: [], playerBoardCard: null, botBoardCard: null, playerScore: 0, botScore: 0, rematchIndex: 0,
    status: 'resolving', message: 'Conectando a la sala...', playerWantsRematch: false, opponentWantsRematch: false,
    playerUsername: session.username, opponentUsername: 'RIVAL'
  };
};

const triggerRematch = (state: OnlineGameState, roomCode: string): OnlineGameState => {
  const nextRematchIndex = state.rematchIndex + 1;
  const allPlayer = [...state.playerHand, ...state.playerDeck, ...state.playerDiscard, ...(state.playerBoardCard ? [state.playerBoardCard] : [])];
  const allBot = [...state.botHand, ...state.botDeck, ...state.botDiscard, ...(state.botBoardCard ? [state.botBoardCard] : [])];
  const shuffledPlayer = shuffleWithSeed(sortCardsForShuffle(allPlayer), `${roomCode}:rematch:${nextRematchIndex}:${state.role}`);
  const shuffledBot = shuffleWithSeed(sortCardsForShuffle(allBot), `${roomCode}:rematch:${nextRematchIndex}:${state.opponentRole}`);

  const nextState: OnlineGameState = {
    ...state, round: 1, playerScore: 0, botScore: 0, rematchIndex: nextRematchIndex, introState: 'vs',
    playerHand: shuffledPlayer.slice(0, HAND_SIZE), playerDeck: shuffledPlayer.slice(HAND_SIZE), playerDiscard: [],
    botHand: shuffledBot.slice(0, HAND_SIZE), botDeck: shuffledBot.slice(HAND_SIZE), botDiscard: [],
    playerBoardCard: null, botBoardCard: null, currentTurn: 'host', status: 'playing',
    playerWantsRematch: false, opponentWantsRematch: false, message: '¡NUEVA PARTIDA!'
  };
  return { ...nextState, message: turnMessage(nextState) };
};

const applyPlayedCard = (state: OnlineGameState, playedBy: OnlineRole, cardId: string, round: number): OnlineGameState => {
  if (round !== state.round || state.status === 'gameover' || state.status === 'abandoned') return state;

  const isLocal = playedBy === state.role;
  const boardCard = isLocal ? state.playerBoardCard : state.botBoardCard;
  const sourceHand = isLocal ? state.playerHand : state.botHand;
  const card = sourceHand.find((item) => item.id === cardId);

  if (boardCard || !card) return state;

  const nextState: OnlineGameState = isLocal
    ? { ...state, playerHand: state.playerHand.filter((item) => item.id !== cardId), playerBoardCard: card }
    : { ...state, botHand: state.botHand.filter((item) => item.id !== cardId), botBoardCard: card };

  if (nextState.playerBoardCard && nextState.botBoardCard) {
    return { ...nextState, currentTurn: null, status: 'revealing', message: '¡TENSIÓN EN LA CANCHA!' };
  }

  const nextTurn = otherRole(playedBy);
  return { ...nextState, currentTurn: nextTurn, status: 'playing', message: turnMessage({...nextState, currentTurn: nextTurn}) };
};

const canApplyIncomingPlay = (state: OnlineGameState, play: OnlinePayload) =>
  Boolean(play.cardId && play.round === state.round && (play.matchIndex === undefined || play.matchIndex === state.rematchIndex) && play.role === state.opponentRole && state.opponentReady && !state.botBoardCard && state.botHand.some((item) => item.id === play.cardId) && state.status !== 'gameover' && state.status !== 'abandoned');

export const useOnlineMatch = (session?: OnlineSession | null) => {
  const [state, setState] = useState<OnlineGameState | null>(() => (session ? createInitialState(session) : null));
  const channelRef = useRef<RealtimeChannel | null>(null);
  const stateRef = useRef<OnlineGameState | null>(state);
  const acknowledgedRef = useRef(false);
  const subscribedRef = useRef(false);
  const pendingPlaysRef = useRef<Map<string, PendingPlay>>(new Map());
  const queuedOpponentPlaysRef = useRef<Map<string, OnlinePayload>>(new Map());
  const processedOpponentPlaysRef = useRef<Set<string>>(new Set());

  useEffect(() => { stateRef.current = state; }, [state]);

  const sendPlayAck = useCallback((ackId: string) => {
    const current = stateRef.current;
    if (!session || !current || !channelRef.current || !subscribedRef.current) return;
    void channelRef.current.send({ type: 'broadcast', event: 'play_ack', payload: { role: current.role, roomCode: session.roomCode, ackId }});
  }, [session]);

  const sendPendingPlay = useCallback((pendingPlay: PendingPlay) => {
    if (!channelRef.current || !subscribedRef.current) return;
    void channelRef.current.send({ type: 'broadcast', event: pendingPlay.event, payload: pendingPlay.payload });
  }, []);

  const queueIncomingPlay = useCallback((play: OnlinePayload) => {
    if (!play.cardId || !play.round) return;
    const actionId = play.actionId || createPlayActionId(play.role, play.round, play.cardId, play.matchIndex ?? stateRef.current?.rematchIndex ?? 0);
    if (!processedOpponentPlaysRef.current.has(actionId)) { queuedOpponentPlaysRef.current.set(actionId, { ...play, actionId }); }
  }, []);

  const resetReliablePlayState = useCallback(() => {
    pendingPlaysRef.current.clear(); queuedOpponentPlaysRef.current.clear(); processedOpponentPlaysRef.current.clear();
  }, []);

  // LÓGICA DE TIEMPOS CORREGIDA (VS -> Gira 2s -> Muestra 3s -> Listo)
  useEffect(() => {
    if (!state?.opponentReady) return;

    if (state.introState === 'vs') {
      const timer = setTimeout(() => { setState(s => s ? { ...s, introState: 'coin_spin' } : null); }, 3500);
      return () => clearTimeout(timer);
    }

    if (state.introState === 'coin_spin') {
      const timer = setTimeout(() => {
        const rng = seededRandom(`${session?.roomCode}:coin:${state.rematchIndex}`);
        const coinWinner: OnlineRole = rng() > 0.5 ? 'host' : 'guest';
        setState(s => s ? { ...s, introState: 'coin_result', hasPossession: coinWinner } : null);
      }, 2000); // 2 segundos girando
      return () => clearTimeout(timer);
    }

    if (state.introState === 'coin_result') {
      const timer = setTimeout(() => {
        setState((s) => {
          if (!s) return null;
          const nextState = {
            ...s,
            introState: 'none' as const,
            status: 'playing' as const,
            currentTurn: s.hasPossession,
          };
          return { ...nextState, message: turnMessage(nextState) };
        });
      }, 3000); // 3 segundos congelado en el resultado
      return () => clearTimeout(timer);
    }
  }, [state?.opponentReady, state?.introState, state?.rematchIndex, session?.roomCode]);

  useEffect(() => {
    if (!state?.opponentReady || queuedOpponentPlaysRef.current.size === 0) return;
    const current = stateRef.current; if (!current) return;
    const acknowledged: string[] = []; let nextState = current;
    const queuedPlays = Array.from(queuedOpponentPlaysRef.current.entries()).sort(([, first], [, second]) => (first.round ?? 0) - (second.round ?? 0));

    for (const [actionId, play] of queuedPlays) {
      if (processedOpponentPlaysRef.current.has(actionId)) { queuedOpponentPlaysRef.current.delete(actionId); continue; }
      if (canApplyIncomingPlay(nextState, play)) {
        nextState = applyPlayedCard(nextState, play.role, play.cardId!, play.round!);
        processedOpponentPlaysRef.current.add(actionId); queuedOpponentPlaysRef.current.delete(actionId); acknowledged.push(actionId); continue;
      }
      if ((play.matchIndex !== undefined && play.matchIndex < nextState.rematchIndex) || (play.round ?? 0) < nextState.round) {
        processedOpponentPlaysRef.current.add(actionId); queuedOpponentPlaysRef.current.delete(actionId); acknowledged.push(actionId);
      }
    }
    if (nextState !== current) setState(nextState);
    acknowledged.forEach(sendPlayAck);
  }, [sendPlayAck, state?.botHand, state?.botBoardCard, state?.opponentReady, state?.round, state?.status]);

  useEffect(() => {
    if (!session) { stateRef.current = null; queueMicrotask(() => setState(null)); return undefined; }
    const initialState = createInitialState(session); let isActive = true; stateRef.current = initialState;
    queueMicrotask(() => { if (isActive) setState(initialState); });
    acknowledgedRef.current = false; subscribedRef.current = false; resetReliablePlayState();

    const channel = supabase
      .channel(`online_match_${session.roomCode}`, { config: { broadcast: { ack: true } } })
      .on('broadcast', { event: 'ready' }, ({ payload }) => {
        const ready = payload as OnlinePayload;
        if (ready.roomCode !== session.roomCode || ready.role === initialState.role) return;
        if (ready.hasOpponentDeck) { acknowledgedRef.current = true; }

        setState((current) => {
          if (!current || current.opponentReady) return current;
          const globalShuffled = shuffleWithSeed(MOCK_DECK, session.roomCode);
          const opponentBaseCards = current.role === 'host' ? globalShuffled.slice(MATCH_DECK_SIZE, MATCH_DECK_SIZE * 2) : globalShuffled.slice(0, MATCH_DECK_SIZE);
          const opponentCards = opponentBaseCards.map((card, index) => ({ ...card, id: `${current.opponentRole}-${card.id}-${index}`, owner: 'bot' as 'player' | 'bot' }));

          return { ...current, opponentReady: true, opponentUsername: ready.username || 'RIVAL', botHand: opponentCards.slice(0, HAND_SIZE), botDeck: opponentCards.slice(HAND_SIZE) };
        });
      })
      .on('broadcast', { event: 'play_card' }, ({ payload }) => {
        const play = payload as OnlinePayload; if (!play.cardId || !play.round) return;
        const actionId = play.actionId || createPlayActionId(play.role, play.round, play.cardId, play.matchIndex ?? stateRef.current?.rematchIndex ?? 0);
        if (processedOpponentPlaysRef.current.has(actionId)) { sendPlayAck(actionId); return; }
        const current = stateRef.current; if (!current || play.roomCode !== session.roomCode || play.role !== current.opponentRole) return;
        if (play.matchIndex !== undefined && play.matchIndex < current.rematchIndex) { processedOpponentPlaysRef.current.add(actionId); sendPlayAck(actionId); return; }
        if (!canApplyIncomingPlay(current, play)) { queueIncomingPlay({ ...play, actionId }); return; }
        processedOpponentPlaysRef.current.add(actionId);
        setState((latest) => (latest ? applyPlayedCard(latest, play.role, play.cardId!, play.round!) : latest));
        sendPlayAck(actionId);
      })
      .on('broadcast', { event: 'play_ack' }, ({ payload }) => {
        const ack = payload as OnlinePayload; if (ack.roomCode !== session.roomCode || ack.role !== initialState.opponentRole || !ack.ackId) return;
        pendingPlaysRef.current.delete(ack.ackId);
      })
      .on('broadcast', { event: 'rematch' }, ({ payload }) => {
        const data = payload as OnlinePayload;
        if (data.roomCode === session.roomCode && data.role === initialState.opponentRole && stateRef.current?.playerWantsRematch) { resetReliablePlayState(); }
        setState((current) => {
          if (!current || data.roomCode !== session.roomCode || data.role !== current.opponentRole) return current;
          const nextState = { ...current, opponentWantsRematch: true };
          if (current.playerWantsRematch) return triggerRematch(nextState, session.roomCode);
          return nextState;
        });
      })
      .on('broadcast', { event: 'leave' }, ({ payload }) => {
        const data = payload as OnlinePayload;
        setState((current) => {
          if (!current || data.roomCode !== session.roomCode || data.role !== current.opponentRole) return current;
          return { ...current, status: 'abandoned', message: 'EL RIVAL ABANDONÓ LA SALA' };
        });
      })
      .subscribe((status) => {
        if (!isActive) return;
        if (status === 'SUBSCRIBED') {
          subscribedRef.current = true;
          setState((current) => { if (!current) return current; return { ...current, connected: true, message: turnMessage({...current, connected: true}) }; });
          if (!acknowledgedRef.current) { void channel.send({ type: 'broadcast', event: 'ready', payload: { role: initialState.role, roomCode: session.roomCode, hasOpponentDeck: stateRef.current?.opponentReady, username: session.username } }); }
          pendingPlaysRef.current.forEach(sendPendingPlay);
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          subscribedRef.current = false;
          setState((current) => { if (!current || current.status === 'abandoned') return current; return { ...current, connected: false, message: 'Reconectando con la sala...' }; });
        }
      });
    channelRef.current = channel;
    const readyTimer = window.setInterval(() => { if (!acknowledgedRef.current && channelRef.current && subscribedRef.current) { void channelRef.current.send({ type: 'broadcast', event: 'ready', payload: { role: initialState.role, roomCode: session.roomCode, hasOpponentDeck: stateRef.current?.opponentReady, username: session.username } }); } }, READY_BROADCAST_MS);
    const resendTimer = window.setInterval(() => { if (!subscribedRef.current) return; pendingPlaysRef.current.forEach(sendPendingPlay); }, RELIABLE_RESEND_MS);
    return () => { isActive = false; window.clearInterval(readyTimer); window.clearInterval(resendTimer); supabase.removeChannel(channel); if (channelRef.current === channel) channelRef.current = null; subscribedRef.current = false; };
  }, [queueIncomingPlay, resetReliablePlayState, sendPendingPlay, sendPlayAck, session]);

  useEffect(() => {
    if (state?.status === 'revealing') {
      const timer = setTimeout(() => { setState((curr) => curr ? { ...curr, status: 'resolving', message: 'Calculando...' } : curr); }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.status]);

  useEffect(() => {
    if (!state?.playerBoardCard || !state.botBoardCard || state.status !== 'resolving') return undefined;

    const resultTimer = window.setTimeout(() => {
      setState((current) => {
        if (!current?.playerBoardCard || !current.botBoardCard) return current;
        const pPossession = current.hasPossession === current.role;
        const attackValue = pPossession ? current.playerBoardCard.atk : current.botBoardCard.atk;
        const defenseValue = pPossession ? current.botBoardCard.def : current.playerBoardCard.def;

        const attackScores = attackValue > defenseValue;
        const playerScores = attackScores && pPossession;
        const opponentScores = attackScores && !pPossession;

        const winnerMsg = attackScores
          ? pPossession ? '¡Golazo! Buen ataque' : 'Gol del rival.'
          : defenseValue > attackValue
            ? pPossession ? 'El rival defendió mejor' : '¡Defensa perfecta!'
            : '¡Empate!';

        return {
          ...current,
          playerScore: playerScores ? current.playerScore + 1 : current.playerScore,
          botScore: opponentScores ? current.botScore + 1 : current.botScore,
          message: winnerMsg,
        };
      });

      const cleanupTimer = window.setTimeout(() => {
        setState((current) => {
          if (!current?.playerBoardCard || !current.botBoardCard) return current;
          const playerRefill = refillHand(current.playerHand, current.playerDeck);
          const opponentRefill = refillHand(current.botHand, current.botDeck);
          const nextRound = current.round + 1;
          const nextPossession = otherRole(current.hasPossession);
          const isGameOver = playerRefill.hand.length === 0 && playerRefill.deck.length === 0 && opponentRefill.hand.length === 0 && opponentRefill.deck.length === 0;

          const nextState: OnlineGameState = {
            ...current, round: nextRound, hasPossession: nextPossession, currentTurn: nextPossession,
            playerHand: playerRefill.hand, playerDeck: playerRefill.deck, playerDiscard: [...current.playerDiscard, current.playerBoardCard],
            botHand: opponentRefill.hand, botDeck: opponentRefill.deck, botDiscard: [...current.botDiscard, current.botBoardCard],
            playerBoardCard: null, botBoardCard: null, status: isGameOver ? 'gameover' : 'playing',
          };
          return { ...nextState, message: isGameOver ? 'FIN DEL PARTIDO' : turnMessage(nextState) };
        });
      }, 2000);

      return () => window.clearTimeout(cleanupTimer);
    }, 400);

    return () => window.clearTimeout(resultTimer);
  }, [state?.playerBoardCard?.id, state?.botBoardCard?.id, state?.status]);

  const playCard = useCallback((card: CardData) => {
    const current = stateRef.current; const channel = channelRef.current;
    if (!session || !current || !channel || !current.connected || !current.opponentReady || current.introState !== 'none' || current.status !== 'playing' || current.currentTurn !== current.role || current.playerBoardCard || !current.playerHand.some((item) => item.id === card.id)) return;

    setState((latest) => (latest ? applyPlayedCard(latest, current.role, card.id, current.round) : latest));
    channel.send({ type: 'broadcast', event: 'play_card', payload: { role: current.role, roomCode: session.roomCode, cardId: card.id, round: current.round } });
  }, [session]);

  const requestRematch = useCallback(() => {
    setState((current) => {
      if (!current) return current; const nextState = { ...current, playerWantsRematch: true };
      if (current.opponentWantsRematch) return triggerRematch(nextState, session!.roomCode);
      return nextState;
    });
    channelRef.current?.send({ type: 'broadcast', event: 'rematch', payload: { role: stateRef.current?.role, roomCode: session!.roomCode } });
  }, [session]);

  const leaveRoom = useCallback(() => {
    if (channelRef.current && session) { channelRef.current.send({ type: 'broadcast', event: 'leave', payload: { role: stateRef.current?.role, roomCode: session.roomCode } }); }
  }, [session]);

  return {
    ...(state ?? createInitialState({ roomCode: session?.roomCode ?? 'ONLINE', isHost: true, username: 'Player' })),
    canPlay: Boolean(state?.connected && state.opponentReady && state?.introState === 'none' && state.status === 'playing' && state.currentTurn === state.role && !state.playerBoardCard),
    playCard, requestRematch, leaveRoom,
  };
};
