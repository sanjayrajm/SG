import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { TAMIL_NADU_DISTRICTS } from '../constants';
import { BackgroundVideo } from './BackgroundVideo';

interface Props {
  onBack: () => void;
  asSection?: boolean;
  t: any;
  common: any;
}

const TACTICAL_VIDEO_SRC = "https://sanjayrajm.github.io/taxi-video-website/taxi-video.mp4";

export const LocationPage: React.FC<Props> = ({ onBack, asSection = false, t, common }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);

  const gridContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.02
      }
    }
  };

  const gridItem = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  return (
    <div className={`w-full ${asSection ? 'py-32' : 'min-h-screen pt-32'} bg-slate-950/10 text-white font-sans border-t border-white/5 relative overflow-hidden`}>
      {!asSection && (
        <BackgroundVideo src={TACTICAL_VIDEO_SRC} overlayOpacity="bg-slate-950/40" />
      )}

      {!asSection && (
        <nav className="fixed top-0 left-0 right-0 z-[100] p-6 md:px-12 flex justify-between items-center bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={onBack} 
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] hover:text-yellow-400 transition-all group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> {common.backHome}
          </motion.button>
        </nav>
      )}

      <main className={`relative z-10 px-6 md:px-20 max-w-7xl mx-auto flex flex-col gap-16 md:gap-32`}>
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-center"
        >
           <motion.span 
             initial={{ opacity: 0 }}
             whileInView={{ opacity: 1 }}
             transition={{ delay: 0.3 }}
             className="text-[10px] font-black text-yellow-500 uppercase tracking-[10px] block"
           >
            {t.subheading}
           </motion.span>
           <motion.h2 
             initial={{ opacity: 0, scale: 0.95 }} 
             whileInView={{ opacity: 1, scale: 1 }} 
             className="text-6xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.85] whitespace-pre-line"
           >
            {t.heading}
           </motion.h2>
        </motion.header>

        <section className="relative px-6">
           <motion.div 
             initial={{ opacity: 0, y: 40 }}
             whileInView={{ opacity: 1, y: 0 }}
             viewport={{ once: true }}
             className="bg-slate-900/40 backdrop-blur-3xl border-2 border-white/5 p-8 md:p-20 rounded-[80px] relative overflow-hidden"
           >
              <div className="absolute inset-0 tactical-grid opacity-5" />
              <motion.div 
                variants={gridContainer}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, amount: 0.1 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-5 relative z-10"
              >
                {TAMIL_NADU_DISTRICTS.map(district => (
                  <motion.div 
                    key={district}
                    variants={gridItem}
                    onHoverStart={() => setHoveredDistrict(district)}
                    onHoverEnd={() => setHoveredDistrict(null)}
                    whileHover={{ scale: 1.05, y: -5, boxShadow: '0 0 20px rgba(255, 193, 7, 0.2)' }}
                    className={`p-4 md:p-6 rounded-3xl border transition-all cursor-pointer ${
                      hoveredDistrict === district 
                      ? 'bg-yellow-400 border-white text-black shadow-2xl' 
                      : 'bg-white/5 border-white/10 text-slate-400'
                    }`}
                  >
                    <span className="text-[9px] font-black uppercase tracking-widest block">{district}</span>
                  </motion.div>
                ))}
              </motion.div>
           </motion.div>
        </section>
      </main>
    </div>
  );
};