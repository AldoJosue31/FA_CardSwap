import { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { MOCK_DECK } from '../gameData';
import Card from '../components/Card';
import { supabase } from '../supabaseClient';

// ==========================================
// IMPORTAR AUDIO DE FONDO
// ==========================================
import menuMusicFile from '../assets/main_theme.mp3';

const ROOM_CODE_LENGTH = 6;

const POS_WEIGHT: Record<string, number> = {
  'POR': 1,
  'DEF': 2,
  'MED': 3,
  'DEL': 4
};

type OnlineRoom = {
  short_code: string;
  status: 'waiting' | 'playing' | 'finished';
};

const createRoomCode = () =>
  Math.random()
    .toString(36)
    .replace(/[^a-z0-9]/gi, '')
    .slice(2, 2 + ROOM_CODE_LENGTH)
    .toUpperCase()
    .padEnd(ROOM_CODE_LENGTH, '0');

const normalizeRoomCode = (value: string) =>
  value.replace(/[^a-z0-9]/gi, '').toUpperCase().slice(0, ROOM_CODE_LENGTH);

type MenuScreen = 'boot' | 'title' | 'main' | 'quickplay' | 'local' | 'difficulty' | 'online' | 'join_room' | 'waiting_room' | 'options' | 'credits' | 'support' | 'gallery';

const DIFFICULTIES = ['Fácil', 'Normal', 'Difícil', 'Avanzado'];

export default function MainMenu({ 
  initialScreen = 'boot', 
  onStartMatch,
  onStartOnlineMatch 
}: { 
  initialScreen?: MenuScreen, 
  onStartMatch?: (diff: string) => void,
  onStartOnlineMatch?: (roomId: string, isHost: boolean, username: string) => void 
}) {
  const [screen, setScreen] = useState<MenuScreen>(initialScreen);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

  const [posFilter, setPosFilter] = useState('ALL');
  const [natFilter, setNatFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('POS');

  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineError, setOnlineError] = useState('');
  const roomChannelRef = useRef<RealtimeChannel | null>(null);

  const [username, setUsername] = useState(() => localStorage.getItem('futarena_username') || '');

  // ==========================================
  // MOTOR DE AUDIO CON FADE-IN (20% a 50%)
  // ==========================================
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<number | null>(null);

  const playAudioWithFade = () => {
    const audio = audioRef.current;
    if (!audio) return;

    // Limpiamos cualquier animación de volumen previa
    if (fadeIntervalRef.current) window.clearInterval(fadeIntervalRef.current);

    // Inicia en el segundo 15
    audio.currentTime = 15; 
    audio.volume = 0.2;     // Empieza al 20%
    
    audio.play().catch(e => console.log("Audio bloqueado:", e));

    let vol = 0.2;
    // Transición de 0.2 a 0.5 (diferencia de 0.3) en 1.5 segundos (1500ms). Se actualiza cada 50ms (30 iteraciones)
    const step = 0.3 / (1500 / 50); 

    fadeIntervalRef.current = window.setInterval(() => {
      vol += step;
      if (vol >= 0.5) {
        audio.volume = 0.5; // Termina exactamente en 50%
        if (fadeIntervalRef.current) window.clearInterval(fadeIntervalRef.current);
      } else {
        audio.volume = vol;
      }
    }, 50);
  };

  useEffect(() => {
    const audio = new Audio(menuMusicFile);
    audio.loop = true;
    audioRef.current = audio;

    // Si regresamos desde un partido (saltando la pantalla boot y title), arranca el fade-in
    if (initialScreen !== 'boot' && initialScreen !== 'title') {
      playAudioWithFade();
    }

    // Limpieza al desmontar el menú (ir a jugar)
    return () => {
      if (fadeIntervalRef.current) window.clearInterval(fadeIntervalRef.current);
      audio.pause();
      audio.currentTime = 0;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScreen]);
  // ==========================================

  useEffect(() => {
    const saved = localStorage.getItem('futarena_unlocked_level');
    if (saved) setUnlockedLevel(parseInt(saved, 10));
  }, []);

  useEffect(() => {
    if (screen === 'boot') {
      const timer = setTimeout(() => setScreen('title'), 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  // ==========================================
  // EVENTO AL PRESIONAR CUALQUIER TECLA
  // ==========================================
  useEffect(() => {
    const handleKeyPress = () => { 
      if (screen === 'title') {
        setScreen('main');
        playAudioWithFade(); // ¡Arranca el audio con fade in!
      } 
    };
    
    if (screen === 'title') {
      window.addEventListener('keydown', handleKeyPress);
      window.addEventListener('click', handleKeyPress);
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('click', handleKeyPress);
    };
  }, [screen]);

  useEffect(() => {
    return () => {
      if (roomChannelRef.current) {
        supabase.removeChannel(roomChannelRef.current);
        roomChannelRef.current = null;
      }
    };
  }, []);

  const clearRoomSubscription = () => {
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }
  };

  const startOnlineMatch = (code: string, isHost: boolean) => {
    clearRoomSubscription();
    setIsLoading(false);
    
    localStorage.setItem('futarena_username', username.trim());
    if (onStartOnlineMatch) onStartOnlineMatch(code, isHost, username.trim() || 'JUGADOR');
  };

  const watchRoomStart = (code: string) => {
    clearRoomSubscription();

    const channel = supabase
      .channel(`online_room_${code}_${Date.now()}`)
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'online_rooms', filter: `short_code=eq.${code}` },
        (payload) => {
          const updatedRoom = payload.new as OnlineRoom;
          if (updatedRoom.status === 'playing') {
            startOnlineMatch(code, true);
          }
        }
      )
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          const { data, error } = await supabase
            .from('online_rooms')
            .select('short_code,status')
            .eq('short_code', code)
            .maybeSingle<OnlineRoom>();

          if (!error && data?.status === 'playing') {
            startOnlineMatch(code, true);
          }
        }

        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
          setOnlineError('No se pudo mantener la conexion en vivo con la sala.');
        }
      });

    roomChannelRef.current = channel;
  };

  const handleCreateRoom = async () => {
    setIsLoading(true);
    setOnlineError('');

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const code = createRoomCode();
      const { data, error } = await supabase
        .from('online_rooms')
        .insert([{ short_code: code }])
        .select('short_code,status')
        .single<OnlineRoom>();

      if (!error && data) {
        setRoomCode(data.short_code);
        setScreen('waiting_room');
        setIsLoading(false);
        watchRoomStart(data.short_code);
        return;
      }

      if (error?.code !== '23505') {
        setIsLoading(false);
        setOnlineError(error?.message || 'Error al crear sala en los servidores.');
        return;
      }
    }

    setIsLoading(false);
    setOnlineError('No se pudo generar un codigo de sala disponible. Intenta otra vez.');
  };

  const handleJoinRoom = async () => {
    const codeUpper = normalizeRoomCode(joinCode);
    if (codeUpper.length !== ROOM_CODE_LENGTH) return;

    setIsLoading(true);
    setOnlineError('');

    const { data, error } = await supabase
      .from('online_rooms')
      .select('short_code,status')
      .eq('short_code', codeUpper)
      .maybeSingle<OnlineRoom>();

    if (error || !data || data.status !== 'waiting') {
      setOnlineError('Sala no encontrada o la partida ya inicio.');
      setIsLoading(false);
      return;
    }

    const { data: updatedRoom, error: updateError } = await supabase
      .from('online_rooms')
      .update({ status: 'playing' })
      .eq('short_code', codeUpper)
      .eq('status', 'waiting')
      .select('short_code,status')
      .maybeSingle<OnlineRoom>();

    if (updateError || !updatedRoom) {
      setOnlineError(updateError?.message || 'La sala ya no esta disponible.');
      setIsLoading(false);
      return;
    }

    setIsLoading(false);
    startOnlineMatch(updatedRoom.short_code, false);
  };

  const handleCancelRoom = async () => {
    const code = roomCode;
    clearRoomSubscription();
    setOnlineError('');
    setRoomCode('');
    setScreen('online');

    if (code) {
      await supabase
        .from('online_rooms')
        .update({ status: 'finished' })
        .eq('short_code', code)
        .eq('status', 'waiting');
    }
  };

  const uniqueNats = useMemo(() => {
    const nats = new Set(MOCK_DECK.map(c => c.nationality));
    return Array.from(nats).sort();
  }, []);

  const processedDeck = useMemo(() => {
    let deck = [...MOCK_DECK];

    if (posFilter !== 'ALL') deck = deck.filter(c => c.pos === posFilter);
    if (natFilter !== 'ALL') deck = deck.filter(c => c.nationality === natFilter);

    if (sortBy === 'POS') {
      deck.sort((a, b) => (POS_WEIGHT[a.pos] || 99) - (POS_WEIGHT[b.pos] || 99));
    } else if (sortBy === 'ATK_DESC') {
      deck.sort((a, b) => b.atk - a.atk);
    } else if (sortBy === 'ATK_ASC') {
      deck.sort((a, b) => a.atk - b.atk);
    } else if (sortBy === 'DEF_DESC') {
      deck.sort((a, b) => b.def - a.def);
    } else if (sortBy === 'DEF_ASC') {
      deck.sort((a, b) => a.def - b.def);
    }

    return deck;
  }, [posFilter, natFilter, sortBy]);

  const MenuButton = ({ title, subtitle, onClick, disabled = false, icon = '' }: any) => (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, x: 10, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors
        ${disabled 
          ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed' 
          : 'bg-black/40 border-white/10 hover:border-cyan-500/50 cursor-pointer backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)]'}`}
    >
      <div>
        <h3 className={`text-xl font-black tracking-wide ${disabled ? 'text-slate-500' : 'text-white'}`}>{title}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
      </div>
      <div className="text-2xl opacity-70">{icon}</div>
    </motion.button>
  );

  const galleryContainerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const galleryItemVariants: Variants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="h-screen w-full bg-[#021812] flex flex-col items-center justify-center font-sans relative overflow-hidden text-white selection:bg-cyan-500/30">
      
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 40px, transparent 40px, transparent 80px), radial-gradient(circle at center, #0a3d24 0%, #021812 100%)` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.2]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

      <AnimatePresence mode="wait">
        {screen === 'boot' && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="z-10 flex flex-col items-center">
            <motion.div initial={{ scale: 0.9, filter: 'blur(10px)' }} animate={{ scale: 1, filter: 'blur(0px)' }} transition={{ duration: 2 }} className="text-center">
              <p className="text-sm tracking-[0.5em] text-cyan-500/80 mb-2 uppercase">Desarrollado por</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">KRAVITT STUDIOS</h1>
            </motion.div>
          </motion.div>
        )}

        {screen === 'title' && (
          <motion.div key="title" initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1 }} className="z-10 flex flex-col items-center w-full h-full justify-center">
            <div className="w-64 h-32 md:w-96 md:h-48 border border-dashed border-white/20 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)] mb-16 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent"></div>
               <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-2xl"><span className="text-white">FUT</span><span className="text-cyan-400">ARENA</span></h1>
            </div>
            <motion.p animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-sm md:text-base tracking-[0.3em] font-medium text-slate-300 uppercase">Presiona cualquier tecla</motion.p>
          </motion.div>
        )}

        {['main', 'quickplay', 'local', 'difficulty', 'online', 'join_room', 'waiting_room'].includes(screen) && (
          <motion.div key="menus" initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="z-10 w-full max-w-md px-6 flex flex-col h-full justify-center">
            <div className="mb-12">
               <h2 className="text-4xl font-black italic tracking-tighter"><span className="text-white">FUT</span><span className="text-cyan-400">ARENA</span></h2>
               <p className="text-xs text-slate-400 tracking-widest mt-1 uppercase">v0.1.0 Alpha</p>
            </div>

            {screen === 'main' && (
              <motion.div className="flex flex-col gap-3">
                <MenuButton title="PARTIDA RÁPIDA" subtitle="Juega sin registro" icon="⚡" onClick={() => setScreen('quickplay')} />
                <MenuButton title="MODO ARCADE" subtitle="Requiere Iniciar Sesión" icon="🔒" disabled={true} />
                <MenuButton title="GALERÍA DE CARTAS" subtitle="Filtros y colecciones" icon="📚" onClick={() => setScreen('gallery')} />
                <div className="h-px w-full bg-white/10 my-2"></div>
                <MenuButton title="OPCIONES" onClick={() => {}} />
                <MenuButton title="CRÉDITOS" onClick={() => {}} />
                <MenuButton title="APOYAR" icon="☕" onClick={() => {}} />
              </motion.div>
            )}

            {screen === 'quickplay' && (
              <motion.div className="flex flex-col gap-3">
                <MenuButton title="LOCAL" subtitle="Vs CPU o 2 Jugadores" icon="🎮" onClick={() => setScreen('local')} />
                <MenuButton title="ONLINE" subtitle="Salas privadas con código" icon="🌐" onClick={() => setScreen('online')} />
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('main')} />
              </motion.div>
            )}

            {screen === 'local' && (
              <motion.div className="flex flex-col gap-3">
                <MenuButton title="VS CPU" subtitle="Entrena contra la máquina" onClick={() => setScreen('difficulty')} />
                <MenuButton title="2 JUGADORES" subtitle="En esta PC" onClick={() => {}} />
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('quickplay')} />
              </motion.div>
            )}

            {screen === 'difficulty' && (
              <motion.div className="flex flex-col gap-3">
                {DIFFICULTIES.map((diff, index) => {
                  const isLocked = index > unlockedLevel;
                  return (
                    <MenuButton key={diff} title={diff} subtitle={isLocked ? 'Bloqueado' : `Jugar en ${diff}`} icon={isLocked ? '🔒' : '⚽'} disabled={isLocked} onClick={() => onStartMatch && onStartMatch(diff)} />
                  );
                })}
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('local')} />
              </motion.div>
            )}

            {screen === 'online' && (
              <motion.div className="flex flex-col gap-3">
                <p className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-1">Nombre de Entrenador</p>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toUpperCase())}
                  maxLength={12}
                  placeholder="JUGADOR 1"
                  className="bg-black/50 border-2 border-cyan-500/50 text-white rounded-xl p-4 text-center text-2xl font-black uppercase tracking-[0.2em] outline-none focus:border-cyan-400 transition-colors mb-2"
                />

                <MenuButton 
                  title="CREAR PARTIDA" 
                  subtitle="Genera un código de sala" 
                  icon="➕" 
                  onClick={() => {
                    if(username.trim().length > 0) {
                      localStorage.setItem('futarena_username', username.trim());
                      handleCreateRoom();
                    } else {
                      alert("Ingresa un nombre de entrenador");
                    }
                  }} 
                  disabled={isLoading || username.trim().length === 0} 
                />
                <MenuButton 
                  title="UNIRSE A PARTIDA" 
                  subtitle="Ingresa el código de tu amigo" 
                  icon="🔗" 
                  onClick={() => {
                    if(username.trim().length > 0) {
                      localStorage.setItem('futarena_username', username.trim());
                      setScreen('join_room');
                    } else {
                      alert("Ingresa un nombre de entrenador");
                    }
                  }} 
                  disabled={isLoading || username.trim().length === 0} 
                />
                
                {onlineError && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{onlineError}</p>}
                
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('quickplay')} disabled={isLoading} />
              </motion.div>
            )}

            {screen === 'join_room' && (
              <motion.div className="flex flex-col gap-3">
                <p className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-1">Ingresa el código</p>
                <input 
                  type="text" 
                  value={joinCode} 
                  onChange={(e) => setJoinCode(normalizeRoomCode(e.target.value))}
                  maxLength={ROOM_CODE_LENGTH}
                  placeholder="X7B9TQ"
                  className="bg-black/50 border-2 border-cyan-500/50 text-white rounded-xl p-4 text-center text-3xl font-black uppercase tracking-[0.3em] outline-none focus:border-cyan-400 transition-colors"
                />
                {onlineError && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{onlineError}</p>}
                <MenuButton title={isLoading ? "CONECTANDO..." : "ENTRAR A LA CANCHA"} icon="⚡" onClick={handleJoinRoom} disabled={normalizeRoomCode(joinCode).length < ROOM_CODE_LENGTH || isLoading} />
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="CANCELAR" icon="✖" onClick={() => setScreen('online')} disabled={isLoading} />
              </motion.div>
            )}

            {screen === 'waiting_room' && (
              <motion.div className="flex flex-col gap-3 items-center justify-center text-center">
                <p className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-2">Pásale este código a tu rival</p>
                <div className="bg-black/60 border border-white/20 rounded-xl p-6 mb-4 w-full shadow-[inset_0_0_20px_rgba(255,255,255,0.05)]">
                  <h1 className="text-5xl font-black tracking-[0.2em] text-white">{roomCode}</h1>
                </div>
                <motion.p 
                  animate={{ opacity: [0.4, 1, 0.4] }} 
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="text-slate-400 text-sm font-medium tracking-wide"
                >
                  Esperando conexión del rival...
                </motion.p>
                {onlineError && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{onlineError}</p>}
                <div className="h-px w-full bg-transparent my-4"></div>
                <MenuButton title="CANCELAR SALA" icon="✖" onClick={handleCancelRoom} />
              </motion.div>
            )}
          </motion.div>
        )}

        {screen === 'gallery' && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="z-10 w-full h-full flex flex-col pt-8 md:pt-12 pb-6 px-4 md:px-12"
          >
            <div className="flex justify-between items-start mb-6 md:mb-8 max-w-7xl mx-auto w-full shrink-0">
               <div>
                 <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">
                   GALERÍA <span className="text-cyan-400">DE CARTAS</span>
                 </h2>
                 <p className="text-xs md:text-sm text-cyan-500/80 tracking-widest uppercase mt-1">Mostrando {processedDeck.length} Cartas</p>
               </div>
               <button
                 onClick={() => setScreen('main')}
                 className="px-5 py-2 md:px-6 md:py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs md:text-sm font-bold tracking-widest uppercase transition-all hover:bg-white/20 hover:scale-105"
               >
                 VOLVER
               </button>
            </div>

            <div className="max-w-7xl mx-auto w-full shrink-0 flex flex-wrap gap-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-lg">
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] text-cyan-400 font-bold tracking-widest mb-1">POSICIÓN</label>
                <select 
                  value={posFilter} 
                  onChange={(e) => setPosFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="ALL">Todas</option>
                  <option value="POR">Porteros (POR)</option>
                  <option value="DEF">Defensas (DEF)</option>
                  <option value="MED">Medios (MED)</option>
                  <option value="DEL">Delanteros (DEL)</option>
                </select>
              </div>

              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] text-cyan-400 font-bold tracking-widest mb-1">PAÍS</label>
                <select 
                  value={natFilter} 
                  onChange={(e) => setNatFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="ALL">Todos los Países</option>
                  {uniqueNats.map(nat => (
                    <option key={nat} value={nat}>{nat}</option>
                  ))}
                </select>
              </div>

              <div className="flex-1 min-w-[180px]">
                <label className="block text-[10px] text-cyan-400 font-bold tracking-widest mb-1">ORDENAR POR</label>
                <select 
                  value={sortBy} 
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
                >
                  <option value="POS">Por Posición (Defecto)</option>
                  <option value="ATK_DESC">Mayor Ataque</option>
                  <option value="ATK_ASC">Menor Ataque</option>
                  <option value="DEF_DESC">Mayor Defensa</option>
                  <option value="DEF_ASC">Menor Defensa</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto pt-6 px-4 pb-32 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-cyan-500/50 [&::-webkit-scrollbar-thumb]:rounded-full">
              <motion.div 
                variants={galleryContainerVariants}
                initial="hidden"
                animate="show"
                className="flex flex-wrap gap-4 md:gap-8 justify-center"
              >
                {processedDeck.length === 0 ? (
                  <div className="text-slate-400 mt-10 text-lg font-medium tracking-wide">No se encontraron cartas con esos filtros.</div>
                ) : (
                  processedDeck.map(card => (
                    <motion.div 
                      key={card.id} 
                      variants={galleryItemVariants} 
                      className="relative group perspective-1000"
                    >
                      <Card card={card} isGalleryCard />
                    </motion.div>
                  ))
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}