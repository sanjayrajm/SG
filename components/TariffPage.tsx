
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';
import { DISTANCE_SLOTS } from '../constants';

interface Props {
  onBack?: () => void;
  onBook: () => void;
  asSection?: boolean;
  vehicles: Vehicle[];
}

export const TariffPage: React.FC<Props> = ({ onBack, onBook, asSection = false, vehicles }) => {
  const [activeMode, setActiveMode] = useState<'AC' | 'NON_AC'>('AC');

  return (
    <div className={`w-full ${asSection ? 'py-16' : 'min-h-screen p-4 md:p-8'} bg-[#020617] text-white font-sans flex flex-col space-y-8 relative overflow-hidden`}>
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      {!asSection && (
        <header className="flex justify-between items-center relative z-10 max-w-7xl mx-auto w-full">
          <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-yellow-400 transition-all group bg-white/5 px-4 py-2 rounded-xl border border-white/10">
            <span>←</span> BACK
          </button>
          <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10">
             <button 
              onClick={() => setActiveMode('NON_AC')} 
              className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${activeMode === 'NON_AC' ? 'bg-white text-black' : 'text-slate-500'}`}
             >
              Non-AC
             </button>
             <button 
              onClick={() => setActiveMode('AC')} 
              className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${activeMode === 'AC' ? 'bg-white text-black' : 'text-slate-500'}`}
             >
              AC
             </button>
          </div>
        </header>
      )}

      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col gap-8 relative z-10">
         <div className="text-center space-y-2">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tight">VEHICLE <span className="text-yellow-400">PRICING.</span></h2>
            <p className="text-slate-500 font-bold uppercase text-[10px] tracking-widest">Official Tariff Registry 2025</p>
         </div>

         <div className="bg-slate-900/80 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                    <tr className="bg-white/5">
                      <th className="p-5 text-left text-[10px] font-black uppercase text-slate-400 tracking-wider border-b border-white/10">Distance</th>
                      {vehicles.map(v => (
                        <th key={v.id} className="p-5 text-center border-b border-white/10 min-w-[120px]">
                            <p className="text-yellow-400 font-black uppercase text-sm">{v.id}</p>
                            <p className="text-[8px] text-slate-500 uppercase tracking-widest mt-1">Class</p>
                        </th>
                      ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {DISTANCE_SLOTS.map((slot, idx) => (
                      <tr key={slot} className="hover:bg-white/5 transition-colors group">
                        <td className="p-5 font-bold text-slate-400 group-hover:text-white text-xs">{slot}</td>
                        {vehicles.map(v => {
                          const price = activeMode === 'AC' ? v.tariff?.ac?.[idx] : v.tariff?.nonAc?.[idx];
                          return (
                            <td key={v.id} className="p-5 text-center text-base md:text-lg font-bold text-white tabular-nums">
                                {price ? `₹${price}` : '--'}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                </tbody>
                <tfoot className="bg-yellow-400 text-black">
                    <tr>
                      <td className="p-5 font-black uppercase text-[10px] tracking-wider">Extra KM</td>
                      {vehicles.map(v => (
                        <td key={v.id} className="p-5 text-center font-black text-sm">
                            ₹{activeMode === 'AC' ? v.tariff?.extraKm.ac : v.tariff?.extraKm.nonAc}/KM
                        </td>
                      ))}
                    </tr>
                </tfoot>
              </table>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row gap-4 justify-center py-4">
            <button onClick={onBook} className="bg-yellow-400 text-black px-10 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-lg hover:scale-105 transition-all">BOOK MISSION ➔</button>
            <div className="bg-white/5 border border-white/10 px-6 py-4 rounded-2xl flex items-center gap-2">
               <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
               <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Verified Rates</p>
            </div>
         </div>
      </main>
    </div>
  );
};
