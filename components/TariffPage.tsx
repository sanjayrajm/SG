
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { VEHICLES, DISTANCE_SLOTS } from '../constants';

interface Props {
  onBack?: () => void;
  onBook: () => void;
  asSection?: boolean;
}

export const TariffPage: React.FC<Props> = ({ onBack, onBook, asSection = false }) => {
  const [activeMode, setActiveMode] = useState<'AC' | 'NON_AC'>('AC');

  return (
    <div className={`w-full ${asSection ? 'py-24' : 'min-h-screen p-6 lg:p-12'} bg-slate-950/40 text-white font-sans flex flex-col space-y-12 backdrop-blur-3xl relative overflow-hidden`}>
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      {!asSection && (
        <header className="flex justify-between items-center relative z-10">
          <button onClick={onBack} className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[4px] hover:text-yellow-400 transition-all group">
            <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> BACK HOME
          </button>
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl">
             <button 
              onClick={() => setActiveMode('NON_AC')} 
              className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[2px] transition-all ${activeMode === 'NON_AC' ? 'bg-white text-black' : 'text-slate-400'}`}
             >
              Non-AC
             </button>
             <button 
              onClick={() => setActiveMode('AC')} 
              className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[2px] transition-all ${activeMode === 'AC' ? 'bg-white text-black' : 'text-slate-400'}`}
             >
              AC
             </button>
          </div>
        </header>
      )}

      {asSection && (
        <div className="flex justify-center relative z-10">
          <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl">
             <button 
              onClick={() => setActiveMode('NON_AC')} 
              className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[2px] transition-all ${activeMode === 'NON_AC' ? 'bg-white text-black' : 'text-slate-400'}`}
             >
              Non-AC
             </button>
             <button 
              onClick={() => setActiveMode('AC')} 
              className={`px-6 py-2 rounded-full font-black text-[9px] uppercase tracking-[2px] transition-all ${activeMode === 'AC' ? 'bg-white text-black' : 'text-slate-400'}`}
             >
              AC
             </button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-12 relative z-10">
         <div className="text-center space-y-4">
            <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">UNIT<br/><span className="text-yellow-400">TARIFFS.</span></h2>
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[8px]">Precision Budgeting For Every Deployment.</p>
         </div>

         <div className="overflow-x-auto no-scrollbar">
            <table className="w-full border-collapse">
               <thead>
                  <tr className="bg-white/5">
                     <th className="p-8 text-left text-[10px] font-black uppercase text-slate-500 tracking-[5px] border-b border-white/10">Distance Slot</th>
                     {Object.keys(VEHICLES).map(key => (
                       <th key={key} className="p-8 text-center border-b border-white/10">
                          <p className="text-yellow-400 font-black italic uppercase text-lg">{key}</p>
                          <p className="text-[8px] text-white/40 uppercase tracking-widest">{VEHICLES[key].type}</p>
                       </th>
                     ))}
                  </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                  {DISTANCE_SLOTS.map((slot, idx) => (
                    <tr key={slot} className="hover:bg-white/5 transition-colors group">
                       <td className="p-8 font-black italic uppercase text-slate-400 group-hover:text-white transition-colors">{slot}</td>
                       {Object.keys(VEHICLES).map(key => {
                         const v = VEHICLES[key];
                         const price = activeMode === 'AC' ? v.tariff.ac[idx] : v.tariff.nonAc[idx];
                         return (
                           <td key={key} className="p-8 text-center text-2xl font-black italic tracking-tighter text-white">
                              ₹{price || '--'}
                           </td>
                         );
                       })}
                    </tr>
                  ))}
               </tbody>
               <tfoot>
                  <tr className="bg-yellow-400 text-black">
                     <td className="p-8 font-black uppercase text-[10px] tracking-widest">Extra KM Charge (₹)</td>
                     {Object.keys(VEHICLES).map(key => (
                       <td key={key} className="p-8 text-center font-black text-xl italic">
                          ₹{activeMode === 'AC' ? VEHICLES[key].tariff.extraKm.ac : VEHICLES[key].tariff.extraKm.nonAc} / KM
                       </td>
                     ))}
                  </tr>
               </tfoot>
            </table>
         </div>

         <div className="flex flex-col md:flex-row gap-6 justify-center py-10">
            <button onClick={onBook} className="bg-white text-black px-16 py-6 rounded-[35px] font-black uppercase text-sm tracking-[8px] shadow-4xl active:scale-95 transition-all border-b-8 border-slate-300">REQUEST DEPLOYMENT</button>
            <div className="bg-white/5 border border-white/10 px-10 py-6 rounded-[35px] flex items-center gap-4">
               <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rates Verified for 2025</p>
            </div>
         </div>
      </main>
    </div>
  );
};
