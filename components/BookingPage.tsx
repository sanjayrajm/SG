
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverProfile, Booking, BookingStatus, Vehicle } from '../types';
import { getTacticalRouteIntel } from '../geminiService';
import { FIXED_PACKAGES, NEURAL_LOCATION_REGISTRY, VEHICLES } from '../constants';
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
  const [calcError, setCalcError] = useState(false);
  const [calculatedDistance, setCalculatedDistance] = useState<number | null>(null);
  const [fareBreakdown, setFareBreakdown] = useState<any>(null);
  const [assignedDriver, setAssignedDriver] = useState<DriverProfile | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [focusedField, setFocusedField] = useState<'pickup' | 'drop' | null>(null);
  const [showNoDriverModal, setShowNoDriverModal] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === formData.vehicleId) || vehicles[0], [formData.vehicleId, vehicles]);
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

  // Registry-First Sync Logic
  useEffect(() => {
    const packageInfo = FIXED_PACKAGES[formData.drop];
    const pickupEntry = NEURAL_LOCATION_REGISTRY.find(l => l.name === formData.pickup);
    const dropEntry = NEURAL_LOCATION_REGISTRY.find(l => l.name === formData.drop);

    setCalcError(false);

    if (packageInfo) {
      setCalculatedDistance(packageInfo.distance);
      setIsCalculating(false);
    } 
    // FAST PATH: If both are in registry, calculate difference or use drop's default dist from center
    else if (pickupEntry && dropEntry) {
      setCalculatedDistance(Math.abs(dropEntry.dist - (pickupEntry.dist || 0)) || 1);
      setIsCalculating(false);
    }
    // AI PATH: Debounced fallback
    else if (formData.pickup.trim().length > 3 && formData.drop.trim().length > 3) {
      setIsCalculating(true);
      const timer = setTimeout(async () => {
        try {
          const intel = await getTacticalRouteIntel(formData.pickup, formData.drop);
          if (intel.isError || intel.distanceKm === 0) {
            setCalcError(true);
            setCalculatedDistance(null);
          } else {
            setCalculatedDistance(intel.distanceKm);
            setCalcError(false);
          }
        } catch (err) {
          setCalcError(true);
        } finally {
          setIsCalculating(false);
        }
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCalculatedDistance(null);
      setFareBreakdown(null);
    }
  }, [formData.pickup, formData.drop]);

  useEffect(() => {
    if (calculatedDistance !== null) {
      setFareBreakdown(calculateMissionFare(calculatedDistance, selectedVehicle, formData.isAc));
    }
  }, [calculatedDistance, selectedVehicle, formData.isAc]);

  const suggestions = focusedField === 'pickup' 
    ? NEURAL_LOCATION_REGISTRY.filter(loc => loc.name.toLowerCase().includes(formData.pickup.toLowerCase())).slice(0, 5)
    : NEURAL_LOCATION_REGISTRY.filter(loc => loc.name.toLowerCase().includes(formData.drop.toLowerCase())).slice(0, 5);

  const handleBooking = () => {
    setValidationError(null);
    if (!formData.name || !formData.phone || !formData.pickup || !formData.drop) {
      setValidationError("Incomplete coordinates. Please fill all fields.");
      return;
    }
    if (formData.members > selectedVehicle.capacity) {
      setValidationError(`Vehicle capacity exceeded. Max ${selectedVehicle.capacity} passengers for ${selectedVehicle.id}.`);
      return;
    }

    setPhase('ASSIGNING');
    
    setTimeout(() => {
      // TACTICAL DRIVER ASSIGNMENT ENGINE
      // Filter online drivers that match the specific vehicle class (SUV, SEDAN, HATCHBACK)
      const matchingOnlineDriver = drivers.find(d => 
        d.isOnline && d.vehicleType.toUpperCase() === formData.vehicleId.toUpperCase()
      );

      // CRITICAL DIRECTIVE: If no specific online driver is found for SUV, trigger failure protocol
      if (!matchingOnlineDriver) {
        setPhase('FORM');
        setShowNoDriverModal(true);
        return;
      }

      const newBooking: Booking = {
        id: `SG-${Date.now().toString().slice(-4)}`,
        customerName: formData.name, 
        customerPhone: formData.phone,
        pickup: formData.pickup, 
        drop: formData.drop,
        vehicleType: formData.vehicleId, 
        status: BookingStatus.PENDING, 
        fare: fareBreakdown?.totalFare || selectedVehicle.baseFare,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        timestamp: new Date(`${formData.date}T${formData.time}`), 
        isAc: formData.isAc,
        passengerCount: formData.members,
        driverId: matchingOnlineDriver.id
      };
      
      if (onNewBooking) onNewBooking(newBooking);
      setAssignedDriver(matchingOnlineDriver);
      setActiveBooking(newBooking);
      setPhase('CONFIRMED');
    }, 2000); // 2s simulated telemetry lookup
  };

  if (phase === 'CONFIRMED' && activeBooking) {
    return <BookingConfirmationPage booking={activeBooking} driver={assignedDriver} onReturnHome={onBack || (() => {})} />;
  }

  return (
    <div className="w-full min-h-screen bg-transparent flex flex-col p-4 md:p-6 font-sans relative">
      <header className="max-w-4xl mx-auto w-full flex justify-between items-center py-4 relative z-10">
        <button onClick={onBack} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">← ABORT</button>
        <div className="flex items-center gap-3">
           <span className={`w-2 h-2 rounded-full ${isDriverAvailable ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
           <span className="text-[8px] font-black uppercase tracking-widest text-slate-400">{isDriverAvailable ? 'LINK_ACTIVE' : 'LINK_OFFLINE'}</span>
        </div>
      </header>

      <main className="max-w-xl mx-auto w-full flex-1 flex flex-col justify-center gap-6 py-8 relative z-10">
        <div className="text-center">
           <h1 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter leading-none text-white">Neural<br/><span className="text-yellow-400">Deployment.</span></h1>
           <p className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] mt-2 italic">GRID SCAN: {isCalculating ? 'SEARCHING' : calcError ? 'INTERRUPTED' : 'SYNCED'}</p>
        </div>

        <div className="bg-slate-900/60 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-[40px] shadow-2xl space-y-6" ref={containerRef}>
           {/* Section 1: Route & Identity */}
           <div className="space-y-4">
              <div className="relative">
                <input placeholder="PICKUP" value={formData.pickup} onChange={e => setFormData({...formData, pickup: e.target.value})} onFocus={() => setFocusedField('pickup')} className="w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm" />
                <AnimatePresence>
                  {focusedField === 'pickup' && suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-2xl p-2 z-[50] shadow-2xl">
                      {suggestions.map(loc => (
                        <button key={loc.id} onClick={() => { setFormData({...formData, pickup: loc.name}); setFocusedField(null); }} className="w-full text-left p-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors flex justify-between group">
                          <span className="text-[10px] font-black uppercase italic">{loc.name}</span>
                          <span className="text-[8px] opacity-40 uppercase">{loc.district}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="relative">
                <input placeholder="DESTINATION" value={formData.drop} onChange={e => setFormData({...formData, drop: e.target.value})} onFocus={() => setFocusedField('drop')} className="w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 transition-all text-sm" />
                <AnimatePresence>
                  {focusedField === 'drop' && suggestions.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 top-full mt-2 bg-slate-800 border border-white/10 rounded-2xl p-2 z-[50] shadow-2xl">
                      {suggestions.map(loc => (
                        <button key={loc.id} onClick={() => { setFormData({...formData, drop: loc.name}); setFocusedField(null); }} className="w-full text-left p-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors flex justify-between group">
                          <span className="text-[10px] font-black uppercase italic">{loc.name}</span>
                          <span className="text-[8px] opacity-40 uppercase">{loc.district}</span>
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <input placeholder="NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="bg-black/40 p-4 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 text-sm" />
              <input placeholder="PHONE" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="bg-black/40 p-4 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 text-sm" />
           </div>

           {/* Section 2: Fleet & Preferences */}
           <div className="space-y-4 pt-2">
              <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest block ml-2">Fleet Selection</label>
              <div className="grid grid-cols-3 gap-2">
                {vehicles.map(v => (
                  <button 
                    key={v.id} 
                    onClick={() => setFormData({...formData, vehicleId: v.id})}
                    className={`p-3 rounded-2xl border transition-all flex flex-col items-center gap-2 ${formData.vehicleId === v.id ? 'bg-yellow-400 border-yellow-500 shadow-lg' : 'bg-black/20 border-white/5'}`}
                  >
                    <img src={v.image} className={`h-8 object-contain ${formData.vehicleId === v.id ? 'brightness-0' : 'opacity-60'}`} alt={v.id} />
                    <div className={`text-[8px] font-black uppercase ${formData.vehicleId === v.id ? 'text-black' : 'text-slate-400'}`}>{v.id}</div>
                    <div className={`text-[7px] font-bold ${formData.vehicleId === v.id ? 'text-black/60' : 'text-slate-600'}`}>Max: {v.capacity}</div>
                  </button>
                ))}
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-4">Deployment Date</label>
                 <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 text-sm [color-scheme:dark]" />
              </div>
              <div className="space-y-1">
                 <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-4">Deployment Time</label>
                 <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="w-full bg-black/40 p-4 rounded-2xl border border-white/5 text-white font-bold outline-none focus:border-yellow-400 text-sm [color-scheme:dark]" />
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-4">Climate Control</label>
                 <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button onClick={() => setFormData({...formData, isAc: false})} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${!formData.isAc ? 'bg-white text-black' : 'text-slate-500'}`}>Non-AC</button>
                    <button onClick={() => setFormData({...formData, isAc: true})} className={`flex-1 py-3 rounded-xl text-[8px] font-black uppercase transition-all ${formData.isAc ? 'bg-white text-black' : 'text-slate-500'}`}>AC</button>
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest ml-4">Passengers</label>
                 <div className="flex items-center bg-black/40 p-1 rounded-2xl border border-white/5">
                    <button onClick={() => setFormData({...formData, members: Math.max(1, formData.members - 1)})} className="w-10 h-10 flex items-center justify-center text-white hover:text-yellow-400 transition-colors">－</button>
                    <input readOnly value={formData.members} className="flex-1 bg-transparent text-center font-black text-white text-sm outline-none" />
                    <button onClick={() => setFormData({...formData, members: Math.min(selectedVehicle.capacity, formData.members + 1)})} className="w-10 h-10 flex items-center justify-center text-white hover:text-yellow-400 transition-colors">＋</button>
                 </div>
              </div>
           </div>

           {/* Section 3: Summary & Execution */}
           <div className="bg-black/40 p-6 rounded-3xl border border-white/5 flex justify-between items-center relative overflow-hidden">
              {isCalculating && <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute bottom-0 left-0 w-full h-0.5 bg-yellow-400" />}
              <div>
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Range</p>
                 <p className={`text-2xl font-black italic ${calcError ? 'text-red-500' : 'text-white'}`}>{isCalculating ? 'SYNCING...' : (calculatedDistance ? `${calculatedDistance.toFixed(1)} KM` : '--')}</p>
              </div>
              <div className="text-right">
                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Yield</p>
                 <p className="text-3xl font-black italic text-yellow-400">₹{fareBreakdown?.totalFare || '--'}</p>
              </div>
           </div>

           {validationError && (
             <p className="text-red-500 text-[10px] font-black uppercase text-center tracking-widest italic">{validationError}</p>
           )}

           <button disabled={isCalculating || phase === 'ASSIGNING'} onClick={handleBooking} className={`w-full py-6 rounded-3xl font-black uppercase tracking-[6px] shadow-2xl transition-all ${isCalculating ? 'bg-slate-800 text-slate-500 opacity-50' : 'bg-yellow-400 text-black border-b-4 border-yellow-600 active:translate-y-1'}`}>
            {phase === 'ASSIGNING' ? 'SEARCHING FOR UNIT...' : 'INITIATE MISSION'}
           </button>
        </div>
      </main>

      {/* TACTICAL DRIVER NOT AVAILABLE MODAL */}
      <AnimatePresence>
        {showNoDriverModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9 }}
               className="bg-slate-900 border-2 border-red-500/40 p-10 rounded-[50px] shadow-4xl max-w-sm w-full text-center space-y-8 relative overflow-hidden"
             >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-red-500/20">
                   <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2 }} className="w-1/3 h-full bg-red-500" />
                </div>
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto text-4xl border border-red-500/30">⚠️</div>
                <div className="space-y-3">
                   <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white">Driver Not Available</h2>
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px] leading-relaxed">
                     No {formData.vehicleId} units are currently online in your sector. 
                   </p>
                </div>
                <div className="space-y-4">
                  <button onClick={() => setShowNoDriverModal(false)} className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase tracking-[5px] text-[10px] shadow-xl hover:bg-slate-200 transition-all">TRY DIFFERENT CLASS</button>
                  <button onClick={() => window.open('tel:+918608000999')} className="w-full bg-red-500 text-white py-5 rounded-3xl font-black uppercase tracking-[5px] text-[10px] shadow-xl active:translate-y-1 transition-all">MANUAL DISPATCH</button>
                </div>
                <p className="text-[7px] font-black text-slate-600 uppercase tracking-[8px] italic">Protocol Error: SIG_NULL_TARGET</p>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
