import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue } from 'framer-motion';
import { BookingPage } from './components/BookingPage';
import { TempleBookingPage } from './components/TempleBookingPage';
import { TempleTourPage } from './components/TempleTourPage';
import { IdentityPage } from './components/IdentityPage';
import { AdminPanel } from './components/AdminPanel';
import { DriverApp } from './components/DriverApp';
import { AuthPortal } from './components/AuthPortal';
import { BackgroundVideo } from './components/BackgroundVideo';
import { FleetPage } from './components/FleetPage';
import { LocationPage } from './components/LocationPage';
import { SmartAssistant } from './components/SmartAssistant';
import { FloatingSocials } from './components/FloatingSocials';
import { CustomerDashboard } from './components/CustomerDashboard';
import { ContactPage } from './components/ContactPage';
import { AboutPage } from './components/AboutPage';
import { VehicleTariffPage } from './components/VehicleTariffPage';
import { LanguageSwitcher } from './components/LanguageSwitcher';
import { VEHICLES } from './constants';
import { TRANSLATIONS } from './translations';
import { Vehicle, DriverProfile, Booking, DriverAuth, UserRole, AppSettings, CustomerProfile, Language, BookingStatus } from './types';

type View = 'home' | 'about' | 'fleet' | 'locations' | 'contact' | 'booking' | 'temple-booking' | 'temple-tour' | 'identity' | 'admin' | 'driver' | 'ride-history' | 'customer-login' | 'vehicle-tariff';

const STORAGE_KEYS = {
  SETTINGS: 'sg_settings_v1',
  VEHICLES: 'sg_vehicles_v1',
  DRIVERS: 'sg_drivers_v1',
  DRIVER_AUTHS: 'sg_driver_auths_v1',
  ADMIN_AUTH: 'sg_admin_auth_v1',
  BOOKINGS: 'sg_bookings_v1',
  CURRENT_CUSTOMER: 'sg_current_customer_v1',
  LANG: 'sg_lang_v1'
};

const MAIN_VIDEO_SRC = "https://sanjayrajm.github.io/taxi-video-website/taxi-video.mp4";
const OFFICIAL_LOGO_URL = "https://sanjayrajm.github.io/SGCALLTAXI-LOGO/logo.png";
const FALLBACK_LOGO_URL = "https://raw.githubusercontent.com/sanjayrajm/taxi-video-website/main/logo.png";

