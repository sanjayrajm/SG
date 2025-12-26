
import React from 'react';
import { motion } from 'framer-motion';
import { Booking, DriverProfile } from '../types';
import { BackgroundVideo } from './BackgroundVideo';

interface Props {
  booking: Booking;
  driver: DriverProfile | null;
  onReturnHome: () => void;
}

const TACTICAL_VIDEO_SRC = "https://sanjayrajm.github.io/taxi-video-website/taxi-video.mp4";

export const BookingConfirmationPage: React.FC<Props> = ({ booking, driver, onReturnHome }) => {
  const isWhatsAppBooking = !driver || booking.id.startsWith('TOUR');
  const WHATSAPP_SUPPORT = `https://wa.me/918608000999?text=Assistance required for Mission ID: ${booking.id}`;

  return (
    <div className="min-h-screen w-full bg-slate-950 text-white font-sans relative overflow-x-hidden flex flex-col items-center justify-center p-4 md:p-12">
      <BackgroundVideo 
        src={TACTICAL_VIDEO_SRC} 
        overlayOpacity="bg-slate-950/85" 
        gradientFrom="from-slate-950"
        gradientVia="via-slate-950/80"
        mobileOverlay="bg-slate-950/90"
      />

      <div className="relative z-10 w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", damping: 20, stiffness: 100 }}
          className="bg-slate-900/40 backdrop-blur-3xl border-2 border-yellow-400/30 rounded-[40px] md:rounded-[60px] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)]"
        >
          {/* Header Section: Status Indicator */}
          <div className={`${isWhatsAppBooking ? 'bg-green-500' : 'bg-yellow-400'} p-8 md:p-14 text-black text-center relative overflow-hidden transition-colors duration-1000`}>
             <div className="absolute inset-0 tactical-grid opacity-30" />
             <motion.div 
               initial={{ scale: 0, rotate: -180 }} 
               animate={{ scale: 1, rotate: 0 }} 
               transition={{ delay: 0.2, type: "spring" }}
               className="w-20 h-20 bg-black rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl relative z-10"
             >
                <span className="text-white text-3xl">{isWhatsAppBooking ? '💬' : '✓'}</span>
             </motion.div>
             <h2 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter leading-none mb-3 relative z-10">
               {isWhatsAppBooking ? 'UPLINK SENT' : 'MISSION LIVE'}
             </h2>
             <p className="text-[10px] font-black uppercase tracking-[8px] opacity-60 relative z-10">
               REGISTRY ID: {booking.id} • STATUS: {isWhatsAppBooking ? 'MANUAL_DISPATCH' : 'UNIT_ENGAGED'}
             </p>
             
             {/* Progress Bar Simulation */}
             <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/10">
                <motion.div 
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-black/30"
                />
             </div>
          </div>

          {/* Ticket Body */}
          <div className="p-8 md:p-12 space-y-12">
             {/* Driver Dossier / Dispatch Info */}
             <div className="flex flex-col md:flex-row items-center gap-10 border-b border-white/5 pb-12">
                <div className="relative">
                   <div className="relative z-10">
                      {isWhatsAppBooking ? (
                        <div className="w-28 h-28 md:w-36 md:h-36 rounded-[40px] bg-white/5 border-4 border-green-500/50 shadow-2xl flex items-center justify-center text-5xl">
                           🏢
                        </div>
                      ) : (
                        <img 
                         src={`https://i.pravatar.cc/200?u=${driver?.id || 'D1'}`} 
                         className="w-28 h-28 md:w-36 md:h-36 rounded-[40px] border-4 border-yellow-400 shadow-3xl object-cover" 
                         alt="Driver dossier photo" 
                        />
                      )}
                   </div>
                   <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [1, 0.7, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={`absolute -bottom-2 -right-2 ${isWhatsAppBooking ? 'bg-green-500' : 'bg-yellow-400'} w-10 h-10 rounded-full border-4 border-slate-900 flex items-center justify-center text-black font-black text-xs z-20 shadow-lg`}
                   >
                     {isWhatsAppBooking ? 'HQ' : '🛡️'}
                   </motion.div>
                </div>
                
                <div className="text-center md:text-left flex-1 space-y-3">
                   <p className={`text-[11px] font-black ${isWhatsAppBooking ? 'text-green-500' : 'text-yellow-500'} uppercase tracking-[4px] italic`}>
                     {isWhatsAppBooking ? 'Tactical Hub Control' : 'Assigned Field Operative'}
                   </p>
                   <h3 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                     {isWhatsAppBooking ? "SG DISPATCH" : (driver?.name || "Neural Pilot")}
                   </h3>
                   <div className="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
                      <div className="bg-white/5 px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-white/10 flex items-center gap-2">
                        <span className="opacity-40">SIGNAL:</span>
                        <span className="text-white">{isWhatsAppBooking ? "+91 86080 00999" : (driver?.vehicleNo || "TN-SG-CORE")}</span>
                      </div>
                      <div className={`${isWhatsAppBooking ? 'bg-green-500/10 text-green-500' : 'bg-yellow-400/10 text-yellow-400'} px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-current/20`}>
                        CLASS: {booking.vehicleType}
                      </div>
                   </div>
                </div>
             </div>

             {/* Mission Metrics: OTP & Yield */}
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center md:text-left group hover:bg-white/10 transition-all duration-500 cursor-default relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">🔐</div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">
                     {isWhatsAppBooking ? 'Mission Node Key' : 'Authentication Token (OTP)'}
                   </p>
                   <p className={`text-5xl font-black italic ${isWhatsAppBooking ? 'tracking-[2px]' : 'tracking-[12px]'} text-yellow-400 transition-colors`}>
                     {booking.otp}
                   </p>
                </div>
                <div className="bg-white/5 p-8 rounded-[40px] border border-white/10 text-center md:text-left relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-4 opacity-5 text-4xl">💰</div>
                   <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Mission Yield Estimate</p>
                   <p className="text-5xl font-black italic tracking-tighter text-white">₹{booking.fare}</p>
                </div>
             </div>

             {/* Mission Coordinates */}
             <div className="space-y-4">
                <div className="flex items-start gap-6 bg-black/40 p-8 rounded-[35px] border border-white/5 group hover:border-white/10 transition-colors">
                   <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-3 h-3 rounded-full bg-yellow-400 shadow-[0_0_15px_rgba(255,193,7,0.6)]" />
                      <div className="w-0.5 h-14 bg-gradient-to-b from-yellow-400 to-transparent opacity-30" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Extraction Zone</p>
                      <p className="text-lg font-black italic uppercase text-white truncate group-hover:text-yellow-400 transition-colors">{booking.pickup}</p>
                   </div>
                </div>
                <div className="flex items-start gap-6 bg-black/40 p-8 rounded-[35px] border border-white/5 group hover:border-white/10 transition-colors">
                   <div className="flex flex-col items-center gap-1 mt-1">
                      <div className="w-3 h-3 rounded-full bg-slate-700" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Primary Objective</p>
                      <p className="text-lg font-black italic uppercase text-white truncate group-hover:text-yellow-400 transition-colors">{booking.drop}</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Action Protocols */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-8 md:p-12 pt-0">
             <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onReturnHome}
              className="w-full bg-white text-black py-7 rounded-[30px] font-black uppercase tracking-[5px] text-[11px] shadow-2xl active:translate-y-1 transition-all border-b-8 border-slate-300"
             >
              TERMINATE & RETURN HOME
             </motion.button>
             <motion.a 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href={WHATSAPP_SUPPORT} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white py-7 rounded-[30px] font-black uppercase tracking-[5px] text-[11px] shadow-2xl flex items-center justify-center gap-4 border-b-8 border-green-800"
             >
              <span>💬</span> SYNC WITH SUPPORT
             </motion.a>
          </div>
        </motion.div>

        {/* Footer Branding */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 text-center"
        >
          <p className="text-[10px] font-black text-slate-600 uppercase tracking-[15px] italic mb-2">
            NEURAL_FLEET_SYNC_COMPLETE
          </p>
          <p className="text-[9px] font-bold text-slate-700 uppercase tracking-[4px]">
            SG CALL TAXI © 2025 • KANCHIPURAM GRID
          </p>
        </motion.div>
      </div>
    </div>
  );
};
