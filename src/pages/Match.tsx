// src/pages/Match.tsx
import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from '../components/Card';
import CoinFlip from '../components/CoinFlip'; 
import AnimatedBall from '../components/AnimatedBall';
import GoalNet from '../components/GoalNet';
import StadiumConfetti from '../components/StadiumConfetti'; // Motor de partículas de estadio
import { useGameStore } from '../store/gameStore';
import { useOnlineMatch, type OnlineSession } from '../store/onlineGameStore';
import type { CardData } from '../gameData';

// Importación de los efectos de sonido
import goalSoundFile from '../assets/goal.mp3'; 
import kickSoundFile from '../assets/kick.mp3'; 
import cardSoundFile from '../assets/card.m4a'; // Sonido de repartir cartas

const DIFFICULTIES = ['Fácil', 'Normal', 'Difícil', 'Avanzado'];

export default function Match({ difficulty, onlineSession, onReturnToMenu, onNextLevel }: { difficulty?: string, onlineSession?: OnlineSession | null, onReturnToMenu?: () => void, onNextLevel?: (diff: string) => void }) {
  const localGame = useGameStore();
  const onlineGame = useOnlineMatch(onlineSession);
  const [isPaused, setIsPaused] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  
  // Estado para controlar la animación escalonada de las cartas iniciales
  const [hasDealtInitialCards, setHasDealtInitialCards] = useState(false);
  // Candado para asegurar que el audio se reproduzca estrictamente una vez
  const audioPlayedRef = useRef(false);
  
  const isOnlineMatch = Boolean(onlineSession);
  const isCompactLayout = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches;

  // GARANTÍA DE TURNO LIBERADO
  const activeGame = isOnlineMatch ? onlineGame : { ...localGame, canPlay: localGame.status === 'playing' && localGame.introState === 'none' && localGame.currentTurn === 'player' && !localGame.playerBoardCard };
  const { playerHand, playerDeck, playerDiscard, botHand, botDeck, botDiscard, playerBoardCard, botBoardCard, playerScore, botScore, status, message, playCard, hasPossession, introState } = activeGame as any;
  const { initGame, advanceIntro } = localGame;

  const playerWantsRematch = (activeGame as any).playerWantsRematch || false;
  const opponentWantsRematch = (activeGame as any).opponentWantsRematch || false;
  const requestRematch = (activeGame as any).requestRematch || (() => {});
  const leaveRoom = (activeGame as any).leaveRoom || (() => {});

  const isHost = isOnlineMatch ? onlineSession?.isHost : true;
  const myRole = isOnlineMatch ? (activeGame as any).role : 'player';
  const opponentRole = isOnlineMatch ? (activeGame as any).opponentRole : 'bot';
  const playerUsername = isOnlineMatch && (activeGame as any).playerUsername ? (activeGame as any).playerUsername : 'TÚ';
  const opponentUsername = isOnlineMatch && (activeGame as any).opponentUsername ? (activeGame as any).opponentUsername : 'BOT';

  useEffect(() => {
    setIsPaused(false);
    setIsHelpOpen(false);
    if (!isOnlineMatch) initGame(difficulty || 'Normal');
  }, [initGame, difficulty, isOnlineMatch]);

  useEffect(() => {
    if (!isOnlineMatch && introState === 'vs') {
      // Reiniciamos los candados al inicio visual de una nueva partida
      setHasDealtInitialCards(false);
      audioPlayedRef.current = false;
      
      const timer = setTimeout(() => advanceIntro(), 3500);
      return () => clearTimeout(timer);
    }
  }, [isOnlineMatch, introState, advanceIntro]);

  useEffect(() => {
    if (!isOnlineMatch && status === 'gameover' && playerScore > botScore && difficulty) {
      const currentLevelIndex = DIFFICULTIES.indexOf(difficulty);
      const savedLevel = parseInt(localStorage.getItem('futarena_unlocked_level') || '1', 10);
      if (currentLevelIndex >= savedLevel && currentLevelIndex < 3) {
        localStorage.setItem('futarena_unlocked_level', (currentLevelIndex + 1).toString());
      }
    }
  }, [isOnlineMatch, status, playerScore, botScore, difficulty]);

  const scoreDiff = Math.abs(playerScore - botScore);
  const isWin = playerScore > botScore;
  const isDraw = playerScore === botScore;

  const currentLevelIndex = DIFFICULTIES.indexOf(difficulty || 'Normal');
  const hasNextLevel = !isOnlineMatch && currentLevelIndex >= 0 && currentLevelIndex < 3;
  const nextDifficulty = hasNextLevel ? DIFFICULTIES[currentLevelIndex + 1] : null;

  const playerLabel = playerUsername;
  const rivalLabel = opponentUsername;
  const statusMessage = isOnlineMatch && onlineSession ? `${onlineSession.roomCode} - ${message}` : message;

  const playerHighlight: 'atk' | 'def' | undefined = (playerBoardCard && botBoardCard && status === 'resolving') ? (hasPossession === myRole ? 'atk' : 'def') : undefined;
  const botHighlight: 'atk' | 'def' | undefined = (playerBoardCard && botBoardCard && status === 'resolving') ? (hasPossession === opponentRole ? 'atk' : 'def') : undefined;

  const botCardWasPlayedFirst = hasPossession === opponentRole;
  const shouldHideBotBoardCard = !botCardWasPlayedFirst && status === 'revealing';

  const ballTurnOffset = isCompactLayout ? 82 : 130;
  const coinFace = hasPossession === myRole ? (isHost ? 'CARA' : 'CRUZ') : (isHost ? 'CRUZ' : 'CARA');
  const coinWinnerLabel = hasPossession === myRole ? playerLabel : rivalLabel;

  // =========================================================================================
  // LOGICA DE EVENTOS (GOL, DEFENSA Y BALON)
  // =========================================================================================
  let isGoal = false;
  let isDefenseSuccess = false;
  let goalScorer: string | null = null;
  let activeSide: 'top' | 'bottom' | null = null; 

  if (status === 'resolving' && playerBoardCard && botBoardCard) {
    const pAtk = playerBoardCard.atk !== undefined ? playerBoardCard.atk : (playerBoardCard.stats?.atk || 0);
    const pDef = playerBoardCard.def !== undefined ? playerBoardCard.def : (playerBoardCard.stats?.def || 0);
    const bAtk = botBoardCard.atk !== undefined ? botBoardCard.atk : (botBoardCard.stats?.atk || 0);
    const bDef = botBoardCard.def !== undefined ? botBoardCard.def : (botBoardCard.stats?.def || 0);

    if (hasPossession === myRole) {
      if (pAtk > bDef) {
        isGoal = true;
        goalScorer = myRole;
        activeSide = 'bottom'; 
      } else if (bDef > pAtk) {
        isDefenseSuccess = true;
        activeSide = 'top'; 
      }
    } else if (hasPossession === opponentRole) {
      if (bAtk > pDef) {
        isGoal = true;
        goalScorer = opponentRole;
        activeSide = 'top'; 
      } else if (pDef > bAtk) {
        isDefenseSuccess = true;
        activeSide = 'bottom'; 
      }
    }
  }

  const isPlayerDucking = status === 'resolving' && goalScorer === opponentRole;
  const isBotDucking = status === 'resolving' && goalScorer === myRole;

  const ballDuelOffset = isCompactLayout ? 90 : 210; 
  const ballGoalOffset = isCompactLayout ? 160 : 360; 

  let ballX = 0;
  let ballY = 0;
  let ballRotate = 0;
  let ballScale = 1;

  if (status === 'playing' || status === 'bot_thinking') {
    ballY = hasPossession === myRole ? ballTurnOffset : -ballTurnOffset;
    ballRotate = hasPossession === myRole ? 720 : -720;
  } else if (status === 'revealing') {
    ballX = hasPossession === myRole ? -ballDuelOffset : ballDuelOffset;
    ballRotate = hasPossession === myRole ? -360 : 360;
  } else if (status === 'resolving') {
    if (isGoal) {
      ballX = goalScorer === myRole ? ballGoalOffset : -ballGoalOffset;
      ballScale = 0.5; 
      ballRotate = goalScorer === myRole ? 1080 : -1080; 
    } else {
      ballX = hasPossession === myRole ? (ballDuelOffset - (isCompactLayout ? 20 : 40)) : (-ballDuelOffset + (isCompactLayout ? 20 : 40));
      ballRotate = hasPossession === myRole ? 360 : -360;
    }
  }

  // =========================================================================================
  // EFECTO PARA REPRODUCIR SONIDO DE CARTAS REPARTIDAS AL INICIO
  // =========================================================================================
  const prevIntroStateRef = useRef(introState);

  useEffect(() => {
    if (prevIntroStateRef.current !== 'none' && introState === 'none' && !hasDealtInitialCards && !audioPlayedRef.current) {
      audioPlayedRef.current = true; 
      
      const savedSfxVol = localStorage.getItem('futarena_sfx_volume');
      const sfxVolume = savedSfxVol !== null ? parseFloat(savedSfxVol) : 0.8;
      
      const timeouts: NodeJS.Timeout[] = [];

      if (sfxVolume > 0) {
        // Reproducir sonido inicial compensando latencias (-60ms) para que suene ANTES
        for (let i = 0; i < 4; i++) {
          // Evitamos valores negativos en el primer índice usando Math.max
          const offsetDelay = Math.max(0, (i * 600) - 60); 
          const t = setTimeout(() => {
            const cardAudio = new Audio(cardSoundFile);
            cardAudio.volume = sfxVolume;
            cardAudio.play().catch(e => console.log("Audio de cartas bloqueado:", e));
          }, offsetDelay); 
          timeouts.push(t);
        }
      }

      const finalTimer = setTimeout(() => {
        setHasDealtInitialCards(true);
      }, 2400);
      timeouts.push(finalTimer);

      prevIntroStateRef.current = introState;

      return () => {
        timeouts.forEach(clearTimeout);
      };
    }

    prevIntroStateRef.current = introState;
  }, [introState, hasDealtInitialCards]);

  // =========================================================================================
  // NUEVO EFECTO: REPRODUCIR SONIDO AL ROBAR UNA CARTA NUEVA DURANTE LA PARTIDA
  // =========================================================================================
  const prevHandSizeRef = useRef(playerHand?.length || 0);

  useEffect(() => {
    if (hasDealtInitialCards && playerHand && playerHand.length > prevHandSizeRef.current) {
      const savedSfxVol = localStorage.getItem('futarena_sfx_volume');
      const sfxVolume = savedSfxVol !== null ? parseFloat(savedSfxVol) : 0.8;

      if (sfxVolume > 0) {
        // Reducido a 0ms (Inmediato) para que no suene tarde al robar carta
        const cardAudio = new Audio(cardSoundFile);
        cardAudio.volume = sfxVolume;
        cardAudio.play().catch(e => console.log("Audio de nueva carta bloqueado:", e));
      }
    }
    
    prevHandSizeRef.current = playerHand?.length || 0;
  }, [playerHand, hasDealtInitialCards]);


  // =========================================================================================
  // EFECTO PARA REPRODUCIR LOS SONIDOS DE PATADA Y GOL
  // =========================================================================================
  useEffect(() => {
    if (status === 'resolving') {
      const savedSfxVol = localStorage.getItem('futarena_sfx_volume');
      const sfxVolume = savedSfxVol !== null ? parseFloat(savedSfxVol) : 0.8;

      if (sfxVolume > 0) {
        const kickAudio = new Audio(kickSoundFile);
        kickAudio.volume = sfxVolume;
        kickAudio.play().catch(e => console.log("Audio de patada bloqueado:", e));

        if (isGoal) {
          const timer = setTimeout(() => {
            const goalAudio = new Audio(goalSoundFile);
            goalAudio.volume = sfxVolume;
            goalAudio.play().catch(e => console.log("Audio de gol bloqueado:", e));
          }, 200); 

          return () => clearTimeout(timer);
        }
      }
    }
  }, [status, isGoal]);

  return (
    <div className="match-screen h-[100svh] max-h-[100svh] min-h-0 w-full bg-[#143d22] flex flex-col justify-between font-sans relative overflow-hidden text-white selection:bg-cyan-500/30">
      {/* ================= FASE DE INTRO ================= */}
      <AnimatePresence>
        {introState !== 'none' && (
          <motion.div
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.5 } }}
          >
            {introState === 'vs' && (
              <motion.div className="flex flex-col md:flex-row items-center w-full justify-center" key="vs-screen" exit={{ scale: 1.5, opacity: 0 }}>
                 <motion.div initial={{ x: -300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.1 }} className="flex-1 flex flex-col items-center justify-center md:justify-end md:pr-16 text-center">
                   <h2 className="text-4xl md:text-7xl font-black text-cyan-400 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">{playerLabel}</h2>
                 </motion.div>
                 <motion.div initial={{ scale: 0, opacity: 0, rotate: -180 }} animate={{ scale: 1, opacity: 1, rotate: 0 }} transition={{ type: 'spring', bounce: 0.6, delay: 0.5 }} className="text-6xl md:text-8xl font-black italic text-white drop-shadow-[0_0_40px_rgba(255,255,255,0.8)] z-10 my-8 md:my-0">VS</motion.div>
                 <motion.div initial={{ x: 300, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ type: 'spring', damping: 20, delay: 0.3 }} className="flex-1 flex flex-col items-center justify-center md:justify-start md:pl-16 text-center">
                   <h2 className="text-4xl md:text-7xl font-black text-red-500 tracking-tighter uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.5)]">{rivalLabel}</h2>
                 </motion.div>
              </motion.div>
            )}
            {(introState === 'coin_spin' || introState === 'coin_result') && (
              <CoinFlip
                 phase={introState}
                 resultFace={coinFace}
                 winnerLabel={coinWinnerLabel}
               />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ==================================================================== */}
      {/* Franjas del césped */}
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: `repeating-linear-gradient(90deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 40px, transparent 40px, transparent 80px), radial-gradient(circle at center, #26733a 0%, #143d22 100%)` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.35] mix-blend-overlay" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-30 mix-blend-multiply" style={{ backgroundImage: `radial-gradient(circle at 20% 30%, #3f2a14 0%, transparent 15%), radial-gradient(circle at 80% 70%, #3f2a14 0%, transparent 20%)`, filter: 'blur(30px)' }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.7)] pointer-events-none z-0"></div>

      {/* EFECTO DE CONFETI Y PAPELES ULTRA REALISTA */}
      <StadiumConfetti 
        isGoal={status === 'resolving' && isGoal} 
        isDefense={status === 'resolving' && isDefenseSuccess} 
        activeSide={activeSide} 
      />

      {/* Líneas de la cancha */}
      <div className="absolute inset-x-3 inset-y-4 md:inset-x-8 md:inset-y-6 border-[2px] md:border-[3px] border-white/40 rounded-lg pointer-events-none flex items-center justify-center z-10 overflow-hidden shadow-[0_0_15px_rgba(255,255,255,0.15)]">
        <div className="absolute left-1/2 top-0 bottom-0 w-[2px] md:w-[3px] bg-white/40 -translate-x-1/2 shadow-[0_0_10px_rgba(255,255,255,0.2)]"></div>
        <div className="absolute left-1/2 top-1/2 w-32 h-32 md:w-48 md:h-48 border-[2px] md:border-[3px] border-white/40 rounded-full -translate-x-1/2 -translate-y-1/2 backdrop-blur-[1px] shadow-[inset_0_0_10px_rgba(255,255,255,0.1),0_0_10px_rgba(255,255,255,0.1)]"></div>
        <div className="absolute left-1/2 top-1/2 w-3 h-3 md:w-4 md:h-4 bg-white/70 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-[0_0_10px_rgba(255,255,255,0.3)]"></div>
      </div>

      {status === 'playing' && (
        <button
          onClick={() => { setIsHelpOpen(false); setIsPaused(true); }}
          className="absolute top-4 right-4 md:top-6 md:right-8 z-40 h-11 w-11 md:h-12 md:w-12 rounded-full bg-black/70 border border-white/15 text-white text-xl font-black backdrop-blur-md shadow-[0_10px_25px_rgba(0,0,0,0.45)] transition-all hover:bg-white/15 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"
        >II</button>
      )}

      {/* Bot Deck (Mazo Rival) */}
      <div className="match-bot-deck absolute !right-1 sm:!right-4 md:!right-8 lg:!right-12 !top-[8%] sm:!top-[12%] md:!top-[15%] !bottom-auto w-16 h-24 md:w-20 md:h-28 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-red-500/60 font-bold shadow-2xl z-20">
        <span className="text-[8px] md:text-[10px] tracking-widest font-medium opacity-70">MAZO</span>
        <span className="text-xl md:text-3xl font-black drop-shadow-md">{botDeck?.length || 0}</span>
      </div>

      {/* Player Deck (Mazo Jugador) */}
      <div className="match-player-deck absolute !right-1 sm:!right-4 md:!right-8 lg:!right-12 !bottom-[18%] sm:!bottom-[22%] md:!bottom-[25%] !top-auto w-16 h-24 md:w-20 md:h-28 bg-black/70 backdrop-blur-md border border-white/10 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-cyan-500/60 font-bold shadow-2xl z-20">
        <span className="text-[8px] md:text-[10px] tracking-widest font-medium opacity-70">MAZO</span>
        <span className="text-xl md:text-3xl font-black text-white drop-shadow-md">{playerDeck?.length || 0}</span>
      </div>

      {/* Bot Discard (Usadas Rival) */}
      <div className="match-discard-pile match-bot-discard absolute !left-1 sm:!left-4 md:!left-8 lg:!left-12 !top-[8%] sm:!top-[12%] md:!top-[15%] !bottom-auto w-20 h-28 md:w-24 md:h-32 bg-black/10 border border-white/5 border-dashed rounded-xl flex items-center justify-center shadow-inner z-10">
        <span className="text-[8px] tracking-widest font-medium text-slate-500 absolute -top-5">USADAS</span>
        {botDiscard.map((card: CardData) => <div key={card.id} className="absolute inset-0 flex items-center justify-center"><Card card={card} disabled isDiscardCard className="match-card" /></div>)}
      </div>

      {/* Player Discard (Usadas Jugador) */}
      <div className="match-discard-pile match-player-discard absolute !left-1 sm:!left-4 md:!left-8 lg:!left-12 !bottom-[18%] sm:!bottom-[22%] md:!bottom-[25%] !top-auto w-20 h-28 md:w-24 md:h-32 bg-black/10 border border-white/5 border-dashed rounded-xl flex items-center justify-center shadow-inner z-10">
        <span className="text-[8px] tracking-widest font-medium text-slate-400 absolute -bottom-5">USADAS</span>
        {playerDiscard.map((card: CardData) => <div key={card.id} className="absolute inset-0 flex items-center justify-center"><Card card={card} disabled isDiscardCard className="match-card" /></div>)}
      </div>

      <header className="relative z-20 flex justify-center pt-2 md:pt-4 shrink-0 pointer-events-none">
        <div className="max-w-[calc(100vw-3.75rem)] bg-black/60 backdrop-blur-lg border border-white/10 px-3 md:px-10 py-1.5 md:py-3 rounded-full flex gap-3 md:gap-16 items-center shadow-[0_15px_35px_rgba(0,0,0,0.5)] pointer-events-auto">
          <div className="text-base sm:text-xl md:text-3xl font-black text-cyan-400 tracking-tighter whitespace-nowrap">
            {playerLabel}: {playerScore}
          </div>
          <div className="max-w-[7rem] sm:max-w-none truncate text-[8px] md:text-xs font-medium tracking-[0.16em] md:tracking-[0.2em] text-slate-300 uppercase">{statusMessage}</div>
          <div className="text-base sm:text-xl md:text-3xl font-black text-red-500 tracking-tighter whitespace-nowrap">
            {botScore} :{rivalLabel}
          </div>
        </div>
      </header>

      <div className="flex justify-center items-start mt-1 md:mt-4 z-20 opacity-90 origin-top shrink-0">
        <div className="flex justify-center gap-1.5 md:gap-3.5 overflow-x-auto px-3 md:px-10 pb-2 md:pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {botHand.map((card: CardData, index: number) => (
            <motion.div 
              key={card.id} 
              layoutId={`card-${card.id}`} 
              initial={{ x: 150, y: -150, scale: 0.2, opacity: 0 }} 
              animate={{ x: 0, y: 0, scale: 1, opacity: introState === 'none' ? 1 : 0 }} 
              transition={{ 
                type: "spring", 
                stiffness: 280, 
                damping: 25, 
                delay: introState === 'none' && !hasDealtInitialCards ? index * 0.6 : 0 
              }} 
              className="match-hidden-card w-12 h-[4.5rem] sm:w-14 sm:h-20 md:w-20 md:h-28 bg-black/80 border border-white/10 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg relative overflow-hidden group"
            >
              <span className="text-2xl md:text-3xl opacity-20">🤖</span>
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div className="flex-1 min-h-0 flex items-center justify-center gap-2 sm:gap-3 md:gap-16 z-20 perspective-1000 my-1 md:my-2" animate={status === 'revealing' ? { scale: [1, 1.05, 0.98, 1.05, 1] } : { scale: 1 }} transition={status === 'revealing' ? { duration: 1, ease: "easeInOut" } : { duration: 0.3 }}>
                 
        {/* =======================================================
            CARTA DEL JUGADOR
        ======================================================= */}
        <div className="match-board-slot relative w-28 h-40 md:w-40 md:h-56 flex items-center justify-center">
          <GoalNet isPlayer={true} />
          {!playerBoardCard && <div className="match-board-placeholder absolute inset-0 rounded-2xl md:rounded-3xl border border-cyan-500/30 bg-black/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] z-10"></div>}
                   
          {playerBoardCard && (
            <>
              <motion.div 
                className="absolute inset-0 z-10 flex items-center justify-center"
                animate={isPlayerDucking ? { rotateX: 75, y: 30, scale: 0.9, opacity: 0.4 } : { rotateX: 0, y: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                style={{ transformOrigin: 'bottom' }}
              >
                <Card card={playerBoardCard} disabled isBoardCard highlightStat={playerHighlight} className="match-card w-full h-full" />
              </motion.div>
              <AnimatePresence>
                {status === 'resolving' && (
                  <motion.div initial={{ scale: 0, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <span className="text-7xl md:text-9xl drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                      {hasPossession === myRole ? '⚔️' : '🛡️'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>

        {/* ZONA CENTRAL Y ANIMACIÓN DEL BALÓN PROYECTIL */}
        <div className="flex flex-col items-center justify-center pointer-events-none relative w-12 md:w-32">
           <motion.div className="text-2xl md:text-6xl font-black italic tracking-tighter drop-shadow-2xl" animate={{ color: status === 'revealing' ? '#22d3ee' : 'rgba(255,255,255,0.2)' }}>VS</motion.div>
           
           <AnimatePresence>
             {introState === 'none' && (
               <motion.div
                 initial={{ scale: 0, opacity: 0, x: 0, y: 0, rotate: 0 }}
                 animate={{ scale: ballScale, opacity: 1, x: ballX, y: ballY, rotate: ballRotate }}
                 transition={{ 
                    type: "spring", 
                    stiffness: status === 'resolving' ? (isGoal ? 120 : 160) : 180, 
                    damping: status === 'resolving' ? (isGoal ? 12 : 16) : 18,
                   delay: status === 'playing' ? 0.3 : 0 
                  }}
                 className={`absolute z-30 drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)] ${status === 'playing' ? 'animate-pulse' : ''}`}
               >
                 <AnimatedBall className="!w-8 !h-8 md:!w-12 md:!h-12" />
               </motion.div>
             )}
           </AnimatePresence>
        </div>

        {/* =======================================================
            CARTA DEL RIVAL
        ======================================================= */}
        <div className="match-board-slot relative w-28 h-40 md:w-40 md:h-56 flex items-center justify-center">
          <GoalNet isPlayer={false} />
          {!botBoardCard && <div className="match-board-placeholder absolute inset-0 rounded-2xl md:rounded-3xl border border-red-500/30 bg-black/50 shadow-[inset_0_0_40px_rgba(0,0,0,0.4)] z-10"></div>}
                   
          {botBoardCard && (
            <>
              <motion.div 
                className="absolute inset-0 z-10 flex items-center justify-center"
                animate={isBotDucking ? { rotateX: 75, y: 30, scale: 0.9, opacity: 0.4 } : { rotateX: 0, y: 0, scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 180, damping: 20 }}
                style={{ transformOrigin: 'bottom' }}
              >
                <Card card={botBoardCard} disabled isBoardCard isHidden={shouldHideBotBoardCard} highlightStat={botHighlight} className="match-card w-full h-full" />
              </motion.div>
              <AnimatePresence>
                {status === 'resolving' && (
                  <motion.div initial={{ scale: 0, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0, opacity: 0 }} className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
                    <span className="text-7xl md:text-9xl drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                      {hasPossession === opponentRole ? '⚔️' : '🛡️'}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>

      <div className="match-player-hand flex justify-center items-end pb-4 md:pb-6 z-20 relative shrink-0 origin-bottom">
        <div className="flex justify-center gap-2 md:gap-5 overflow-x-auto px-4 md:px-10 pt-10 pb-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {playerHand.map((card: CardData, index: number) => (
            <motion.div 
              key={card.id} 
              className="match-hand-slot"
              initial={{ x: 150, y: 150, scale: 0.2, opacity: 0 }} 
              animate={{ x: 0, y: 0, scale: 1, opacity: introState === 'none' ? 1 : 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 280, 
                damping: 25, 
                delay: introState === 'none' && !hasDealtInitialCards ? index * 0.6 : 0 
              }}
            >
              <Card card={card} onClick={() => playCard(card)} disabled={!activeGame.canPlay || isPaused} isHandCard className="match-card" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* MENÚS PAUSA / GAMEOVER */}
      {isPaused && status !== 'gameover' && status !== 'abandoned' && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-xl flex flex-col items-center justify-center z-50 px-6">
          <p className="text-sm md:text-base text-cyan-300 font-bold tracking-[0.35em] uppercase mb-3">NIVEL: {difficulty}</p>
          <h1 className="text-5xl md:text-7xl font-black mb-10 uppercase tracking-tighter text-center text-white drop-shadow-[0_0_40px_rgba(34,211,238,0.35)]">PAUSA</h1>
          <div className="flex flex-col gap-4 w-full max-w-sm">
            <button onClick={() => setIsPaused(false)} className="w-full py-4 bg-cyan-500 text-black rounded-xl text-lg font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,211,238,0.4)]">CONTINUAR</button>
            <button onClick={() => setIsHelpOpen(true)} className="w-full py-4 bg-white/10 text-white border border-cyan-400/30 rounded-xl text-lg font-bold transition-all hover:scale-105 hover:bg-cyan-400/15 hover:border-cyan-300/60">AYUDA</button>
            {onReturnToMenu && (
              <button onClick={() => { if (isOnlineMatch) leaveRoom(); onReturnToMenu(); }} className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-xl text-lg font-bold transition-all hover:bg-white/20">SALIR</button>
            )}
          </div>
          {isHelpOpen && (
            <motion.div initial={{ opacity: 0, scale: 0.92, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: "spring", stiffness: 280, damping: 24 }} className="absolute inset-0 bg-black/80 backdrop-blur-xl flex items-center justify-center px-6 z-10">
              <div className="w-full max-w-md rounded-2xl border border-cyan-400/30 bg-slate-950/95 p-6 md:p-8 shadow-[0_0_45px_rgba(34,211,238,0.18)]">
                <p className="text-xs text-cyan-300 font-bold tracking-[0.35em] uppercase mb-2">MECÁNICA DEL JUEGO</p>
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter text-white mb-5">POSESIÓN Y DUELOS</h2>
                <div className="space-y-3 text-sm md:text-base text-slate-300 leading-relaxed">
                  <p>Al inicio se lanza una moneda. El ganador tira primero y toma la <span className="text-cyan-400 font-bold">Posesión</span>.</p>
                  <p>En el duelo, el jugador <span className="font-bold text-white">CON</span> posesión usa su <span className="text-red-400 font-bold">ATK ⚔️</span> para intentar anotar.</p>
                  <p>El jugador <span className="font-bold text-white">SIN</span> posesión debe usar su <span className="text-blue-400 font-bold">DEF 🛡️</span> para intentar robar el balón.</p>
                  <p>Si la Defensa es mayor que el Ataque, ¡Robas el balón para el próximo turno!</p>
                </div>
                <button onClick={() => setIsHelpOpen(false)} className="mt-7 w-full py-4 bg-cyan-500 text-black rounded-xl text-lg font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,211,238,0.35)]">ENTENDIDO</button>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {(status === 'gameover' || status === 'abandoned') && (
        <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl flex flex-col items-center justify-center z-50">
          {status === 'abandoned' ? (
             <>
               <h1 className="text-5xl md:text-6xl font-black mb-4 uppercase tracking-tighter text-center text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.6)]">CONEXIÓN PERDIDA</h1>
               <p className="text-lg md:text-xl text-slate-300 font-bold tracking-[0.2em] mb-10 uppercase text-center">{rivalLabel} ABANDONÓ LA SALA</p>
             </>
          ) : (
             <>
                <p className="text-xl md:text-2xl text-slate-400 font-bold tracking-[0.3em] uppercase mb-2">NIVEL: {difficulty}</p>
                <h1 className={`text-5xl md:text-7xl font-black mb-4 uppercase tracking-tighter text-center ${isWin ? 'text-cyan-400 drop-shadow-[0_0_50px_rgba(34,211,238,0.6)]' : isDraw ? 'text-slate-300' : 'text-red-500 drop-shadow-[0_0_50px_rgba(239,68,68,0.6)]'}`}>
                  {isWin ? `¡VICTORIA POR ${scoreDiff} PUNTOS!` : isDraw ? '¡EMPATE TÁCTICO!' : `DERROTA POR ${scoreDiff} PUNTOS`}
                </h1>
                <div className="flex items-center gap-6 md:gap-12 mb-10 md:mb-16 bg-black/50 p-6 md:p-8 rounded-full border border-white/10 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                  <div className="text-5xl md:text-7xl font-black text-cyan-400 tracking-tighter">{playerScore}</div>
                  <div className="text-2xl md:text-3xl text-slate-600 font-light">VS</div>
                  <div className="text-5xl md:text-7xl font-black text-red-500 tracking-tighter">{botScore}</div>
                </div>
             </>
          )}
          <div className="flex flex-col gap-4 w-full max-w-sm px-6">
            {isOnlineMatch && status === 'gameover' && (
              <>
                <button onClick={requestRematch} disabled={playerWantsRematch} className={`w-full py-4 rounded-xl text-lg font-black transition-all shadow-[0_0_30px_rgba(34,211,238,0.4)] ${playerWantsRematch ? 'bg-cyan-900 text-slate-400 cursor-not-allowed' : 'bg-cyan-500 text-black hover:scale-105'}`}>{playerWantsRematch ? 'ESPERANDO RIVAL...' : 'JUGAR REVANCHA'}</button>
                {opponentWantsRematch && !playerWantsRematch && <p className="text-cyan-400 font-bold tracking-widest text-center text-xs uppercase animate-pulse">¡El rival quiere la revancha!</p>}
              </>
            )}
            {!isOnlineMatch && isWin && hasNextLevel && onNextLevel && (
              <button onClick={() => onNextLevel(nextDifficulty!)} className="w-full py-4 bg-cyan-500 text-black rounded-xl text-lg font-black transition-all hover:scale-105 shadow-[0_0_30px_rgba(34,211,238,0.4)]">JUGAR NIVEL {nextDifficulty!.toUpperCase()}</button>
            )}
            {!isOnlineMatch && status === 'gameover' && (
              <button onClick={() => initGame(difficulty || 'Normal')} className="w-full py-4 bg-white/10 text-white border border-white/20 rounded-xl text-lg font-bold transition-all hover:bg-white/20">REINTENTAR</button>
            )}
            {onReturnToMenu && (
              <button onClick={() => { if (isOnlineMatch) leaveRoom(); onReturnToMenu(); }} className="w-full py-4 bg-transparent text-slate-400 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:text-white">SALIR AL MENÚ</button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}