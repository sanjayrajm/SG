
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

/**
 * NeuralPathVisualizer: Futuristic SVG polyline to simulate route pathfinding.
 */
const NeuralPathVisualizer: React.FC<{ active: boolean }> = ({ active }) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
      <svg width="100%" height="100%" viewBox="0 0 1000 600" fill="none" xmlns="http://www.w3.org/2000/svg">
        <AnimatePresence>
          {active && (
            <>
              {/* Extraction Node */}
              <motion.circle 
                initial={{ r: 0 }} animate={{ r: 10 }} exit={{ r: 0 }}
                cx="200" cy="450" fill="#FFC107" 
              />
              <motion.circle 
                animate={{ r: [10, 30], opacity: [0.5, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                cx="200" cy="450" fill="#FFC107" 
              />
              
              {/* Objective Node */}
              <motion.circle 
                initial={{ r: 0 }} animate={{ r: 10 }} exit={{ r: 0 }}
                cx="800" cy="150" fill="#ffffff" 
              />
              <motion.circle 
                animate={{ r: [10, 30], opacity: [0.3, 0] }}
                transition={{ repeat: Infinity, duration: 2, delay: 0.5 }}
                cx="800" cy="150" fill="#ffffff" 
              />

              {/* Neural Polyline Path */}
              <motion.path
                d="M200 450 L350 400 L450 420 L600 250 L700 270 L800 150"
                stroke="#FFC107"
                strokeWidth="4"
                strokeDasharray="15 15"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 0.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.5, ease: "easeInOut" }}
              />
              
              <motion.path
                d="M200 450 L350 400 L450 420 L600 250 L700 270 L800 150"
                stroke="#FFC107"
                strokeWidth="8"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: [0, 1], 
                  opacity: [0, 0.4, 0] 
                }}
                transition={{ 
                  pathLength: { duration: 2.5, repeat: Infinity, ease: "linear" },
                  opacity: { duration: 2.5, repeat: Infinity, ease: "linear" }
                }}
              />

              {/* Tactical Scanning Grid Sub-Nodes */}
              <circle cx="350" cy="400" r="3" fill="#FFC107" opacity="0.3" />
              <circle cx="450" cy="420" r="3" fill="#FFC107" opacity="0.3" />
              <circle cx="600" cy="250" r="3" fill="#FFC107" opacity="0.3" />
              <circle cx="700" cy="270" r="3" fill="#FFC107" opacity="0.3" />
            </>
          )}
        </AnimatePresence>
      </svg>
    </div>
  );
};

