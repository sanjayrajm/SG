
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
  isTamil: boolean;
}

const BASE_URL = "https://sanjayrajm.github.io/SGCALLTAXI-LOGO/";

const ASSETS = [
  { 
    id: 'logo', 
    title: 'Brand Mark', 
    path: 'logo.png', 
    desc: 'The official SG Call Taxi signature. Represents precision and reliability in the Kanchipuram grid.',
    color: '#FFC107'
  },
  { 
    id: 'vishnu', 
    title: 'Divyadesam Roadmap', 
    path: 'vishnu_map.png', 
    desc: 'Neural mapping for the 15 sacred Vishnu Divyadesam nodes. Optimized for spiritual sequence.',
    color: '#FFC107'
  },
  { 
    id: 'shiva', 
    title: 'Sivalayangal Roadmap', 
    path: 'shiva_map.png', 
    desc: 'Strategic intelligence for the 12 sacred Shiva temples. Structured for cosmic alignment.',
    color: '#ff9800'
  }
];

export const IdentityPage: React.FC<Props> = ({ onBack, isTamil }) => {
  const [loadedAssets, setLoadedAssets] = useState<Record<string, boolean>>({});

  return (
    <div className="w-full text-white font-sans p-6 md:p-12 relative overflow-x-hidden">
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-20 relative z-10 pb-24"
      >
        <header className="space-y-6 text-center">
          <h1 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">
            IDENTITY<br/><span className="text-yellow-400">BLUEPRINTS.</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[10px] mt-4">Official Asset Intelligence Hub</p>
        </header>

        <section className="grid grid-cols-1 gap-12 pb-24">
          {ASSETS.map((asset, idx) => (
            <motion.div 
              key={asset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/5 border border-white/10 rounded-[60px] p-8 md:p-16 backdrop-blur-3xl overflow-hidden relative group-hover:border-white/20 transition-all">
                <div className="absolute top-0 right-0 p-8 text-9xl opacity-5 font-black italic" style={{ color: asset.color }}>0{idx + 1}</div>
                
                <div className="flex-1 space-y-6 relative z-10 text-center lg:text-left">
                  <span className="font-black text-xs uppercase tracking-[5px]" style={{ color: asset.color }}>{asset.title}</span>
                  <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">{asset.id.toUpperCase()}</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed italic max-w-md mx-auto lg:mx-0">{asset.desc}</p>
                  <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                    <a 
                      href={`${BASE_URL}${asset.path}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="bg-white/10 px-8 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[3px] hover:bg-white hover:text-black transition-all"
                    >
                      View Source Signal
                    </a>
                    <button 
                      onClick={() => window.open(`${BASE_URL}${asset.path}`, '_blank')}
                      className="px-8 py-4 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-[3px] hover:border-yellow-400 transition-all"
                    >
                      Download Identity
                    </button>
                  </div>
                </div>

                <div className="flex-1 w-full aspect-square md:aspect-video lg:h-[450px] bg-black/60 rounded-[40px] border border-white/5 overflow-hidden flex items-center justify-center p-8 group-hover:border-yellow-400/30 transition-all relative">
                  <AnimatePresence>
                    {!loadedAssets[asset.id] && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-slate-950 flex items-center justify-center z-10">
                        <div className="w-10 h-10 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <img 
                    src={`${BASE_URL}${asset.path}`} 
                    className={`max-w-full max-h-full object-contain group-hover:scale-105 transition-all duration-1000 block ${loadedAssets[asset.id] ? 'opacity-100' : 'opacity-0'}`}
                    alt={asset.title}
                    onLoad={() => setLoadedAssets(prev => ({ ...prev, [asset.id]: true }))}
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <footer className="text-center py-20 border-t border-white/5">
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[15px] italic">
             SG CALL TAXI BRAND_CORE_INTEL 2025
           </p>
        </footer>
      </motion.div>
    </div>
  );
};
