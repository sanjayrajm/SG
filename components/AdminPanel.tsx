
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Vehicle, DriverProfile, Booking, BookingStatus, AuthCredentials, DriverAuth, AppSettings } from '../types';
import { VEHICLES } from '../constants';

interface Props {
  vehicles: Vehicle[];
  setVehicles: React.Dispatch<React.SetStateAction<Vehicle[]>>;
  drivers: DriverProfile[];
  setDrivers: React.Dispatch<React.SetStateAction<DriverProfile[]>>;
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  adminAuth: AuthCredentials;
  setAdminAuth: React.Dispatch<React.SetStateAction<AuthCredentials>>;
  driverAuths: DriverAuth[];
  setDriverAuths: React.Dispatch<React.SetStateAction<DriverAuth[]>>;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  onLogout: () => void;
  onResetSystem?: () => void;
}

export const AdminPanel: React.FC<Props> = ({ 
  vehicles, setVehicles, drivers, setDrivers, bookings, setBookings,
  driverAuths, setDriverAuths, settings, setSettings, onLogout, onResetSystem
}) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  
  // Modal States
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  const [driverForm, setDriverForm] = useState<Partial<DriverProfile & { username: string, password?: string }>>({});
  const [vehicleForm, setVehicleForm] = useState<Partial<Vehicle>>({});

  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const base64Logo = event.target.result as string;
          setSettings(prev => ({ ...prev, logoUrl: base64Logo }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGlobalSync = async () => {
    setIsSyncingGlobal(true);
    try {
      const updatedVehicles = await Promise.all(vehicles.map(async (v) => {
        const vConfig = VEHICLES[v.id];
        if (vConfig && vConfig.syncImage) {
          const newImg = await vConfig.syncImage();
          return newImg ? { ...v, image: newImg } : v;
        }
        return v;
      }));
      setVehicles(updatedVehicles);
    } finally {
      setIsSyncingGlobal(false);
      setIsMenuOpen(false);
    }
  };

  const openAddDriver = () => {
    setDriverForm({ 
      id: `D${Date.now()}`, 
      name: '', 
      phone: '', 
      vehicleNo: '', 
      vehicleType: 'SEDAN', 
      rating: 5, 
      totalTrips: 0, 
      earnings: 0, 
      isOnline: false,
      username: '', 
      password: '' 
    });
    setIsDriverModalOpen(true);
    setIsMenuOpen(false);
  };

  const startEditingDriver = (driver: DriverProfile) => {
    const auth = driverAuths.find(a => a.driverId === driver.id);
    setDriverForm({ ...driver, username: auth?.username || '', password: auth?.password || '' });
    setIsDriverModalOpen(true);
  };

  const saveDriver = () => {
    if (!driverForm.name || !driverForm.phone || !driverForm.id) return;

    const newDriver: DriverProfile = {
      id: driverForm.id,
      name: driverForm.name,
      phone: driverForm.phone,
      vehicleNo: driverForm.vehicleNo || 'TBD',
      vehicleType: driverForm.vehicleType || 'SEDAN',
      isOnline: driverForm.isOnline || false,
      rating: driverForm.rating || 5,
      totalTrips: driverForm.totalTrips || 0,
      earnings: driverForm.earnings || 0,
    };

    setDrivers(prev => {
      const exists = prev.find(d => d.id === newDriver.id);
      if (exists) return prev.map(d => d.id === newDriver.id ? newDriver : d);
      return [...prev, newDriver];
    });

    if (driverForm.username) {
      const newAuth: DriverAuth = {
        driverId: newDriver.id,
        username: driverForm.username,
        password: driverForm.password || '123'
      };
      setDriverAuths(prev => {
        const exists = prev.find(a => a.driverId === newAuth.driverId);
        if (exists) return prev.map(a => a.driverId === newAuth.driverId ? newAuth : a);
        return [...prev, newAuth];
      });
    }

    setIsDriverModalOpen(false);
  };

  const startEditingVehicle = (vehicle: Vehicle) => {
    setVehicleForm({ ...vehicle });
    setIsVehicleModalOpen(true);
  };

  const saveVehicle = () => {
    if (!vehicleForm.id) return;
    setVehicles(prev => prev.map(v => v.id === vehicleForm.id ? { ...v, ...vehicleForm } : v));
    setIsVehicleModalOpen(false);
  };

  const navItems = [
    { id: 'dashboard', label: 'OVERVIEW', icon: '📊' },
    { id: 'logs', label: 'MANIFEST', icon: '📜' },
    { id: 'drivers', label: 'PARTNERS', icon: '🤝' },
    { id: 'vehicles', label: 'FLEET', icon: '🚗' },
    { id: 'settings', label: 'SETTINGS', icon: '⚙️' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      <div className="flex flex-col gap-6 mb-12 px-2">
        <div className="h-12 flex items-center justify-start overflow-hidden">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-full w-auto object-contain" alt={settings.appName} />
          ) : (
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black font-black text-xl italic shadow-lg">SG</div>
          )}
        </div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-black text-lg tracking-widest text-white uppercase italic leading-none">{settings.appName}</h1>
          <span className="text-[9px] text-yellow-400 font-bold uppercase tracking-[6px] mt-1 block">CONTROL CENTER</span>
        </motion.div>
      </div>

      <nav className="flex-1 space-y-4">
        {navItems.map(item => (
          <motion.button
            key={item.id}
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => { setActivePage(item.id); setIsMenuOpen(false); }}
            className={`w-full flex items-center gap-5 px-6 py-5 rounded-[25px] font-black text-[11px] uppercase tracking-[2px] transition-all ${
              activePage === item.id ? 'bg-yellow-400 text-black shadow-yellow-tactical scale-105' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-2xl">{item.icon}</span> 
            <span className="whitespace-nowrap italic">{item.label}</span>
          </motion.button>
        ))}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-5 px-6 py-5 rounded-[25px] font-black text-[10px] uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-lg"
        >
          <span className="text-xl">🚪</span> 
          <span className="whitespace-nowrap italic">SECURE DISCONNECT</span>
        </button>
      </div>
    </div>
  );

  const onlineDriversCount = drivers.filter(d => d.isOnline).length;

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans relative overflow-hidden">
      <div className="fixed inset-0 tactical-grid opacity-5 pointer-events-none" />

      {/* TACTICAL COMMAND HEADER - Universal 3-line menu entry point */}
      <header className="fixed top-0 left-0 right-0 z-[4500] bg-black/80 backdrop-blur-3xl border-b border-white/10 p-5 md:px-12 flex items-center justify-between shadow-2xl">
         <div className="flex items-center gap-4">
            <div 
              className="w-11 h-11 bg-yellow-400 rounded-xl flex items-center justify-center text-black font-black text-xl italic shadow-lg cursor-pointer active:scale-95 transition-transform" 
              onClick={() => setActivePage('dashboard')}
            >
              SG
            </div>
            <div className="flex flex-col">
               <span className="text-[12px] md:text-sm font-black uppercase text-white italic tracking-tighter leading-none">Command Center</span>
               <span className="text-[8px] md:text-[9px] font-bold text-yellow-400 uppercase tracking-[4px] mt-1">
                  SECTOR: <span className="text-white">{activePage.toUpperCase()}</span>
               </span>
            </div>
         </div>
         
         <div className="flex items-center gap-3 md:gap-5">
            <div className="hidden sm:flex items-center gap-3 bg-white/5 px-5 py-2.5 rounded-full border border-white/5">
               <span className={`w-2 h-2 rounded-full ${onlineDriversCount > 0 ? 'bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]' : 'bg-red-500'}`} />
               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{onlineDriversCount} UNIT{onlineDriversCount !== 1 ? 'S' : ''} ACTIVE</span>
            </div>
            
            {/* Quick Logout Header Button */}
            <button 
              onClick={onLogout} 
              className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all hover:bg-white/10 active:scale-90"
              title="Secure Disconnect"
            >
               <span className="text-xl md:text-2xl">🚪</span>
            </button>

            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center gap-1.5 shadow-[0_0_30px_rgba(255,193,7,0.3)] relative z-[4600] border-2 border-black/10 transition-all active:scale-90 ${isMenuOpen ? 'bg-white text-black' : 'bg-yellow-400 text-black'}`}
              aria-label="Tactical Navigation Menu"
            >
               <motion.div animate={isMenuOpen ? { rotate: 45, y: 7.5 } : { rotate: 0, y: 0 }} className="w-7 h-1 bg-current rounded-full" />
               <motion.div animate={isMenuOpen ? { opacity: 0, x: 10 } : { opacity: 1, x: 0 }} className="w-7 h-1 bg-current rounded-full" />
               <motion.div animate={isMenuOpen ? { rotate: -45, y: -7.5 } : { rotate: 0, y: 0 }} className="w-7 h-1 bg-current rounded-full" />
            </button>
         </div>
      </header>

      {/* Full-Screen Drawer Navigation */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[4100] bg-black/95 backdrop-blur-xl"
              onClick={() => setIsMenuOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[340px] z-[4200] bg-slate-950 border-r border-white/10 p-10 pt-32 flex flex-col h-full shadow-[30px_0_60px_rgba(0,0,0,0.8)]"
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 w-full min-h-screen p-6 md:p-12 lg:p-20 overflow-y-auto no-scrollbar pt-32 lg:pt-36 relative z-10">
        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 max-w-7xl mx-auto">
              <header className="flex flex-col gap-3">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-[0.9]">Sector Overview.</h2>
                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[10px] italic">REAL-TIME MISSION TELEMETRY</p>
              </header>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 md:gap-10">
                {[
                  { label: 'Total Revenue', value: `₹${bookings.reduce((a, b) => a + (b.fare || 0), 0).toLocaleString()}`, icon: '💰' },
                  { label: 'Logged Missions', value: bookings.length, icon: '🚕' },
                  { label: 'Unit Fleet Size', value: vehicles.length, icon: '🚗' },
                  { label: 'Units Online', value: onlineDriversCount, icon: '🛡️', isLive: true },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-8 md:p-12 rounded-[40px] md:rounded-[60px] border border-white/5 space-y-4 group hover:bg-white/10 transition-all relative overflow-hidden shadow-2xl">
                    {stat.isLive && onlineDriversCount > 0 && (
                      <div className="absolute top-8 right-8 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,197,94,0.8)]" />
                      </div>
                    )}
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-yellow-400 transition-colors italic">{stat.label}</p>
                    <p className="text-3xl md:text-5xl font-black text-white italic tracking-tighter truncate leading-none">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                 <div className="xl:col-span-2 bg-white/5 rounded-[60px] border border-white/10 p-10 md:p-16 space-y-12 shadow-3xl backdrop-blur-sm">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-6 border-b border-white/5 pb-10">
                       <h3 className="text-3xl font-black uppercase italic tracking-tighter">Mission Manifest</h3>
                       <button onClick={() => setActivePage('logs')} className="text-[10px] font-black text-yellow-400 uppercase tracking-[6px] hover:underline transition-all">FULL ARCHIVE ➔</button>
                    </div>
                    <div className="space-y-6">
                       {bookings.slice(-4).reverse().map(b => (
                         <div key={b.id} className="flex justify-between items-center p-8 bg-black/40 rounded-[35px] border border-white/5 hover:border-white/20 transition-all group">
                            <div className="flex-1 truncate pr-8">
                               <p className="font-black text-lg md:text-xl uppercase truncate text-white italic">{b.customerName}</p>
                               <p className="text-[10px] md:text-[11px] text-slate-500 font-bold uppercase truncate mt-3 tracking-tight">
                                  {b.pickup} <span className="text-yellow-400/50 mx-2">➔</span> {b.drop}
                               </p>
                            </div>
                            <div className="text-right">
                               <p className="font-black text-yellow-400 italic text-2xl md:text-4xl tracking-tighter leading-none">₹{b.fare}</p>
                               <span className="text-[9px] font-black uppercase tracking-[4px] opacity-40 mt-2 block">{b.status}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-white/5 rounded-[60px] border border-white/10 p-16 flex flex-col items-center justify-center text-center shadow-3xl group">
                    <div className="w-48 h-48 md:w-64 md:h-64 relative flex items-center justify-center">
                       <div className="absolute inset-0 border-8 border-white/5 border-t-yellow-400 rounded-full animate-spin transition-all" />
                       <motion.div animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 3 }} className="text-7xl group-hover:scale-125 transition-transform">📡</motion.div>
                    </div>
                    <h3 className="text-3xl font-black uppercase italic tracking-tighter mt-12">Neural Health</h3>
                    <p className="text-[11px] font-black text-green-500 uppercase tracking-[8px] mt-4 animate-pulse italic">GRID ONLINE</p>
                 </div>
              </div>
            </motion.div>
          )}

          {activePage === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-12 max-w-7xl mx-auto">
              <header className="flex flex-col gap-3">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">Mission Logs.</h2>
                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[10px] italic">HISTORICAL GRID ARCHIVE</p>
              </header>

              <div className="bg-white/5 rounded-[60px] border border-white/10 overflow-hidden overflow-x-auto no-scrollbar shadow-3xl">
                <table className="w-full text-left min-w-[1000px]">
                  <thead>
                    <tr className="bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <th className="p-12">REGISTRY_ID</th>
                      <th className="p-12">CLIENT_SIG</th>
                      <th className="p-12">COORDINATES</th>
                      <th className="p-12">UNIT_CLASS</th>
                      <th className="p-12">YIELD</th>
                      <th className="p-12">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.slice().reverse().map(b => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors text-sm font-bold text-slate-300 group">
                        <td className="p-12 text-yellow-400 font-black italic tracking-widest group-hover:scale-105 transition-transform">{b.id}</td>
                        <td className="p-12 uppercase">{b.customerName}</td>
                        <td className="p-12 truncate max-w-[300px] italic text-[11px]">{b.pickup} ➔ {b.drop}</td>
                        <td className="p-12 uppercase text-[11px] font-black">{b.vehicleType}</td>
                        <td className="p-12 font-black text-white italic text-2xl tracking-tighter">₹{b.fare}</td>
                        <td className="p-12">
                          <span className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg ${
                            b.status === BookingStatus.COMPLETED ? 'bg-green-500/20 text-green-500' : 
                            b.status === BookingStatus.CANCELLED ? 'bg-red-500/20 text-red-500' : 'bg-yellow-400/20 text-yellow-400'
                          }`}>
                            {b.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {activePage === 'drivers' && (
            <motion.div key="drivers" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 max-w-7xl mx-auto">
              <header className="flex flex-col md:flex-row justify-between items-end gap-8">
                <div className="space-y-3">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">Operatives.</h2>
                  <p className="text-slate-500 font-black text-[11px] uppercase tracking-[10px] italic">FIELD PARTNER REGISTRY</p>
                </div>
                <button onClick={openAddDriver} className="bg-yellow-400 text-black px-10 py-6 rounded-[30px] font-black text-[11px] uppercase tracking-[5px] shadow-yellow-tactical active:translate-y-1 transition-all border-b-8 border-yellow-600 italic">+ NEW REQUISITION</button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {drivers.map(driver => (
                  <div key={driver.id} className="bg-white/5 border border-white/10 p-10 md:p-12 rounded-[60px] space-y-10 flex flex-col hover:bg-white/10 transition-all group shadow-2xl relative overflow-hidden">
                    <div className="flex items-center gap-8">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/250?u=${driver.id}`} className="w-24 h-24 md:w-32 md:h-32 rounded-[40px] grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-3xl border-4 border-white/5 group-hover:border-yellow-400/50" alt={driver.name} />
                        <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full border-4 border-slate-950 ${driver.isOnline ? 'bg-green-500 shadow-[0_0_15px_#22c55e]' : 'bg-slate-700'}`} />
                      </div>
                      <div className="truncate">
                        <h4 className="font-black text-white uppercase italic truncate text-2xl md:text-3xl leading-none">{driver.name}</h4>
                        <p className="text-[11px] font-black text-yellow-400 tracking-[4px] uppercase mt-3 italic">{driver.vehicleNo}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-black/40 p-8 rounded-[35px] border border-white/5 text-center">
                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-2">Rating</p>
                        <p className="text-3xl font-black italic text-white leading-none">{driver.rating.toFixed(1)} ★</p>
                      </div>
                      <div className="bg-black/40 p-8 rounded-[35px] border border-white/5 text-center">
                        <p className="text-[9px] text-slate-600 uppercase font-black tracking-widest mb-2">Trips</p>
                        <p className="text-3xl font-black italic text-white leading-none">{driver.totalTrips || 0}</p>
                      </div>
                    </div>
                    <button onClick={() => startEditingDriver(driver)} className="w-full mt-auto bg-white/10 border border-white/10 py-6 rounded-[30px] text-[11px] font-black uppercase tracking-[5px] hover:bg-white hover:text-black transition-all shadow-lg italic">MODIFY SIGNATURE</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activePage === 'vehicles' && (
            <motion.div key="vehicles" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.98 }} className="space-y-12 max-w-7xl mx-auto">
              <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-8">
                <div className="space-y-3">
                  <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">Unit Fleet.</h2>
                  <p className="text-slate-500 font-black text-[11px] uppercase tracking-[10px] italic">DEPLOYMENT CLASSES</p>
                </div>
                <button 
                  onClick={handleGlobalSync} 
                  disabled={isSyncingGlobal}
                  className="bg-white/5 border border-white/10 px-10 py-6 rounded-[30px] font-black text-[11px] uppercase tracking-[6px] hover:text-yellow-400 transition-all shadow-xl active:scale-95 italic"
                >
                  {isSyncingGlobal ? 'SYNCING_VISUALS...' : 'RE-SYNC UNIT VISUALS'}
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                {vehicles.map(v => (
                  <div key={v.id} className="bg-white/5 border border-white/10 rounded-[70px] overflow-hidden flex flex-col group hover:bg-white/10 transition-all shadow-2xl relative">
                    <div className="h-72 bg-black/60 flex items-center justify-center p-16 relative overflow-hidden">
                       <div className="absolute inset-0 tactical-grid opacity-20" />
                       <img src={v.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000 relative z-10 drop-shadow-2xl" alt={v.type} />
                    </div>
                    <div className="p-12 space-y-10 flex-1 flex flex-col">
                      <div>
                        <h4 className="text-4xl font-black italic uppercase tracking-tighter text-white leading-tight">{v.type}</h4>
                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[6px] mt-4 truncate italic">{v.models.join(' • ')}</p>
                      </div>
                      <button onClick={() => startEditingVehicle(v)} className="w-full mt-auto bg-white/10 border border-white/10 py-6 rounded-[30px] text-[11px] font-black uppercase tracking-[6px] hover:bg-yellow-400 hover:text-black transition-all shadow-lg italic">SPECIFICATIONS</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activePage === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-12 max-w-7xl mx-auto">
              <header className="space-y-3">
                <h2 className="text-5xl md:text-7xl font-black tracking-tighter uppercase italic text-white leading-none">System Core.</h2>
                <p className="text-slate-500 font-black text-[11px] uppercase tracking-[10px] italic">CENTRAL PROTOCOL CONFIG</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                <div className="bg-white/5 p-12 md:p-16 rounded-[70px] border border-white/10 space-y-12 shadow-3xl backdrop-blur-md">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-6">Identity Parameters</h3>
                   <div className="space-y-10">
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-[6px] ml-6 italic">Broadcast Signal Name</label>
                        <input 
                          value={settings.appName} 
                          onChange={e => setSettings({...settings, appName: e.target.value})}
                          className="w-full bg-black/60 border border-white/10 p-8 rounded-[35px] font-black text-xl text-white outline-none focus:border-yellow-400 transition-all italic tracking-tight" 
                        />
                      </div>
                      <div className="space-y-4">
                        <label className="text-[11px] font-black text-slate-600 uppercase tracking-[6px] ml-6 italic">Emergency Frequency</label>
                        <input 
                          value={settings.supportPhone} 
                          onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                          className="w-full bg-black/60 border border-white/10 p-8 rounded-[35px] font-black text-xl text-white outline-none focus:border-yellow-400 transition-all italic tracking-tight" 
                        />
                      </div>
                      <div className="pt-8 space-y-10">
                        <div className="flex items-center justify-between bg-black/40 p-10 rounded-[45px] border border-white/5 shadow-inner">
                           <div className="space-y-3">
                              <p className="font-black italic uppercase text-2xl leading-none">GRID STATUS</p>
                              <p className="text-[10px] font-bold text-slate-700 uppercase tracking-[4px]">Neural Visibility Toggle</p>
                           </div>
                           <button 
                            onClick={() => setSettings({...settings, serviceEnabled: !settings.serviceEnabled})}
                            className={`w-24 h-12 rounded-full transition-all relative border-4 ${settings.serviceEnabled ? 'bg-green-500 border-green-900/30' : 'bg-red-500 border-red-900/30'}`}
                           >
                              <motion.div 
                                animate={{ x: settings.serviceEnabled ? 48 : 4 }}
                                className="w-10 h-10 bg-white rounded-full mt-0.5 shadow-xl" 
                              />
                           </button>
                        </div>
                        
                        <div className="bg-red-500/5 p-12 rounded-[50px] border border-red-500/20 space-y-8 shadow-2xl">
                           <div className="space-y-3">
                              <p className="text-red-500 font-black italic uppercase text-2xl leading-none">PURGE COMMAND</p>
                              <p className="text-[10px] font-bold text-slate-800 uppercase tracking-[4px]">Wipe All Deployment Data</p>
                           </div>
                           <button 
                             onClick={() => setShowResetConfirm(true)}
                             className="w-full py-6 bg-red-600 text-white rounded-[30px] font-black uppercase text-[12px] tracking-[8px] hover:bg-red-700 transition-all shadow-red-500/30 shadow-2xl active:scale-95 italic"
                           >
                              EXECUTE SYSTEM RESET
                           </button>
                        </div>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 p-12 md:p-16 rounded-[70px] border border-white/10 space-y-12 flex flex-col items-center text-center shadow-3xl backdrop-blur-md">
                   <h3 className="text-3xl font-black uppercase italic tracking-tighter border-b border-white/5 pb-6 w-full">Visual Signature</h3>
                   <div className="relative group flex flex-col items-center gap-12 w-full">
                      <div className="w-full max-w-[400px] aspect-square bg-black/60 rounded-[80px] border-4 border-dashed border-white/10 flex items-center justify-center overflow-hidden p-16 group-hover:border-yellow-400/30 transition-all relative shadow-inner">
                        <div className="absolute inset-0 tactical-grid opacity-10" />
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} className="w-full h-full object-contain relative z-10 drop-shadow-2xl" alt="Brand Logo" />
                        ) : (
                          <div className="flex flex-col items-center gap-6 text-slate-800 relative z-10">
                             <span className="text-8xl">🎨</span>
                             <p className="text-[12px] font-black uppercase tracking-widest italic">Awaiting Asset Upload</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-8 w-full max-w-sm">
                        <button 
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full bg-yellow-400 text-black py-7 rounded-[35px] font-black uppercase text-[12px] tracking-[8px] shadow-yellow-tactical hover:scale-105 transition-all border-b-8 border-yellow-600 italic"
                        >
                          BROADCAST LOGO
                        </button>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[4px] leading-relaxed italic">
                          Recommended: 2K High-Def PNG with Transparent Alpha for Neural Integration.
                        </p>
                      </div>

                      <input type="file" ref={logoInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
                   </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Reset Confirmation Overlay */}
      <AnimatePresence>
        {showResetConfirm && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-8 bg-black/95 backdrop-blur-3xl">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border-2 border-red-500/50 p-16 md:p-24 rounded-[70px] shadow-4xl max-w-lg w-full text-center space-y-12"
            >
               <div className="w-28 h-28 bg-red-600/10 rounded-full flex items-center justify-center mx-auto text-6xl border border-red-600/30 animate-pulse">⚠️</div>
               <div className="space-y-6">
                  <h2 className="text-5xl font-black italic uppercase tracking-tighter text-white leading-none">Confirm Purge?</h2>
                  <p className="text-[12px] font-bold text-slate-500 uppercase tracking-[5px] leading-relaxed italic">
                    This action is PERMANENT. It will wipe all partner signatures, mission logs, and calibrations.
                  </p>
               </div>
               <div className="space-y-6">
                  <button 
                    onClick={() => { onResetSystem?.(); setShowResetConfirm(false); }} 
                    className="w-full bg-red-600 text-white py-7 rounded-[35px] font-black uppercase tracking-[8px] text-[13px] shadow-red-500/40 shadow-2xl active:translate-y-1 transition-all border-b-8 border-red-900 italic"
                  >
                    CONFIRM NEURAL WIPE
                  </button>
                  <button 
                    onClick={() => setShowResetConfirm(false)} 
                    className="w-full bg-white/5 border border-white/10 text-white py-7 rounded-[35px] font-black uppercase tracking-[8px] text-[11px] italic hover:bg-white/10 transition-all"
                  >
                    ABORT OPERATION
                  </button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shared Modals for Driver/Vehicle remained as standard centered overlays */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDriverModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-slate-900 border border-white/10 p-12 md:p-20 rounded-[70px] shadow-4xl space-y-12 overflow-y-auto max-h-[90vh] no-scrollbar">
               <header className="flex justify-between items-center border-b border-white/5 pb-10">
                  <div className="space-y-2">
                     <h3 className="text-4xl font-black italic uppercase tracking-tighter">Operative Signature</h3>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[6px]">Partner Requisition Protocol</p>
                  </div>
                  <button onClick={() => setIsDriverModalOpen(false)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all text-3xl">✕</button>
               </header>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Full Name</label>
                     <input value={driverForm.name || ''} onChange={e => setDriverForm({...driverForm, name: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-xl outline-none focus:border-yellow-400 transition-all italic" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Signal Line</label>
                     <input value={driverForm.phone || ''} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-xl outline-none focus:border-yellow-400 transition-all italic" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Unit Registry</label>
                     <input value={driverForm.vehicleNo || ''} onChange={e => setDriverForm({...driverForm, vehicleNo: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-xl outline-none focus:border-yellow-400 transition-all italic" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Classification</label>
                     <div className="relative">
                        <select value={driverForm.vehicleType || 'SEDAN'} onChange={e => setDriverForm({...driverForm, vehicleType: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-xl outline-none focus:border-yellow-400 transition-all appearance-none italic">
                           {Object.keys(VEHICLES).map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                        <div className="absolute right-8 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
                     </div>
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Uplink Username</label>
                     <input value={driverForm.username || ''} onChange={e => setDriverForm({...driverForm, username: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-xl outline-none focus:border-yellow-400 transition-all italic uppercase" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Secret Passphrase</label>
                     <input type="password" value={driverForm.password || ''} onChange={e => setDriverForm({...driverForm, password: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-xl outline-none focus:border-yellow-400 transition-all" />
                  </div>
               </div>
               <div className="pt-10">
                  <button onClick={saveDriver} className="w-full bg-yellow-400 text-black py-8 rounded-[40px] font-black uppercase text-[13px] tracking-[10px] shadow-yellow-tactical border-b-8 border-yellow-600 active:translate-y-1 transition-all italic">COMMIT PARTNER CHANGES ➔</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isVehicleModalOpen && (
          <div className="fixed inset-0 z-[5000] flex items-center justify-center p-6 md:p-12">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsVehicleModalOpen(false)} className="absolute inset-0 bg-black/95 backdrop-blur-xl" />
            <motion.div initial={{ opacity: 0, scale: 0.9, y: 30 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 30 }} className="relative w-full max-w-4xl bg-slate-900 border border-white/10 p-12 md:p-20 rounded-[70px] shadow-4xl space-y-12 overflow-y-auto max-h-[90vh] no-scrollbar">
               <header className="flex justify-between items-center border-b border-white/5 pb-10">
                  <div className="space-y-2">
                     <h3 className="text-4xl font-black italic uppercase tracking-tighter">Unit Calibration</h3>
                     <p className="text-[10px] font-black text-slate-500 uppercase tracking-[6px]">Fleet Optimization Protocol</p>
                  </div>
                  <button onClick={() => setIsVehicleModalOpen(false)} className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all text-3xl">✕</button>
               </header>
               <div className="grid grid-cols-1 gap-12">
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Deployment Class Signature</label>
                     <input value={vehicleForm.type || ''} onChange={e => setVehicleForm({...vehicleForm, type: e.target.value})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-2xl text-white outline-none focus:border-yellow-400 transition-all italic" />
                  </div>
                  <div className="space-y-4">
                     <label className="text-[11px] font-black uppercase text-slate-600 tracking-[6px] ml-6 italic">Base Mission Requisition Yield (₹)</label>
                     <input type="number" value={vehicleForm.baseFare || 0} onChange={e => setVehicleForm({...vehicleForm, baseFare: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/10 p-8 rounded-[35px] font-black text-4xl text-yellow-400 outline-none focus:border-white transition-all italic tracking-tighter" />
                  </div>
               </div>
               <div className="pt-10">
                  <button onClick={saveVehicle} className="w-full bg-yellow-400 text-black py-8 rounded-[40px] font-black uppercase text-[13px] tracking-[10px] shadow-yellow-tactical border-b-8 border-yellow-600 active:translate-y-1 transition-all italic">UPDATE UNIT CLASS ➔</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
