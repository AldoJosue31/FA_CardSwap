import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type OnlineSubmenuProps = {
  isLoading: boolean;
  error: string;
  username: string; // NUEVO
  setUsername: (val: string) => void; // NUEVO
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
};

export default function OnlineSubmenu({
  isLoading,
  error,
  username,
  setUsername,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: OnlineSubmenuProps) {
  // Solo se puede jugar si el nombre no está vacío
  const isNameValid = username.trim().length > 0;

  return (
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
        onClick={onCreateRoom}
        disabled={isLoading || !isNameValid}
      />
      <MenuButton
        title="UNIRSE A PARTIDA"
        subtitle="Ingresa el código de tu amigo"
        icon="🔗"
        onClick={onJoinRoom}
        disabled={isLoading || !isNameValid}
      />
      {error && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{error}</p>}
      <Divider />
      <MenuButton title="VOLVER" icon="↩" onClick={onBack} disabled={isLoading} />
    </motion.div>
  );
}