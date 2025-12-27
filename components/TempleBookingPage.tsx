
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverProfile, Booking, BookingStatus, Vehicle } from '../types';
import { FIXED_PACKAGES } from '../constants';
import { calculateMissionFare } from '../services/fareCalculationService';
import { BookingConfirmationPage } from './BookingConfirmationPage';

interface Props {
  onBack: () => void;
  drivers: DriverProfile[];
  vehicles: Vehicle[];
  onNewBooking: (b: Booking) => void;
  selectedTemple: string;
}

type Phase = 'FORM' | 'REDIRECTING' | 'CONFIRMED';

export const TempleBookingPage: React.FC<Props> = ({ onBack, drivers, vehicles, onNewBooking, selectedTemple }) => {
  const [phase, setPhase] = useState<Phase>('FORM');
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  
  const isShivaTour = selectedTemple.toLowerCase().includes('shiva') || selectedTemple.toLowerCase().includes('sivalayangal');
  const themeColor = isShivaTour ? '#ff9800' : '#FFC107';
  const themeBg = isShivaTour ? 'bg-[#1a0f00]' : 'bg-[#020617]';

  const packageInfo = useMemo(() => FIXED_PACKAGES[selectedTemple] || { distance: 20, fare: 1200 }, [selectedTemple]);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pickup: 'Kanchipuram Bus Stand',
    date: new Date().toISOString().split('T')[0],
    vehicleId: 'SEDAN',
    isAc: true
  });

  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === formData.vehicleId) || vehicles[0], [formData.vehicleId, vehicles]);

  const currentFare = useMemo(() => {
    const standardCalculation = calculateMissionFare(packageInfo.distance, selectedVehicle, formData.isAc).totalFare;
    if (FIXED_PACKAGES[selectedTemple]) {
      const sedan = vehicles.find(v => v.id === 'SEDAN') || vehicles[0];
      const standardSedanFare = calculateMissionFare(packageInfo.distance, sedan, true).totalFare;
      const tourPremium = packageInfo.fare - standardSedanFare;
      return standardCalculation + tourPremium;
    }
    return standardCalculation;
  }, [packageInfo, selectedVehicle, formData.isAc, selectedTemple, vehicles]);

  const handleConfirm = () => {
    if (!formData.name || !formData.phone) return;
    setPhase('REDIRECTING');
    
    const message = `🚨 *SG CALL TAXI MISSION REQUISITION* 🚨\n\n` +
      `*Mission Type:* SACRED TEMPLE TOUR\n` +
      `*Tour Identity:* ${selectedTemple.toUpperCase()}\n` +
      `*Client Name:* ${formData.name}\n` +
      `*Contact Signal:* ${formData.phone}\n` +
      `*Deployment Date:* ${formData.date}\n` +
      `*Unit Class:* ${formData.vehicleId} (${formData.isAc ? 'AC' : 'Non-AC'})\n` +
      `*Origin Point:* ${formData.pickup}\n` +
      `*Secured Yield:* ₹${currentFare}\n\n` +
      `_Status: Requesting HQ Uplink via Neural Link_`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/918608000999?text=${encodedMessage}`;

    const newBooking: Booking = {
      id: `TOUR-${Date.now().toString().slice(-4)}`,
      customerName: formData.name,
      customerPhone: formData.phone,
      pickup: formData.pickup,
      drop: selectedTemple,
      vehicleType: formData.vehicleId,
      status: BookingStatus.PENDING,
      fare: currentFare,
      otp: "TOUR",
      timestamp: new Date(),
      isAc: formData.isAc,
      passengerCount: 1
    };

    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
      onNewBooking(newBooking);
      setActiveBooking(newBooking);
      setPhase('CONFIRMED');
    }, 1500);
  };

  if (phase === 'CONFIRMED' && activeBooking) {
    return <BookingConfirmationPage booking={activeBooking} driver={null} onReturnHome={onBack} />;
  }

  return (
    <div className={`w-full ${themeBg} text-white font-sans p-6 md:p-12 relative overflow-hidden transition-colors duration-1000`}>
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-12 relative z-10 pb-24"
      >
        <header className="space-y-4 text-center">
          <div className="flex flex-col items-center">
            <span className="text-[40px] mb-2">{isShivaTour ? '🔱' : '🪷'}</span>
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              Pilgrimage<br/><span style={{ color: themeColor }}>Registration.</span>
            </h1>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] space-y-8 h-full flex flex-col">
              <div className="flex-1">
                <p className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 mb-2">Selected Sacred Site</p>
                <h4 className="text-2xl font-black italic uppercase text-white leading-tight">{selectedTemple}</h4>
                
                <div className="space-y-4 mt-8">
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Fixed Distance</span>
                    <span className="text-xl font-black italic">{packageInfo.distance} KM</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Climate Spec</span>
                    <span className="text-xl font-black italic uppercase">{formData.isAc ? 'AC Premium' : 'Non-AC Standard'}</span>
                  </div>
                  <div className="flex justify-between items-center py-4 border-b border-white/5">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Mission Yield</span>
                    <span className="text-4xl font-black italic" style={{ color: themeColor }}>₹{currentFare}</span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-yellow-400/5 rounded-3xl border border-yellow-400/20">
                <p className="text-[9px] font-bold text-yellow-500/80 leading-relaxed uppercase tracking-wider italic">
                  * Tactical adjustments enabled. Base package rates are optimized for multi-node pilgrimages. Change car class to update yield.
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 space-y-8">
            <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] space-y-6">
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Devotee Name</label>
                  <input 
                    placeholder="Enter Full Name"
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl outline-none focus:border-white transition-all font-bold placeholder:text-white/10" 
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Contact Signal</label>
                  <input 
                    placeholder="Mobile Number"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                    className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl outline-none focus:border-white transition-all font-bold placeholder:text-white/10" 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Pickup Date</label>
                      <input 
                        type="date"
                        value={formData.date}
                        onChange={e => setFormData({...formData, date: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 p-6 rounded-3xl outline-none focus:border-white transition-all font-bold" 
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Climate Control</label>
                      <div className="flex bg-black/40 p-1 rounded-3xl border border-white/10">
                        <button 
                          onClick={() => setFormData({...formData, isAc: false})} 
                          className={`flex-1 py-4 rounded-2xl font-black text-[8px] uppercase tracking-[2px] transition-all ${!formData.isAc ? 'bg-white text-black shadow-xl' : 'text-white/30'}`}
                        >
                          Non-AC
                        </button>
                        <button 
                          onClick={() => setFormData({...formData, isAc: true})} 
                          className={`flex-1 py-4 rounded-2xl font-black text-[8px] uppercase tracking-[2px] transition-all ${formData.isAc ? 'bg-white text-black shadow-xl' : 'text-white/30'}`}
                        >
                          AC
                        </button>
                      </div>
                   </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest ml-4">Select Deployment Unit</label>
                    <div className="flex gap-2">
                      {vehicles.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => setFormData({...formData, vehicleId: v.id})}
                          className={`flex-1 p-3 rounded-2xl border transition-all text-[8px] font-black uppercase ${formData.vehicleId === v.id ? 'bg-white text-black border-white shadow-xl' : 'bg-black/20 border-white/10 text-white/40'}`}
                        >
                          {v.id}
                        </button>
                      ))}
                    </div>
                </div>
              </div>

              <button 
                onClick={handleConfirm}
                disabled={phase === 'REDIRECTING'}
                style={{ backgroundColor: themeColor }}
                className="w-full text-black py-7 rounded-[35px] font-black uppercase tracking-[8px] text-sm shadow-2xl hover:scale-[1.02] active:scale-95 transition-all mt-6 relative overflow-hidden"
              >
                <AnimatePresence mode="wait">
                  {phase === 'REDIRECTING' ? (
                    <motion.span 
                      key="red" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}
                      className="flex items-center justify-center gap-3"
                    >
                      <span className="w-2 h-2 bg-black rounded-full animate-ping" />
                      UPLINKING TO HQ...
                    </motion.span>
                  ) : (
                    <motion.span key="conf" initial={{ y: 20 }} animate={{ y: 0 }} exit={{ y: -20 }}>
                      ESTABLISH MISSION LINK ➔
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
