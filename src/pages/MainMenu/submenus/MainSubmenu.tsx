import { motion } from 'framer-motion';
import Divider from '../components/Divider';
import MenuButton from '../components/MenuButton';

type MainSubmenuProps = {
  onQuickplay: () => void;
  onGallery: () => void;
};

export default function MainSubmenu({ onQuickplay, onGallery }: MainSubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      <MenuButton title="PARTIDA RÁPIDA" subtitle="Juega sin registro" icon="⚡" onClick={onQuickplay} />
      <MenuButton title="MODO ARCADE" subtitle="Requiere Iniciar Sesión" icon="🔒" disabled />
      <MenuButton title="GALERÍA DE CARTAS" subtitle="Filtros y colecciones" icon="📚" onClick={onGallery} />
      <Divider visible />
      <MenuButton title="OPCIONES" onClick={() => {}} />
      <MenuButton title="CRÉDITOS" onClick={() => {}} />
      <MenuButton title="APOYAR" icon="☕" onClick={() => {}} />
    </motion.div>
  );
}
