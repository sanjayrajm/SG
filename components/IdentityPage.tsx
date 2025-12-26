
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onBack: () => void;
  isTamil: boolean;
}

const BASE_URL = "https://sanjayrajm.github.io/SGCALLTAXI-LOGO/";
const RAW_URL = "https://raw.githubusercontent.com/sanjayrajm/SGCALLTAXI-LOGO/main/";

const ASSETS = [
  { id: 'logo', title: 'Official Identity', path: 'logo.png', desc: 'The primary brand mark of SG Call Taxi Kanchipuram.' },
  { id: 'vishnu', title: 'Divyadesam Roadmap', path: 'vishnu_map.png', desc: 'Tactical routing for the 15 sacred Vaishnava sites.' },
  { id: 'shiva', title: 'Sivalayangal Roadmap', path: 'shiva_map.png', desc: 'Spiritual path intelligence for the 12 Shiva temples.' }
];

export const IdentityPage: React.FC<Props> = ({ onBack, isTamil }) => {
  const [loadedAssets, setLoadedAssets] = useState<Record<string, boolean>>({});

  const handleAssetLoad = (id: string) => {
    setLoadedAssets(prev => ({ ...prev, [id]: true }));
  };

  const handleAssetError = (e: React.SyntheticEvent<HTMLImageElement, Event>, path: string) => {
    const target = e.target as HTMLImageElement;
    if (target.src.includes(BASE_URL)) {
      target.src = `${RAW_URL}${path}`;
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950/60 backdrop-blur-xl text-white font-sans p-6 md:p-12 pt-32 relative overflow-x-hidden">
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-20 relative z-10"
      >
        <header className="space-y-6 text-center">
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 hover:text-white transition-all mb-4">
            {isTamil ? '← முகப்பிற்கு' : '← BACK TO MISSION CONTROL'}
          </button>
          <h1 className="text-5xl md:text-9xl font-black italic uppercase tracking-tighter leading-none">
            BRAND<br/><span className="text-yellow-400">IDENTITY.</span>
          </h1>
          <p className="text-slate-500 font-black text-[10px] uppercase tracking-[10px] mt-4">Official Asset Repository Intelligence</p>
        </header>

        <section className="grid grid-cols-1 gap-20 pb-24">
          {ASSETS.map((asset, idx) => (
            <motion.div 
              key={asset.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="flex flex-col lg:flex-row items-center gap-12 bg-white/5 border border-white/10 rounded-[60px] p-8 md:p-16 backdrop-blur-3xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-8 text-8xl opacity-5 font-black italic">0{idx + 1}</div>
                
                <div className="flex-1 space-y-6">
                  <span className="text-yellow-400 font-black text-xs uppercase tracking-[5px]">{asset.title}</span>
                  <h3 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white">{asset.id.toUpperCase()}</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed italic">{asset.desc}</p>
                  <div className="pt-6">
                    <code className="bg-black/40 px-6 py-3 rounded-xl border border-white/5 text-[10px] text-yellow-500 font-mono break-all">
                      {BASE_URL}{asset.path}
                    </code>
                  </div>
                </div>

                <div className="flex-1 w-full min-h-[350px] h-auto lg:h-[450px] bg-black/60 rounded-[40px] border border-white/10 overflow-hidden flex items-center justify-center p-8 group-hover:border-yellow-400/30 transition-all relative">
                  <AnimatePresence>
                    {!loadedAssets[asset.id] && (
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900 flex items-center justify-center z-10"
                      >
                        <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <img 
                    src={`${BASE_URL}${asset.path}`} 
                    className={`max-w-full max-h-full object-contain group-hover:scale-105 transition-all duration-700 block ${loadedAssets[asset.id] ? 'opacity-100' : 'opacity-0'}`}
                    alt={asset.title}
                    onLoad={() => handleAssetLoad(asset.id)}
                    onError={(e) => handleAssetError(e, asset.path)}
                    decoding="async"
                  />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <footer className="text-center py-20 border-t border-white/5">
           <p className="text-[10px] font-black text-white/20 uppercase tracking-[8px]">
             SG CALL TAXI BRAND STANDARDS V5.0
           </p>
        </footer>
      </motion.div>
    </div>
  );
};
