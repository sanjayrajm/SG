
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverProfile, Booking, BookingStatus, Vehicle } from '../types';
import { getTacticalRouteIntel } from '../geminiService';
import { FIXED_PACKAGES, NEURAL_LOCATION_REGISTRY } from '../constants';
import { calculateMissionFare } from '../services/fareCalculationService';
import { BookingConfirmationPage } from './BookingConfirmationPage';

type BookingPhase = 'FORM' | 'PAYMENT' | 'ASSIGNING' | 'CONFIRMED' | 'FAILED';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  members: number;
  pickup: string;
  drop: string;
  date: string;
  time: string;
  vehicleId: string;
  isAc: boolean;
}

interface Props {
  onBack?: () => void;
  drivers: DriverProfile[];
  vehicles: Vehicle[];
  bookings?: Booking[];
  onNewBooking?: (b: Booking) => void;
  initialDrop?: string;
}

export const BookingPage: React.FC<Props> = ({ 
  onBack, 
  drivers = [], 
  vehicles = [], 
  bookings = [], 
  onNewBooking,
  initialDrop = ''
}) => {
  const [phase, setPhase] = useState<BookingPhase>('FORM');
  const [formData, setFormData] = useState<BookingFormData>({
    name: '', email: '', phone: '', members: 1, pickup: '', drop: initialDrop,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
    vehicleId: 'SEDAN', isAc: true
  });
  
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [fareBreakdown, setFareBreakdown] = useState<any>(null);
  const [assignedDriver, setAssignedDriver] = useState<DriverProfile | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isFixedPackage, setIsFixedPackage] = useState(false);
  const [focusedField, setFocusedField] = useState<'pickup' | 'drop' | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === formData.vehicleId) || vehicles[0], [formData.vehicleId, vehicles]);
  
  // SCANNER: Detect available pilot signals
  const isDriverAvailable = useMemo(() => drivers.some(d => d.isOnline), [drivers]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocusedField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const packageInfo = FIXED_PACKAGES[formData.drop];
    
    if (packageInfo) {
      setIsFixedPackage(true);
      setCalculatedDistance(packageInfo.distance);
      setIsCalculating(false);
    } else if (formData.pickup.trim().length > 3 && formData.drop.trim().length > 3) {
      setIsFixedPackage(false);
      setIsCalculating(true);
      const timer = setTimeout(async () => {
        try {
          const intel = await getTacticalRouteIntel(formData.pickup, formData.drop);
          setCalculatedDistance(intel.distanceKm);
        } finally {
          setIsCalculating(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsFixedPackage(false);
      setCalculatedDistance(null);
      setFareBreakdown(null);
    }
  }, [formData.pickup, formData.drop]);

  // Dynamic Fare Calculation: Re-calculates whenever distance, vehicle, or AC status changes
  useEffect(() => {
    if (calculatedDistance !== null) {
      setFareBreakdown(calculateMissionFare(calculatedDistance, selectedVehicle, formData.isAc));
    }
  }, [calculatedDistance, selectedVehicle, formData.isAc]);

  const getFilteredLocations = (query: string) => {
    if (!query) return NEURAL_LOCATION_REGISTRY.slice(0, 4);
    return NEURAL_LOCATION_REGISTRY.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) || 
      loc.district.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  };

  const suggestions = focusedField === 'pickup' ? getFilteredLocations(formData.pickup) : getFilteredLocations(formData.drop);

  const handleBooking = () => {
    if (!formData.name || !formData.phone || !formData.pickup || !formData.drop) {
      setValidationError("Please complete all required fields.");
      return;
    }
    
    if (!isDriverAvailable) {
      setValidationError("NO ACTIVE PILOTS FOUND. MISSION CANNOT COMMENCE.");
      return;
    }

    setPhase('ASSIGNING');
    setTimeout(() => {
      const driver = drivers.find(d => d.isOnline) || drivers[0];
      const newBooking: Booking = {
        id: `SG-${Date.now().toString().slice(-4)}`,
        customerName: formData.name, 
        customerPhone: formData.phone,
        customerEmail: formData.email,
        pickup: formData.pickup, 
        drop: formData.drop,
        vehicleType: formData.vehicleId, 
        status: BookingStatus.PENDING, 
        fare: fareBreakdown?.totalFare || selectedVehicle.baseFare,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        timestamp: new Date(), 
        isAc: formData.isAc,
        passengerCount: formData.members
      };
      if (onNewBooking) onNewBooking(newBooking);
      setAssignedDriver(driver);
      setActiveBooking(newBooking);
      setPhase('CONFIRMED');
    }, 2500);
  };

  if (phase === 'CONFIRMED' && activeBooking) {
    return <BookingConfirmationPage booking={activeBooking} driver={assignedDriver} onReturnHome={onBack || (() => {})} />;
  }

  return (
    <div className="w-full min-h-screen bg-[#020617] flex flex-col p-4 md:p-6 font-sans relative overflow-hidden">
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />

      <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-4 md:py-6 relative z-10">
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">← CANCEL MISSION</button>
        <h2 className="text-lg md:text-xl font-black italic uppercase tracking-tighter">Point Deployment</h2>
        <div className="flex items-center gap-3">
           <span className={`w-2 h-2 rounded-full ${isDriverAvailable ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">
             {isDriverAvailable ? 'PILOTS_ONLINE' : 'SIGNAL_LOST'}
           </span>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center gap-6 md:gap-10 py-8 md:py-12 relative z-10">
        <div className="space-y-2 text-center">
           <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none">Point to Point<br/><span className="text-yellow-400 text-5xl md:text-6xl">Booking.</span></h1>
           <p className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-[4px] mt-2 italic">
             {isDriverAvailable ? 'Neural Grid Connected • Requisition Ready' : 'Fleet Grid Offline • Standby for Pilot Uplink'}
           </p>
        </div>

        <div className="bg-white/5 border border-white/10 p-6 md:p-10 rounded-3xl md:rounded-[40px] shadow-2xl space-y-6 md:space-y-8 relative overflow-hidden" ref={containerRef}>
           <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full" />
           <div className="absolute bottom-0 left-0 w-32 h-32 bg-yellow-400/5 blur-3xl rounded-full" />
           
           <div className="grid grid-cols-1 gap-3 md:gap-4 relative z-10">
              <div className="relative">
                <input 
                  placeholder="PICKUP LOCATION" 
                  value={formData.pickup} 
                  onChange={e => setFormData({...formData, pickup: e.target.value})} 
                  onFocus={() => setFocusedField('pickup')}
                  className="w-full bg-black/40 p-5 md:p-6 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm md:text-base placeholder:text-white/20" 
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-yellow-400/20 text-xs font-black uppercase tracking-widest">Start_Vector</div>
                <AnimatePresence>
                  {focusedField === 'pickup' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl p-2 z-[500] shadow-2xl backdrop-blur-xl"
                    >
                      {suggestions.map(loc => (
                        <button key={loc.id} onClick={() => { setFormData({...formData, pickup: loc.name}); setFocusedField(null); }} className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between group">
                          <div>
                            <p className="text-[10px] font-black text-white uppercase italic">{loc.name}</p>
                            <p className="text-[7px] font-bold text-slate-500 uppercase">{loc.district}</p>
                          </div>
                          <span className="text-yellow-400 opacity-0 group-hover:opacity-100">➔</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <input 
                  placeholder="DROP LOCATION" 
                  value={formData.drop} 
                  onChange={e => setFormData({...formData, drop: e.target.value})} 
                  onFocus={() => setFocusedField('drop')}
                  className="w-full bg-black/40 p-5 md:p-6 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm md:text-base placeholder:text-white/20" 
                />
                <div className="absolute right-6 top-1/2 -translate-y-1/2 text-yellow-400/20 text-xs font-black uppercase tracking-widest">End_Vector</div>
                <AnimatePresence>
                  {focusedField === 'drop' && (
                    <motion.div 
                      initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                      className="absolute left-0 right-0 top-full mt-2 bg-slate-900 border border-white/10 rounded-2xl p-2 z-[500] shadow-2xl backdrop-blur-xl"
                    >
                      {suggestions.map(loc => (
                        <button key={loc.id} onClick={() => { setFormData({...formData, drop: loc.name}); setFocusedField(null); }} className="w-full text-left p-3 rounded-xl hover:bg-white/5 transition-colors flex items-center justify-between group">
                          <div>
                            <p className="text-[10px] font-black text-white uppercase italic">{loc.name}</p>
                            <p className="text-[7px] font-bold text-slate-500 uppercase">{loc.district}</p>
                          </div>
                          <span className="text-yellow-400 opacity-0 group-hover:opacity-100">➔</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative z-10">
              <input placeholder="FULL NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black/40 p-5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm md:text-base" />
              <input placeholder="PHONE SIGNAL" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-black/40 p-5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm md:text-base" />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 relative z-10">
              <input placeholder="EMAIL (OPTIONAL)" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="bg-black/40 p-5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm md:text-base" />
              <div className="flex flex-col gap-1">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-4">Total Passengers</label>
                <input 
                  type="number" 
                  min="1" 
                  max="50"
                  value={formData.members} 
                  onChange={e => setFormData({...formData, members: parseInt(e.target.value) || 1})} 
                  className="w-full bg-black/40 p-5 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm md:text-base" 
                />
              </div>
           </div>

           <div className="space-y-4 relative z-10">
              <div className="flex justify-between items-end px-4">
                <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Select Deployment Unit</label>
                <div className="flex bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-xl">
                  <button 
                    onClick={() => setFormData({...formData, isAc: false})} 
                    className={`px-4 py-1.5 rounded-full font-black text-[7px] uppercase tracking-[1px] transition-all ${!formData.isAc ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
                  >
                    Non-AC
                  </button>
                  <button 
                    onClick={() => setFormData({...formData, isAc: true})} 
                    className={`px-4 py-1.5 rounded-full font-black text-[7px] uppercase tracking-[1px] transition-all ${formData.isAc ? 'bg-white text-black shadow-lg' : 'text-slate-500'}`}
                  >
                    AC
                  </button>
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar py-2 -mx-2 px-2">
                  {vehicles.map(v => (
                    <button key={v.id} onClick={() => setFormData({...formData, vehicleId: v.id})} className={`shrink-0 w-24 md:w-28 p-4 md:p-5 rounded-3xl border transition-all flex flex-col items-center gap-2 ${formData.vehicleId === v.id ? 'bg-yellow-400 border-white text-black scale-105 shadow-xl' : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'}`}>
                       <span className="text-[7px] md:text-[8px] font-black uppercase">{v.id}</span>
                       <img src={v.image} className="h-8 md:h-10 object-contain" alt={v.id} />
                    </button>
                  ))}
              </div>
           </div>

           <div className="bg-black/40 p-6 md:p-8 rounded-2xl md:rounded-3xl border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 md:gap-0 relative z-10">
              <div className={isFixedPackage ? 'border-l-4 border-yellow-400 pl-4' : ''}>
                 <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">{isFixedPackage ? 'Package KM' : 'Distance Intel'}</p>
                 <p className="text-3xl md:text-4xl font-black italic text-white leading-none">
                   {isCalculating ? (
                     <motion.span animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.5 }}>SCANNING...</motion.span>
                   ) : (calculatedDistance ? `${calculatedDistance.toFixed(1)}KM` : '--')}
                 </p>
              </div>
              <div className="text-left md:text-right">
                 <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Fare {isFixedPackage ? '(Dynamic Package)' : 'Estimate'}</p>
                 <p className="text-3xl md:text-4xl font-black italic text-yellow-400 leading-none">₹{fareBreakdown?.totalFare || '--'}</p>
              </div>
           </div>

           {validationError && (
             <p className="text-center text-red-500 text-[10px] font-black uppercase bg-red-500/10 py-3 rounded-xl border border-red-500/20">{validationError}</p>
           )}

           <button 
            disabled={isCalculating || phase === 'ASSIGNING' || !isDriverAvailable}
            onClick={handleBooking} 
            className={`w-full py-5 md:py-6 rounded-2xl md:rounded-3xl font-black uppercase tracking-[4px] md:tracking-[6px] shadow-2xl active:translate-y-0.5 transition-all relative z-10 text-sm md:text-base ${
              isDriverAvailable 
              ? 'bg-yellow-400 text-black border-b-8 border-yellow-600' 
              : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50'
            }`}
           >
            {phase === 'ASSIGNING' ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 bg-black rounded-full animate-ping" />
                BROADCASTING TO NEURAL FLEET...
              </span>
            ) : isDriverAvailable ? 'DEPLOY MISSION TO FLEET' : 'NO PILOT SIGNAL DETECTED'}
           </button>
        </div>
      </main>
    </div>
  );
};
