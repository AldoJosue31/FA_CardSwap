import { motion } from 'framer-motion';
import { DIFFICULTIES } from '../constants';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type DifficultySubmenuProps = {
  unlockedLevel: number;
  onStartMatch?: (diff: string) => void;
  onBack: () => void;
};

export default function DifficultySubmenu({ unlockedLevel, onStartMatch, onBack }: DifficultySubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      {DIFFICULTIES.map((diff, index) => {
        const isLocked = index > unlockedLevel;

        return (
          <MenuButton
            key={diff}
            title={diff}
            subtitle={isLocked ? 'Bloqueado' : `Jugar en ${diff}`}
            icon={isLocked ? '🔒' : '⚽'}
            disabled={isLocked}
            onClick={() => onStartMatch?.(diff)}
          />
        );
      })}
      <Divider />
      <MenuButton title="VOLVER" icon="↩" onClick={onBack} />
    </motion.div>
  );
}
