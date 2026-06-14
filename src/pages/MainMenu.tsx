import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type MenuScreen = 'boot' | 'title' | 'main' | 'quickplay' | 'local' | 'difficulty' | 'online' | 'options' | 'credits' | 'support';

const DIFFICULTIES = ['Fácil', 'Normal', 'Difícil', 'Avanzado'];

export default function MainMenu({ initialScreen = 'boot', onStartMatch }: { initialScreen?: MenuScreen, onStartMatch?: (diff: string) => void }) {
  const [screen, setScreen] = useState<MenuScreen>(initialScreen);
  const [unlockedLevel, setUnlockedLevel] = useState<number>(1);

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

  useEffect(() => {
    const handleKeyPress = () => {
      if (screen === 'title') setScreen('main');
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

  return (
    <div className="h-screen w-full bg-[#021812] flex flex-col items-center justify-center font-sans relative overflow-hidden text-white selection:bg-cyan-500/30">
      
      <div className="absolute inset-0 pointer-events-none z-0" style={{ backgroundImage: `repeating-linear-gradient(0deg, rgba(0,0,0,0.1), rgba(0,0,0,0.1) 40px, transparent 40px, transparent 80px), radial-gradient(circle at center, #0a3d24 0%, #021812 100%)` }}></div>
      <div className="absolute inset-0 pointer-events-none z-0 opacity-[0.2]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.5' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>
      <div className="absolute inset-0 shadow-[inset_0_0_200px_rgba(0,0,0,0.9)] pointer-events-none z-0"></div>

      <AnimatePresence mode="wait">
        
        {screen === 'boot' && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            className="z-10 flex flex-col items-center"
          >
            <motion.div 
              initial={{ scale: 0.9, filter: 'blur(10px)' }}
              animate={{ scale: 1, filter: 'blur(0px)' }}
              transition={{ duration: 2, ease: "easeOut" }}
              className="text-center"
            >
              <p className="text-sm tracking-[0.5em] text-cyan-500/80 mb-2 uppercase">Desarrollado por</p>
              <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                KRAVITT STUDIOS
              </h1>
            </motion.div>
          </motion.div>
        )}

        {screen === 'title' && (
          <motion.div
            key="title"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, filter: 'blur(10px)' }}
            transition={{ duration: 1 }}
            className="z-10 flex flex-col items-center w-full h-full justify-center"
          >
            <div className="w-64 h-32 md:w-96 md:h-48 border border-dashed border-white/20 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)] mb-16 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent"></div>
               <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-2xl">
                 <span className="text-white">FUT</span><span className="text-cyan-400">ARENA</span>
               </h1>
            </div>

            <motion.p 
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
              className="text-sm md:text-base tracking-[0.3em] font-medium text-slate-300 uppercase"
            >
              Presiona cualquier tecla
            </motion.p>
          </motion.div>
        )}

        {['main', 'quickplay', 'local', 'difficulty', 'online'].includes(screen) && (
          <motion.div
            key="menus"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="z-10 w-full max-w-md px-6 flex flex-col h-full justify-center"
          >
            <div className="mb-12">
               <h2 className="text-4xl font-black italic tracking-tighter">
                 <span className="text-white">FUT</span><span className="text-cyan-400">ARENA</span>
               </h2>
               <p className="text-xs text-slate-400 tracking-widest mt-1 uppercase">v0.1.0 Alpha</p>
            </div>

            {screen === 'main' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-3">
                <MenuButton title="PARTIDA RÁPIDA" subtitle="Juega sin registro, datos temporales" icon="⚡" onClick={() => setScreen('quickplay')} />
                <MenuButton title="MODO ARCADE" subtitle="Requiere Iniciar Sesión" icon="🔒" disabled={true} />
                <div className="h-px w-full bg-white/10 my-2"></div>
                <MenuButton title="OPCIONES" onClick={() => {}} />
                <MenuButton title="CRÉDITOS" onClick={() => {}} />
                <MenuButton title="APOYAR" icon="☕" onClick={() => {}} />
              </motion.div>
            )}

            {screen === 'quickplay' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                <MenuButton title="LOCAL" subtitle="Vs CPU o 2 Jugadores en esta PC" icon="🎮" onClick={() => setScreen('local')} />
                <MenuButton title="ONLINE" subtitle="Salas privadas mediante enlace o QR" icon="🌐" onClick={() => setScreen('online')} />
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" subtitle="Al Menú Principal" icon="↩" onClick={() => setScreen('main')} />
              </motion.div>
            )}

            {screen === 'local' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                <MenuButton title="VS CPU" subtitle="Entrena contra la máquina" onClick={() => setScreen('difficulty')} />
                <MenuButton title="2 JUGADORES" subtitle="Por turnos en el mismo teclado/pantalla" onClick={() => {}} />
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('quickplay')} />
              </motion.div>
            )}

            {screen === 'difficulty' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                {DIFFICULTIES.map((diff, index) => {
                  const isLocked = index > unlockedLevel;
                  return (
                    <MenuButton 
                      key={diff}
                      title={diff} 
                      subtitle={isLocked ? 'Desbloquea ganando el nivel anterior' : `Jugar en dificultad ${diff}`} 
                      icon={isLocked ? '🔒' : '⚽'} 
                      disabled={isLocked}
                      onClick={() => onStartMatch && onStartMatch(diff)} 
                    />
                  );
                })}
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('local')} />
              </motion.div>
            )}

            {screen === 'online' && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-3">
                <MenuButton title="CREAR PARTIDA" subtitle="Configura reglas y genera un QR de invitación" icon="➕" onClick={() => {}} />
                <MenuButton title="UNIRSE A PARTIDA" subtitle="Ingresa un código de sala" icon="🔗" onClick={() => {}} />
                <div className="h-px w-full bg-transparent my-2"></div>
                <MenuButton title="VOLVER" icon="↩" onClick={() => setScreen('quickplay')} />
              </motion.div>
            )}

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
