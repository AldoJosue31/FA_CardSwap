import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

type MenuButtonProps = {
  title: string;
  subtitle?: string;
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
};

export default function MenuButton({
  title,
  subtitle,
  onClick,
  disabled = false,
  icon = '',
}: MenuButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02, x: 10, backgroundColor: 'rgba(255,255,255,0.1)' } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={!disabled ? onClick : undefined}
      className={`w-full text-left p-4 rounded-xl border flex items-center justify-between transition-colors
        ${
          disabled
            ? 'bg-black/20 border-white/5 opacity-50 cursor-not-allowed'
            : 'bg-black/40 border-white/10 hover:border-cyan-500/50 cursor-pointer backdrop-blur-sm shadow-[0_4px_15px_rgba(0,0,0,0.3)]'
        }`}
    >
      <div>
        <h3 className={`text-xl font-black tracking-wide ${disabled ? 'text-slate-500' : 'text-white'}`}>
          {title}
        </h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">{subtitle}</p>}
      </div>
      <div className="text-2xl opacity-70">{icon}</div>
    </motion.button>
  );
}
