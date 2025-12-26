
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
 * TacticalMap: An advanced navigational hub displaying real-time vehicle telemetry,
 * active mission targets, and nearby available mission pings.
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
        battery: prev.battery, // Keep battery static or slow drain
        heading: isOnline ? (prev.heading + (Math.random() * 10 - 5)) % 360 : prev.heading
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, [isOnline]);

  // Generate deterministic offsets for pending mission pins based on mission ID
  const getRadarOffset = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const angle = (hash % 360) * (Math.PI / 180);
    // Missions appear within the 30% to 80% radius of the map
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
      
      {/* Radial Scan Animation - Only when online */}
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

      {/* Map Content */}
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
            {/* Sector Labels */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/20 tracking-[10px]">NORTH_SECTOR</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[7px] font-black text-white/20 tracking-[10px]">SOUTH_SECTOR</div>

            {/* Concentric Radar Rings */}
            {[0.3, 0.6, 0.9].map((scale, i) => (
               <div 
                key={i}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 border border-white/5 rounded-full pointer-events-none"
                style={{ width: `${scale * 100}%`, height: `${scale * 100}%` }}
               />
            ))}

            {/* Active Target Path & Pin */}
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
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-red-500 text-black px-2 py-0.5 rounded text-[7px] font-black uppercase whitespace-nowrap">MISSION_TARGET</div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Available Mission Pings */}
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
                    {/* Pulsing Base */}
                    <motion.div 
                      animate={{ scale: [1, 1.6, 1], opacity: [0.4, 0.1, 0.4] }}
                      transition={{ repeat: Infinity, duration: 2.5 }}
                      className={`absolute -inset-6 rounded-full ${isSelected ? 'bg-yellow-400/40' : 'bg-yellow-400/10'}`} 
                    />
                    
                    {/* The Beacon */}
                    <motion.div 
                      animate={isSelected ? { scale: 1.3, rotate: 180 } : { scale: 1, rotate: 0 }}
                      className={`w-10 h-10 rounded-2xl border-2 flex items-center justify-center transition-all ${isSelected ? 'bg-yellow-400 border-white shadow-yellow-tactical text-black' : 'bg-black/80 border-yellow-400 text-yellow-400 hover:scale-110'}`}
                    >
                      <span className="text-sm font-black italic">{isSelected ? '⚡' : 'タク'}</span>
                    </motion.div>

                    {/* Target Lock Visual Brackets */}
                    <AnimatePresence>
                      {isSelected && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 1.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute -inset-4 pointer-events-none"
                        >
                           <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-yellow-400" />
                           <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-yellow-400" />
                           <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-yellow-400" />
                           <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-yellow-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}

            {/* Pilot Identity Marker (The Vehicle) */}
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
                 {/* Directional Arrow */}
                 {isOnline && (
                   <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-yellow-400 text-xs font-black">▲</div>
                 )}
              </div>
              
              {/* Identity Tag */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-6 bg-black/90 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 whitespace-nowrap shadow-2xl">
                <div className="flex items-center gap-2">
                   <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                   <p className="text-[8px] font-black text-white uppercase tracking-[2px]">
                     {isOnline ? (activeMission ? 'SIG_ENGAGED' : 'SIG_IDLE') : 'SIG_OFFLINE'}
                   </p>
                </div>
              </div>
            </motion.div>

            {/* Mission Briefing Overlay Card */}
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
                    <button 
                      onClick={() => setSelectedPending(null)} 
                      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-all border border-white/5"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-6 border-y border-white/5">
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Origin Point</p>
                       <p className="text-sm font-bold text-white uppercase truncate italic">{selectedPending.pickup}</p>
                    </div>
                    <div className="space-y-1">
                       <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Est. Mission Yield</p>
                       <p className="text-3xl font-black italic text-yellow-400">₹{selectedPending.fare}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="text-center sm:text-left space-y-1">
                      <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Operational Intel</p>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-black text-green-500 uppercase">Clear Path</span>
                        <span className="text-slate-800">|</span>
                        <span className="text-[10px] font-black text-white uppercase">1.2KM Radius</span>
                      </div>
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

            {/* HUD: Satellite & Connectivity */}
            <div className="absolute top-8 left-8 space-y-4 hidden md:block">
               <div className="bg-black/80 backdrop-blur-2xl border border-white/10 p-5 rounded-3xl w-56 shadow-4xl relative overflow-hidden group/hud">
                  <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover/hud:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-[7px] font-black text-slate-500 uppercase tracking-widest">Uplink Status</p>
                    <span className={`text-[7px] font-bold uppercase ${isOnline ? 'text-green-500' : 'text-red-500'}`}>{isOnline ? 'Active' : 'Ceased'}</span>
                  </div>
                  <div className="space-y-3 relative z-10">
                    <p className="text-[11px] font-black uppercase text-white">{telemetry.latency} PING • {telemetry.satelliteCount} SATS</p>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: '0%' }}
                        animate={{ width: isOnline ? '85%' : '0%' }}
                        className="h-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]" 
                      />
                    </div>
                    <div className="flex justify-between text-[6px] font-black text-slate-600 tracking-widest">
                       <span>NAV_SYNC</span>
                       <span>GPS_LOCK</span>
                    </div>
                  </div>
               </div>
            </div>

            {/* HUD: Operations Alert */}
            <div className="absolute top-8 right-8 text-right space-y-2">
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-[6px]">Neural Grid</p>
              <div className="flex items-center justify-end gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5 backdrop-blur-md">
                <motion.span 
                  animate={isOnline ? { scale: [1, 1.5, 1], opacity: [1, 0.5, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500'}`} 
                />
                <p className="text-[10px] font-black italic text-white uppercase tracking-tighter">
                  {isOnline ? (activeMission ? 'OPS_ENGAGED' : 'SCANNING_FLEET') : 'GRID_OFFLINE'}
                </p>
              </div>
              {isOnline && !activeMission && (
                <p className="text-[8px] font-bold text-yellow-400 uppercase tracking-widest animate-pulse">
                  {pendingMissions.length} Signal{pendingMissions.length !== 1 ? 's' : ''} Detected
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Decorative Corner Elements */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-white/5 rounded-tl-[40px] md:rounded-tl-[60px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-white/5 rounded-br-[40px] md:rounded-br-[60px] pointer-events-none" />
    </div>
  );
};

export const DriverApp: React.FC<Props> = ({ profile, bookings, onStatusChange, onUpdateBookingStatus, onLogout }) => {
  const [activeTab, setActiveTab] = useState<DriverTab>('DASHBOARD');
  const [online, setOnline] = useState(profile.isOnline);
  const [intel, setIntel] = useState<any>(null);
  const [isIntelLoading, setIsIntelLoading] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number } | null>(null);

  const stats = useMemo(() => {
    const completedMissions = bookings.filter(b => b.status === BookingStatus.COMPLETED);
    const totalEarnings = completedMissions.reduce((sum, b) => sum + (b.fare || 0), 0);
    const totalMissions = completedMissions.length;
    return { totalEarnings, totalMissions };
  }, [bookings]);

  useEffect(() => {
    setOnline(profile.isOnline);
  }, [profile.isOnline]);

  const activeMission = useMemo(() => bookings.find(b => b.status === BookingStatus.ASSIGNED || b.status === BookingStatus.ON_TRIP) || null, [bookings]);
  const pendingMissions = useMemo(() => bookings.filter(b => b.status === BookingStatus.PENDING), [bookings]);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setCurrentCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn("Geolocation signal lost", err),
      { enableHighAccuracy: true }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  useEffect(() => {
    const fetchIntel = async () => {
      if (activeMission && online) {
        setIsIntelLoading(true);
        try {
          const res = await getTacticalRouteIntel(activeMission.pickup, activeMission.drop);
          setIntel(res);
        } catch (e) {
          console.error("Intel link failure", e);
        } finally {
          setIsIntelLoading(false);
        }
      } else {
        setIntel(null);
      }
    };
    if (activeTab === 'MISSION') fetchIntel();
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

  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col font-sans relative z-[500] overflow-hidden">
      <div className="fixed inset-0 tactical-grid opacity-10 pointer-events-none" />

      <header className="px-6 py-6 md:px-12 flex items-center justify-between bg-black/60 backdrop-blur-3xl border-b border-white/5 relative z-50">
        <div className="flex items-center gap-5">
          <div className="relative group cursor-pointer">
            <img src={`https://i.pravatar.cc/150?u=${profile.id}`} className="w-14 h-14 rounded-2xl border-2 border-yellow-400 shadow-2xl transition-transform group-hover:scale-105" alt="Pilot" />
            <motion.div 
              animate={online ? { scale: [1, 1.4, 1], opacity: [1, 0.5, 1] } : {}}
              transition={{ repeat: Infinity, duration: 2 }}
              className={`absolute -top-1 -right-1 w-5 h-5 rounded-full border-4 border-slate-900 ${online ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} 
            />
          </div>
          <div>
            <h2 className="font-black text-xl tracking-tight text-white uppercase italic leading-none">{profile.name}</h2>
            <p className="text-[8px] font-black text-yellow-400 tracking-[4px] uppercase opacity-60 mt-1.5">UNIT ID: {profile.vehicleNo}</p>
          </div>
        </div>
        <button onClick={onLogout} className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 hover:border-red-500/30 group">
          <span className="text-xl group-hover:scale-110 transition-transform">🚪</span>
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 relative">
        <AnimatePresence mode="wait">
          {activeTab === 'DASHBOARD' && (
            <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-10">
               <div className="flex flex-col gap-10">
                  <header className="flex justify-between items-end">
                    <div className="space-y-1">
                      <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white leading-none">Command<br/>Center.</h3>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-[8px] mt-6">Live Tactical Network Feed</p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={toggleOnline} 
                      className={`px-10 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[5px] transition-all border-b-8 shadow-4xl ${
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

                  <div className="grid grid-cols-2 gap-6 md:gap-10">
                     <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] backdrop-blur-3xl space-y-3 group hover:border-yellow-400/30 transition-all shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-4xl">💰</div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Total Mission Yield</p>
                        <p className="text-4xl font-black text-white italic tracking-tighter">₹{stats.totalEarnings.toLocaleString()}</p>
                     </div>
                     <div className="bg-white/5 border border-white/10 p-10 rounded-[50px] backdrop-blur-3xl space-y-3 group hover:border-yellow-400/30 transition-all shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-5 text-4xl">🎖️</div>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">Missions Completed</p>
                        <p className="text-4xl font-black text-white italic tracking-tighter">{stats.totalMissions}</p>
                     </div>
                  </div>

                  {activeMission && (
                    <motion.div 
                      whileHover={{ scale: 1.02, y: -5 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setActiveTab('MISSION')} 
                      className="bg-yellow-400 text-black p-12 rounded-[60px] shadow-[0_30px_60px_rgba(255,193,7,0.3)] cursor-pointer transition-all relative overflow-hidden group"
                    >
                       <div className="absolute top-0 right-0 p-10 opacity-10 text-8xl rotate-12 group-hover:rotate-0 transition-transform">🎯</div>
                       <div className="flex items-center gap-3 mb-6">
                         <span className="w-2.5 h-2.5 bg-black rounded-full animate-ping" />
                         <p className="text-[11px] font-black uppercase opacity-60 tracking-[8px]">ACTIVE DEPLOYMENT REQUISITION</p>
                       </div>
                       <h4 className="text-5xl font-black italic tracking-tighter uppercase mb-3 leading-none">{activeMission.customerName}</h4>
                       <div className="flex items-center gap-4">
                         <p className="font-bold text-sm uppercase tracking-tight opacity-70 truncate max-w-[80%]">
                           {activeMission.pickup} ➔ {activeMission.drop}
                         </p>
                         <span className="bg-black/10 px-3 py-1 rounded-full text-[9px] font-black italic">VIEW INTEL</span>
                       </div>
                    </motion.div>
                  )}
               </div>
            </motion.div>
          )}

          {activeTab === 'MISSION' && (
             <motion.div key="mission" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.05 }} className="h-full">
                {activeMission ? (
                  <div className="space-y-12 pb-10">
                     <header className="flex justify-between items-center">
                        <div className="space-y-1">
                          <h3 className="text-5xl font-black italic uppercase tracking-tighter text-white">Tactical Intel</h3>
                          <p className="text-[9px] font-black text-slate-500 uppercase tracking-[5px]">Mission Deployment Parameters</p>
                        </div>
                        <span className="px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-400 text-black shadow-yellow-tactical italic">{activeMission.status}</span>
                     </header>

                     <div className="bg-white/5 p-12 rounded-[60px] border border-white/10 backdrop-blur-3xl space-y-12 relative overflow-hidden shadow-4xl">
                        <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
                        <div className="space-y-10 relative z-10">
                           <div className="flex items-start gap-10">
                              <div className="w-16 h-16 bg-yellow-400 rounded-[28px] flex items-center justify-center text-black font-black text-2xl shadow-xl italic">P</div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Pickup Requisition</p>
                                 <p className="text-3xl font-black text-white uppercase italic tracking-tight">{activeMission.pickup}</p>
                              </div>
                           </div>
                           <div className="w-1 h-16 bg-white/5 ml-7.5 rounded-full" />
                           <div className="flex items-start gap-10">
                              <div className="w-16 h-16 bg-white/10 rounded-[28px] flex items-center justify-center text-white/40 font-black text-2xl border border-white/5 italic">D</div>
                              <div>
                                 <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3">Target Destination</p>
                                 <p className="text-3xl font-black text-white uppercase italic tracking-tight">{activeMission.drop}</p>
                              </div>
                           </div>
                        </div>

                        <div className="grid grid-cols-2 gap-8 pt-12 border-t border-white/5 relative z-10">
                           <div className="bg-black/60 p-10 rounded-[45px] border border-white/5 shadow-inner group hover:border-yellow-400/20 transition-all">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Estimated Range</p>
                              <p className="text-5xl font-black text-white italic">{intel?.distanceKm || '--'} <span className="text-xl">KM</span></p>
                           </div>
                           <div className="bg-black/60 p-10 rounded-[45px] border border-white/5 shadow-inner group hover:border-yellow-400/20 transition-all">
                              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Secured Yield</p>
                              <p className="text-5xl font-black text-yellow-400 italic">₹{activeMission.fare}</p>
                           </div>
                        </div>
                     </div>

                     <div className="bg-slate-900/80 p-14 rounded-[70px] border border-white/10 text-center space-y-10 shadow-4xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/20">
                          <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 3 }} className="w-1/4 h-full bg-yellow-400" />
                        </div>
                        <p className="text-[12px] font-black text-slate-500 uppercase tracking-[12px]">Execution Protocols</p>
                        <div className="flex flex-col gap-5">
                           {activeMission.status === BookingStatus.ASSIGNED ? (
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onUpdateBookingStatus(activeMission.id, BookingStatus.ON_TRIP)} 
                                className="w-full bg-white text-black py-10 rounded-[45px] font-black uppercase tracking-[12px] shadow-4xl active:translate-y-1 transition-all text-lg border-b-[10px] border-slate-300"
                              >
                                COMMENCE MISSION
                              </motion.button>
                           ) : (
                              <motion.button 
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onUpdateBookingStatus(activeMission.id, BookingStatus.COMPLETED)} 
                                className="w-full bg-green-500 text-black py-10 rounded-[45px] font-black uppercase tracking-[12px] shadow-4xl active:translate-y-1 transition-all text-lg border-b-[10px] border-green-700"
                              >
                                MISSION ACCOMPLISHED
                              </motion.button>
                           )}
                           <button className="w-full bg-red-500/10 border border-red-500/20 text-red-500 py-6 rounded-[35px] font-black uppercase tracking-[6px] text-[11px] hover:bg-red-500 hover:text-white transition-all">ABORT SIGNAL / SOS</button>
                        </div>
                     </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center py-40 text-center space-y-12">
                     <motion.div 
                       animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
                       transition={{ repeat: Infinity, duration: 4 }}
                       className="w-40 h-40 bg-white/5 rounded-full flex items-center justify-center text-7xl border-4 border-dashed border-white/10"
                     >
                       📡
                     </motion.div>
                     <div className="space-y-6">
                        <p className="text-slate-500 font-black uppercase tracking-[12px] italic">Network Registry: Idle</p>
                        <p className="text-[11px] text-slate-600 font-bold uppercase tracking-[4px] max-w-sm mx-auto leading-relaxed">
                          Standing by for tactical mission parameters from SG Central Dispatch node.
                        </p>
                     </div>
                     <button onClick={() => setActiveTab('DASHBOARD')} className="bg-white/5 border border-white/10 px-12 py-6 rounded-[30px] font-black uppercase tracking-[6px] text-[11px] hover:bg-yellow-400 hover:text-black transition-all">RETURN TO COMMAND</button>
                  </div>
                )}
             </motion.div>
          )}

          {activeTab === 'HISTORY' && (
             <motion.div key="history" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-14">
                <header className="space-y-1">
                   <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">Mission Log</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[8px] mt-6">Unit Performance Registry</p>
                </header>

                <div className="space-y-5">
                   {bookings.filter(b => b.status === BookingStatus.COMPLETED).length === 0 ? (
                     <div className="py-20 text-center text-slate-700 font-black uppercase tracking-[10px] italic border-2 border-dashed border-white/5 rounded-[50px]">No History Recorded</div>
                   ) : (
                     bookings.filter(b => b.status === BookingStatus.COMPLETED).slice().reverse().map(b => (
                       <div key={b.id} className="bg-black/60 border border-white/10 p-12 rounded-[55px] flex justify-between items-center group hover:bg-white/5 transition-all shadow-2xl relative overflow-hidden">
                          <div className="absolute top-0 left-0 w-1 h-full bg-green-500/30" />
                          <div className="space-y-3">
                             <p className="text-[12px] font-black text-slate-600 uppercase tracking-widest">{b.timestamp.toLocaleDateString()}</p>
                             <h4 className="text-3xl font-black text-white uppercase italic tracking-tighter truncate max-w-[240px] md:max-w-md">{b.drop}</h4>
                          </div>
                          <div className="text-right space-y-3">
                             <p className="text-4xl font-black text-green-400 italic tracking-tighter leading-none">+₹{b.fare}</p>
                             <p className="text-[10px] font-black text-slate-700 uppercase tracking-[5px]">SECURED</p>
                          </div>
                       </div>
                     ))
                   )}
                </div>
             </motion.div>
          )}

          {activeTab === 'PROFILE' && (
             <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-14">
                <header className="space-y-1">
                   <h3 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter text-white">Pilot Profile</h3>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-[8px] mt-6">Identity Signature Hub</p>
                </header>

                <div className="bg-white/5 border border-white/10 p-14 rounded-[65px] backdrop-blur-3xl space-y-14 shadow-4xl text-center relative overflow-hidden">
                   <div className="absolute inset-0 tactical-grid opacity-5" />
                   <div className="flex flex-col items-center gap-10 relative z-10">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${profile.id}`} className="w-48 h-48 rounded-[60px] border-4 border-yellow-400 shadow-4xl" alt="Profile" />
                        <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-yellow-400 text-black px-8 py-2 rounded-full text-[12px] font-black uppercase tracking-[5px] italic">RANK: ELITE</div>
                      </div>
                      <div className="space-y-3">
                         <h4 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">{profile.name}</h4>
                         <div className="flex items-center justify-center gap-4">
                           <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]" />
                           <p className="text-[12px] font-black text-yellow-500 tracking-[6px] uppercase">SIGNAL: ENCRYPTED_ACTIVE</p>
                         </div>
                      </div>
                   </div>

                   <div className="space-y-8 pt-14 border-t border-white/10 text-left relative z-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-8">Comms Link (Phone)</label>
                            <div className="w-full bg-black/60 border border-white/10 p-8 rounded-3xl font-black text-white/40 italic tracking-widest text-lg">{profile.phone}</div>
                         </div>
                         <div className="space-y-4">
                            <label className="text-[11px] font-black text-slate-600 uppercase tracking-widest ml-8">Tactical Unit ID</label>
                            <div className="w-full bg-black/60 border border-white/10 p-8 rounded-3xl font-black text-white/40 italic tracking-widest uppercase text-lg">{profile.vehicleNo}</div>
                         </div>
                      </div>
                      <div className="bg-black/40 p-8 rounded-3xl border border-white/5 text-center">
                         <p className="text-[10px] font-black text-slate-500 uppercase tracking-[8px]">PILOT AUTHENTICATION TOKEN: SG-CORE-2025-PX</p>
                      </div>
                   </div>
                </div>
             </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Driver Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-[1000] bg-black/80 backdrop-blur-3xl border-t border-white/5 px-8 py-6 md:px-20 flex justify-around items-center shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
         {[
           { id: 'DASHBOARD', icon: '📊', label: 'COMMAND' },
           { id: 'MISSION', icon: '🚕', label: 'MISSION' },
           { id: 'HISTORY', icon: '📜', label: 'LOGS' },
           { id: 'PROFILE', icon: '👤', label: 'PILOT' },
         ].map(tab => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id as DriverTab)}
             className={`flex flex-col items-center gap-2.5 transition-all group ${
               activeTab === tab.id ? 'text-yellow-400' : 'text-slate-600 hover:text-white'
             }`}
           >
             <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center text-3xl transition-all relative ${
               activeTab === tab.id ? 'bg-yellow-400 text-black scale-110 shadow-yellow-tactical' : 'bg-white/5 group-hover:bg-white/10'
             }`}>
               {tab.icon}
               {(tab.id === 'MISSION' && activeMission) || (tab.id === 'DASHBOARD' && pendingMissions.length > 0 && !activeMission) ? (
                  <motion.div 
                    animate={{ scale: [1, 1.8, 1], opacity: [1, 0.4, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className={`absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full border-4 border-black shadow-lg ${activeMission ? 'bg-red-500' : 'bg-yellow-400'}`} 
                  />
               ) : null}
             </div>
             <span className="text-[9px] font-black uppercase tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">{tab.label}</span>
           </button>
         ))}
      </nav>
    </div>
  );
};
