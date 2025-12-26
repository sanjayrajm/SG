import React from 'react';
import { motion } from 'framer-motion';
import { Booking, BookingStatus, DriverProfile, CustomerProfile } from '../types';

interface Props {
  customer: CustomerProfile;
  bookings: Booking[];
  drivers: DriverProfile[];
  onBack: () => void;
  onBookNew: () => void;
  onLogout: () => void;
}

export const CustomerDashboard: React.FC<Props> = ({ 
  customer, bookings, drivers, onBack, onBookNew, onLogout 
}) => {
  const customerBookings = bookings.filter(b => b.customerPhone === customer.phone);
  const activeBooking = customerBookings.find(b => 
    b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED
  );
  const previousBookings = customerBookings.filter(b => 
    b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
  );

  return (
    <div className="min-h-screen w-full bg-slate-950/40 text-white font-sans flex flex-col p-6 lg:p-12 space-y-12 backdrop-blur-3xl">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-4xl font-black tracking-tighter uppercase italic text-white leading-none">Command Center</h2>
          <p className="text-yellow-400 font-bold text-[10px] uppercase tracking-widest mt-2 italic">Neural ID: {customer.phone}</p>
        </div>
        <div className="flex gap-4">
           <button onClick={onBack} className="bg-white/5 border border-white/10 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-white/10">Return Home</button>
           <button onClick={onLogout} className="bg-red-500/20 text-red-500 border border-red-500/20 px-8 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all">Disconnect</button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-10">
         {/* Left Column: Active Mission */}
         <div className="lg:col-span-2 space-y-10">
            <section className="space-y-6">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Active Deployment</h3>
               {activeBooking ? (
                 <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-yellow-400 text-black p-10 rounded-[60px] shadow-4xl relative overflow-hidden">
                    <div className="absolute inset-0 tactical-grid opacity-20" />
                    <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
                       <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase opacity-40 tracking-[6px]">Mission ID: {activeBooking.id}</p>
                          <h4 className="text-5xl font-black italic tracking-tighter uppercase leading-none">{activeBooking.drop}</h4>
                          <p className="font-bold text-sm opacity-60">FROM: {activeBooking.pickup}</p>
                          <div className="flex gap-4 mt-6">
                             <div className="bg-black/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">OTP: {activeBooking.otp}</div>
                             <div className="bg-black/10 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest">STATUS: {activeBooking.status}</div>
                          </div>
                       </div>
                       <div className="bg-black/5 p-8 rounded-[40px] border border-black/10 flex flex-col items-center justify-center min-w-[200px] text-center">
                          <p className="text-[10px] font-black uppercase opacity-40 mb-2">Estimate</p>
                          <p className="text-5xl font-black italic tracking-tighter leading-none">₹{activeBooking.fare}</p>
                       </div>
                    </div>
                 </motion.div>
               ) : (
                 <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-[60px] p-20 text-center space-y-8">
                    <p className="text-slate-500 font-black uppercase tracking-[10px] italic">No Active Missions Found</p>
                    <button onClick={onBookNew} className="bg-yellow-400 text-black px-12 py-6 rounded-3xl font-black uppercase tracking-[6px] shadow-2xl hover:scale-105 active:scale-95 transition-all">Launch New Mission</button>
                 </div>
               )}
            </section>

            <section className="space-y-6">
               <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">Tactical Logs</h3>
               <div className="space-y-4">
                  {previousBookings.length > 0 ? previousBookings.slice().reverse().map(b => (
                    <div key={b.id} className="bg-white/5 border border-white/5 p-6 rounded-3xl flex justify-between items-center transition-all hover:bg-white/10 group">
                       <div className="flex gap-4 items-center">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-xl grayscale group-hover:grayscale-0 transition-all">🚕</div>
                          <div>
                             <p className="font-black text-white uppercase italic">{b.drop}</p>
                             <p className="text-[9px] text-slate-500 font-black tracking-widest uppercase">{b.timestamp.toLocaleDateString()}</p>
                          </div>
                       </div>
                       <div className="text-right">
                          <p className="font-black text-white italic">₹{b.fare}</p>
                          <span className={`text-[8px] font-black uppercase tracking-widest ${b.status === BookingStatus.COMPLETED ? 'text-green-500' : 'text-red-500'}`}>{b.status}</span>
                       </div>
                    </div>
                  )) : (
                    <div className="p-10 text-center text-white/10 font-black uppercase tracking-widest border border-white/5 rounded-3xl">Registry clear.</div>
                  )}
               </div>
            </section>
         </div>

         {/* Right Column: Profile & Intel */}
         <div className="space-y-10">
            <section className="bg-black/60 border border-white/5 rounded-[50px] p-10 space-y-8">
               <h3 className="text-xl font-black uppercase italic tracking-tighter text-white">Neural Profile</h3>
               <div className="flex flex-col items-center gap-6">
                  <div className="w-24 h-24 bg-yellow-400/10 rounded-[35px] border-4 border-yellow-400/20 flex items-center justify-center text-4xl">👤</div>
                  <div className="text-center">
                     <p className="font-black text-2xl italic uppercase tracking-tighter text-white">{customer.phone}</p>
                     <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest">Verified Tactical Client</p>
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Missions</p>
                     <p className="text-2xl font-black">{customerBookings.length}</p>
                  </div>
                  <div className="text-center">
                     <p className="text-[8px] font-black text-slate-600 uppercase mb-1">Status</p>
                     <p className="text-2xl font-black text-green-500">SYNCED</p>
                  </div>
               </div>
            </section>

            <section className="bg-white/5 rounded-[40px] p-8 border border-white/5 space-y-4">
               <span className="text-2xl">⚡</span>
               <h4 className="font-black uppercase italic tracking-tight text-white">Priority Link</h4>
               <p className="text-[10px] text-slate-500 font-bold leading-relaxed uppercase">Your signature is registered for priority unit allocation during peak hours.</p>
            </section>
         </div>
      </main>
    </div>
  );
};