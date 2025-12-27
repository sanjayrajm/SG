
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverProfile, Booking, BookingStatus, Vehicle } from '../types';
import { getTacticalRouteIntel } from '../geminiService';
import { FIXED_PACKAGES, NEURAL_LOCATION_REGISTRY } from '../constants';
import { calculateMissionFare } from '../services/fareCalculationService';
import { BookingConfirmationPage } from './BookingConfirmationPage';

type BookingPhase = 'FORM' | 'PAYMENT' | 'ASSIGNING' | 'CONFIRMED' | 'FAILED';
type BookingMode = 'CUSTOM' | 'PACKAGE';

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
  mode: BookingMode;
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
    name: '', email: '', phone: '', members: 1, pickup: 'Kanchipuram Bus Stand', drop: initialDrop,
    date: new Date().toISOString().split('T')[0],
    time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
    vehicleId: 'SEDAN', isAc: true,
    mode: initialDrop && FIXED_PACKAGES[initialDrop] ? 'PACKAGE' : 'CUSTOM'
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
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const selectedVehicle = useMemo(() => vehicles.find(v => v.id === formData.vehicleId) || vehicles[0], [formData.vehicleId, vehicles]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn(err)
      );
    }
  }, []);

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
    if (formData.mode === 'PACKAGE') {
      const packageInfo = FIXED_PACKAGES[formData.drop];
      if (packageInfo) {
        setCalculatedDistance(packageInfo.distance);
        setCalcError(false);
        setIsCalculating(false);
      }
      return;
    }

    const pickupEntry = NEURAL_LOCATION_REGISTRY.find(l => l.name === formData.pickup);
    const dropEntry = NEURAL_LOCATION_REGISTRY.find(l => l.name === formData.drop);
    setCalcError(false);
    
    if (pickupEntry && dropEntry) {
      setCalculatedDistance(Math.abs(dropEntry.dist - (pickupEntry.dist || 0)) || 1);
      setIsCalculating(false);
    } else if (formData.pickup.trim().length > 3 && formData.drop.trim().length > 3) {
      setIsCalculating(true);
      const timer = setTimeout(async () => {
        try {
          const intel = await getTacticalRouteIntel(formData.pickup, formData.drop, userLocation || undefined);
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
  }, [formData.pickup, formData.drop, formData.mode, userLocation]);

  useEffect(() => {
    if (calculatedDistance !== null) {
      const breakdown = calculateMissionFare(calculatedDistance, selectedVehicle, formData.isAc);
      if (formData.mode === 'PACKAGE' && FIXED_PACKAGES[formData.drop]) {
        const pkg = FIXED_PACKAGES[formData.drop];
        const sedan = vehicles.find(v => v.id === 'SEDAN') || vehicles[0];
        const standardSedanFare = calculateMissionFare(pkg.distance, sedan, true).totalFare;
        const premium = pkg.fare - standardSedanFare;
        breakdown.totalFare += premium;
      }
      setFareBreakdown(breakdown);
    }
  }, [calculatedDistance, selectedVehicle, formData.isAc, formData.mode, formData.drop, vehicles]);

  const suggestions = focusedField === 'pickup' 
    ? NEURAL_LOCATION_REGISTRY.filter(loc => loc.name.toLowerCase().includes(formData.pickup.toLowerCase())).slice(0, 5)
    : NEURAL_LOCATION_REGISTRY.filter(loc => loc.name.toLowerCase().includes(formData.drop.toLowerCase())).slice(0, 5);

  const handleBooking = () => {
    setValidationError(null);
    if (!formData.name || !formData.phone || !formData.pickup || !formData.drop) {
      setValidationError("Please complete all required fields.");
      return;
    }
    if (formData.members > selectedVehicle.capacity) {
      setValidationError(`Selected unit capacity is ${selectedVehicle.capacity}.`);
      return;
    }
    setPhase('ASSIGNING');
    setTimeout(() => {
      const matchingOnlineDriver = drivers.find(d => 
        d.isOnline && d.vehicleType.toUpperCase() === formData.vehicleId.toUpperCase()
      );
      if (!matchingOnlineDriver) {
        setPhase('FORM');
        setShowNoDriverModal(true);
        return;
      }

      const combinedTimestamp = new Date(`${formData.date}T${formData.time}`);

      const newBooking: Booking = {
        id: `SG-${Date.now().toString().slice(-4)}`,
        customerName: formData.name, customerPhone: formData.phone,
        pickup: formData.pickup, drop: formData.drop,
        vehicleType: formData.vehicleId, status: BookingStatus.PENDING, 
        fare: fareBreakdown?.totalFare || selectedVehicle.baseFare,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        timestamp: isNaN(combinedTimestamp.getTime()) ? new Date() : combinedTimestamp, 
        isAc: formData.isAc, passengerCount: formData.members,
        driverId: matchingOnlineDriver.id
      };
      if (onNewBooking) onNewBooking(newBooking);
      setAssignedDriver(matchingOnlineDriver);
      setActiveBooking(newBooking);
      setPhase('CONFIRMED');
    }, 2000);
  };

  if (phase === 'CONFIRMED' && activeBooking) {
    return <BookingConfirmationPage booking={activeBooking} driver={assignedDriver} onReturnHome={onBack || (() => {})} />;
  }

  return (
    <div className="w-full flex flex-col p-4 md:p-8 font-sans relative">
      <main className="max-w-2xl mx-auto w-full flex-1 flex flex-col justify-center gap-8 pb-12 relative z-10">
        <div className="text-center px-4">
           <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight text-white italic text-glow-dark">RESERVE<br/><span className="text-yellow-400">YOUR TRIP.</span></h1>
           <p className="text-[11px] font-black text-slate-400 uppercase tracking-[6px] mt-4 italic text-glow-dark">Mission Parameters Verification Required</p>
        </div>

        <div className="glass-panel p-8 md:p-12 rounded-[50px] space-y-10" ref={containerRef}>
           
           {/* Booking Mode Selector */}
           <div className="flex bg-black/40 p-2 rounded-3xl border border-white/10">
              <button 
                onClick={() => setFormData({...formData, mode: 'CUSTOM'})}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.mode === 'CUSTOM' ? 'bg-yellow-400 text-black shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
              >
                Custom Path
              </button>
              <button 
                onClick={() => setFormData({...formData, mode: 'PACKAGE'})}
                className={`flex-1 py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${formData.mode === 'PACKAGE' ? 'bg-white text-black shadow-lg scale-[1.02]' : 'text-slate-500 hover:text-white'}`}
              >
                Elite Tours
              </button>
           </div>

           {/* Personal Info Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Client Signature</label>
                <input placeholder="ENTER FULL NAME" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/60 p-5 rounded-3xl border border-white/10 text-white font-black italic outline-none focus:border-yellow-400 transition-all text-base placeholder:text-white/5" />
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Signal Line (Mobile)</label>
                <input placeholder="10 DIGITS" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-black/60 p-5 rounded-3xl border border-white/10 text-white font-black italic outline-none focus:border-yellow-400 transition-all text-base placeholder:text-white/5" />
              </div>
           </div>

           {/* Mission Schedule */}
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Mission Schedule</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-black/60 p-5 rounded-3xl border border-white/10 focus-within:border-yellow-400/50 transition-colors">
                  <span className="text-[8px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Start Date</span>
                  <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="bg-transparent w-full outline-none text-white font-black text-sm uppercase cursor-pointer" />
                </div>
                <div className="bg-black/60 p-5 rounded-3xl border border-white/10 focus-within:border-yellow-400/50 transition-colors">
                  <span className="text-[8px] font-black text-slate-600 uppercase mb-2 block tracking-widest">Start Time</span>
                  <input type="time" value={formData.time} onChange={e => setFormData({...formData, time: e.target.value})} className="bg-transparent w-full outline-none text-white font-black text-sm uppercase cursor-pointer" />
                </div>
              </div>
           </div>

           {/* Location Intel */}
           <div className="space-y-6">
              {formData.mode === 'CUSTOM' ? (
                <div className="space-y-6">
                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-3 block italic">Extraction Node (Pickup)</label>
                    <input placeholder="SEARCH SECTOR" value={formData.pickup} onChange={e => setFormData({...formData, pickup: e.target.value})} onFocus={() => setFocusedField('pickup')} className="w-full bg-black/60 p-5 rounded-3xl border border-white/10 text-white font-black italic outline-none focus:border-yellow-400 transition-all text-base placeholder:text-white/5" />
                    <AnimatePresence>
                      {focusedField === 'pickup' && suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 top-full mt-3 bg-slate-900 border border-white/20 rounded-3xl p-3 z-[100] shadow-4xl backdrop-blur-3xl">
                          {suggestions.map(loc => (
                            <button key={loc.id} onClick={() => { setFormData({...formData, pickup: loc.name}); setFocusedField(null); }} className="w-full text-left p-4 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all flex justify-between items-center group">
                              <span className="text-sm font-black uppercase italic truncate">{loc.name}</span>
                              <span className="text-[10px] font-bold opacity-40 uppercase ml-2 group-hover:opacity-100">{loc.district}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <div className="relative">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 mb-3 block italic">Objective Node (Drop)</label>
                    <input placeholder="SPECIFY TARGET" value={formData.drop} onChange={e => setFormData({...formData, drop: e.target.value})} onFocus={() => setFocusedField('drop')} className="w-full bg-black/60 p-5 rounded-3xl border border-white/10 text-white font-black italic outline-none focus:border-yellow-400 transition-all text-base placeholder:text-white/5" />
                    <AnimatePresence>
                      {focusedField === 'drop' && suggestions.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="absolute left-0 right-0 top-full mt-3 bg-slate-900 border border-white/20 rounded-3xl p-3 z-[100] shadow-4xl backdrop-blur-3xl">
                          {suggestions.map(loc => (
                            <button key={loc.id} onClick={() => { setFormData({...formData, drop: loc.name}); setFocusedField(null); }} className="w-full text-left p-4 rounded-2xl hover:bg-yellow-400 hover:text-black transition-all flex justify-between items-center group">
                              <span className="text-sm font-black uppercase italic truncate">{loc.name}</span>
                              <span className="text-[10px] font-bold opacity-40 uppercase ml-2 group-hover:opacity-100">{loc.district}</span>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 block italic">Select Tour Profile</label>
                   <div className="grid grid-cols-1 gap-4">
                      {Object.keys(FIXED_PACKAGES).map(pkgName => (
                        <button 
                          key={pkgName}
                          onClick={() => setFormData({...formData, drop: pkgName})}
                          className={`p-5 md:p-6 rounded-[35px] border text-left transition-all relative overflow-hidden group ${formData.drop === pkgName ? 'bg-white border-white text-black shadow-2xl scale-[1.01]' : 'bg-black/40 border-white/10 text-slate-400 hover:border-white/30'}`}
                        >
                           <div className="flex justify-between items-start gap-4">
                              <div className="flex-1">
                                 <p className="text-[8px] font-black uppercase tracking-[3px] opacity-60 mb-1 italic">Elite Circuit Node</p>
                                 <p className="text-sm md:text-base font-black italic uppercase leading-tight tracking-tight">{pkgName}</p>
                              </div>
                              <div className={`shrink-0 font-black italic text-sm ${formData.drop === pkgName ? 'text-black' : 'text-yellow-400'}`}>
                                ₹{FIXED_PACKAGES[pkgName].fare}
                              </div>
                           </div>
                        </button>
                      ))}
                   </div>
                </div>
              )}
           </div>

           {/* Unit Class Selection - Refactored for better visibility */}
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block ml-4 italic">Deployment Unit Class</label>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {vehicles.map(v => (
                  <button 
                    key={v.id} 
                    onClick={() => setFormData({...formData, vehicleId: v.id})}
                    className={`p-4 md:p-5 rounded-[30px] md:rounded-[40px] border transition-all flex flex-col items-center justify-center gap-2 md:gap-3 active:scale-95 relative group ${
                      formData.vehicleId === v.id 
                        ? 'bg-yellow-400 border-yellow-500 shadow-yellow-tactical' 
                        : 'bg-black/30 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="h-16 md:h-24 w-full flex items-center justify-center">
                      <img 
                        src={v.image} 
                        className={`max-w-full max-h-full object-contain transition-all duration-500 ${
                          formData.vehicleId === v.id ? 'scale-110 drop-shadow-2xl opacity-100' : 'opacity-40 grayscale group-hover:grayscale-0 group-hover:opacity-70'
                        }`} 
                        alt={v.id} 
                      />
                    </div>
                    <div className="space-y-1 text-center">
                      <div className={`text-[9px] md:text-[11px] font-black uppercase tracking-[1px] transition-colors leading-none italic ${
                        formData.vehicleId === v.id ? 'text-black' : 'text-slate-500'
                      }`}>
                        {v.id}
                      </div>
                      <div className={`text-[7px] font-bold uppercase tracking-widest ${
                        formData.vehicleId === v.id ? 'text-black/60' : 'text-slate-700'
                      }`}>
                        Cap: {v.capacity}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
           </div>

           {/* Auxiliary Config Grid */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Crew Count</label>
                 <div className="flex items-center bg-black/60 p-2 rounded-3xl border border-white/10 h-[64px]">
                    <button onClick={() => setFormData({...formData, members: Math.max(1, formData.members - 1)})} className="w-14 h-full flex items-center justify-center text-white/20 hover:text-yellow-400 transition-colors font-black text-2xl">-</button>
                    <span className="flex-1 text-center font-black text-white text-xl italic tracking-tighter">{formData.members}</span>
                    <button onClick={() => setFormData({...formData, members: Math.min(selectedVehicle.capacity, formData.members + 1)})} className="w-14 h-full flex items-center justify-center text-white/20 hover:text-yellow-400 transition-colors font-black text-2xl">+</button>
                 </div>
              </div>
              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-4 italic">Climate Protocol</label>
                 <div className="flex bg-black/60 p-2 rounded-3xl border border-white/10 h-[64px]">
                    <button onClick={() => setFormData({...formData, isAc: false})} className={`flex-1 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${!formData.isAc ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>Standard</button>
                    <button onClick={() => setFormData({...formData, isAc: true})} className={`flex-1 rounded-2xl font-black text-[9px] uppercase tracking-widest transition-all ${formData.isAc ? 'bg-white text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>Premium AC</button>
                 </div>
              </div>
           </div>

           {/* Intelligence Feed */}
           <div className="bg-black/60 p-8 rounded-[40px] border border-white/10 flex justify-between items-center shadow-inner relative overflow-hidden">
              <div className="absolute inset-0 tactical-grid opacity-5" />
              <div className="relative z-10">
                 <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-2 italic">Grid Range Intel</p>
                 <p className={`text-2xl font-black italic tracking-tighter ${calcError ? 'text-red-500' : 'text-white'}`}>
                   {isCalculating ? 'SCANNING...' : (calculatedDistance ? `${calculatedDistance.toFixed(1)} KM` : '--')}
                 </p>
              </div>
              <div className="text-right relative z-10">
                 <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-2 italic">Target Yield</p>
                 <p className="text-3xl md:text-5xl font-black text-yellow-400 italic tracking-tighter leading-none">₹{fareBreakdown?.totalFare || '--'}</p>
              </div>
           </div>

           {validationError && (
             <motion.p initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-red-500 text-[10px] font-black uppercase text-center tracking-[3px] bg-red-500/10 py-4 rounded-2xl border border-red-500/20 italic">MISSION_CRITICAL_ERROR: {validationError}</motion.p>
           )}

           <button 
             disabled={isCalculating || phase === 'ASSIGNING'} 
             onClick={handleBooking} 
             className={`w-full py-7 md:py-8 rounded-[40px] font-black uppercase tracking-[8px] md:tracking-[12px] shadow-3xl transition-all text-sm md:text-base border-b-[8px] active:translate-y-2 ${isCalculating ? 'bg-slate-800 text-slate-600 border-slate-900 opacity-50' : 'bg-yellow-400 text-black border-yellow-600 hover:scale-[1.01]'}`}
           >
            {phase === 'ASSIGNING' ? 'ESTABLISHING UPLINK...' : 'INITIATE DEPLOYMENT ➔'}
           </button>
        </div>
      </main>

      <AnimatePresence>
        {showNoDriverModal && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 bg-black/95 backdrop-blur-3xl">
             <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel max-w-md w-full p-10 md:p-12 rounded-[50px] md:rounded-[60px] text-center space-y-8 border-yellow-400/20">
                <div className="w-20 h-20 bg-yellow-400/10 rounded-full flex items-center justify-center mx-auto text-4xl">⚠️</div>
                <div className="space-y-3">
                   <h3 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Signal Deadlock</h3>
                   <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">No tactical units currently active in this sector. HQ override required.</p>
                </div>
                <div className="space-y-4 pt-4">
                   <button onClick={() => window.open('https://wa.me/918608000999', '_blank')} className="w-full bg-[#25D366] text-white py-5 md:py-6 rounded-3xl font-black uppercase tracking-widest text-xs shadow-2xl">Manual HQ Dispatch</button>
                   <button onClick={() => setShowNoDriverModal(false)} className="w-full bg-white/5 border border-white/10 text-white py-5 md:py-6 rounded-3xl font-black uppercase tracking-widest text-[9px] italic">Abort Override</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
