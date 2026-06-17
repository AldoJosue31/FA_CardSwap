import { motion } from 'framer-motion';

type TitleScreenProps = {
  onContinue: () => void;
};

export default function TitleScreen({ onContinue }: TitleScreenProps) {
  return (
    <motion.div
      key="title"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onClick={onContinue}
      className="z-10 flex flex-col items-center w-full h-full justify-center"
    >
      <div className="w-64 h-32 md:w-96 md:h-48 border border-dashed border-white/20 rounded-2xl bg-black/30 backdrop-blur-sm flex items-center justify-center shadow-[0_0_50px_rgba(34,211,238,0.2)] mb-16 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent" />
        <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter drop-shadow-2xl">
          <span className="text-white">FUT</span>
          <span className="text-cyan-400">ARENA</span>
        </h1>
      </div>
      <motion.p
        animate={{ opacity: [0.3, 1, 0.3] }}
        transition={{ repeat: Infinity, duration: 2 }}
        className="text-sm md:text-base tracking-[0.3em] font-medium text-slate-300 uppercase"
      >
        Presiona cualquier tecla
      </motion.p>
    </motion.div>
  );
}
