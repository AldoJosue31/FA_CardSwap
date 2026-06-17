import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type WaitingRoomSubmenuProps = {
  roomCode: string;
  error: string;
  onCancelRoom: () => void;
};

export default function WaitingRoomSubmenu({ roomCode, error, onCancelRoom }: WaitingRoomSubmenuProps) {
  return (
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
      {error && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{error}</p>}
      <Divider spacing="my-4" />
      <MenuButton title="CANCELAR SALA" icon="✖" onClick={onCancelRoom} />
    </motion.div>
  );
}