export const Website: React.FC = () => {
  const [lang, setLang] = useState<Language>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LANG);
    return (saved as Language) || Language.ENGLISH;
  });

  const [view, setView] = useState<View>('home');
  const [history, setHistory] = useState<View[]>(['home']);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [selectedTemple, setSelectedTemple] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoFailed, setLogoFailed] = useState(false);

  const t = TRANSLATIONS[lang];
  const dragX = useMotionValue(0);

  const load = (key: string, defaultValue: any) => {
    const saved = localStorage.getItem(key);
    if (!saved) return defaultValue;
    try { return JSON.parse(saved); } catch (e) { return defaultValue; }
  };

  const [settings, setSettings] = useState<AppSettings>(() => load(STORAGE_KEYS.SETTINGS, {
    appName: 'SG CALL TAXI',
    logoText: 'SG',
    logoUrl: OFFICIAL_LOGO_URL,
    supportPhone: '+91 86080 00999',
    serviceEnabled: true
  }));

  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    const defaultVehicles = Object.keys(VEHICLES).map(key => ({ 
      id: key, 
      ...VEHICLES[key], 
      baseFare: VEHICLES[key].tariff?.ac?.[0] || 450 
    }));
    return load(STORAGE_KEYS.VEHICLES, defaultVehicles);
  });

  const [drivers, setDrivers] = useState<DriverProfile[]>(() => load(STORAGE_KEYS.DRIVERS, [
    { id: 'D1', name: 'Sanjay S.', phone: '8608000999', email: 'sanjay@sgtaxi.com', licenseNo: 'TN-21-2020', rating: 4.9, totalTrips: 1240, earnings: 45000, vehicleNo: 'TN 21 AX 1234', vehicleType: 'Sedan', status: 'active', isOnline: false },
    { id: 'D2', name: 'Arjun P.', phone: '9860845452', email: 'arjun@sgtaxi.com', licenseNo: 'TN-21-2021', rating: 4.8, totalTrips: 850, earnings: 32000, vehicleNo: 'TN 21 BY 5678', vehicleType: 'SUV', status: 'active', isOnline: false }
  ]));

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const b = load(STORAGE_KEYS.BOOKINGS, []);
    return b.map((item: any) => ({...item, timestamp: new Date(item.timestamp)}));
  });
  
  const [adminAuth, setAdminAuth] = useState<any>(() => load(STORAGE_KEYS.ADMIN_AUTH, { username: 'ADMIN', password: '123' }));
  const [driverAuths, setDriverAuths] = useState<DriverAuth[]>(() => load(STORAGE_KEYS.DRIVER_AUTHS, [
    { driverId: 'D1', username: 'SANJAY', password: '123' },
    { driverId: 'D2', username: 'ARJUN', password: '123' }
  ]));

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [authenticatedDriverId, setAuthenticatedDriverId] = useState<string | null>(null);
  const [currentCustomer, setCurrentCustomer] = useState<CustomerProfile | null>(() => load(STORAGE_KEYS.CURRENT_CUSTOMER, null));

  useEffect(() => { localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings)); }, [settings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles)); }, [vehicles]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DRIVERS, JSON.stringify(drivers)); }, [drivers]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.CURRENT_CUSTOMER, JSON.stringify(currentCustomer)); }, [currentCustomer]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(adminAuth)); }, [adminAuth]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.DRIVER_AUTHS, JSON.stringify(driverAuths)); }, [driverAuths]);
  useEffect(() => { localStorage.setItem(STORAGE_KEYS.LANG, lang); }, [lang]);

  useEffect(() => {
    const timer = setTimeout(() => setIsInitializing(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const navigateTo = (newView: View) => {
    setIsMobileMenuOpen(false);
    dragX.set(0); 
    setHistory(prev => [...prev, newView]);
    setView(newView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (history.length <= 1) {
      setView('home');
      return;
    }
    const newHistory = [...history];
    newHistory.pop(); 
    const previousView = newHistory[newHistory.length - 1];
    setHistory(newHistory);
    setView(previousView);
  };

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src === settings.logoUrl && settings.logoUrl !== OFFICIAL_LOGO_URL) {
      target.src = OFFICIAL_LOGO_URL;
    } else if (target.src === OFFICIAL_LOGO_URL) {
      target.src = FALLBACK_LOGO_URL;
    } else {
      setLogoFailed(true);
    }
  };

  const startTempleBooking = (templeName: string) => {
    setSelectedTemple(templeName);
    navigateTo('temple-booking');
  };

  const renderView = () => {
    switch(view) {
      case 'about': return <AboutPage t={t.about} common={t.common} onBack={goBack} />;
      case 'fleet': return <FleetPage t={t.fleet} common={t.common} vehicles={vehicles} onBack={goBack} onBook={() => navigateTo('booking')} onViewTariff={(v) => { setSelectedVehicle(v); navigateTo('vehicle-tariff'); }} />;
      case 'locations': return <LocationPage t={t.locations} common={t.common} onBack={goBack} />;
      case 'contact': return <ContactPage t={t.contact} common={t.common} supportPhone={settings.supportPhone} onBack={goBack} />;
      case 'booking': return <BookingPage onBack={goBack} drivers={drivers} vehicles={vehicles} onNewBooking={(b) => setBookings([...bookings, b])} />;
      case 'identity': return <IdentityPage onBack={goBack} isTamil={lang === Language.TAMIL} />;
      case 'temple-tour':
        return <TempleTourPage lang={lang} onBack={goBack} settings={settings} onSelectTemple={startTempleBooking} />;
      case 'temple-booking':
        return selectedTemple ? (
          <TempleBookingPage onBack={goBack} drivers={drivers} vehicles={vehicles} onNewBooking={(b) => setBookings([...bookings, b])} selectedTemple={selectedTemple} />
        ) : null;
      case 'vehicle-tariff': 
        return selectedVehicle ? (
          <VehicleTariffPage vehicle={selectedVehicle} onBack={goBack} onBook={() => navigateTo('booking')} />
        ) : null;
      case 'ride-history': 
        if (!currentCustomer) { navigateTo('customer-login'); return null; }
        return <CustomerDashboard customer={currentCustomer} bookings={bookings} drivers={drivers} onBack={goBack} onBookNew={() => navigateTo('booking')} onLogout={() => { setCurrentCustomer(null); navigateTo('home'); }} />;
      case 'admin':
        if (!isAdminAuthenticated) return <AuthPortal role={UserRole.ADMIN} onBack={goBack} onSuccess={() => setIsAdminAuthenticated(true)} adminCredentials={adminAuth} />;
        return (
          <AdminPanel 
            vehicles={vehicles} setVehicles={setVehicles} drivers={drivers} setDrivers={setDrivers} 
            bookings={bookings} setBookings={setBookings} adminAuth={adminAuth} setAdminAuth={setAdminAuth}
            driverAuths={driverAuths} setDriverAuths={setDriverAuths} settings={settings} setSettings={setSettings}
            onLogout={() => { setIsAdminAuthenticated(false); navigateTo('home'); }} 
          />
        );
      case 'driver':
        if (!authenticatedDriverId) return <AuthPortal role={UserRole.DRIVER} onBack={goBack} onSuccess={(id) => setAuthenticatedDriverId(id || null)} driverAuths={driverAuths} />;
        const activeDriver = drivers.find(d => d.id === authenticatedDriverId);
        return activeDriver ? (
          <DriverApp 
            onLogout={() => { setAuthenticatedDriverId(null); navigateTo('home'); }} 
            profile={activeDriver} 
            onStatusChange={(isOnline) => setDrivers(drivers.map(d => d.id === activeDriver.id ? {...d, isOnline} : d))} 
            bookings={bookings.filter(b => b.driverId === activeDriver.id || b.status === BookingStatus.PENDING)} 
            onUpdateBookingStatus={(id, s) => setBookings(bookings.map(b => b.id === id ? {...b, status: s, driverId: s === BookingStatus.ASSIGNED ? activeDriver.id : b.driverId} : b))} 
          />
        ) : null;
      default: return null;
    }
  };

  const isTamil = lang === Language.TAMIL;

  const navLinks = [
    { id: 'home', label: t.common.home },
    { id: 'about', label: t.common.about },
    { id: 'identity', label: isTamil ? 'அடையாளம்' : 'IDENTITY' },
    { id: 'temple-tour', label: isTamil ? 'ஆன்மீக உலா' : 'KANCHI TOURS' },
    { id: 'fleet', label: t.common.services },
    { id: 'locations', label: t.common.locations },
    { id: 'contact', label: t.common.contact },
  ];

  const renderBrandLogo = (sizeClass: string) => {
    if (logoFailed) {
      return (
        <div className={`aspect-square bg-yellow-400 rounded-xl flex items-center justify-center font-black text-black italic shadow-xl ${sizeClass.includes('h-8') ? 'w-8 h-8 text-[10px]' : 'w-24 h-24 text-2xl'}`}>
          {settings.logoText || 'SG'}
        </div>
      );
    }
    return (
      <img 
        src={settings.logoUrl || OFFICIAL_LOGO_URL} 
        onError={handleLogoError} 
        className={`${sizeClass} w-auto object-contain transition-transform`} 
        alt="Logo" 
      />
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#020617] text-white font-sans flex flex-col relative overflow-hidden">
      <div className="fixed inset-0 z-0 opacity-100">
        <BackgroundVideo src={MAIN_VIDEO_SRC} />
      </div>

      <AnimatePresence>
        {isInitializing && (
          <motion.div 
            key="splash"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] bg-[#020617] flex flex-col items-center justify-center"
          >
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4 flex flex-col items-center">
                {renderBrandLogo("h-20 md:h-28 mb-4")}
                <h1 className="text-5xl font-black italic tracking-widest text-white uppercase">{settings.appName || t.nav.brand}</h1>
                <div className="w-48 h-1 bg-yellow-400 mx-auto rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ x: '-100%' }} 
                    animate={{ x: '100%' }} 
                    transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                    className="w-full h-full bg-white/50"
                  />
                </div>
             </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="flex-1 relative z-10 flex flex-col w-full h-full">
        <header className="fixed top-0 left-0 right-0 z-[1000] bg-black/40 backdrop-blur-md border-b border-white/5 px-6 lg:px-12 py-4 flex items-center justify-between">
          <div 
            className="flex items-center gap-4 cursor-pointer group"
            onClick={() => navigateTo('home')}
          >
            {renderBrandLogo("h-8 md:h-10")}
            <div className="hidden sm:flex flex-col">
              <span className="font-black text-xs tracking-tight text-white leading-none uppercase">{settings.appName || t.nav.brand}</span>
              <span className="text-[7px] font-bold text-yellow-400 uppercase tracking-[2px] opacity-60">EST. 2010</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => navigateTo(link.id as View)}
                className={`relative text-[9px] font-black uppercase tracking-[2px] transition-colors hover:text-yellow-400 ${
                  view === link.id ? 'text-yellow-400' : 'text-white/60'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
              <button
                onClick={() => navigateTo('driver')}
                className={`px-5 py-2 text-[8px] font-black uppercase tracking-widest rounded-full transition-all ${view === 'driver' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
              >
                {isTamil ? 'டிரைவர் பக்கம்' : 'DRIVER LOGIN'}
              </button>
              <button
                onClick={() => navigateTo('admin')}
                className={`px-5 py-2 text-[8px] font-black uppercase tracking-widest rounded-full transition-all ${view === 'admin' ? 'bg-white text-black' : 'text-white/60 hover:text-white'}`}
              >
                {isTamil ? 'நிர்வாகம்' : 'ADMIN LOGIN'}
              </button>
            </div>

            <div className="hidden md:block">
              <LanguageSwitcher current={lang} onChange={setLang} />
            </div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigateTo('booking')}
              className="hidden sm:block bg-yellow-400 text-black px-6 py-2.5 rounded-full font-black text-[9px] uppercase tracking-widest shadow-lg active:translate-y-0.5 transition-all"
            >
              {t.common.bookNow}
            </motion.button>

            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 z-[1100]"
            >
              <motion.div animate={isMobileMenuOpen ? { rotate: 45, y: 6.5 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-white" />
              <motion.div animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }} className="w-5 h-0.5 bg-white" />
              <motion.div animate={isMobileMenuOpen ? { rotate: -45, y: -6.5 } : { rotate: 0, y: 0 }} className="w-5 h-0.5 bg-white" />
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-0 z-[1050] bg-slate-950/95 backdrop-blur-2xl lg:hidden flex flex-col p-12 pt-32"
            >
              <div className="flex flex-col gap-8 flex-1">
                {navLinks.map((link) => (
                  <motion.button
                    key={link.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => navigateTo(link.id as View)}
                    className={`text-4xl font-black italic uppercase text-left tracking-tighter ${
                      view === link.id ? 'text-yellow-400' : 'text-white/60'
                    }`}
                  >
                    {link.label}
                  </motion.button>
                ))}
                
                <div className="h-px w-full bg-white/10 my-4" />
                
                <div className="flex flex-col gap-6">
                   <button
                    onClick={() => navigateTo('driver')}
                    className="text-left font-black text-xs tracking-widest text-white/40 uppercase"
                  >
                    {isTamil ? 'டிரைவர் லாகின்' : 'DRIVER LOGIN'}
                  </button>
                  <button
                    onClick={() => navigateTo('admin')}
                    className="text-left font-black text-xs tracking-widest text-white/40 uppercase"
                  >
                    {isTamil ? 'நிர்வாக லாகின்' : 'ADMIN LOGIN'}
                  </button>
                  <div className="pt-2">
                    <LanguageSwitcher current={lang} onChange={setLang} />
                  </div>
                </div>
              </div>

              <button
                onClick={() => navigateTo('booking')}
                className="w-full bg-yellow-400 text-black py-6 rounded-3xl font-black uppercase text-xl italic shadow-2xl mt-auto"
              >
                {t.common.bookNow}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div 
              key="home-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
              className="flex flex-col min-h-screen pt-20"
            >
              <section className="min-h-screen flex flex-col items-center justify-center text-center px-6">
                <motion.div 
                  initial={{ y: 20, opacity: 0 }} 
                  animate={{ y: 0, opacity: 1 }} 
                  className="space-y-8 max-w-5xl"
                >
                  <h2 className="text-7xl md:text-9xl lg:text-[10rem] font-black italic tracking-tighter leading-[0.85] uppercase text-white">
                    {t.hero.title}
                  </h2>
                  <p className="text-base md:text-lg text-slate-400 max-w-xl mx-auto font-medium uppercase tracking-tight italic">
                    {t.hero.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateTo('booking')} 
                      className="bg-yellow-400 text-black px-12 py-5 rounded-full font-black text-xl italic uppercase shadow-2xl transition-all"
                    >
                      {t.hero.ctaBook}
                    </motion.button>
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigateTo('temple-tour')} 
                      className="bg-white/5 backdrop-blur-md border border-white/20 text-white px-12 py-5 rounded-full font-black text-xl italic uppercase transition-all"
                    >
                      {isTamil ? 'ஆன்மீக உலா ➔' : 'TEMPLE TOURS ➔'}
                    </motion.button>
                  </div>
                </motion.div>
              </section>

              <section className="bg-white/90 backdrop-blur-sm"><AboutPage t={t.about} common={t.common} asSection /></section>
              
              <section className="bg-slate-950/60 backdrop-blur-md py-32 px-6 relative overflow-hidden">
                <div className="absolute inset-0 tactical-grid opacity-10" />
                <div className="max-w-7xl mx-auto space-y-20 relative z-10">
                   <div className="text-center space-y-6">
                      <h2 className="text-5xl md:text-8xl font-black italic uppercase tracking-tighter leading-none text-white">
                        {isTamil ? 'ஆன்மீக\nபயணம்.' : 'SACRED\nHERITAGE.'}
                      </h2>
                      <p className="text-yellow-400 font-bold uppercase text-[10px] tracking-[8px]">
                        {isTamil ? 'காஞ்சிபுரத்தின் புனித ஆலயங்களை தரிசிக்க' : 'EXPERIENCE THE ETERNAL CITY OF KANCHIPURAM'}
                      </p>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[60px] p-12 flex flex-col group overflow-hidden relative"
                      >
                         <div className="absolute top-0 right-0 p-8 text-4xl opacity-20">🪷</div>
                         <h3 className="text-3xl font-black italic uppercase text-white mb-4">Divyadesam Tour</h3>
                         <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-1 uppercase">
                           {isTamil ? '15 புனித வைணவ திவ்ய தேசங்களை தரிசிக்க சிறப்பு ஆன்மீகப் பயணம்.' : 'A spiritual odyssey covering the 15 sacred Vaishnava Divyadesam temples of Kanchipuram.'}
                         </p>
                         <button 
                           onClick={() => navigateTo('temple-tour')}
                           className="w-full bg-yellow-400 text-black py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all"
                         >
                           {isTamil ? 'மேலும் அறிய ➔' : 'EXPLORE TOUR ➔'}
                         </button>
                      </motion.div>

                      <motion.div 
                        whileHover={{ y: -10 }}
                        className="bg-slate-900/40 backdrop-blur-3xl border border-white/5 rounded-[60px] p-12 flex flex-col group overflow-hidden relative"
                      >
                         <div className="absolute top-0 right-0 p-8 text-4xl opacity-20">🔱</div>
                         <h3 className="text-3xl font-black italic uppercase text-white mb-4">Sivalayangal Tour</h3>
                         <p className="text-slate-400 text-sm font-medium leading-relaxed mb-10 flex-1 uppercase">
                           {isTamil ? 'புனித 12 சிவாலயங்களின் அருளைப் பெற ஒரு மகத்தான பயணம்.' : 'A grand journey through the 12 significant Shiva temples across the heritage region.'}
                         </p>
                         <button 
                           onClick={() => navigateTo('temple-tour')}
                           className="w-full bg-white text-black py-5 rounded-3xl font-black uppercase text-xs tracking-widest shadow-2xl hover:scale-105 transition-all"
                         >
                           {isTamil ? 'மேலும் அறிய ➔' : 'EXPLORE TOUR ➔'}
                         </button>
                      </motion.div>
                   </div>
                </div>
              </section>

              <section className="bg-slate-950/80 backdrop-blur-md"><FleetPage t={t.fleet} common={t.common} vehicles={vehicles} onBack={() => {}} onBook={() => navigateTo('booking')} asSection /></section>
              
              <footer className="bg-[#0f1115]/90 backdrop-blur-lg pt-24 pb-12 px-6 border-t border-white/5">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-16">
                  <div className="space-y-8">
                    <h3 className="text-yellow-400 font-black text-xl uppercase tracking-widest leading-none">{isTamil ? 'எங்களைப் பற்றி' : 'ABOUT US'}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed font-medium">
                      {t.about.description}
                    </p>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-yellow-400 font-black text-xl uppercase tracking-widest leading-none">{isTamil ? 'இணைப்புகள்' : 'EXPLORE'}</h3>
                    <div className="grid grid-cols-2 gap-x-12">
                      <div className="space-y-0">
                        {[
                          { label: t.common.home, id: 'home' },
                          { label: t.common.about, id: 'about' },
                          { label: isTamil ? 'கட்டணங்கள்' : 'Tariffs', id: 'fleet' }
                        ].map((link, idx) => (
                          <div key={idx} className="border-b border-white/5 py-4 last:border-0">
                            <button onClick={() => navigateTo(link.id as View)} className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-all group">
                              <span className="text-yellow-400 font-black text-xs transition-transform group-hover:translate-x-1">{'>'}</span>
                              <span className="text-[13px] font-bold uppercase tracking-tight">{link.label}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-0">
                        {[
                          { label: isTamil ? 'ஆன்மீக உலா' : 'Kanchi Tours', id: 'temple-tour' },
                          { label: t.common.services, id: 'fleet' },
                          { label: t.common.contact, id: 'contact' }
                        ].map((link, idx) => (
                          <div key={idx} className="border-b border-white/5 py-4 last:border-0">
                            <button onClick={() => navigateTo(link.id as View)} className="flex items-center gap-3 text-gray-400 hover:text-yellow-400 transition-all group">
                              <span className="text-yellow-400 font-black text-xs transition-transform group-hover:translate-x-1">{'>'}</span>
                              <span className="text-[13px] font-bold uppercase tracking-tight">{link.label}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <h3 className="text-yellow-400 font-black text-xl uppercase tracking-widest leading-none">{isTamil ? 'தொடர்புக்கு' : 'CONTACT US'}</h3>
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <p className="text-yellow-400 font-black text-[11px] uppercase tracking-[3px]">{isTamil ? 'முகவரி:' : 'Address:'}</p>
                        <p className="text-gray-400 text-sm leading-relaxed font-bold">
                          SG Call Taxi Kanchipuram<br />
                          no18b-26b Ulagalanda mada st, near<br />
                          aruna mahal kanchipuram - 631502.
                        </p>
                      </div>
                      <div className="space-y-5 pt-4">
                         <a href="tel:8608454545" className="flex items-center gap-4 text-gray-400 hover:text-yellow-400 transition-colors group">
                            <span className="text-yellow-400 text-xl transition-transform group-hover:scale-110">📞</span>
                            <span className="text-lg font-black italic tracking-tighter">86 08 454545</span>
                         </a>
                         <a href="mailto:sgcalltaxi@gmail.com" className="flex items-center gap-4 text-gray-400 hover:text-yellow-400 transition-colors group">
                            <span className="text-yellow-400 text-xl transition-transform group-hover:scale-110">✉️</span>
                            <span className="text-[13px] font-bold">sgcalltaxi@gmail.com</span>
                         </a>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="max-w-7xl mx-auto mt-24 pt-12 border-t border-white/5 text-center">
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-[6px]">
                    SG CALL TAXI 2025 © ALL RIGHTS RESERVED.
                  </p>
                </div>
              </footer>
            </motion.div>
          ) : (
            <motion.div 
              key="sub-view"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-[500] bg-[#020617]/40 backdrop-blur-sm w-full h-full overflow-y-auto pt-24"
            >
              {renderView()}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <FloatingSocials />
      <SmartAssistant />
    </div>
  );
};
