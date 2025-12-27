
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';
import { DISTANCE_SLOTS } from '../constants';

interface Props {
  vehicle: Vehicle;
  onBack: () => void;
  onBook: () => void;
}

export const VehicleTariffPage: React.FC<Props> = ({ vehicle, onBack, onBook }) => {
  const [tariffType, setTariffType] = useState<'AC' | 'NON_AC'>('AC');

  return (
    <div className="min-h-screen w-full bg-[#020617] text-white font-sans p-4 md:p-8 relative overflow-x-hidden border-t border-white/5">
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />

      <main className="relative z-10 w-full max-w-5xl mx-auto space-y-8 pb-20">
        <header className="flex items-center justify-between">
           <button onClick={onBack} className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white/5 px-4 py-2 rounded-xl border border-white/10">
              <span>←</span> BACK
           </button>
           <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10">
             <button 
              onClick={() => setTariffType('NON_AC')} 
              className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${tariffType === 'NON_AC' ? 'bg-white text-black' : 'text-slate-500'}`}
             >
              Standard
             </button>
             <button 
              onClick={() => setTariffType('AC')} 
              className={`px-4 py-2 rounded-lg font-bold text-[10px] uppercase transition-all ${tariffType === 'AC' ? 'bg-white text-black' : 'text-slate-500'}`}
             >
              AC
             </button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[4px]">VEHICLE CLASS</span>
              <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight leading-none">{vehicle.type}</h2>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-wide">{vehicle.models.join(' • ')}</p>
            </div>
            
            <div className="bg-slate-900/50 p-6 rounded-3xl border border-white/5 backdrop-blur-xl relative overflow-hidden flex items-center justify-center min-h-[250px]">
               <img src={vehicle.image} className="max-w-full max-h-[180px] object-contain relative z-10" alt={vehicle.type} />
            </div>

            <button onClick={onBook} className="w-full bg-yellow-400 text-black py-5 rounded-2xl font-black uppercase text-sm tracking-widest shadow-lg hover:scale-[1.02] transition-all">BOOK THIS UNIT ➔</button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-xl">
             <div className="bg-white/5 p-4 border-b border-white/10 flex justify-between items-center px-6">
                <p className="text-[10px] font-bold uppercase text-slate-400">DISTANCE SLOT</p>
                <p className="text-[10px] font-bold uppercase text-yellow-400">{tariffType === 'AC' ? 'AC' : 'STANDARD'} RATE</p>
             </div>
             <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                {DISTANCE_SLOTS.map((slot, idx) => {
                  const price = (tariffType === 'AC' ? vehicle.tariff?.ac?.[idx] : vehicle.tariff?.nonAc?.[idx]);
                  return (
                    <div key={slot} className="flex justify-between items-center p-4 border-b border-white/5 hover:bg-white/5 transition-colors px-6">
                      <span className="text-xs font-bold uppercase text-slate-500">{slot}</span>
                      <span className="text-xl font-black text-white tabular-nums">
                        {price ? `₹${price}` : '--'}
                      </span>
                    </div>
                  );
                })}
             </div>
             <div className="p-6 bg-yellow-400 text-black flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-wider">EXTRA KM RATE</p>
                <p className="text-xl font-black italic">₹{tariffType === 'AC' ? vehicle.tariff?.extraKm.ac : vehicle.tariff?.extraKm.nonAc}/KM</p>
             </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
