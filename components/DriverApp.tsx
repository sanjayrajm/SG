
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverProfile, Booking, BookingStatus } from '../types';
import { sgNotify } from '../services/NotificationService';
import { getTacticalRouteIntel } from '../geminiService';

interface Props {
  profile: DriverProfile;
  bookings: Booking[];
  onStatusChange: (isOnline: boolean) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  onLogout: () => void;
}

type DriverTab = 'DASHBOARD' | 'MISSION' | 'HISTORY' | 'PROFILE';

/**
 * TacticalMap: An advanced navigational hub displaying real-time vehicle telemetry.
 */
const TacticalMap: React.FC<{ 
  coords: { lat: number; lng: number } | null; 
  isOnline: boolean; 
  activeMission: Booking | null;
  pendingMissions: Booking[];
  onAcceptMission: (b: Booking) => void;
}> = ({ coords, isOnline, activeMission, pendingMissions, onAcceptMission }) => {
  const [telemetry, setTelemetry] = useState({
    latency: '14ms',
    gForce: '1.0G',
    satelliteCount: 12,
    battery: '88%',
    heading: 0
  });
  const [selectedPending, setSelectedPending] = useState<Booking | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetry(prev => ({
        latency: isOnline ? `${Math.floor(Math.random() * 5 + 12)}ms` : '--',
        gForce: isOnline ? `${(1.0 + Math.random() * 0.1).toFixed(1)}G` : '0.0G',
        satelliteCount: isOnline ? 10 + Math.floor(Math.random() * 5) : 0,
        battery: prev.battery,
        heading: isOnline ? (prev.heading + (Math.random() * 10 - 5)) % 360 : prev.heading
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const getRadarOffset = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    const radius = 20 + (hash % 40); 
    return {
      left: `${50 + Math.cos(angle) * radius}%`,
      top: `${50 + Math.sin(angle) * radius}%`,
    };
  };

  const handlePinTap = (m: Booking) => {
    if (!isOnline) {
      sgNotify.playSmsSound();
      return;
    }
    sgNotify.playSmsSound();
    setSelectedPending(m);
  };

  return (
    <div className="relative w-full h-80 md:h-[520px] bg-[#020617] rounded-[40px] md:rounded-[60px] border-2 border-white/5 overflow-hidden shadow-4xl group">
      <div className="absolute inset-0 tactical-grid opacity-20 pointer-events-none" />
      
      <AnimatePresence>
        {isOnline && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-10 pointer-events-none origin-center"
          >
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="w-full h-full"
              style={{ background: 'conic-gradient(from 0deg, rgba(255,193,7,0.15) 0deg, transparent 90deg)' }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-0 flex items-center justify-center">
        {!coords ? (
          <div className="text-center space-y-4 px-6">
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="w-12 h-12 md:w-16 md:h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"
             />
             <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[5px] text-slate-500 animate-pulse italic">Establishing Uplink...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            {[0.3, 0.6, 0.9].map((scale, i) => (
               <div 
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full pointer-events-none"
                style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
               />
            ))}

            {isOnline && !activeMission && pendingMissions.map(m => {
              const pos = getRadarOffset(m.id);
              const isSelected = selectedPending?.id === m.id;
              return (
                <motion.div 
                  key={m.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute z-20 cursor-pointer"
                  style={{ left: pos.left, top: pos.top }}
                  onClick={() => handlePinTap(m)}
                >
                  <div className="relative group/pin">
                    <motion.div 
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className={`absolute -inset-4 md:-inset-6 rounded-full ${isSelected ? 'bg-yellow-400/40' : 'bg-yellow-400/10'}`} 
                    />
                    <motion.div 
                      className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-yellow-400 border-white shadow-yellow-tactical text-black scale-125' : 'bg-black/80 border-yellow-400 text-yellow-400'}`}
                    >
                      <span className="text-xs md:text-sm font-black italic">{isSelected ? '⚡' : '🚕'}</span>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div 
              animate={isOnline ? { y: [0, -4, 0], rotate: telemetry.heading } : {}}
              transition={{ y: { repeat: Infinity, duration: 3, ease: "easeInOut" }, rotate: { duration: 1 } }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl md:rounded-[24px] border-4 border-[#020617] shadow-4xl flex items-center justify-center transition-all duration-1000 ${isOnline ? (activeMission ? 'bg-red-500' : 'bg-yellow-400') : 'bg-slate-800'}`}>
                 <span className="text-2xl md:text-3xl">{isOnline ? (activeMission ? '🏎️' : '🚕') : '💤'}</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {selectedPending && isOnline && (
                <motion.div 
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 50 }}
                  className="absolute bottom-4 left-4 right-4 z-[100] bg-slate-900/98 backdrop-blur-3xl border border-yellow-400/30 p-6 md:p-8 rounded-[35px] md:rounded-[40px] shadow-4xl space-y-5"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full animate-pulse" />
                        <p className="text-[7px] font-black text-yellow-400 uppercase tracking-[4px]">Mission Ready</p>
                      </div>
                      <h4 className="text-2xl md:text-4xl font-black italic text-white uppercase tracking-tighter leading-none truncate max-w-[200px]">{selectedPending.customerName}</h4>
                    </div>
                    <button onClick={() => setSelectedPending(null)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white border border-white/5">✕</button>
                  </div>
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4 border-t border-white/5">
                    <div className="text-center md:text-left space-y-1 w-full truncate">
                      <p className="text-[7px] font-black text-slate-600 uppercase tracking-widest">Pickup Node</p>
                      <p className="text-xs font-bold text-white uppercase truncate italic">{selectedPending.pickup}</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                      onClick={() => { onAcceptMission(selectedPending); setSelectedPending(null); }}
                      className="w-full md:w-auto bg-yellow-400 text-black px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[4px] shadow-yellow-tactical active:translate-y-0.5 transition-all"
                    >
                      ENGAGE TARGET ➔
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};

export const DriverApp: React.FC<Props> = ({ profile, bookings, onStatusChange, onUpdateBookingStatus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<DriverTab>('DASHBOARD');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [online, setOnline] = useState(profile.isOnline);
  const [intel, setIntel] = useState<any>(null);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  const stats = useMemo(() => {
    const completedMissions = bookings.filter(b => b.status === BookingStatus.COMPLETED);
    const totalEarnings = completedMissions.reduce((sum, b) => sum + (b.fare || 0), 0);
    const totalMissions = completedMissions.length;
    return { 
      totalEarnings, 
      totalMissions, 
      averageRating: profile.rating,
      statusLabel: online ? 'OPERATIONAL' : 'OFFLINE'
    };
  }, [bookings, profile.rating, online]);

  useEffect(() => { setOnline(profile.isOnline); }, [profile.isOnline]);

  const activeMission = useMemo(() => bookings.find(b => b.status === BookingStatus.ASSIGNED || b.status === BookingStatus.ON_TRIP) || null, [bookings]);
  const pendingMissions = useMemo(() => bookings.filter(b => b.status === BookingStatus.PENDING), [bookings]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn(err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchIntel = async () => {
      if (activeMission && online && activeTab === 'MISSION') {
        try {
          const res = await getTacticalRouteIntel(activeMission.pickup, activeMission.drop);
          setIntel(res);
        } catch (e) { console.error(e); }
      }
    };
    fetchIntel();
  }, [activeMission?.id, online, activeTab]);

  const toggleOnline = () => {
    const nextState = !online;
    setOnline(nextState);
    onStatusChange(nextState);
    sgNotify.playSmsSound();
  };

  const handleAcceptMission = (b: Booking) => {
    onUpdateBookingStatus(b.id, BookingStatus.ASSIGNED);
    setActiveTab('MISSION');
    sgNotify.playNewMissionSound();
  };

  const navItems = [
    { id: 'DASHBOARD', icon: '📊', label: 'COMMAND' },
    { id: 'MISSION', icon: '🚕', label: 'MISSION' },
    { id: 'HISTORY', icon: '📜', label: 'LOGS' },
    { id: 'PROFILE', icon: '👤', label: 'PILOT' },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans relative z-[500] overflow-hidden">
      <div className="fixed inset-0 tactical-grid opacity-10 pointer-events-none" />

      <header className="px-5 py-4 md:px-12 flex items-center justify-between bg-black/60 backdrop-blur-3xl border-b border-white/5 relative z-[1100]">
        <div className="flex items-center gap-4">
          <div className="relative cursor-pointer active:scale-95 transition-transform" onClick={() => { setActiveTab('PROFILE'); setIsMenuOpen(false); }}>
            <img src={`https://i.pravatar.cc/150?u=${profile.id}`} className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl border-2 border-yellow-400 shadow-2xl" alt="Pilot" />
            <motion.div animate={online ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}} transition={{ repeat: Infinity, duration: 2 }} className={`absolute -top-1 -right-1 w-3.5 h-3.5 md:w-5 md:h-5 rounded-full border-[3px] md:border-4 border-slate-900 ${online ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-black text-lg md:text-xl tracking-tight text-white uppercase italic leading-none">{profile.name}</h2>
            <p className="text-[7px] font-black text-yellow-400 tracking-[3px] uppercase opacity-50 mt-1">{profile.vehicleNo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={onLogout} className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-90">
             <span className="text-lg">🚪</span>
          </button>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className={`w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-[20px] flex flex-col items-center justify-center gap-1.5 transition-all relative active:scale-90 ${isMenuOpen ? 'bg-white text-black' : 'bg-yellow-400 text-black shadow-yellow-tactical'}`}>
            <motion.div animate={isMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }} className="w-5 h-1 bg-current rounded-full" />
            <motion.div animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-1 bg-current rounded-full" />
            <motion.div animate={isMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }} className="w-5 h-1 bg-current rounded-full" />
            {(pendingMissions.length > 0 || activeMission) && !isMenuOpen && (
               <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 border-2 border-black rounded-full shadow-lg" />
            )}
          </button>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex flex-col p-8 md:p-16 pt-24 md:pt-40">
             <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
             <div className="flex-1 space-y-3 md:space-y-6 max-w-2xl mx-auto w-full">
               {navItems.map((item) => {
                 const isActive = activeTab === item.id;
                 return (
                   <motion.button key={item.id} whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)' }} whileTap={{ scale: 0.98 }} onClick={() => { setActiveTab(item.id as DriverTab); setIsMenuOpen(false); }} className="w-full flex items-center gap-5 md:gap-10 p-5 md:p-8 rounded-[30px] border border-white/5 group transition-all">
                     <div className={`w-14 h-14 md:w-20 md:h-20 rounded-[20px] md:rounded-[28px] flex items-center justify-center text-2xl md:text-4xl transition-all ${isActive ? 'bg-yellow-400 text-black shadow-yellow-tactical scale-110' : 'bg-white/5 text-slate-500'}`}>{item.icon}</div>
                     <div className="text-left">
                        <p className={`text-2xl md:text-5xl font-black italic tracking-tighter uppercase leading-none transition-colors ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-400'}`}>{item.label}</p>
                        <p className="text-[7px] md:text-[9px] font-bold text-slate-600 uppercase tracking-[4px] mt-2 italic">Access Registry</p>
                     </div>
                   </motion.button>
                 );
               })}
             </div>
             <div className="pt-10 border-t border-white/5 text-center mt-auto">
                <p className="text-[7px] md:text-[9px] font-black text-slate-700 uppercase tracking-[10px] italic mb-6">SG NEURAL NETWORK V1.0.0</p>
                <button onClick={onLogout} className="w-full max-w-sm mx-auto py-5 rounded-3xl bg-red-500/10 text-red-500 font-black uppercase tracking-[4px] text-[10px] hover:bg-red-500 hover:text-white active:scale-95 transition-all">ABORT CONNECTION</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-5 md:p-12 pb-32 relative no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'DASHBOARD' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-8 max-w-7xl mx-auto">
               <div className="flex flex-col gap-8">
                  <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-6 pb-6 border-b border-white/5">
                    <div className="space-y-1 text-center lg:text-left">
                      <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">Command Center.</h3>
                      <p className="text-[7px] font-black text-slate-500 uppercase tracking-[6px] mt-4 italic">Live Operation Feed</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={toggleOnline} className={`px-8 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-[4px] border-b-8 shadow-4xl transition-all ${online ? 'bg-red-500/10 text-red-500 border-red-900/40' : 'bg-green-500 text-black border-green-700'}`}>
                      {online ? 'CEASE OPERATIONS' : 'INITIATE OPS'}
                    </motion.button>
                  </header>

                  {/* Tactical Grid: Core Performance Indicators */}
                  <section className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-2 group shadow-2xl overflow-hidden relative">
                        <p className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Operation Status</p>
                        <p className={`text-xl md:text-3xl font-black italic tracking-tighter ${online ? 'text-green-500' : 'text-red-500'}`}>{stats.statusLabel}</p>
                        <div className="absolute -bottom-2 -right-2 opacity-5 text-4xl md:text-6xl font-black italic">⚙️</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-2 group shadow-2xl overflow-hidden relative">
                        <p className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Pilot Rating</p>
                        <div className="flex items-baseline gap-1">
                          <p className="text-xl md:text-4xl font-black text-white italic tracking-tighter">{stats.averageRating.toFixed(1)}</p>
                          <span className="text-yellow-400 text-xs md:text-lg">★</span>
                        </div>
                        <div className="absolute -bottom-2 -right-2 opacity-5 text-4xl md:text-6xl font-black italic">★</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-2 group shadow-2xl overflow-hidden relative">
                        <p className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Mission Yield</p>
                        <p className="text-xl md:text-4xl font-black text-white italic tracking-tighter truncate">₹{stats.totalEarnings.toLocaleString()}</p>
                        <div className="absolute -bottom-2 -right-2 opacity-5 text-4xl md:text-6xl font-black italic">₹</div>
                    </div>
                    <div className="bg-white/5 border border-white/10 p-5 md:p-8 rounded-[30px] md:rounded-[40px] space-y-2 group shadow-2xl overflow-hidden relative">
                        <p className="text-[7px] md:text-[9px] font-black text-slate-600 uppercase tracking-widest">Logged Ops</p>
                        <p className="text-xl md:text-4xl font-black text-white italic tracking-tighter">{stats.totalMissions}</p>
                        <div className="absolute -bottom-2 -right-2 opacity-5 text-4xl md:text-6xl font-black italic">📊</div>
                    </div>
                  </section>

                  <TacticalMap coords={currentCoords} isOnline={online} activeMission={activeMission} pendingMissions={pendingMissions} onAcceptMission={handleAcceptMission} />
                  
               </div>
            </motion.div>
          )}

          {activeTab === 'MISSION' && (
             <motion.div key="mission" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="h-full max-w-4xl mx-auto space-y-8">
                {activeMission ? (
                  <div className="space-y-8">
                     <header className="flex justify-between items-center border-b border-white/5 pb-6">
                        <div className="space-y-1">
                          <h3 className="text-3xl md:text-5xl font-black italic uppercase tracking-tighter text-white">Tactical Intel</h3>
                          <p className="text-[7px] font-black text-slate-600 uppercase tracking-[4px]">Mission Params</p>
                        </div>
                        <span className="px-5 py-2 rounded-full text-[8px] font-black uppercase tracking-widest bg-yellow-400 text-black shadow-yellow-tactical">{activeMission.status}</span>
                     </header>

                     <div className="bg-white/5 p-8 md:p-12 rounded-[50px] border border-white/10 backdrop-blur-3xl space-y-10 shadow-4xl relative overflow-hidden">
                        <div className="space-y-8 relative z-10">
                           <div className="flex items-start gap-6 md:gap-10">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-yellow-400 rounded-2xl md:rounded-[28px] flex items-center justify-center text-black font-black text-xl md:text-2xl shadow-xl italic shrink-0">P</div>
                              <div className="truncate">
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Origin Node</p>
                                 <p className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-none truncate">{activeMission.pickup}</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-6 md:gap-10">
                              <div className="w-12 h-12 md:w-16 md:h-16 bg-white/10 rounded-2xl md:rounded-[28px] flex items-center justify-center text-white/30 font-black text-xl md:text-2xl border border-white/5 italic shrink-0">D</div>
                              <div className="truncate">
                                 <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Target Node</p>
                                 <p className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tight leading-none truncate">{activeMission.drop}</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 md:gap-8 pt-8 border-t border-white/5 relative z-10">
                           <div className="bg-black/40 p-6 md:p-10 rounded-[35px] border border-white/5">
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Distance</p>
                              <p className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">{intel?.distanceKm || '--'} KM</p>
                           </div>
                           <div className="bg-black/40 p-6 md:p-10 rounded-[35px] border border-white/5">
                              <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest mb-2">Yield</p>
                              <p className="text-3xl md:text-5xl font-black text-yellow-400 italic tracking-tighter">₹{activeMission.fare}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-900/90 p-8 md:p-14 rounded-[60px] border border-white/10 text-center space-y-8 shadow-4xl relative overflow-hidden">
                        <p className="text-[10px] font-black text-slate-600 uppercase tracking-[10px]">Protocols</p>
                        <div className="flex flex-col gap-4">
                           {activeMission.status === BookingStatus.ASSIGNED ? (
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onUpdateBookingStatus(activeMission.id, BookingStatus.ON_TRIP)} className="w-full bg-white text-black py-7 md:py-10 rounded-[40px] font-black uppercase tracking-[8px] md:tracking-[12px] shadow-4xl active:translate-y-1 transition-all text-sm md:text-lg border-b-[10px] border-slate-300">COMMENCE MISSION</motion.button>
                           ) : (
                              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => onUpdateBookingStatus(activeMission.id, BookingStatus.COMPLETED)} className="w-full bg-green-500 text-black py-7 md:py-10 rounded-[40px] font-black uppercase tracking-[8px] md:tracking-[12px] shadow-4xl active:translate-y-1 transition-all text-sm md:text-lg border-b-[10px] border-green-700">MISSION COMPLETE</motion.button>
                           )}
                           <button className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-4 rounded-[30px] font-black uppercase tracking-[4px] text-[9px] hover:bg-red-500 hover:text-white transition-all">ABORT MISSION</button>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-32 text-center space-y-8">
                     <div className="w-24 h-24 md:w-40 md:h-40 bg-white/5 rounded-full flex items-center justify-center text-4xl md:text-7xl border-4 border-dashed border-white/10 opacity-30 animate-pulse">📡</div>
                     <div className="space-y-2">
                        <p className="text-slate-600 font-black uppercase tracking-[8px] italic text-[10px] md:text-xs">Uplink: Listening</p>
                        <p className="text-[7px] text-slate-800 font-bold uppercase tracking-[3px]">Awaiting HQ directive in sector KPM-GRID</p>
                     </div>
                     <button onClick={() => setActiveTab('DASHBOARD')} className="bg-white/5 px-8 py-3 rounded-xl border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">Return to Core</button>
                  </div>
                )}
             </motion.div>
          )}

          {activeTab === 'HISTORY' && (
             <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-10 max-w-5xl mx-auto pb-20">
                <header className="space-y-1 border-b border-white/5 pb-6">
                   <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white">Registry.</h3>
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-[6px] mt-4 italic">Historical Mission Logs</p>
                </header>
                <div className="space-y-4">
                   {bookings.filter(b => b.status === BookingStatus.COMPLETED).length > 0 ? (
                     bookings.filter(b => b.status === BookingStatus.COMPLETED).slice().reverse().map(b => (
                       <div key={b.id} className="bg-black/60 border border-white/10 p-8 md:p-10 rounded-[45px] flex justify-between items-center shadow-xl relative overflow-hidden group hover:bg-white/5 transition-all">
                          <div className="absolute top-0 left-0 w-1 h-full bg-green-500/40" />
                          <div className="space-y-2 truncate flex-1 pr-4">
                             <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{b.timestamp.toLocaleDateString()} • {b.id}</p>
                             <h4 className="text-xl md:text-3xl font-black text-white uppercase italic tracking-tighter truncate leading-none">{b.drop}</h4>
                          </div>
                          <div className="text-right shrink-0">
                             <p className="text-2xl md:text-4xl font-black text-green-400 italic tracking-tighter leading-none">+₹{b.fare}</p>
                             <span className="text-[7px] font-black uppercase text-slate-700 tracking-[2px]">SETTLED</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-24 text-center text-slate-800 font-black uppercase tracking-[10px] italic border-2 border-dashed border-white/5 rounded-[50px]">Manifest Empty</div>
                   )}
                </div>
             </motion.div>
          )}

          {activeTab === 'PROFILE' && (
             <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-10 max-w-5xl mx-auto">
                <header className="space-y-1 border-b border-white/5 pb-6 text-center lg:text-left">
                   <h3 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white">Identity.</h3>
                   <p className="text-[8px] font-black text-slate-600 uppercase tracking-[6px] mt-4 italic">Pilot Signature Hub</p>
                </header>
                <div className="bg-white/5 border border-white/10 p-10 md:p-20 rounded-[60px] backdrop-blur-3xl space-y-12 shadow-4xl text-center relative overflow-hidden">
                   <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none" />
                   <div className="flex flex-col items-center gap-8 relative z-10">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${profile.id}`} className="w-32 h-32 md:w-56 md:h-56 rounded-[40px] md:rounded-[70px] border-4 border-yellow-400 shadow-4xl" alt="Pilot" />
                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-8 py-2 rounded-full text-[10px] font-black uppercase tracking-[4px] italic shadow-2xl">ELITE PILOT</div>
                      </div>
                      <div className="space-y-3">
                         <h4 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">{profile.name}</h4>
                         <div className="flex items-center justify-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                            <p className="text-[9px] md:text-[11px] font-black text-yellow-500 tracking-[8px] uppercase italic">ENCRYPTED_AUTH_ACTIVE</p>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10 text-left pt-10 border-t border-white/10 relative z-10">
                      <div className="p-6 md:p-8 bg-black/40 rounded-[30px] border border-white/5 space-y-2">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">SIGNAL LINE</p>
                        <p className="text-xl md:text-2xl font-bold italic text-white">{profile.phone}</p>
                      </div>
                      <div className="p-6 md:p-8 bg-black/40 rounded-[30px] border border-white/5 space-y-2">
                        <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">TACTICAL ID</p>
                        <p className="text-xl md:text-2xl font-bold italic uppercase text-yellow-400">{profile.vehicleNo}</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