export const CustomerApp: React.FC<Props> = ({ vehicles, bookings, onNewBooking, onBackToHome }) => {
  const [activeTab, setActiveTab] = useState<SidebarTab>('BOOK');
  const [phase, setPhase] = useState<BookingPhase>('SELECTION');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [focusedField, setFocusedField] = useState<'pickup' | 'drop' | null>(null);
  const [passengerCount, setPassengerCount] = useState<number>(1);
  const [isAc, setIsAc] = useState(true);
  
  const availableVehicles = useMemo(() => {
    return vehicles.filter(v => v.capacity >= passengerCount);
  }, [vehicles, passengerCount]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(availableVehicles[0]?.id || 'SEDAN');

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
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-slate-800/95 border border-white/10 rounded-2xl p-2 z-[400] shadow-2xl backdrop-blur-xl overflow-hidden"
                          >
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest px-3 py-1">Tactical Registry</p>
                            {suggestions.map(loc => (
                              <button key={loc.id} onClick={() => { setPickup(loc.name); setFocusedField(null); }} className="w-full text-left p-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all group flex items-center justify-between">
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
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
                            className="absolute left-0 right-0 top-full mt-2 bg-slate-800/95 border border-white/10 rounded-2xl p-2 z-[400] shadow-2xl backdrop-blur-xl overflow-hidden"
                          >
                            <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest px-3 py-1">Neural Node Selection</p>
                            {suggestions.map(loc => (
                              <button key={loc.id} onClick={() => { setDrop(loc.name); setFocusedField(null); }} className="w-full text-left p-3 rounded-xl hover:bg-yellow-400 hover:text-black transition-all group flex items-center justify-between">
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

                <div className="space-y-4 pt-2">
                   <div className="flex justify-between items-end px-2">
                      <div className="space-y-2">
                         <label className="text-[7px] font-black text-slate-500 uppercase tracking-widest block">Unit Capacity</label>
                         <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                            {[1, 4, 7].map(num => (
                              <button key={num} onClick={() => setPassengerCount(num)} className={`px-4 py-2 rounded-lg text-[9px] font-black transition-all ${passengerCount === num ? 'bg-yellow-400 text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}>
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
                        <button key={v.id} onClick={() => setSelectedVehicleId(v.id)} className={`p-4 rounded-2xl font-black text-[10px] uppercase transition-all flex flex-col items-center gap-2 border ${selectedVehicleId === v.id ? 'bg-yellow-400 text-black border-yellow-500 shadow-yellow-tactical' : 'bg-black/40 border-white/5 text-slate-500 hover:border-white/20'}`}>
                           <span>{v.id}</span>
                           <img src={v.image} className="h-6 object-contain opacity-60" alt={v.id} />
                        </button>
                      ))}
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
              <motion.div key="history-tab" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-6">
                <div className="space-y-1">
                   <h2 className="text-white font-black text-xl italic uppercase tracking-tighter">Mission Logs</h2>
                   <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Historical Data Extraction</p>
                </div>
                {/* ... history list items ... */}
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
                {/* ... other status cards ... */}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={onBackToHome} className="mt-8 pt-8 border-t border-white/5 text-slate-600 font-black uppercase text-[10px] tracking-widest hover:text-white transition-colors">Abort Link</button>
      </aside>

      <div className="flex-1 relative bg-slate-900">
         <div className="absolute inset-0 tactical-grid opacity-30" />
         
         {/* Route Visualization Map Layer */}
         <NeuralPathVisualizer active={phase === 'CALCULATION' && routeInfo && !isAnalyzing} />

         <AnimatePresence>
           {phase === 'CALCULATION' && routeInfo && !isAnalyzing && (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} 
               className="absolute top-12 left-1/2 -translate-x-1/2 z-[400] flex flex-col items-center gap-2"
             >
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 px-8 py-3 rounded-full flex items-center gap-6 shadow-4xl">
                   <div className="flex flex-col items-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Grid Range</p>
                      <p className="text-xl font-black italic text-yellow-400">{routeInfo.distanceKm} KM</p>
                   </div>
                   <div className="w-px h-8 bg-white/10" />
                   <div className="flex flex-col items-center">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Time Slice</p>
                      <p className="text-xl font-black italic text-white">{routeInfo.durationMin} MIN</p>
                   </div>
                </div>
                <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[4px] bg-slate-950/80 px-4 py-1 rounded-full backdrop-blur-md">Tactical Route Intel Verified</p>
             </motion.div>
           )}
         </AnimatePresence>

         <AnimatePresence>
           {phase === 'CONFIRMED' && assignedDriver && (
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-950/95 backdrop-blur-3xl z-[500] flex flex-col items-center justify-center p-6 md:p-12 text-center overflow-y-auto no-scrollbar">
                {/* ... existing confirmation content ... */}
             </motion.div>
           )}
         </AnimatePresence>

         {/* Grid Decorations */}
         <div className="absolute top-8 left-8 space-y-1 opacity-20 hidden md:block">
            <p className="text-[8px] font-black uppercase text-white tracking-[5px]">Sector: KPM_GRID_01</p>
            <p className="text-[8px] font-black uppercase text-white tracking-[5px]">Neural_Link: Established</p>
         </div>
      </div>
    </div>
  );
};
