
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TAMIL_NADU_DISTRICTS, NEURAL_LOCATION_REGISTRY, DIVYADESAM_TEMPLES, SHIVA_TEMPLES } from '../constants';
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
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const gridContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.01
      }
    }
  };

  const gridItem = {
    hidden: { scale: 0.8, opacity: 0 },
    show: { scale: 1, opacity: 1 }
  };

  // Extract POIs from all registries for the active district
  const activeDistrictData = useMemo(() => {
    const district = selectedDistrict || hoveredDistrict;
    if (!district) return null;

    const fromRegistry = NEURAL_LOCATION_REGISTRY.filter(l => l.district === district);
    const fromDivyadesam = district === 'Kanchipuram' ? DIVYADESAM_TEMPLES.slice(0, 5) : [];
    const fromShiva = district === 'Kanchipuram' ? SHIVA_TEMPLES.slice(0, 5) : [];

    return {
      name: district,
      pois: [
        ...fromRegistry.map(p => ({ name: p.name, type: 'TRANSIT NODE' })),
        ...fromDivyadesam.map(p => ({ name: p.name, type: 'VISHNU TEMPLE' })),
        ...fromShiva.map(p => ({ name: p.name, type: 'SHIVA TEMPLE' }))
      ].slice(0, 8) // Limit for UI density
    };
  }, [selectedDistrict, hoveredDistrict]);

  return (
    <div className={`w-full ${asSection ? 'py-32' : 'min-h-screen pt-12'} bg-slate-950/10 text-white font-sans border-t border-white/5 relative overflow-hidden`}>
      {!asSection && (
        <BackgroundVideo src={TACTICAL_VIDEO_SRC} overlayOpacity="bg-slate-950/60" />
      )}

      <main className={`relative z-10 px-6 md:px-20 max-w-7xl mx-auto flex flex-col gap-16`}>
        <motion.header 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-center lg:text-left"
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
             className="text-6xl md:text-[8rem] font-black italic uppercase tracking-tighter leading-[0.85] whitespace-pre-line"
           >
            {t.heading}
           </motion.h2>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-start">
          {/* Main Grid Sector */}
          <section className="lg:col-span-2 relative">
             <motion.div 
               initial={{ opacity: 0, y: 40 }}
               whileInView={{ opacity: 1, y: 0 }}
               viewport={{ once: true }}
               className="bg-slate-900/40 backdrop-blur-3xl border-2 border-white/5 p-6 md:p-12 rounded-[60px] relative overflow-hidden"
             >
                <div className="absolute inset-0 tactical-grid opacity-5" />
                <motion.div 
                  variants={gridContainer}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, amount: 0.1 }}
                  className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 relative z-10"
                >
                  {TAMIL_NADU_DISTRICTS.map(district => (
                    <motion.div 
                      key={district}
                      variants={gridItem}
                      onHoverStart={() => setHoveredDistrict(district)}
                      onHoverEnd={() => setHoveredDistrict(null)}
                      onClick={() => setSelectedDistrict(selectedDistrict === district ? null : district)}
                      whileHover={{ scale: 1.05, y: -2 }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden group ${
                        selectedDistrict === district 
                        ? 'bg-yellow-400 border-white text-black shadow-yellow-tactical z-20' 
                        : hoveredDistrict === district
                        ? 'bg-white/10 border-yellow-400/50 text-white'
                        : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      {selectedDistrict === district && (
                        <motion.div 
                          layoutId="activeGlow"
                          className="absolute inset-0 bg-white/20"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        />
                      )}
                      <span className="text-[9px] font-black uppercase tracking-widest block relative z-10">{district}</span>
                      <div className="absolute bottom-1 right-2 opacity-10 group-hover:opacity-30 transition-opacity">
                        <span className="text-[10px]">🛰️</span>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
             </motion.div>
          </section>

          {/* Intel Dossier Side Panel */}
          <aside className="sticky top-12 space-y-6 h-full min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeDistrictData ? (
                <motion.div
                  key={activeDistrictData.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-black/60 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 space-y-8 shadow-4xl relative overflow-hidden"
                >
                  <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                      <p className="text-[10px] font-black text-yellow-500 uppercase tracking-[4px]">Sector Intelligence</p>
                    </div>
                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white">
                      {activeDistrictData.name}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest border-b border-white/5 pb-2">Identified Nodes (POIs)</p>
                    <div className="space-y-3">
                      {activeDistrictData.pois.length > 0 ? (
                        activeDistrictData.pois.map((poi, idx) => (
                          <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            className="flex justify-between items-center bg-white/5 p-4 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group"
                          >
                            <div className="truncate pr-4">
                              <p className="text-[10px] font-black text-white uppercase italic truncate">{poi.name}</p>
                              <p className="text-[7px] font-bold text-slate-500 uppercase tracking-widest">{poi.type}</p>
                            </div>
                            <span className="text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                          </motion.div>
                        ))
                      ) : (
                        <div className="py-12 text-center space-y-4">
                          <div className="text-2xl opacity-20">📡</div>
                          <p className="text-[8px] font-black text-slate-700 uppercase tracking-widest">Scanning local sub-nodes...</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {selectedDistrict === activeDistrictData.name && (
                    <button 
                      onClick={() => setSelectedDistrict(null)}
                      className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-[9px] font-black uppercase tracking-[3px] hover:bg-white/10 transition-all text-slate-400"
                    >
                      Clear Selection
                    </button>
                  )}
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-white/5 border-2 border-dashed border-white/10 rounded-[40px] p-12 flex flex-col items-center justify-center text-center space-y-6 h-full"
                >
                  <div className="w-16 h-16 rounded-full border-2 border-white/5 flex items-center justify-center">
                    <span className="text-3xl opacity-20">📍</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Registry Standby</p>
                    <p className="text-[8px] font-bold text-slate-600 uppercase tracking-widest leading-relaxed">
                      Select a tactical sector from the grid to reveal regional intelligence and points of interest.
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </aside>
        </div>
      </main>

      {!asSection && (
        <footer className="text-center py-24 opacity-20 relative z-10 border-t border-white/5 mt-20">
           <p className="text-[10px] font-black uppercase tracking-[15px] italic">SG Neural Link Terminal // 2025</p>
        </footer>
      )}
    </div>
  );
};
