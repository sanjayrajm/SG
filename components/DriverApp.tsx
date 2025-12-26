
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
    <div className="relative w-full h-96 md:h-[520px] bg-[#020617] rounded-[40px] md:rounded-[60px] border-2 border-white/5 overflow-hidden shadow-4xl group">
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
          <div className="text-center space-y-4">
             <motion.div 
               animate={{ rotate: 360 }} 
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full mx-auto"
             />
             <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-500 animate-pulse italic">Establishing Uplink...</p>
          </div>
        ) : (
          <div className="relative w-full h-full">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/20 tracking-[10px]">NORTH_SECTOR</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/20 tracking-[10px]">SOUTH_SECTOR</div>

            {[0.3, 0.6, 0.9].map((scale, i) => (
               <div 
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full pointer-events-none"
                style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
               />
            ))}

            <AnimatePresence>
              {activeMission && isOnline && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  className="absolute left-[75%] top-[25%] -translate-x-1/2 -translate-y-1/2 z-20"
                >
                   <div className="relative">
                      <motion.div 
                        animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                        className="absolute inset-0 w-12 h-12 -ml-1 -mt-1 rounded-full bg-red-500"
                      />
                      <div className="w-10 h-10 rounded-full bg-red-500 shadow-[0_0_30px_rgba(239,68,68,0.8)] border-2 border-white/20 flex items-center justify-center text-xs">🎯</div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

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
                      className={`absolute -inset-6 rounded-full ${isSelected ? 'bg-yellow-400/40' : 'bg-yellow-400/10'}`} 
                    />
                    <motion.div 
                      animate={isSelected ? { scale: 1.3, rotate: 180 } : { scale: 1, rotate: 0 }}
                      className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-yellow-400 border-white shadow-yellow-tactical text-black' : 'bg-black/80 border-yellow-400 text-yellow-400 hover:scale-110'}`}
                    >
                      <span className="text-sm font-black italic">{isSelected ? '⚡' : '🚕'}</span>
                    </motion.div>
                  </div>
                </motion.div>
              );
            })}

            <motion.div 
              animate={isOnline ? { 
                y: [0, -4, 0],
                rotate: telemetry.heading
              } : {}}
              transition={{ 
                y: { repeat: Infinity, duration: 3, ease: "easeInOut" },
                rotate: { duration: 1 }
              }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
            >
              <div className={`w-16 h-16 rounded-[24px] border-4 border-[#020617] shadow-4xl flex items-center justify-center transition-all duration-1000 ${isOnline ? (activeMission ? 'bg-red-500 rotate-0' : 'bg-yellow-400') : 'bg-slate-800'}`}>
                 <span className="text-3xl">{isOnline ? (activeMission ? '🏎️' : '🚕') : '💤'}</span>
              </div>
            </motion.div>

            <AnimatePresence>
              {selectedPending && isOnline && (
                <motion.div 
                  initial={{ opacity: 0, y: 100 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 100 }}
                  className="absolute bottom-6 left-6 right-6 z-[100] bg-slate-900/95 backdrop-blur-3xl border-2 border-yellow-400/30 p-8 rounded-[40px] shadow-4xl space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-yellow-400 rounded-full" />
                        <p className="text-[8px] font-black text-yellow-400 uppercase tracking-[5px]">Signal Locked • Mission Ready</p>
                      </div>
                      <h4 className="text-4xl font-black italic text-white uppercase tracking-tighter leading-none">{selectedPending.customerName}</h4>
                    </div>
                    <button onClick={() => setSelectedPending(null)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all border border-white/5">✕</button>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-6 border-t border-white/5">
                    <div className="text-center sm:text-left space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Origin Point</p>
                      <p className="text-sm font-bold text-white uppercase truncate italic">{selectedPending.pickup}</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => { onAcceptMission(selectedPending); setSelectedPending(null); }}
                      className="w-full sm:w-auto bg-yellow-400 text-black px-12 py-5 rounded-3xl font-black text-[11px] uppercase tracking-[6px] shadow-yellow-tactical border-b-4 border-yellow-600"
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
    return { totalEarnings, totalMissions };
  }, [bookings]);

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

      {/* Optimized Header: Fixed for reliable interaction */}
      <header className="px-6 py-5 md:px-12 flex items-center justify-between bg-black/60 backdrop-blur-3xl border-b border-white/5 relative z-[1100]">
        <div className="flex items-center gap-5">
          <div 
            className="relative group cursor-pointer active:scale-95 transition-transform" 
            onClick={() => { setActiveTab('PROFILE'); setIsMenuOpen(false); }}
          >
            <img src={`https://i.pravatar.cc/150?u=${profile.id}`} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl border-2 border-yellow-400 shadow-2xl" alt="Pilot" />
            <motion.div 
              animate={online ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 rounded-full border-4 border-slate-900 ${online ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} 
            />
          </div>
          <div className="hidden sm:block">
            <h2 className="font-black text-lg md:text-xl tracking-tight text-white uppercase italic leading-none">{profile.name}</h2>
            <p className="text-[8px] font-black text-yellow-400 tracking-[3px] uppercase opacity-60 mt-1.5">{profile.vehicleNo}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 md:gap-5">
          <button 
            onClick={onLogout} 
            className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 group active:scale-90"
          >
             <span className="text-lg">🚪</span>
          </button>
          
          {/* Tactical Hamburger Menu Trigger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className={`w-12 h-12 md:w-14 md:h-14 rounded-[20px] flex flex-col items-center justify-center gap-1.5 transition-all relative active:scale-90 ${isMenuOpen ? 'bg-white text-black' : 'bg-yellow-400 text-black shadow-yellow-tactical'}`}
          >
            <motion.div animate={isMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }} className="w-6 h-1 bg-current rounded-full" />
            <motion.div animate={isMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-6 h-1 bg-current rounded-full" />
            <motion.div animate={isMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }} className="w-6 h-1 bg-current rounded-full" />
            
            {(pendingMissions.length > 0 || activeMission) && !isMenuOpen && (
               <motion.div animate={{ scale: [1, 1.5, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-black rounded-full shadow-lg" />
            )}
          </button>
        </div>
      </header>

      {/* Polished Full-Screen Tactical Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[1000] bg-slate-950/98 backdrop-blur-3xl flex flex-col p-8 md:p-16 pt-32 md:pt-40"
          >
             <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
             
             <div className="flex-1 space-y-4 md:space-y-6 max-w-2xl mx-auto w-full">
               {navItems.map((item) => {
                 const isActive = activeTab === item.id;
                 const hasAlert = (item.id === 'DASHBOARD' && pendingMissions.length > 0 && !activeMission) || (item.id === 'MISSION' && activeMission);
                 
                 return (
                   <motion.button
                     key={item.id}
                     whileHover={{ x: 10, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                     whileTap={{ scale: 0.98 }}
                     onClick={() => { setActiveTab(item.id as DriverTab); setIsMenuOpen(false); }}
                     className="w-full flex items-center gap-6 md:gap-10 p-5 md:p-8 rounded-[35px] border border-white/5 relative group transition-all"
                   >
                     <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[24px] md:rounded-[28px] flex items-center justify-center text-3xl md:text-4xl transition-all ${isActive ? 'bg-yellow-400 text-black shadow-yellow-tactical scale-110' : 'bg-white/5 text-slate-500'}`}>
                       {item.icon}
                       {hasAlert && (
                         <motion.div 
                           animate={{ scale: [1, 1.8], opacity: [1, 0] }} 
                           transition={{ repeat: Infinity, duration: 1.5 }} 
                           className={`absolute -top-2 -right-2 w-5 h-5 md:w-6 md:h-6 border-2 border-black rounded-full ${item.id === 'MISSION' ? 'bg-red-500' : 'bg-yellow-400'}`} 
                         />
                       )}
                     </div>
                     <div className="text-left">
                        <p className={`text-3xl md:text-5xl font-black italic tracking-tighter uppercase leading-none transition-colors ${isActive ? 'text-white' : 'text-slate-700 group-hover:text-slate-400'}`}>
                          {item.label}
                        </p>
                        <p className="text-[8px] md:text-[10px] font-bold text-slate-600 uppercase tracking-[4px] mt-2 italic">Access Signal Node</p>
                     </div>
                   </motion.button>
                 );
               })}
             </div>
             
             <div className="pt-12 border-t border-white/5 text-center mt-auto">
                <p className="text-[8px] md:text-[10px] font-black text-slate-700 uppercase tracking-[10px] md:tracking-[15px] italic mb-6">SG NEURAL NETWORK V5.4</p>
                <button 
                  onClick={onLogout} 
                  className="w-full max-w-sm mx-auto py-5 rounded-[30px] bg-red-500/10 text-red-500 font-black uppercase tracking-[5px] text-xs hover:bg-red-500 hover:text-white transition-all active:scale-95"
                >
                  ABORT CONNECTION
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 relative no-scrollbar">
        <AnimatePresence mode="wait">
          {activeTab === 'DASHBOARD' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10 max-w-7xl mx-auto">
               <div className="flex flex-col gap-10">
                  <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-8 border-b border-white/5 pb-8">
                    <div className="space-y-1">
                      <h3 className="text-5xl md:text-7xl lg:text-8xl font-black italic uppercase tracking-tighter text-white leading-[0.9]">Command<br/>Center.</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[8px] mt-6 italic">Live Tactical Feed</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleOnline} 
                      className={`px-10 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[5px] transition-all border-b-8 shadow-4xl min-w-[240px] ${
                        online ? 'bg-red-500/10 text-red-500 border-red-900/40' : 'bg-green-500 text-black border-green-700'
                      }`}
                    >
                      {online ? 'CEASE OPERATIONS' : 'INITIATE OPS'}
                    </motion.button>
                  </header>

                  <TacticalMap 
                    coords={currentCoords} 
                    isOnline={online} 
                    activeMission={activeMission} 
                    pendingMissions={pendingMissions}
                    onAcceptMission={handleAcceptMission}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-10 pb-12">
                     <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] backdrop-blur-3xl space-y-3 relative overflow-hidden group hover:border-yellow-400/20 transition-colors shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl italic font-black">₹</div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Est. Revenue</p>
                        <p className="text-5xl font-black text-white italic tracking-tighter">₹{stats.totalEarnings.toLocaleString()}</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] backdrop-blur-3xl space-y-3 relative overflow-hidden group hover:border-yellow-400/20 transition-colors shadow-2xl">
                        <div className="absolute top-0 right-0 p-8 opacity-5 text-6xl italic font-black">LOG</div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Completed</p>
                        <p className="text-5xl font-black text-white italic tracking-tighter">{stats.totalMissions}</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {activeTab === 'MISSION' && (
             <motion.div key="mission" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="h-full max-w-4xl mx-auto">
                {activeMission ? (
                  <div className="space-y-10">
                     <header className="flex justify-between items-center border-b border-white/5 pb-8">
                        <div className="space-y-1">
                          <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Tactical Intel</h3>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[5px]">Deployment Specs</p>
                        </div>
                        <span className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black shadow-yellow-tactical italic">{activeMission.status}</span>
                     </header>

                     <div className="bg-white/5 p-10 md:p-14 rounded-[60px] border border-white/10 backdrop-blur-3xl space-y-12 relative overflow-hidden shadow-4xl">
                        <div className="space-y-10 relative z-10">
                           <div className="flex items-start gap-10">
                              <div className="w-16 h-16 bg-yellow-400 rounded-[28px] flex items-center justify-center text-black font-black text-2xl shadow-xl italic">P</div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Origin Node</p>
                                 <p className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight leading-none">{activeMission.pickup}</p>
                              </div>
                           </div>
                           <div className="flex items-start gap-10">
                              <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center text-white/40 font-black text-2xl border border-white/5 italic">D</div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Node</p>
                                 <p className="text-3xl md:text-4xl font-black text-white uppercase italic tracking-tight leading-none">{activeMission.drop}</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 md:gap-10 pt-12 border-t border-white/5 relative z-10">
                           <div className="bg-black/60 p-8 md:p-10 rounded-[45px] border border-white/5 shadow-inner">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Route Range</p>
                              <p className="text-4xl md:text-5xl font-black text-white italic">{intel?.distanceKm || '--'} KM</p>
                           </div>
                           <div className="bg-black/60 p-8 md:p-10 rounded-[45px] border border-white/5 shadow-inner">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Fixed Yield</p>
                              <p className="text-4xl md:text-5xl font-black text-yellow-400 italic">₹{activeMission.fare}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-900/80 p-10 md:p-14 rounded-[70px] border border-white/10 text-center space-y-10 shadow-4xl relative overflow-hidden">
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-[12px]">Deployment Protocols</p>
                        <div className="flex flex-col gap-5">
                           {activeMission.status === BookingStatus.ASSIGNED ? (
                              <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onUpdateBookingStatus(activeMission.id, BookingStatus.ON_TRIP)} 
                                className="w-full bg-white text-black py-8 rounded-[40px] font-black uppercase tracking-[12px] shadow-4xl text-lg border-b-[10px] border-slate-300 active:translate-y-1 transition-all"
                              >
                                COMMENCE MISSION
                              </motion.button>
                           ) : (
                              <motion.button 
                                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                onClick={() => onUpdateBookingStatus(activeMission.id, BookingStatus.COMPLETED)} 
                                className="w-full bg-green-500 text-black py-8 rounded-[40px] font-black uppercase tracking-[12px] shadow-4xl text-lg border-b-[10px] border-green-700 active:translate-y-1 transition-all"
                              >
                                MISSION COMPLETE
                              </motion.button>
                           )}
                           <button className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-6 rounded-[35px] font-black uppercase tracking-[6px] text-[11px] hover:bg-red-500 hover:text-white transition-all active:scale-95">ABORT MISSION / SOS</button>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-40 text-center space-y-12">
                     <div className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center text-7xl border-4 border-dashed border-white/10 opacity-30">📡</div>
                     <div className="space-y-4">
                        <p className="text-slate-500 font-black uppercase tracking-[12px] italic">Registry: Listening</p>
                        <p className="text-[9px] text-slate-700 font-bold uppercase tracking-[4px]">Awaiting next tactical assignment from HQ</p>
                     </div>
                     <button onClick={() => setActiveTab('DASHBOARD')} className="bg-white/5 px-10 py-5 rounded-2xl border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">Return to Command Center</button>
                  </div>
                )}
             </motion.div>
          )}

          {activeTab === 'HISTORY' && (
             <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-14 max-w-5xl mx-auto">
                <header className="space-y-1 border-b border-white/5 pb-8">
                   <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">Mission Log</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[8px] mt-6 italic">Registry Archives</p>
                </header>
                <div className="space-y-5 pb-20">
                   {bookings.filter(b => b.status === BookingStatus.COMPLETED).length > 0 ? (
                     bookings.filter(b => b.status === BookingStatus.COMPLETED).slice().reverse().map(b => (
                       <div key={b.id} className="bg-black/60 border border-white/10 p-10 md:p-12 rounded-[55px] flex justify-between items-center shadow-2xl relative overflow-hidden group hover:bg-white/5 transition-all">
                          <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500/40" />
                          <div className="space-y-3">
                             <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{b.timestamp.toLocaleDateString()} • {b.id}</p>
                             <h4 className="text-2xl md:text-3xl font-black text-white uppercase italic tracking-tighter truncate max-w-[200px] md:max-w-md">{b.drop}</h4>
                          </div>
                          <div className="text-right space-y-2">
                             <p className="text-3xl md:text-4xl font-black text-green-400 italic tracking-tighter leading-none">+₹{b.fare}</p>
                             <span className="text-[8px] font-black uppercase text-slate-600 tracking-[3px]">SETTLED</span>
                          </div>
                       </div>
                     ))
                   ) : (
                     <div className="py-32 text-center text-slate-700 font-black uppercase tracking-[15px] italic border-2 border-dashed border-white/5 rounded-[60px]">Archive Entry Null</div>
                   )}
                </div>
             </motion.div>
          )}

          {activeTab === 'PROFILE' && (
             <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-14 max-w-5xl mx-auto">
                <header className="space-y-1 border-b border-white/5 pb-8">
                   <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">Pilot Profile</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[8px] mt-6 italic">Identity Signature</p>
                </header>
                <div className="bg-white/5 border border-white/10 p-12 md:p-20 rounded-[65px] backdrop-blur-3xl space-y-14 shadow-4xl text-center relative overflow-hidden pb-20">
                   <div className="absolute inset-0 tactical-grid opacity-5 pointer-events-none" />
                   <div className="flex flex-col items-center gap-10 relative z-10">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${profile.id}`} className="w-40 h-40 md:w-56 md:h-56 rounded-[50px] md:rounded-[70px] border-4 border-yellow-400 shadow-4xl" alt="Profile" />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-10 py-2.5 rounded-full text-[12px] font-black uppercase tracking-[6px] italic shadow-2xl">RANK: ELITE</div>
                      </div>
                      <div className="space-y-4">
                         <h4 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">{profile.name}</h4>
                         <div className="flex items-center justify-center gap-4">
                            <span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e] animate-pulse" />
                            <p className="text-[12px] md:text-sm font-black text-yellow-500 tracking-[8px] md:tracking-[12px] uppercase italic">ENCRYPTED SIGNAL ACTIVE</p>
                         </div>
                      </div>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 text-left pt-12 border-t border-white/10 relative z-10">
                      <div className="p-8 bg-black/40 rounded-[35px] border border-white/5 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">COMMS LINK</p>
                        <p className="text-2xl md:text-3xl font-bold italic text-white">{profile.phone}</p>
                      </div>
                      <div className="p-8 bg-black/40 rounded-[35px] border border-white/5 space-y-3">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">TACTICAL UNIT ID</p>
                        <p className="text-2xl md:text-3xl font-bold italic uppercase text-yellow-400">{profile.vehicleNo}</p>
                      </div>
                   </div>
                   <div className="pt-10 flex justify-center opacity-30">
                      <p className="text-[10px] font-black uppercase tracking-[20px] italic">PILOT_AUTH_TOKEN: SG-2025-CORE</p>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
