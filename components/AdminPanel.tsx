
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
}

export const AdminPanel: React.FC<Props> = ({ 
  vehicles, setVehicles, drivers, setDrivers, bookings, setBookings,
  driverAuths, setDriverAuths, settings, setSettings, onLogout
}) => {
  const [activePage, setActivePage] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSyncingGlobal, setIsSyncingGlobal] = useState(false);
  
  // Modal States
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  
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
    { id: 'dashboard', label: 'Overview', icon: '📊' },
    { id: 'logs', label: 'Logs', icon: '📜' },
    { id: 'drivers', label: 'Partners', icon: '🤝' },
    { id: 'vehicles', label: 'Fleet', icon: '🚗' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full text-white">
      <div className="flex flex-col gap-6 mb-12 px-2">
        <div className="h-10 w-full flex items-center justify-start overflow-hidden">
          {settings.logoUrl ? (
            <img src={settings.logoUrl} className="h-full w-auto object-contain" alt={settings.appName} />
          ) : (
            <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-black font-black text-lg">SG</div>
          )}
        </div>
        <div>
          <h1 className="font-black text-sm tracking-widest text-white uppercase">{settings.appName}</h1>
          <span className="text-[8px] text-yellow-400 font-bold uppercase tracking-[4px]">ADMIN PANEL</span>
        </div>
      </div>
      <nav className="flex-1 space-y-1">
        {navItems.map(item => (
          <button
            key={item.id}
            onClick={() => { setActivePage(item.id); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center gap-4 px-6 py-3.5 rounded-xl font-bold text-xs transition-all ${
              activePage === item.id ? 'bg-yellow-400 text-black shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <span className="text-base">{item.icon}</span> {item.label}
          </button>
        ))}
      </nav>
      <div className="mt-auto pt-6 border-t border-white/5">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-4 px-6 py-4 rounded-xl font-bold text-[9px] uppercase tracking-widest text-red-500 hover:bg-red-500 hover:text-white transition-all"
        >
          <span>🚪</span> DISCONNECT
        </button>
      </div>
    </div>
  );

  const onlineDriversCount = drivers.filter(d => d.isOnline).length;

  return (
    <div className="flex min-h-screen bg-[#020617] text-white font-sans relative">
      {/* Mobile Toggle Button */}
      <div className="lg:hidden fixed top-6 left-6 z-[600] flex items-center gap-3">
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="w-12 h-12 bg-yellow-400 text-black rounded-xl flex items-center justify-center shadow-2xl active:scale-95 transition-transform"
        >
          <span className="text-xl">☰</span>
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[650] bg-black/80 backdrop-blur-sm lg:hidden"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-72 z-[700] bg-slate-900 border-r border-white/5 p-8 lg:hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-end mb-6">
                 <button onClick={() => setIsMobileSidebarOpen(false)} className="text-white/40 text-2xl p-2">✕</button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <aside className="hidden lg:flex w-72 bg-black/40 border-r border-white/5 flex-col p-8 sticky top-0 h-screen backdrop-blur-3xl">
        <SidebarContent />
      </aside>

      <main className="flex-1 p-6 lg:p-12 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activePage === 'dashboard' && (
            <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
              <header className="flex flex-col gap-2 lg:pt-0 pt-16">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Command Center</h2>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[5px]">REAL-TIME FLEET TELEMETRY</p>
              </header>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {[
                  { label: 'Revenue', value: `₹${bookings.reduce((a, b) => a + (b.fare || 0), 0).toLocaleString()}`, icon: '💰' },
                  { label: 'Bookings', value: bookings.length, icon: '🚕' },
                  { label: 'Fleet Size', value: vehicles.length, icon: '🚗' },
                  { 
                    label: 'Drivers Online', 
                    value: onlineDriversCount, 
                    icon: '🛡️',
                    isLive: true
                  },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 p-5 md:p-8 rounded-2xl md:rounded-[40px] border border-white/5 space-y-2 group hover:bg-white/10 transition-colors relative overflow-hidden">
                    {stat.isLive && onlineDriversCount > 0 && (
                      <div className="absolute top-4 right-4 flex items-center gap-1.5">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]" />
                        <span className="text-[6px] font-black text-green-500 uppercase tracking-widest">LIVE</span>
                      </div>
                    )}
                    <p className="text-[7px] md:text-[8px] font-black text-slate-500 uppercase tracking-widest group-hover:text-yellow-400 transition-colors">{stat.label}</p>
                    <p className="text-xl md:text-3xl font-black text-white italic truncate">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                 <div className="lg:col-span-2 bg-white/5 rounded-[40px] border border-white/5 p-6 md:p-10 space-y-8">
                    <div className="flex justify-between items-center">
                       <h3 className="text-lg font-black uppercase italic tracking-tighter">Recent Logs</h3>
                       <button onClick={() => setActivePage('logs')} className="text-[8px] font-black text-yellow-400 uppercase tracking-[4px] hover:underline">MANIFEST ➔</button>
                    </div>
                    <div className="space-y-4">
                       {bookings.slice(-4).reverse().map(b => (
                         <div key={b.id} className="flex justify-between items-center p-5 bg-black/40 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
                            <div className="flex-1 truncate pr-4">
                               <p className="font-bold text-xs md:text-sm uppercase truncate text-white">{b.customerName}</p>
                               <p className="text-[9px] md:text-[10px] text-slate-500 uppercase truncate mt-1">{b.pickup} ➔ {b.drop}</p>
                            </div>
                            <div className="text-right">
                               <p className="font-black text-yellow-400 italic text-sm md:text-lg">₹{b.fare}</p>
                               <span className="text-[7px] font-black uppercase tracking-[3px] opacity-40">{b.status}</span>
                            </div>
                         </div>
                       ))}
                    </div>
                 </div>
                 <div className="bg-white/5 rounded-[40px] border border-white/5 p-10 flex flex-col items-center justify-center text-center">
                    <div className="w-32 h-32 md:w-40 md:h-40 relative flex items-center justify-center">
                       <div className="absolute inset-0 border-4 border-white/5 border-t-yellow-400 rounded-full animate-spin" />
                       <div className="text-3xl">📡</div>
                    </div>
                    <h3 className="text-lg font-black uppercase italic tracking-tighter mt-8">System Signal</h3>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">NETWORK OPS STABLE</p>
                 </div>
              </div>
            </motion.div>
          )}

          {activePage === 'logs' && (
            <motion.div key="logs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8 lg:pt-0 pt-16">
              <header className="flex flex-col gap-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Registry</h2>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[5px]">FULL MISSION CHRONICLE</p>
              </header>

              <div className="hidden lg:block bg-white/5 rounded-[40px] border border-white/5 overflow-hidden">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-white/5 text-[8px] font-black uppercase tracking-widest text-slate-400">
                      <th className="p-8">ID</th>
                      <th className="p-8">Client</th>
                      <th className="p-8">Route</th>
                      <th className="p-8">Vehicle</th>
                      <th className="p-8">Fare (₹)</th>
                      <th className="p-8">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {bookings.slice().reverse().map(b => (
                      <tr key={b.id} className="hover:bg-white/5 transition-colors text-xs font-bold text-slate-300">
                        <td className="p-8 text-yellow-400 font-black italic">{b.id}</td>
                        <td className="p-8">{b.customerName}</td>
                        <td className="p-8 truncate max-w-[200px]">{b.pickup} ➔ {b.drop}</td>
                        <td className="p-8 uppercase">{b.vehicleType}</td>
                        <td className="p-8 font-black text-white italic">₹{b.fare}</td>
                        <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest ${
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
            <motion.div key="drivers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 lg:pt-0 pt-16">
              <header className="flex justify-between items-end">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Partners</h2>
                  <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[5px]">ELITE FLEET OPERATIVES</p>
                </div>
                <button onClick={openAddDriver} className="bg-yellow-400 text-black px-6 py-4 rounded-3xl font-black text-[9px] uppercase tracking-widest shadow-xl active:scale-95 transition-all">+ NEW PARTNER</button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {drivers.map(driver => (
                  <div key={driver.id} className="bg-white/5 border border-white/5 p-8 rounded-[40px] space-y-6 flex flex-col hover:bg-white/10 transition-colors group">
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <img src={`https://i.pravatar.cc/150?u=${driver.id}`} className="w-16 h-16 rounded-2xl grayscale group-hover:grayscale-0 transition-all shadow-2xl" alt={driver.name} />
                        <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-slate-900 ${driver.isOnline ? 'bg-green-500' : 'bg-slate-600'}`} />
                      </div>
                      <div className="truncate">
                        <h4 className="font-black text-white uppercase italic truncate text-lg">{driver.name}</h4>
                        <p className="text-[8px] font-black text-yellow-400 tracking-widest uppercase mt-1">{driver.vehicleNo}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-black/40 p-5 rounded-2xl">
                        <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Rating</p>
                        <p className="text-xl font-black italic">{driver.rating.toFixed(1)} ★</p>
                      </div>
                      <div className="bg-black/40 p-5 rounded-2xl">
                        <p className="text-[7px] text-slate-500 uppercase font-black tracking-widest">Mission Count</p>
                        <p className="text-xl font-black italic">{driver.totalTrips || 0}</p>
                      </div>
                    </div>
                    <button onClick={() => startEditingDriver(driver)} className="w-full mt-auto bg-white/5 border border-white/10 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white text-black transition-all">EDIT PROFILE</button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activePage === 'vehicles' && (
            <motion.div key="vehicles" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 lg:pt-0 pt-16">
              <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
                <div className="space-y-2">
                  <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Tactical Fleet</h2>
                  <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[5px]">ACTIVE DEPLOYMENT UNITS</p>
                </div>
                <button 
                  onClick={handleGlobalSync} 
                  disabled={isSyncingGlobal}
                  className="bg-white/5 border border-white/10 px-6 py-4 rounded-3xl font-black text-[9px] uppercase tracking-widest hover:text-yellow-400 transition-colors"
                >
                  {isSyncingGlobal ? 'SYNCING AI VISUALS...' : 'SYNC AI VISUALS'}
                </button>
              </header>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {vehicles.map(v => (
                  <div key={v.id} className="bg-white/5 border border-white/5 rounded-[50px] overflow-hidden flex flex-col group hover:bg-white/10 transition-colors">
                    <div className="h-56 bg-black/40 flex items-center justify-center p-12">
                      <img src={v.image} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000" alt={v.type} />
                    </div>
                    <div className="p-10 space-y-6 flex-1 flex flex-col">
                      <div>
                        <h4 className="text-2xl font-black italic uppercase tracking-tighter text-white">{v.type}</h4>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-[4px] mt-2 truncate">{v.models.join(' • ')}</p>
                      </div>
                      <button onClick={() => startEditingVehicle(v)} className="w-full mt-auto bg-white/5 border border-white/10 py-4 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-yellow-400 hover:text-black transition-all">UNIT SPECS</button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activePage === 'settings' && (
            <motion.div key="settings" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12 lg:pt-0 pt-16">
              <header className="space-y-2">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Parameters</h2>
                <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[5px]">SYSTEM CORE CONFIG</p>
              </header>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white/5 p-8 md:p-12 rounded-[50px] border border-white/5 space-y-10">
                   <h3 className="text-xl font-black uppercase italic tracking-tighter">Identity Settings</h3>
                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] ml-4">Brand Display Name</label>
                        <input 
                          value={settings.appName} 
                          onChange={e => setSettings({...settings, appName: e.target.value})}
                          className="w-full bg-black/60 border border-white/10 p-6 rounded-3xl font-bold text-white outline-none focus:border-yellow-400 transition-all" 
                        />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[4px] ml-4">Emergency Uplink (Phone)</label>
                        <input 
                          value={settings.supportPhone} 
                          onChange={e => setSettings({...settings, supportPhone: e.target.value})}
                          className="w-full bg-black/60 border border-white/10 p-6 rounded-3xl font-bold text-white outline-none focus:border-yellow-400 transition-all" 
                        />
                      </div>
                      <div className="pt-4 flex items-center justify-between bg-white/5 p-6 rounded-3xl border border-white/5">
                         <div className="space-y-1">
                            <p className="font-black italic uppercase text-sm">Deployment Status</p>
                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[2px]">Toggle global network</p>
                         </div>
                         <button 
                          onClick={() => setSettings({...settings, serviceEnabled: !settings.serviceEnabled})}
                          className={`w-16 h-8 rounded-full transition-all relative ${settings.serviceEnabled ? 'bg-green-500' : 'bg-red-500'}`}
                         >
                            <motion.div 
                              animate={{ x: settings.serviceEnabled ? 32 : 4 }}
                              className="w-6 h-6 bg-white rounded-full mt-1" 
                            />
                         </button>
                      </div>
                   </div>
                </div>

                <div className="bg-white/5 p-8 md:p-12 rounded-[50px] border border-white/5 space-y-10 flex flex-col items-center text-center">
                   <h3 className="text-xl font-black uppercase italic tracking-tighter">Branding Signature</h3>
                   <div className="relative group flex flex-col items-center gap-8 w-full">
                      <div className="w-full max-w-[280px] aspect-square bg-black/40 rounded-[60px] border-4 border-dashed border-white/5 flex items-center justify-center overflow-hidden p-10">
                        {settings.logoUrl ? (
                          <img src={settings.logoUrl} className="w-full h-full object-contain" alt="Brand Logo" />
                        ) : (
                          <div className="flex flex-col items-center gap-4 text-slate-600">
                             <span className="text-5xl">🎨</span>
                             <p className="text-[8px] font-black uppercase tracking-widest">Awaiting Visual</p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex flex-col gap-4 w-full">
                        <button 
                          onClick={() => logoInputRef.current?.click()}
                          className="w-full bg-yellow-400 text-black py-5 rounded-3xl font-black uppercase text-[10px] tracking-[4px] shadow-2xl hover:scale-105 transition-all"
                        >
                          REPLACE LOGO SIGNAL
                        </button>
                        <p className="text-[8px] font-bold text-slate-500 uppercase tracking-[2px] max-w-[240px] mx-auto leading-relaxed">
                          Recommended: 1024x1024px Transparent PNG for elite transparency blending.
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

      {/* Driver Edit Modal */}
      <AnimatePresence>
        {isDriverModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDriverModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 p-10 rounded-[50px] shadow-4xl space-y-8 overflow-y-auto max-h-[90vh] no-scrollbar"
            >
               <header className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Partner Requisition</h3>
                  <button onClick={() => setIsDriverModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
               </header>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Full Name</label>
                     <input value={driverForm.name || ''} onChange={e => setDriverForm({...driverForm, name: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Signal Link (Phone)</label>
                     <input value={driverForm.phone || ''} onChange={e => setDriverForm({...driverForm, phone: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Unit Registry (Plate No)</label>
                     <input value={driverForm.vehicleNo || ''} onChange={e => setDriverForm({...driverForm, vehicleNo: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Unit Classification</label>
                     <select value={driverForm.vehicleType || 'SEDAN'} onChange={e => setDriverForm({...driverForm, vehicleType: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all appearance-none">
                        {Object.keys(VEHICLES).map(k => <option key={k} value={k}>{k}</option>)}
                     </select>
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Uplink Username</label>
                     <input value={driverForm.username || ''} onChange={e => setDriverForm({...driverForm, username: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Passphrase</label>
                     <input type="password" value={driverForm.password || ''} onChange={e => setDriverForm({...driverForm, password: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
               </div>

               <div className="pt-6">
                  <button onClick={saveDriver} className="w-full bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-[6px] shadow-2xl">COMMIT CHANGES</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Vehicle Edit Modal */}
      <AnimatePresence>
        {isVehicleModalOpen && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-12">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsVehicleModalOpen(false)}
              className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-slate-900 border border-white/10 p-10 rounded-[50px] shadow-4xl space-y-8 overflow-y-auto max-h-[90vh] no-scrollbar"
            >
               <header className="flex justify-between items-center border-b border-white/5 pb-6">
                  <h3 className="text-2xl font-black italic uppercase tracking-tighter">Unit Specifications</h3>
                  <button onClick={() => setIsVehicleModalOpen(false)} className="text-slate-500 hover:text-white">✕</button>
               </header>
               
               <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Deployment Class Name</label>
                     <input value={vehicleForm.type || ''} onChange={e => setVehicleForm({...vehicleForm, type: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Base Requisition Fare (₹)</label>
                     <input type="number" value={vehicleForm.baseFare || 0} onChange={e => setVehicleForm({...vehicleForm, baseFare: parseInt(e.target.value)})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
                  <div className="space-y-2">
                     <label className="text-[8px] font-black uppercase text-slate-500 tracking-widest ml-4">Visual Identity (URL)</label>
                     <input value={vehicleForm.image || ''} onChange={e => setVehicleForm({...vehicleForm, image: e.target.value})} className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl font-bold outline-none focus:border-yellow-400 transition-all" />
                  </div>
               </div>

               <div className="pt-6">
                  <button onClick={saveVehicle} className="w-full bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase text-xs tracking-[6px] shadow-2xl">UPDATE UNIT DEPLOYMENT</button>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
