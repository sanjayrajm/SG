
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthCredentials, DriverAuth, UserRole } from '../types';
import { sgNotify } from '../services/NotificationService';

interface Props {
  role: UserRole;
  onBack: () => void;
  onSuccess: (id?: string, phone?: string) => void;
  adminCredentials?: AuthCredentials;
  driverAuths?: DriverAuth[];
}

export const AuthPortal: React.FC<Props> = ({ role, onBack, onSuccess, adminCredentials, driverAuths }) => {
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [enteredOtp, setEnteredOtp] = useState(['', '', '', '', '', '']); 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const otpRefs = [
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), 
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)
  ];

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length < 10) {
      setError('INVALID SIGNAL: ENTER 10 DIGITS');
      return;
    }
    setIsAuthenticating(true);
    setError('');

    // Neural Link Handshake Simulation
    setTimeout(() => {
      setOtpSent(true);
      setIsAuthenticating(false);
      sgNotify.playSmsSound();
    }, 1800);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...enteredOtp];
    newOtp[index] = value;
    setEnteredOtp(newOtp);
    if (value && index < 5) otpRefs[index + 1].current?.focus();
  };

  const handleSecureLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsAuthenticating(true);

    setTimeout(() => {
      if (role === UserRole.ADMIN) {
        if (username.toUpperCase() === adminCredentials?.username?.toUpperCase() && password === adminCredentials?.password) {
          onSuccess();
        } else {
          setError('IDENTITY_KEY REJECTED: ACCESS DENIED');
          setIsAuthenticating(false);
        }
      } else if (role === UserRole.DRIVER) {
        const auth = driverAuths?.find(a => a.username.toUpperCase() === username.toUpperCase() && a.password === password);
        if (auth) {
          onSuccess(auth.driverId);
        } else {
          setError('PILOT_SIG_MISMATCH: INVALID CREDENTIALS');
          setIsAuthenticating(false);
        }
      }
    }, 1200);
  };

  const verifyOtp = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      onSuccess(undefined, phone);
      setIsAuthenticating(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-3xl relative z-[200]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }} 
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-black border-2 border-yellow-400/40 p-10 md:p-14 rounded-[50px] shadow-[0_50px_100px_rgba(0,0,0,0.8)] text-center space-y-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400/20">
           <motion.div initial={{ x: '-100%' }} animate={{ x: '100%' }} transition={{ repeat: Infinity, duration: 2 }} className="w-1/3 h-full bg-yellow-400" />
        </div>

        <button onClick={onBack} className="absolute top-8 right-8 text-slate-500 font-black hover:text-white transition-colors">✕</button>

        <div className="space-y-4">
          <div className="w-20 h-20 bg-yellow-400 rounded-[25px] flex items-center justify-center text-black font-black text-3xl mx-auto italic shadow-2xl">SG</div>
          <h2 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            {role.toUpperCase()} HUB
          </h2>
          <p className="text-[9px] font-black text-yellow-500 uppercase tracking-[6px] italic opacity-60">Neural Secure Link Active</p>
        </div>

        {role === UserRole.CUSTOMER ? (
          <div className="space-y-8">
            {!otpSent ? (
              <form onSubmit={handlePhoneSubmit} className="space-y-6">
                 <div className="bg-white/5 border-2 border-white/10 rounded-3xl p-6 flex gap-4 focus-within:border-yellow-400 transition-all">
                    <span className="text-slate-500 font-black">+91</span>
                    <input 
                      type="tel" maxLength={10} placeholder="Mobile Number" 
                      className="bg-transparent flex-1 outline-none text-xl font-black italic tracking-widest"
                      value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    />
                 </div>
                 {error && <p className="text-red-500 font-black text-[10px] uppercase tracking-widest">{error}</p>}
                 <button disabled={isAuthenticating} className="w-full bg-yellow-400 text-black py-7 rounded-3xl font-black uppercase tracking-[8px] shadow-2xl border-b-8 border-yellow-600 active:translate-y-1 transition-all">
                    {isAuthenticating ? 'SYNCHRONIZING...' : 'GET ACCESS TOKEN'}
                 </button>
              </form>
            ) : (
              <div className="space-y-8">
                 <div className="flex justify-center gap-2">
                    {enteredOtp.map((digit, idx) => (
                      <input 
                        key={idx} ref={otpRefs[idx]} maxLength={1}
                        className="w-12 h-16 bg-white/5 border-2 border-white/10 rounded-xl text-center text-2xl font-black text-yellow-400 focus:border-yellow-400 transition-all"
                        value={digit} onChange={e => handleOtpChange(idx, e.target.value)}
                      />
                    ))}
                 </div>
                 <button onClick={verifyOtp} disabled={isAuthenticating} className="w-full bg-white text-black py-7 rounded-3xl font-black uppercase tracking-[8px]">
                    {isAuthenticating ? 'VERIFYING...' : 'AUTHORIZE LINK'}
                 </button>
              </div>
            )}
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSecureLogin}>
             <div className="space-y-4">
                <input 
                  placeholder="IDENTITY KEY" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-3xl outline-none focus:border-yellow-400 font-black text-center uppercase tracking-widest" 
                />
                <input 
                  type="password" 
                  placeholder="SECRET PHRASE" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-white/5 border-2 border-white/10 p-6 rounded-3xl outline-none focus:border-yellow-400 font-black text-center" 
                />
             </div>
             
             {error && <p className="text-red-500 font-black text-[10px] uppercase tracking-widest bg-red-500/10 py-3 rounded-xl border border-red-500/20">{error}</p>}
             
             <button 
               disabled={isAuthenticating}
               className="w-full bg-yellow-400 text-black py-7 rounded-3xl font-black uppercase tracking-[8px] border-b-8 border-yellow-600 shadow-2xl active:translate-y-1 transition-all"
             >
                {isAuthenticating ? 'AUTHENTICATING...' : 'ESTABLISH CONNECTION'}
             </button>
          </form>
        )}
      </motion.div>
    </div>
  );
};
