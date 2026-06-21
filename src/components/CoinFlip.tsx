import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';

interface CoinFlipProps {
  phase: 'coin_spin' | 'coin_result' | 'none';
  resultFace: 'CARA' | 'CRUZ';
  winnerLabel: string;
}

export default function CoinFlip({ phase, resultFace, winnerLabel }: CoinFlipProps) {
  const controls = useAnimation();
  const shadowControls = useAnimation();
  const [showResultText, setShowResultText] = useState(false);

  useEffect(() => {
    if (phase === 'coin_spin') {
      setShowResultText(false);
      
      // FASE 1: Se tira al aire con fuerza y cae al piso
      controls.start({
        y: [0, -350, 100], // Sube mucho hacia la cámara y luego cae "al piso"
        rotateX: [0, 1800, 3600], // Gira brutalmente a alta velocidad
        scale: [1, 2, 0.4], // Se hace gigante al subir y pequeñita al caer
        transition: { 
          duration: 2, 
          times: [0, 0.4, 1], 
          ease: ["easeOut", "easeIn"] 
        }
      });

      // La sombra en el piso reacciona a la altura de la moneda
      shadowControls.start({
        scale: [1, 0.1, 1.2],
        opacity: [0.5, 0.05, 0.9],
        transition: { duration: 2, times: [0, 0.4, 1], ease: ["easeOut", "easeIn"] }
      });

    } else if (phase === 'coin_result') {
      // FASE 2: Rebota del piso, frena en la cara correcta y levita
      // 3600 es múltiplo de 360 (CARA hacia el frente).
      // Le sumamos 360 (1 vuelta) para CARA, o 540 (vuelta y media) para CRUZ.
      const finalRotation = resultFace === 'CARA' ? 3960 : 4140;

      controls.start({
        y: [100, -20], // Rebota suavemente hacia arriba
        rotateX: finalRotation, // Frena matemáticamente en el ángulo exacto
        scale: [0.4, 1.4], // Retoma un tamaño grande y legible
        transition: { 
          type: "spring",
          stiffness: 100,
          damping: 12,
          duration: 1 
        }
      }).then(() => {
        // Efecto de levitación infinita suave
        controls.start({
          y: [-20, -35, -20],
          transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        });
        setShowResultText(true); // Aparece el texto holográfico
      });

      // La sombra se adapta a la levitación
      shadowControls.start({
        scale: [1.2, 0.8],
        opacity: [0.8, 0.4],
        transition: { duration: 1, ease: "easeOut" }
      });
    }
  }, [phase, resultFace, controls, shadowControls]);

  if (phase === 'none') return null;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center z-[110] pointer-events-none">
      <p className="absolute top-[20%] text-sm text-cyan-400 font-bold tracking-[0.4em] uppercase opacity-70 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
        Sorteo de Posesión
      </p>

      {/* CONTENEDOR 3D */}
      <div className="relative w-32 h-32 md:w-48 md:h-48 flex items-center justify-center perspective-1000 mt-10">
        <motion.div 
          animate={controls}
          className="relative w-full h-full transform-gpu"
          style={{ transformStyle: 'preserve-3d' }}
        >
          {/* FRENTE: CARA (ORO PREMIUM - LOCAL) */}
          <div 
            className="absolute inset-0 rounded-full border-[8px] md:border-[12px] border-yellow-600 bg-gradient-to-br from-yellow-100 via-yellow-500 to-yellow-900 flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(133,77,14,0.8),0_10px_25px_rgba(0,0,0,0.5)]" 
            style={{ backfaceVisibility: 'hidden' }}
          >
            {/* Detalle interno */}
            <div className="absolute inset-1.5 md:inset-2.5 rounded-full border border-yellow-200/80 shadow-[0_0_10px_rgba(253,224,71,0.5)]"></div>
            <div className="absolute inset-3 md:inset-4 rounded-full border border-yellow-400/60 border-dashed animate-[spin_15s_linear_infinite]"></div>

            <div className="flex flex-col items-center justify-center z-10 transform -translate-y-1">
              <span className="text-3xl md:text-5xl font-black italic text-yellow-950 tracking-tighter drop-shadow-[0_2px_1px_rgba(255,255,255,0.4)]">FUT</span>
              <span className="text-sm md:text-xl font-bold text-yellow-100 tracking-[0.3em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] -mt-1 md:-mt-2">ARENA</span>
              <div className="w-12 h-1 bg-gradient-to-r from-transparent via-yellow-200 to-transparent mt-1 opacity-50"></div>
              <span className="text-[9px] md:text-[11px] text-yellow-900 font-black tracking-widest mt-1">CARA</span>
            </div>
          </div>

          {/* ESPALDA: CRUZ (PLATA CIBERNÉTICA - VISITANTE) */}
          <div 
            className="absolute inset-0 rounded-full border-[8px] md:border-[12px] border-slate-400 bg-gradient-to-br from-slate-100 via-slate-400 to-slate-800 flex flex-col items-center justify-center shadow-[inset_0_0_30px_rgba(15,23,42,0.8),0_10px_25px_rgba(0,0,0,0.5)]" 
            style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)' }}
          >
            {/* Detalle interno */}
            <div className="absolute inset-1.5 md:inset-2.5 rounded-full border border-cyan-200/80 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
            <div className="absolute inset-3 md:inset-4 rounded-full border border-cyan-400/60 border-dashed animate-[spin_15s_linear_infinite_reverse]"></div>

            <div className="flex flex-col items-center justify-center z-10 transform translate-y-1">
              <svg viewBox="0 0 24 24" className="w-10 h-10 md:w-14 md:h-14 text-slate-800 drop-shadow-[0_2px_1px_rgba(255,255,255,0.6)] mb-1" fill="currentColor">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm0 2a7.973 7.973 0 0 1 2.37.362l-2.016 3.109L9.63 7.15Zm-3.131.764 2.3 2.684L8.76 10.42H4.4A8.026 8.026 0 0 1 8.869 4.764Zm-4.66 6.816h3.918l1.328 1.93-1.616 2.5H4.167A8.006 8.006 0 0 1 4.209 11.58Zm1.968 5.679h3.19l1.616-2.5 1.017 1.564v3.58a8.03 8.03 0 0 1-5.823-2.644Zm7.023 2.72v-3.876l2.42-1.745 2.42 1.745v3.876a8.016 8.016 0 0 1-4.84 0Zm5.623-2.72a8.03 8.03 0 0 1-5.823 2.644v-3.58l1.017-1.564 1.616 2.5h3.19Zm-1.968-5.679a8.006 8.006 0 0 1 .042 4.166h-3.64l-1.616-2.5 1.328-1.93h3.918Zm-3.41-1.16H10.57L9.24 8.5h5.52l-1.32 1.93Zm-3.268-3.664L9.63 7.15l-2.724.316A7.973 7.973 0 0 1 12 4a7.973 7.973 0 0 1 2.37.362l-2.016 3.109-2.724-.316Z" />
              </svg>
              <span className="text-[9px] md:text-[11px] text-cyan-200 font-black tracking-widest uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">CRUZ</span>
            </div>
          </div>
        </motion.div>

        {/* SOMBRA DINÁMICA */}
        <motion.div 
          animate={shadowControls}
          className="absolute -bottom-24 md:-bottom-32 left-1/2 -translate-x-1/2 w-20 md:w-32 h-4 md:h-6 bg-black/90 rounded-[100%] blur-md"
        />
      </div>

      {/* TEXTO DE RESULTADO (Aparece con resplandor tipo Glassmorphism) */}
      <AnimatePresence>
        {showResultText && phase === 'coin_result' && (
          <motion.div 
            initial={{ opacity: 0, y: 30, scale: 0.8 }} 
            animate={{ opacity: 1, y: 0, scale: 1 }} 
            exit={{ opacity: 0 }}
            className="absolute top-[65%] flex flex-col items-center"
          >
             <h3 className="text-6xl md:text-7xl font-black text-white tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.7)] uppercase text-center">
               {resultFace}
             </h3>
             <p className="text-yellow-300 mt-4 text-sm md:text-lg tracking-[0.2em] md:tracking-[0.3em] font-bold text-center bg-black/60 px-8 py-3 rounded-full border border-white/20 backdrop-blur-md shadow-[0_15px_30px_rgba(0,0,0,0.9)]">
               {winnerLabel} TIENE EL BALÓN
             </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}