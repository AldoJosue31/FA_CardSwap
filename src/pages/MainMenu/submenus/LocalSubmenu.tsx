import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type LocalSubmenuProps = {
  onDifficulty: () => void;
  onBack: () => void;
};

export default function LocalSubmenu({ onDifficulty, onBack }: LocalSubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      <MenuButton title="VS CPU" subtitle="Entrena contra la máquina" onClick={onDifficulty} />
      <MenuButton title="2 JUGADORES" subtitle="En esta PC" onClick={() => {}} />
      <Divider />
      <MenuButton title="VOLVER" icon="↩" onClick={onBack} />
    </motion.div>
  );
}
