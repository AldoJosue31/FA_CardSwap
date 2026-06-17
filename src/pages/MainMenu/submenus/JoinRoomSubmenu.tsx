import { motion } from 'framer-motion';
import { ROOM_CODE_LENGTH } from '../constants';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';
import { normalizeRoomCode } from '../utils';

type JoinRoomSubmenuProps = {
  joinCode: string;
  isLoading: boolean;
  error: string;
  onChangeJoinCode: (code: string) => void;
  onJoinRoom: () => void;
  onCancel: () => void;
};

export default function JoinRoomSubmenu({
  joinCode,
  isLoading,
  error,
  onChangeJoinCode,
  onJoinRoom,
  onCancel,
}: JoinRoomSubmenuProps) {
  const canJoin = normalizeRoomCode(joinCode).length === ROOM_CODE_LENGTH && !isLoading;

  return (
    <motion.div className="flex flex-col gap-3">
      <p className="text-cyan-400 font-bold tracking-widest text-xs uppercase mb-1">Ingresa el código</p>
      <input
        type="text"
        value={joinCode}
        onChange={(event) => onChangeJoinCode(normalizeRoomCode(event.target.value))}
        maxLength={ROOM_CODE_LENGTH}
        placeholder="X7B9TQ"
        className="bg-black/50 border-2 border-cyan-500/50 text-white rounded-xl p-4 text-center text-3xl font-black uppercase tracking-[0.3em] outline-none focus:border-cyan-400 transition-colors"
      />
      {error && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{error}</p>}
      <MenuButton
        title={isLoading ? 'CONECTANDO...' : 'ENTRAR A LA CANCHA'}
        icon="⚡"
        onClick={onJoinRoom}
        disabled={!canJoin}
      />
      <Divider />
      <MenuButton title="CANCELAR" icon="✖" onClick={onCancel} disabled={isLoading} />
    </motion.div>
  );
}
