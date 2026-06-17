import { motion } from 'framer-motion';

export default function BootScreen() {
  return (
    <motion.div
      key="boot"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="z-10 flex flex-col items-center"
    >
      <motion.div
        initial={{ scale: 0.9, filter: 'blur(10px)' }}
        animate={{ scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 2 }}
        className="text-center"
      >
        <p className="text-sm tracking-[0.5em] text-cyan-500/80 mb-2 uppercase">Desarrollado por</p>
        <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
          KRAVITT STUDIOS
        </h1>
      </motion.div>
    </motion.div>
  );
}
