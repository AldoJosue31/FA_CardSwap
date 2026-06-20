import { motion } from 'framer-motion';
import MenuButton from '../components/MenuButton';
import Divider from '../components/Divider';

type OptionsSubmenuProps = {
  onBack: () => void;
  globalVolume: number;
  handleVolumeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
};

export default function OptionsSubmenu({ onBack, globalVolume, handleVolumeChange }: OptionsSubmenuProps) {
  return (
    <motion.div className="flex flex-col gap-3">
      <div className="bg-black/40 border border-white/10 rounded-xl p-6 backdrop-blur-md shadow-[0_4px_15px_rgba(0,0,0,0.3)] text-left mb-2">
        <h3 className="text-lg font-black text-cyan-400 mb-4 tracking-widest uppercase">Ajustes de Sonido</h3>
        
        <div className="flex flex-col gap-3">
          <div className="flex justify-between items-center text-sm font-bold text-white uppercase tracking-widest">
            <span>Música de Fondo</span>
            <span className="text-cyan-400">{Math.round(globalVolume * 100)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={globalVolume}
            onChange={handleVolumeChange}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500 hover:accent-cyan-400"
          />
        </div>
      </div>

      <Divider visible />
      <MenuButton title="VOLVER" icon="↩" onClick={onBack} />
    </motion.div>
  );
}