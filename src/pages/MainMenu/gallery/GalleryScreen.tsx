import { motion, type Variants } from 'framer-motion';
import { memo, type CSSProperties } from 'react';
import type { CardData } from '../../../gameData';
import Card from '../../../components/Card';

type GalleryScreenProps = {
  cards: CardData[];
  uniqueNats: string[];
  posFilter: string;
  natFilter: string;
  sortBy: string;
  onPosFilterChange: (value: string) => void;
  onNatFilterChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onBack: () => void;
};

const galleryContainerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const galleryItemVariants: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 300, damping: 24 },
  },
};

const cardShellStyle: CSSProperties = {
  contain: 'layout style',
  overflow: 'visible',
};

const scrollAreaStyle: CSSProperties = {
  contain: 'layout paint style',
  overscrollBehavior: 'contain',
  WebkitOverflowScrolling: 'touch',
};

const GalleryCard = memo(function GalleryCard({ card }: { card: CardData }) {
  return (
    <motion.div
      variants={galleryItemVariants}
      whileHover={{ zIndex: 50 }}
      style={cardShellStyle}
      className="relative group perspective-1000 w-28 h-40 md:w-40 md:h-56 shrink-0 overflow-visible"
    >
      <Card card={card} isGalleryCard />
    </motion.div>
  );
});

export default function GalleryScreen({
  cards,
  uniqueNats,
  posFilter,
  natFilter,
  sortBy,
  onPosFilterChange,
  onNatFilterChange,
  onSortByChange,
  onBack,
}: GalleryScreenProps) {
  return (
    <motion.div
      key="gallery"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="z-10 w-full h-full flex flex-col pt-8 md:pt-12 pb-6 px-4 md:px-12"
    >
      <div className="flex justify-between items-start mb-6 md:mb-8 max-w-7xl mx-auto w-full shrink-0">
        <div>
          <h2 className="text-3xl md:text-5xl font-black italic tracking-tighter text-white drop-shadow-lg">
            GALERÍA <span className="text-cyan-400">DE CARTAS</span>
          </h2>
          <p className="text-xs md:text-sm text-cyan-500/80 tracking-widest uppercase mt-1">
            Mostrando {cards.length} Cartas
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-5 py-2 md:px-6 md:py-3 bg-white/10 text-white border border-white/20 rounded-xl text-xs md:text-sm font-bold tracking-widest uppercase transition-all hover:bg-white/20 hover:scale-105"
        >
          VOLVER
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full shrink-0 flex flex-wrap gap-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/10 backdrop-blur-md shadow-lg">
        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] text-cyan-400 font-bold tracking-widest mb-1">POSICIÓN</label>
          <select
            value={posFilter}
            onChange={(event) => onPosFilterChange(event.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="ALL">Todas</option>
            <option value="POR">Porteros (POR)</option>
            <option value="DEF">Defensas (DEF)</option>
            <option value="MED">Medios (MED)</option>
            <option value="DEL">Delanteros (DEL)</option>
          </select>
        </div>

        <div className="flex-1 min-w-[140px]">
          <label className="block text-[10px] text-cyan-400 font-bold tracking-widest mb-1">PAÍS</label>
          <select
            value={natFilter}
            onChange={(event) => onNatFilterChange(event.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="ALL">Todos los Países</option>
            {uniqueNats.map((nat) => (
              <option key={nat} value={nat}>
                {nat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 min-w-[180px]">
          <label className="block text-[10px] text-cyan-400 font-bold tracking-widest mb-1">ORDENAR POR</label>
          <select
            value={sortBy}
            onChange={(event) => onSortByChange(event.target.value)}
            className="w-full bg-slate-900 border border-white/10 text-white rounded-lg px-3 py-2 text-sm outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="POS">Por Posición (Defecto)</option>
            <option value="ATK_DESC">Mayor Ataque</option>
            <option value="ATK_ASC">Menor Ataque</option>
            <option value="DEF_DESC">Mayor Defensa</option>
            <option value="DEF_ASC">Menor Defensa</option>
          </select>
        </div>
      </div>

      <div
        style={scrollAreaStyle}
        className="flex-1 overflow-y-auto w-full max-w-7xl mx-auto pt-10 px-6 pb-32 scroll-smooth [scrollbar-gutter:stable] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black/20 [&::-webkit-scrollbar-thumb]:bg-cyan-500/50 [&::-webkit-scrollbar-thumb]:rounded-full"
      >
        <motion.div
          variants={galleryContainerVariants}
          initial="hidden"
          animate="show"
          className="flex flex-wrap gap-4 md:gap-8 justify-center"
        >
          {cards.length === 0 ? (
            <div className="text-slate-400 mt-10 text-lg font-medium tracking-wide">
              No se encontraron cartas con esos filtros.
            </div>
          ) : (
            cards.map((card) => <GalleryCard key={card.id} card={card} />)
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
