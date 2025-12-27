
import React from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';

interface Props {
  vehicles: Vehicle[];
  onBack: () => void;
  onBook: () => void;
  onViewTariff?: (vehicle: Vehicle) => void;
  asSection?: boolean;
  t: any;
  common: any;
}

export const FleetPage: React.FC<Props> = ({ vehicles, onBack, onBook, onViewTariff, asSection = false, t, common }) => {
  return (
    <div className={`w-full ${asSection ? 'py-32' : 'min-h-screen pt-12'} text-white font-sans relative overflow-x-hidden`}>
      <main className={`relative z-10 px-6 md:px-20 max-w-7xl mx-auto space-y-24`}>
        <motion.header 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="space-y-6 text-center"
        >
           <h2 className="text-6xl md:text-[9rem] font-black italic uppercase tracking-tighter leading-[0.85] whitespace-pre-line text-glow-dark">
             {t.heading}
           </h2>
           <p className="text-yellow-400 font-black uppercase text-[12px] tracking-[10px] text-glow-dark">
             {t.subheading}
           </p>
        </motion.header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
          {vehicles.map((v) => (
            <motion.div 
              key={v.id}
              whileHover={{ y: -15, scale: 1.02 }}
              className="glass-panel rounded-[60px] p-10 border border-white/20 flex flex-col group relative overflow-hidden transition-all duration-500"
            >
              <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="h-48 lg:h-64 bg-black/40 rounded-[40px] mb-8 flex items-center justify-center p-6 border border-white/10 shadow-inner group-hover:border-yellow-400/30 transition-all">
                <img 
                  src={v.image} 
                  className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-700 drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" 
                  alt={v.type} 
                />
              </div>
              
              <h3 className="text-4xl font-black mb-4 uppercase italic tracking-tighter text-white group-hover:text-yellow-400 transition-colors">
                {v.type}
              </h3>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[3px] mb-8 italic">
                {v.models.join(' • ')}
              </p>
              
              <div className="mt-auto space-y-4 relative z-10">
                <motion.button 
                  whileTap={{ scale: 0.95 }}
                  onClick={onBook} 
                  className="w-full py-6 rounded-3xl bg-yellow-400 text-black font-black uppercase tracking-[5px] text-xs shadow-yellow-tactical border-b-8 border-yellow-600 active:translate-y-2 transition-all italic"
                >
                  {common.bookNow} ➔
                </motion.button>
                
                <motion.button 
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onViewTariff && onViewTariff(v)} 
                  className="w-full py-5 rounded-3xl bg-white/10 border border-white/20 text-white font-black uppercase tracking-[3px] text-[10px] hover:bg-white hover:text-black transition-all italic"
                >
                  {common.viewFares}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};
