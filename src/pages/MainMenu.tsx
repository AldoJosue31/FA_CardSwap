import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { MOCK_DECK } from '../gameData';
import { supabase } from '../supabaseClient';
import { MENU_SCREENS, POSITION_ORDER, ROOM_CODE_LENGTH } from './MainMenu/constants';
import MenuHeader from './MainMenu/components/MenuHeader';
import BootScreen from './MainMenu/screens/BootScreen';
import TitleScreen from './MainMenu/screens/TitleScreen';
import MainSubmenu from './MainMenu/submenus/MainSubmenu';
import QuickplaySubmenu from './MainMenu/submenus/QuickplaySubmenu';
import LocalSubmenu from './MainMenu/submenus/LocalSubmenu';
import DifficultySubmenu from './MainMenu/submenus/DifficultySubmenu';
import OnlineSubmenu from './MainMenu/submenus/OnlineSubmenu';
import JoinRoomSubmenu from './MainMenu/submenus/JoinRoomSubmenu';
import WaitingRoomSubmenu from './MainMenu/submenus/WaitingRoomSubmenu';
import GalleryScreen from './MainMenu/gallery/GalleryScreen';
import type { MainMenuProps, MenuScreen, OnlineRoom } from './MainMenu/types';
import { createRoomCode, normalizeRoomCode } from './MainMenu/utils';

export default function MainMenu({
  initialScreen = 'boot',
  onStartMatch,
  onStartOnlineMatch,
}: MainMenuProps) {
  const [screen, setScreen] = useState<MenuScreen>(initialScreen);
  const [unlockedLevel] = useState(() => {
    const saved = localStorage.getItem('futarena_unlocked_level');
    return saved ? parseInt(saved, 10) : 1;
  });

  const [posFilter, setPosFilter] = useState('ALL');
  const [natFilter, setNatFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('POS');

  const [joinCode, setJoinCode] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [onlineError, setOnlineError] = useState('');
  const roomChannelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (screen === 'boot') {
      const timer = setTimeout(() => setScreen('title'), 3500);
      return () => clearTimeout(timer);
    }
  }, [screen]);

  useEffect(() => {
    const handleKeyPress = () => {
      if (screen === 'title') setScreen('main');
    };

    if (screen === 'title') {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
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
    onStartOnlineMatch?.(code, isHost);
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
        },
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
      await supabase.from('online_rooms').update({ status: 'finished' }).eq('short_code', code).eq('status', 'waiting');
    }
  };

  const uniqueNats = useMemo(() => {
    const nats = new Set(MOCK_DECK.map((card) => card.nationality));
    return Array.from(nats).sort();
  }, []);

  const processedDeck = useMemo(() => {
    let deck = [...MOCK_DECK];

    if (posFilter !== 'ALL') deck = deck.filter((card) => card.pos === posFilter);
    if (natFilter !== 'ALL') deck = deck.filter((card) => card.nationality === natFilter);

    if (sortBy === 'POS') deck.sort((a, b) => (POSITION_ORDER[a.pos] || 99) - (POSITION_ORDER[b.pos] || 99));
    if (sortBy === 'ATK_DESC') deck.sort((a, b) => b.atk - a.atk);
    if (sortBy === 'ATK_ASC') deck.sort((a, b) => a.atk - b.atk);
    if (sortBy === 'DEF_DESC') deck.sort((a, b) => b.def - a.def);
    if (sortBy === 'DEF_ASC') deck.sort((a, b) => a.def - b.def);

    return deck;
  }, [posFilter, natFilter, sortBy]);

  const renderSubmenu = () => {
    switch (screen) {
      case 'main':
        return <MainSubmenu onQuickplay={() => setScreen('quickplay')} onGallery={() => setScreen('gallery')} />;
      case 'quickplay':
        return (
          <QuickplaySubmenu
            onLocal={() => setScreen('local')}
            onOnline={() => setScreen('online')}
            onBack={() => setScreen('main')}
          />
        );
      case 'local':
        return <LocalSubmenu onDifficulty={() => setScreen('difficulty')} onBack={() => setScreen('quickplay')} />;
      case 'difficulty':
        return (
          <DifficultySubmenu
            unlockedLevel={unlockedLevel}
            onStartMatch={onStartMatch}
            onBack={() => setScreen('local')}
          />
        );
      case 'online':
        return (
          <OnlineSubmenu
            isLoading={isLoading}
            error={onlineError}
            onCreateRoom={handleCreateRoom}
            onJoinRoom={() => setScreen('join_room')}
            onBack={() => setScreen('quickplay')}
          />
        );
      case 'join_room':
        return (
          <JoinRoomSubmenu
            joinCode={joinCode}
            isLoading={isLoading}
            error={onlineError}
            onChangeJoinCode={setJoinCode}
            onJoinRoom={handleJoinRoom}
            onCancel={() => setScreen('online')}
          />
        );
      case 'waiting_room':
        return <WaitingRoomSubmenu roomCode={roomCode} error={onlineError} onCancelRoom={handleCancelRoom} />;
      default:
        return null;
    }
  };

  return (
    <div className="h-screen w-full bg-[#021812] flex flex-col items-center justify-center font-sans relative overflow-hidden text-white selection:bg-cyan-500/30">
      <div
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 40px, transparent 40px, transparent 80px), radial-gradient(circle at center, #0a3d24 0%, #021812 100%)',
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none z-0 opacity-[0.2]"
        style={{
          backgroundImage:
            'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'1.5\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
        }}
      />
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] pointer-events-none z-0" />

      <AnimatePresence mode="wait">
        {screen === 'boot' && <BootScreen />}
        {screen === 'title' && <TitleScreen onContinue={() => setScreen('main')} />}

        {MENU_SCREENS.includes(screen) && (
          <motion.div
            key="menus"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="z-10 w-full max-w-md px-6 flex flex-col h-full justify-center"
          >
            <MenuHeader />
            {renderSubmenu()}
          </motion.div>
        )}

        {screen === 'gallery' && (
          <GalleryScreen
            cards={processedDeck}
            uniqueNats={uniqueNats}
            posFilter={posFilter}
            natFilter={natFilter}
            sortBy={sortBy}
            onPosFilterChange={setPosFilter}
            onNatFilterChange={setNatFilter}
            onSortByChange={setSortBy}
            onBack={() => setScreen('main')}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
