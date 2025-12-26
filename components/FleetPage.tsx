import React from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';
import { BackgroundVideo } from './BackgroundVideo';

interface Props {
  vehicles: Vehicle[];
  onBack: () => void;
  onBook: () => void;
  onViewTariff?: (vehicle: Vehicle) => void;
  asSection?: boolean;
  t: any;
  common: any;
}

const TACTICAL_VIDEO_SRC = "https://sanjayrajm.github.io/taxi-video-website/taxi-video.mp4";

export const FleetPage: React.FC<Props> = ({ vehicles, onBack, onBook, onViewTariff, asSection = false, t, common }) => {
  return (
    <div className={`w-full ${asSection ? 'py-24' : 'min-h-screen pt-32'} bg-slate-950/5 text-white font-sans relative overflow-x-hidden`}>
      {!asSection && (
        <BackgroundVideo src={TACTICAL_VIDEO_SRC} overlayOpacity="bg-slate-950/40" />
      )}

      {!asSection && (
        <nav className="fixed top-0 left-0 right-0 z-[100] p-6 md:px-12 flex justify-between items-center bg-slate-950/80 backdrop-blur-3xl border-b border-white/5">
          <motion.button 
            whileHover={{ x: -5 }}
            onClick={onBack} 
            className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] hover:text-yellow-400 transition-all group"
          >
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> {common.backHome}
          </motion.button>
        </nav>
      )}

      <main className={`relative z-10 px-6 md:px-20 max-w-7xl mx-auto space-y-24`}>
        <motion.header 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-center lg:text-left"
        >
           <h2 className="text-6xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.85] whitespace-pre-line">{t.heading}</h2>
           <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[8px]">{t.subheading}</p>
        </motion.header>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16"
        >
          {vehicles.map((v) => (
            <motion.div 
              key={v.id}
              whileHover={{ y: -10 }}
              className="bg-slate-900/60 backdrop-blur-3xl rounded-[60px] p-10 border border-white/10 flex flex-col shadow-2xl group relative overflow-hidden"
            >
              <div className="h-48 lg:h-64 bg-black/40 rounded-[40px] mb-8 flex items-center justify-center p-6 border border-white/5">
                <img 
                  src={v.image} 
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-700" 
                  alt={v.type} 
                />
              </div>
              
              <h3 className="text-3xl font-black mb-4 uppercase italic tracking-tighter">{v.type}</h3>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">{v.models.join(' • ')}</p>
              
              <div className="mt-auto space-y-4">
                <motion.button 
                  onClick={onBook} 
                  className="w-full py-6 rounded-3xl bg-yellow-400 text-black font-black uppercase tracking-[5px] shadow-lg border-b-4 border-yellow-600 active:translate-y-1 transition-all"
                >
                  {common.bookNow}
                </motion.button>
                
                <motion.button 
                  onClick={() => onViewTariff && onViewTariff(v)} 
                  className="w-full py-5 rounded-3xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-[3px] text-[10px]"
                >
                  {common.viewFares}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </main>
    </div>
  );
};