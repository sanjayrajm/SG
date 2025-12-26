
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle, Booking, BookingStatus, DriverProfile } from '../types';
import { getTacticalRouteIntel } from '../geminiService';
import { calculateMissionFare } from '../services/fareCalculationService';
import { NEURAL_LOCATION_REGISTRY } from '../constants';

interface Props {
  vehicles: Vehicle[];
  bookings: Booking[];
  onNewBooking: (b: Booking) => void;
  onBackToHome?: () => void;
}

type BookingPhase = 'SELECTION' | 'CALCULATION' | 'CONFIRMED';
type SidebarTab = 'BOOK' | 'HISTORY';

// Real-time tracking sub-statuses for visual feedback
type TrackingStatus = 'UNIT_ASSIGNED' | 'EN_ROUTE' | 'ARRIVING_SOON' | 'AT_PICKUP';

export const CustomerApp: React.FC<Props> = ({ vehicles, bookings, onNewBooking, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('BOOK');
  const [phase, setPhase] = useState<BookingPhase>('SELECTION');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [focusedField, setFocusedField] = useState<'pickup' | 'drop' | null>(null);
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [isAc, setIsAc] = useState(true);
  
  // Filter vehicles based on passenger capacity
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.capacity >= passengerCount);
  }, [vehicles, passengerCount]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(availableVehicles[0]?.id || 'SEDAN');

  // Auto-correct selection if current vehicle is no longer available
  useEffect(() => {
    if (!availableVehicles.find(v => v.id === selectedVehicleId) && availableVehicles.length > 0) {
      setSelectedVehicleId(availableVehicles[0].id);
    }
  }, [availableVehicles, selectedVehicleId]);

  const [routeInfo, setRouteInfo] = useState<any>(null);
  const [fareBreakdown, setFareBreakdown] = useState<any>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [assignedDriver, setAssignedDriver] = useState<DriverProfile | null>(null);
  const [otp] = useState(() => Math.floor(1000 + Math.random() * 9000).toString());
  
  // Real-time tracking state
  const [trackingStatus, setTrackingStatus] = useState<TrackingStatus>('UNIT_ASSIGNED');
  const [trackingProgress, setTrackingProgress] = useState(0);
  const [showLiveTracking, setShowLiveTracking] = useState(false);
  const [eta, setEta] = useState('Calculating...');

  const searchRef = useRef<HTMLDivElement>(null);
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId) || vehicles[0];

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.warn(err)
      );
    }

    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setFocusedField(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tracking simulator & Dynamic ETA logic
  useEffect(() => {
    if (phase === 'CONFIRMED') {
      const stages: TrackingStatus[] = ['UNIT_ASSIGNED', 'EN_ROUTE', 'ARRIVING_SOON', 'AT_PICKUP'];
      const etaRanges = ['8-10 Min', '4-7 Min', '1-2 Min', 'Arrived'];
      let currentStageIdx = 0;
      
      setEta(etaRanges[0]);

      const interval = setInterval(() => {
        if (currentStageIdx < stages.length - 1) {
          currentStageIdx++;
          const newStatus = stages[currentStageIdx];
          setTrackingStatus(newStatus);
          setEta(etaRanges[currentStageIdx]);
          setTrackingProgress((currentStageIdx / (stages.length - 1)) * 100);
        } else {
          clearInterval(interval);
        }
      }, 7000); 

      return () => clearInterval(interval);
    }
  }, [phase]);

  const calculateRoute = async () => {
    if (!drop.trim()) return;
    setIsAnalyzing(true);
    setPhase('CALCULATION');
    const intel = await getTacticalRouteIntel(pickup || "Current Location", drop, userLocation || undefined);
    setRouteInfo(intel);
    
    if (intel.distanceKm > 0) {
      const breakdown = calculateMissionFare(intel.distanceKm, selectedVehicle, isAc);
      setFareBreakdown(breakdown);
    }
    setIsAnalyzing(false);
  };

  // Re-calculate fare if vehicle or AC toggle changes after initial calculation
  useEffect(() => {
    if (phase === 'CALCULATION' && routeInfo?.distanceKm) {
      const breakdown = calculateMissionFare(routeInfo.distanceKm, selectedVehicle, isAc);
      setFareBreakdown(breakdown);
    }
  }, [selectedVehicle, isAc]);

  const finalizeBooking = () => {
    const booking: Booking = {
      id: `SG-${Date.now().toString().slice(-4)}`,
      customerName: "Neural User",
      customerPhone: "8608000999",
      customerEmail: "neural.user@sgcalltaxi.com",
      passengerCount: passengerCount,
      pickup: pickup || "Current Location",
      pickupCoords: userLocation || {lat: 0, lng: 0},
      drop, 
      dropCoords: {lat: 0, lng: 0},
      vehicleType: `${selectedVehicleId}`,
      status: BookingStatus.ASSIGNED,
      fare: fareBreakdown?.totalFare || 550,
      paymentStatus: 'Paid',
      paymentMethod: 'UPI',
      otp: otp,
      driverId: 'D1',
      timestamp: new Date(),
      isAc: isAc
    };
    onNewBooking(booking);
    setAssignedDriver({ 
      id: 'D1', 
      name: 'Sanjay S.', 
      vehicleNo: 'TN 21 AX 1234',
      rating: 4.9,
      totalTrips: 1240,
      phone: '8608000999'
    } as any);
    setPhase('CONFIRMED');
    setTrackingStatus('UNIT_ASSIGNED');
    setTrackingProgress(0);
  };

  const getFilteredLocations = (query: string) => {
    if (!query) return NEURAL_LOCATION_REGISTRY.slice(0, 4);
    return NEURAL_LOCATION_REGISTRY.filter(loc => 
      loc.name.toLowerCase().includes(query.toLowerCase()) || 
      loc.district.toLowerCase().includes(query.toLowerCase())
    ).slice(0, 6);
  };

  const suggestions = focusedField === 'pickup' ? getFilteredLocations(pickup) : getFilteredLocations(drop);

  const getStatusLabel = (status: TrackingStatus) => {
    switch (status) {
      case 'UNIT_ASSIGNED': return 'Tactical Unit Assigned';
      case 'EN_ROUTE': return 'En Route to Pickup';
      case 'ARRIVING_SOON': return 'Arriving Soon';
      case 'AT_PICKUP': return 'Unit At Location';
      default: return 'Active Session';
    }
  };

  return (
    <div className="h-screen w-full bg-slate-950 relative overflow-hidden flex flex-col lg:flex-row font-sans">
      <aside className="w-full lg:w-96 bg-slate-900 border-r border-white/5 flex flex-col p-8 z-[300] shadow-4xl">
        <div className="flex bg-white/5 p-1 rounded-2xl mb-8 border border-white/10">
          <button 
            onClick={() => { setActiveTab('BOOK'); setPhase('SELECTION'); }}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'BOOK' ? 'bg-yellow-400 text-black shadow-xl' : 'text-slate-500'}`}
          >
            Deploy
          </button>
          <button 
            onClick={() => setActiveTab('HISTORY')}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'HISTORY' ? 'bg-yellow-400 text-black shadow-xl' : 'text-slate-500'}`}
          >
            History
          </button>
        </div>

        <div className="flex-1 overflow-y-auto no-scrollbar space-y-8" ref={searchRef}>
          <AnimatePresence mode="wait">
            {activeTab === 'BOOK' && phase !== 'CONFIRMED' ? (
              <motion.div 
                key="book-tab"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                   <h2 className="text-white font-black text-xl italic uppercase tracking-tighter">Mission Selection</h2>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Specify target coordinates</p>
                </div>
                
                <div className="space-y-3 relative">
                   {/* Pickup Field */}
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-yellow-400/40 text-xs">📍</div>
                      <input 
                        placeholder="Origin (Current Location)" 
                        value={pickup} 
                        onChange={e => setPickup(e.target.value)}
                        onFocus={() => setFocusedField('pickup')}
                        className="w-full bg-black/40 pl-10 pr-5 py-4 rounded-2xl border border-white/10 text-white font-black italic outline-none focus:border-yellow-400 transition-all text-sm" 
                      />
                      <AnimatePresence>
                        {focusedField === 'pickup' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-slate-800/95 border border-white/10 rounded-2xl p-2 z-[400] shadow-2xl backdrop-blur-xl overflow-hidden"
                          >
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest px-3 py-1">Tactical Registry</p>
                            {suggestions.map(loc => (
                              <button 
                                key={loc.id} 
                                onClick={() => { setPickup(loc.name); setFocusedField(null); }}
                                className="w-full text-left p-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all group flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-[10px] font-black uppercase italic">{loc.name}</p>
                                  <p className="text-[7px] font-bold opacity-60 uppercase">{loc.district}</p>
                                </div>
                                <span className="text-[10px] opacity-0 group-hover:opacity-100">➔</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>

                   {/* Drop Field */}
                   <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xs">🏁</div>
                      <input 
                        placeholder="Target Destination" 
                        value={drop} 
                        onChange={e => setDrop(e.target.value)} 
                        onFocus={() => setFocusedField('drop')}
                        className="w-full bg-black/40 pl-10 pr-5 py-4 rounded-2xl border border-white/10 text-white font-black italic outline-none focus:border-yellow-400 transition-all text-sm" 
                      />
                      <AnimatePresence>
                        {focusedField === 'drop' && (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-slate-800/95 border border-white/10 rounded-2xl p-2 z-[400] shadow-2xl backdrop-blur-xl overflow-hidden"
                          >
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest px-3 py-1">Neural Node Selection</p>
                            {suggestions.map(loc => (
                              <button 
                                key={loc.id} 
                                onClick={() => { setDrop(loc.name); setFocusedField(null); }}
                                className="w-full text-left p-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all group flex items-center justify-between"
                              >
                                <div>
                                  <p className="text-[10px] font-black uppercase italic">{loc.name}</p>
                                  <p className="text-[7px] font-bold opacity-60 uppercase">{loc.district}</p>
                                </div>
                                <span className="text-[10px] opacity-0 group-hover:opacity-100">➔</span>
                              </button>
                            ))}
                          </motion.div>
                        )}
                      </AnimatePresence>
                   </div>
                </div>

                {/* Tactical Config: Capacity & AC */}
                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-end px-2">
                      <div className="space-y-2">
                         <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Unit Capacity</label>
                         <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                            {[1, 4, 7].map(num => (
                              <button 
                                key={num}
                                onClick={() => setPassengerCount(num)}
                                className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${passengerCount === num ? 'bg-yellow-400 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                              >
                                {num === 1 ? 'Solo' : num === 4 ? 'Group' : 'XL'}
                              </button>
                            ))}
                         </div>
                      </div>
                      <div className="space-y-2">
                         <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest text-right block">Climate</label>
                         <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                            <button onClick={() => setIsAc(false)} className={`px-3 py-2 rounded-lg text-[8px] font-black transition-all ${!isAc ? 'bg-white text-black' : 'text-slate-500'}`}>Standard</button>
                            <button onClick={() => setIsAc(true)} className={`px-3 py-2 rounded-lg text-[8px] font-black transition-all ${isAc ? 'bg-white text-black' : 'text-slate-500'}`}>AC</button>
                         </div>
                      </div>
                   </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest px-2">Unit Class Selection</label>
                   <div className="grid grid-cols-2 gap-2">
                      {availableVehicles.map(v => (
                        <button 
                          key={v.id} 
                          onClick={() => setSelectedVehicleId(v.id)} 
                          className={`p-4 rounded-2xl font-black text-[10px] uppercase transition-all flex flex-col items-center gap-2 border ${selectedVehicleId === v.id ? 'bg-yellow-400 text-black border-yellow-500 shadow-yellow-tactical' : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'}`}
                        >
                           <span>{v.id}</span>
                           <img src={v.image} className="h-6 object-contain opacity-60" alt={v.id} />
                        </button>
                      ))}
                      {availableVehicles.length === 0 && (
                        <p className="col-span-2 text-center text-[8px] text-red-500 font-black uppercase italic py-4">No unit matches required capacity</p>
                      )}
                   </div>
                </div>

                <button 
                  disabled={isAnalyzing || availableVehicles.length === 0}
                  onClick={calculateRoute} 
                  className={`w-full bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl transition-all ${isAnalyzing || availableVehicles.length === 0 ? 'opacity-50' : 'hover:scale-[1.02] border-b-4 border-yellow-600'}`}
                >
                  {isAnalyzing ? 'Scanning Neural Nodes...' : 'Analyze Path'}
                </button>

                {phase === 'CALCULATION' && routeInfo && !isAnalyzing && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pt-6 border-t border-white/5">
                     <div className="grid grid-cols-2 gap-4 text-center">
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><p className="text-[10px] text-slate-500 uppercase font-black">KM</p><p className="text-2xl font-black text-white">{routeInfo.distanceKm}</p></div>
                       <div className="bg-white/5 p-4 rounded-2xl border border-white/5"><p className="text-[10px] text-slate-500 uppercase font-black">MIN</p><p className="text-2xl font-black text-white">{routeInfo.durationMin}</p></div>
                     </div>

                     <div className="bg-yellow-400 p-8 rounded-[40px] text-center shadow-yellow-tactical">
                        <p className="text-[10px] font-black uppercase opacity-40">Final Yield Estimate ({isAc ? 'AC' : 'Standard'})</p>
                        <p className="text-4xl font-black italic">₹{fareBreakdown?.totalFare || 550}</p>
                     </div>
                     <button onClick={finalizeBooking} className="w-full bg-white text-black py-6 rounded-3xl font-black uppercase text-xs tracking-widest border-b-4 border-slate-300 active:translate-y-0.5">Deploy Mission</button>
                  </motion.div>
                )}
              </motion.div>
            ) : activeTab === 'HISTORY' ? (
              <motion.div 
                key="history-tab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                <div className="space-y-1">
                   <h2 className="text-white font-black text-xl italic uppercase tracking-tighter">Mission Logs</h2>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Historical Data Extraction</p>
                </div>

                <div className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="py-20 text-center space-y-4 opacity-20">
                      <span className="text-4xl">📜</span>
                      <p className="text-[10px] font-black uppercase tracking-[5px]">No Logs Recorded</p>
                    </div>
                  ) : (
                    bookings.slice().reverse().map(b => (
                      <div key={b.id} className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 hover:border-yellow-400/30 transition-all group">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-yellow-400 font-black text-[9px] tracking-widest">ID: {b.id}</p>
                            <p className="text-[10px] text-slate-500 font-bold uppercase">{b.timestamp.toLocaleDateString()}</p>
                          </div>
                          <span className={`px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-widest ${
                            b.status === BookingStatus.COMPLETED ? 'bg-green-500/20 text-green-500' : 'bg-yellow-400/20 text-yellow-400'
                          }`}>
                            {b.status}
                          </span>
                        </div>
                        <div className="space-y-2">
                          <p className="text-xs font-black text-white italic truncate uppercase">{b.drop}</p>
                          <p className="text-[8px] text-slate-500 font-bold truncate uppercase">From: {b.pickup}</p>
                        </div>
                        <div className="flex justify-between items-center pt-2 border-t border-white/5">
                           <p className="text-[8px] font-black text-slate-500 uppercase">Mission Yield</p>
                           <p className="text-lg font-black text-white italic">₹{b.fare}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                <div className="space-y-1">
                   <h2 className="text-white font-black text-xl italic uppercase tracking-tighter">Live Deployment</h2>
                   <p className="text-[8px] font-black text-yellow-500 uppercase tracking-widest">Mission ID: {bookings[bookings.length-1]?.id}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                   <div className="flex justify-between items-center mb-2">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Live ETA</p>
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                   </div>
                   <p className="text-3xl font-black italic text-white uppercase">{eta}</p>
                </div>
                <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">Status</p>
                   <p className="text-xs font-black uppercase text-yellow-400">{getStatusLabel(trackingStatus)}</p>
                </div>
                <button 
                  onClick={() => setShowLiveTracking(true)}
                  className="w-full bg-yellow-400 text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest"
                >
                  Expand Tactical View
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={onBackToHome} className="mt-8 pt-8 border-t border-white/5 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Abort Link</button>
      </aside>

      <div className="flex-1 relative bg-slate-800">
         <div className="absolute inset-0 tactical-grid opacity-20" />
         
         <AnimatePresence>
           {phase === 'CONFIRMED' && assignedDriver && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto no-scrollbar">
                
                <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-start py-12">
                   
                   {/* Left Panel: Mission Intel & Status */}
                   <div className="space-y-10 text-left">
                      <div className="space-y-2">
                         <span className="bg-yellow-400/20 text-yellow-400 px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[5px]">Deployment Confirmed</span>
                         <h2 className="text-5xl md:text-7xl font-black text-white uppercase italic tracking-tighter leading-none">
                            {getStatusLabel(trackingStatus)}
                         </h2>
                      </div>

                      <div className="bg-white/5 border border-white/10 p-8 rounded-[50px] space-y-6 backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl font-black italic">SG</div>
                         
                         <div className="grid grid-cols-2 gap-8">
                            <div>
                               <div className="flex items-center gap-2 mb-2">
                                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">ETA to Pickup</p>
                                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                               </div>
                               <p className="text-4xl font-black italic text-yellow-400 uppercase leading-none">{eta}</p>
                            </div>
                            <div>
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">Distance</p>
                               <p className="text-4xl font-black italic text-white">1.2 KM</p>
                            </div>
                         </div>

                         <div className="space-y-4 pt-6 border-t border-white/5">
                            <div className="flex justify-between items-center">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Origin</p>
                               <p className="text-[11px] font-black text-white italic uppercase truncate max-w-[200px]">{pickup || 'Current Location'}</p>
                            </div>
                            <div className="flex justify-between items-center">
                               <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Target</p>
                               <p className="text-[11px] font-black text-white italic uppercase truncate max-w-[200px]">{drop}</p>
                            </div>
                         </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                         <motion.button 
                           whileHover={{ scale: 1.02 }}
                           whileTap={{ scale: 0.98 }}
                           onClick={() => setShowLiveTracking(true)}
                           className="flex-1 bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-[4px] shadow-2xl"
                         >
                            Live Tactical Tracking
                         </motion.button>
                         <button className="flex-1 bg-white/5 border border-white/10 text-white py-6 rounded-3xl font-black uppercase text-xs tracking-[4px]">
                            Contact Support
                         </button>
                      </div>
                   </div>

                   {/* Right Panel: Driver & Vehicle Intel */}
                   <div className="space-y-8">
                      <div className="bg-slate-900 border border-white/10 p-10 rounded-[60px] space-y-10 shadow-4xl text-center relative overflow-hidden">
                         <div className="absolute inset-0 tactical-grid opacity-10" />
                         
                         <div className="relative flex flex-col items-center gap-6">
                            <div className="relative">
                               <img 
                                 src={`https://i.pravatar.cc/150?u=${assignedDriver.id}`} 
                                 className="w-32 h-32 rounded-[40px] border-4 border-yellow-400 shadow-3xl" 
                                 alt="Partner" 
                               />
                               <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest">RANK: ELITE</div>
                            </div>
                            <div className="space-y-1">
                               <h4 className="text-3xl font-black text-white italic uppercase tracking-tighter">{assignedDriver.name}</h4>
                               <div className="flex items-center justify-center gap-2">
                                  <span className="text-yellow-400 text-xs">★</span>
                                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assignedDriver.rating} Rating</p>
                               </div>
                            </div>
                         </div>

                         <div className="grid grid-cols-1 gap-4 pt-8 border-t border-white/5">
                            <div className="bg-black/40 p-6 rounded-3xl border border-white/5 flex justify-between items-center">
                               <div className="text-left">
                                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Unit Registry</p>
                                  <p className="text-lg font-black italic text-white">{assignedDriver.vehicleNo}</p>
                               </div>
                               <div className="text-right">
                                  <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Unit Type</p>
                                  <p className="text-lg font-black italic text-yellow-400">{selectedVehicleId}</p>
                               </div>
                            </div>
                         </div>

                         <div className="pt-4">
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-3">Authentication Key (OTP)</p>
                            <div className="bg-yellow-400/10 border-2 border-dashed border-yellow-400/30 text-yellow-400 px-10 py-4 rounded-2xl inline-block font-black text-4xl tracking-[10px] italic">
                               {otp}
                            </div>
                         </div>
                      </div>

                      <div className="bg-white/5 p-8 rounded-[40px] border border-white/5 flex items-center justify-between">
                         <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-green-500/20 rounded-xl flex items-center justify-center text-green-500">✓</div>
                            <div className="text-left">
                               <p className="text-[10px] font-black text-white uppercase italic">Mission Secured</p>
                               <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest">Secured via Neural Link</p>
                            </div>
                         </div>
                         <p className="text-2xl font-black italic text-white">₹{fareBreakdown?.totalFare || 550}</p>
                      </div>
                   </div>
                </div>

                {/* Overlay Live Tracking Map View */}
                <AnimatePresence>
                   {showLiveTracking && (
                     <motion.div 
                       initial={{ opacity: 0, scale: 0.95 }}
                       animate={{ opacity: 1, scale: 1 }}
                       exit={{ opacity: 0, scale: 0.95 }}
                       className="fixed inset-0 z-[600] bg-slate-950 p-6 md:p-12 flex flex-col items-center justify-center"
                     >
                        <div className="absolute inset-0 tactical-grid opacity-20" />
                        <button 
                          onClick={() => setShowLiveTracking(false)}
                          className="absolute top-12 right-12 text-slate-500 font-black uppercase text-[10px] tracking-[5px] hover:text-white transition-all z-[700]"
                        >
                          Close Tactical View
                        </button>

                        <div className="w-full h-full max-w-5xl relative flex flex-col items-center justify-center space-y-12">
                           <div className="relative w-full aspect-square md:aspect-video bg-black/40 rounded-[60px] border-4 border-white/5 overflow-hidden shadow-4xl">
                              <div className="absolute inset-0 tactical-grid opacity-30" />
                              
                              <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                                 <motion.div 
                                   animate={{ scale: [1, 3], opacity: [0.5, 0] }}
                                   transition={{ repeat: Infinity, duration: 2 }}
                                   className="w-40 h-40 bg-yellow-400/20 rounded-full border border-yellow-400/30"
                                 />
                                 <motion.div 
                                   animate={{ scale: [1, 2], opacity: [0.8, 0] }}
                                   transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
                                   className="absolute inset-0 bg-yellow-400/10 rounded-full border border-yellow-400/20"
                                 />
                                 <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center text-xl shadow-yellow-tactical relative z-10">📍</div>
                                 <p className="absolute top-14 left-1/2 -translate-x-1/2 text-[7px] font-black text-yellow-400 uppercase tracking-widest whitespace-nowrap">MISSION_ORIGIN</p>
                              </div>

                              <motion.div 
                                initial={{ x: -300, y: -200 }}
                                animate={{ x: trackingProgress * 3 - 150, y: trackingProgress * 1.5 - 100 }}
                                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-20"
                              >
                                 <div className="relative">
                                    <div className="w-12 h-12 bg-white rounded-[20px] flex items-center justify-center text-xl shadow-4xl border-2 border-yellow-400">🚕</div>
                                    <motion.div 
                                      animate={{ scale: [1, 1.5], opacity: [1, 0] }}
                                      transition={{ repeat: Infinity, duration: 1 }}
                                      className="absolute inset-0 bg-yellow-400/50 rounded-[20px]"
                                    />
                                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 whitespace-nowrap">
                                       <p className="text-[7px] font-black text-white uppercase tracking-widest">{assignedDriver.name}</p>
                                    </div>
                                 </div>
                              </motion.div>

                              <div className="absolute bottom-12 left-12 space-y-2">
                                 <p className="text-[8px] font-black text-slate-500 uppercase tracking-[5px]">Telemetry Signal</p>
                                 <div className="flex items-center gap-3">
                                    <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]" />
                                    <p className="text-xs font-black italic text-white uppercase tracking-tighter">GPS LINK STABLE • 14ms LATENCY</p>
                                 </div>
                              </div>
                           </div>

                           <div className="w-full space-y-6">
                              <div className="flex justify-between items-end">
                                 <h3 className="text-4xl font-black italic uppercase text-white tracking-tighter">{getStatusLabel(trackingStatus)}</h3>
                                 <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-1">
                                       <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">ETA</span>
                                       <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                                    </div>
                                    <p className="text-4xl font-black italic text-yellow-400 uppercase leading-none">{eta}</p>
                                 </div>
                              </div>
                              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                 <motion.div 
                                   className="h-full bg-yellow-400 shadow-yellow-tactical"
                                   initial={{ width: 0 }}
                                   animate={{ width: `${trackingProgress}%` }}
                                   transition={{ duration: 1 }}
                                 />
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-500 tracking-[5px]">
                                 <span className={trackingStatus === 'UNIT_ASSIGNED' ? 'text-yellow-400' : ''}>ASSIGNED</span>
                                 <span className={trackingStatus === 'EN_ROUTE' ? 'text-yellow-400' : ''}>EN ROUTE</span>
                                 <span className={trackingStatus === 'ARRIVING_SOON' ? 'text-yellow-400' : ''}>ARRIVING</span>
                                 <span className={trackingStatus === 'AT_PICKUP' ? 'text-yellow-400' : ''}>AT PICKUP</span>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>

                <div className="mt-12 flex gap-4 relative z-[510]">
                   <button onClick={() => { setPhase('SELECTION'); setActiveTab('HISTORY'); }} className="text-slate-600 font-black uppercase text-[10px] tracking-[5px] hover:text-white transition-colors">View Mission Logs</button>
                   <span className="text-slate-800">|</span>
                   <button onClick={() => setPhase('SELECTION')} className="text-slate-600 font-black uppercase text-[10px] tracking-[5px] hover:text-white transition-colors">Return to Deployment Hub</button>
                </div>
             </motion.div>
           )}
         </AnimatePresence>
      </div>
    </div>
  );
};
