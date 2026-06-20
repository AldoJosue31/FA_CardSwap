import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type MainSubmenuProps = {
  onQuickplay: () => void;
  onGallery: () => void;
  onOptions: () => void; // AÑADIDO
};

export default function MainSubmenu({ onQuickplay, onGallery, onOptions }: MainSubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      <MenuButton title="PARTIDA RÁPIDA" subtitle="Juega sin registro" icon="⚡" onClick={onQuickplay} />
      <MenuButton title="MODO ARCADE" subtitle="Requiere Iniciar Sesión" icon="🔒" disabled />
      <MenuButton title="GALERÍA DE CARTAS" subtitle="Filtros y colecciones" icon="📚" onClick={onGallery} />
      <Divider visible />
      <MenuButton title="OPCIONES" icon="⚙️" onClick={onOptions} />
      <MenuButton title="CRÉDITOS" onClick={() => {}} />
      <MenuButton title="APOYAR" icon="☕" onClick={() => {}} />
    </motion.div>
  );
}