import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type QuickplaySubmenuProps = {
  onLocal: () => void;
  onOnline: () => void;
  onBack: () => void;
};

export default function QuickplaySubmenu({ onLocal, onOnline, onBack }: QuickplaySubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      <MenuButton title="LOCAL" subtitle="Vs CPU o 2 Jugadores" icon="🎮" onClick={onLocal} />
      <MenuButton title="ONLINE" subtitle="Salas privadas con código" icon="🌐" onClick={onOnline} />
      <Divider />
      <MenuButton title="VOLVER" icon="↩" onClick={onBack} />
    </motion.div>
  );
}
