
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Vehicle } from '../types';
import { DISTANCE_SLOTS } from '../constants';
import { BackgroundVideo } from './BackgroundVideo';

interface Props {
  vehicle: Vehicle;
  onBack: () => void;
  onBook: () => void;
}

const TACTICAL_VIDEO_SRC = "https://sanjayrajm.github.io/taxi-video-website/taxi-video.mp4";

export const VehicleTariffPage: React.FC<Props> = ({ vehicle, onBack, onBook }) => {
  const [tariffType, setTariffType] = useState<'AC' | 'NON_AC'>('AC');

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white font-sans relative overflow-x-hidden border-t border-white/5">
      <BackgroundVideo 
        src={TACTICAL_VIDEO_SRC} 
        overlayOpacity="bg-slate-950/60" 
        gradientFrom="from-slate-950/80"
        gradientVia="via-slate-950/40"
        mobileOverlay="bg-slate-950/60"
      />

      <nav className="fixed top-0 left-0 right-0 z-[100] p-4 md:px-12 flex justify-between items-center bg-slate-950/80 backdrop-blur-2xl border-b border-white/5">
        <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[3px] hover:text-yellow-400 transition-all group">
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span> FLEET CATALOG
        </button>
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-black text-black italic text-xs">SG</div>
           <h1 className="font-black text-[9px] tracking-widest uppercase hidden sm:block">{vehicle.id} TARIFF SPECS</h1>
        </div>
      </nav>

      <main className="relative z-10 w-full pt-32 pb-24 px-6 md:px-20 max-w-7xl mx-auto space-y-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
            <header className="space-y-4">
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[10px] italic block">Unit Rates Identified</span>
              <h2 className="text-6xl md:text-8xl font-black italic uppercase tracking-tighter leading-none">{vehicle.type}</h2>
              <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[5px]">{vehicle.models.join(' • ')}</p>
            </header>
            
            <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 tactical-grid opacity-10" />
               <img src={vehicle.image} className="w-full h-48 object-contain relative z-10 group-hover:scale-110 transition-transform duration-700" alt={vehicle.type} />
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={onBook} className="flex-1 bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase tracking-[5px] shadow-2xl active:translate-y-1 transition-all border-b-4 border-yellow-600">BOOK MISSION</button>
              <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl">
                 <button 
                  onClick={() => setTariffType('NON_AC')} 
                  className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[2px] transition-all ${tariffType === 'NON_AC' ? 'bg-white text-black' : 'text-slate-400'}`}
                 >
                  Non-AC
                 </button>
                 <button 
                  onClick={() => setTariffType('AC')} 
                  className={`px-8 py-4 rounded-full font-black text-[10px] uppercase tracking-[2px] transition-all ${tariffType === 'AC' ? 'bg-white text-black' : 'text-slate-400'}`}
                 >
                  AC
                 </button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-3xl rounded-[60px] border border-white/10 overflow-hidden shadow-4xl">
             <div className="bg-white/5 p-8 border-b border-white/10 flex justify-between items-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Distance Slot</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-400">{tariffType === 'AC' ? 'AC Premium' : 'Non-AC'} Rate</p>
             </div>
             <div className="max-h-[500px] overflow-y-auto no-scrollbar">
                {DISTANCE_SLOTS.map((slot, idx) => {
                  const price = (tariffType === 'AC' ? vehicle.tariff?.ac?.[idx] : vehicle.tariff?.nonAc?.[idx]);
                  return (
                    <div key={slot} className="flex justify-between items-center p-8 border-b border-white/5 hover:bg-white/5 transition-colors">
                      <span className="text-lg font-black italic uppercase tracking-tighter text-slate-400">{slot}</span>
                      <span className="text-4xl font-black italic text-white tracking-tighter">
                        {price ? `₹${price}` : <span className="text-sm opacity-20">N/A</span>}
                      </span>
                    </div>
                  );
                })}
             </div>
             <div className="p-8 bg-yellow-400 text-black">
                <div className="flex justify-between items-center">
                   <p className="text-[10px] font-black uppercase tracking-widest">Extra KM Rate</p>
                   <p className="text-2xl font-black italic">₹{tariffType === 'AC' ? vehicle.tariff?.extraKm.ac : vehicle.tariff?.extraKm.nonAc} / KM</p>
                </div>
             </div>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 space-y-4">
              <span className="text-2xl">⏳</span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mission Cycle</p>
              <p className="text-sm font-black text-white italic leading-relaxed uppercase">Shed to Shed calculation. 00:01 To 23:59 Hrs operation window.</p>
           </div>
           <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 space-y-4">
              <span className="text-2xl">🛡️</span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Driver Support</p>
              <p className="text-sm font-black text-white italic leading-relaxed uppercase">Driver Beta ₹700/day extra. Food and stay handled by client for outstation.</p>
           </div>
           <div className="bg-white/5 p-10 rounded-[40px] border border-white/5 space-y-4">
              <span className="text-2xl">🚧</span>
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">External Costs</p>
              <p className="text-sm font-black text-white italic leading-relaxed uppercase">Toll, State Permit, and Parking charges extra as per actuals.</p>
           </div>
        </div>
      </main>
    </div>
  );
};
