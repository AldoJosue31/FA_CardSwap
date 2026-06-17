import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type OnlineSubmenuProps = {
  isLoading: boolean;
  error: string;
  onCreateRoom: () => void;
  onJoinRoom: () => void;
  onBack: () => void;
};

export default function OnlineSubmenu({
  isLoading,
  error,
  onCreateRoom,
  onJoinRoom,
  onBack,
}: OnlineSubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      <MenuButton
        title="CREAR PARTIDA"
        subtitle="Genera un código de sala"
        icon="➕"
        onClick={onCreateRoom}
        disabled={isLoading}
      />
      <MenuButton
        title="UNIRSE A PARTIDA"
        subtitle="Ingresa el código de tu amigo"
        icon="🔗"
        onClick={onJoinRoom}
        disabled={isLoading}
      />
      {error && <p className="text-red-300 text-xs font-bold tracking-widest uppercase">{error}</p>}
      <Divider />
      <MenuButton title="VOLVER" icon="↩" onClick={onBack} disabled={isLoading} />
    </motion.div>
  );
}
