
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI } from '@google/genai';
import { DIVYADESAM_TEMPLES, SHIVA_TEMPLES, FIXED_PACKAGES } from '../constants';
import { Language, AppSettings } from '../types';

interface Props {
  lang: Language;
  onBack: () => void;
  onSelectTemple: (templeName: string) => void;
  settings: AppSettings;
}

type TourType = 'VISHNU' | 'SHIVA';

const OFFICIAL_LOGO_URL = "https://sanjayrajm.github.io/SGCALLTAXI-LOGO/logo.png";
const FALLBACK_LOGO_URL = "https://raw.githubusercontent.com/sanjayrajm/taxi-video-website/main/logo.png";

export const TempleTourPage: React.FC<Props> = ({ lang, onBack, onSelectTemple, settings }) => {
  const [tourType, setTourType] = useState<TourType>('VISHNU');
  const [logoFailed, setLogoFailed] = useState(false);
  const [templeIntel, setTempleIntel] = useState<Record<number, string>>({});
  const [isIntelLoading, setIsIntelLoading] = useState<Record<number, boolean>>({});
  
  const isTamil = lang === Language.TAMIL;
  const currentTemples = tourType === 'VISHNU' ? DIVYADESAM_TEMPLES : SHIVA_TEMPLES;
  const accentColor = tourType === 'VISHNU' ? '#FFC107' : '#ff9800';
  const themeBg = tourType === 'VISHNU' ? 'bg-slate-950/40' : 'bg-[#1a0f00]/40';

  const fullTourKey = tourType === 'VISHNU' 
    ? "Full Kanchipuram 15 Divyadesam Tour" 
    : "Full Kanchipuram 12 Shiva Sivalayangal Tour";
  
  const fullTourData = FIXED_PACKAGES[fullTourKey];

  const fetchTempleInsight = async (templeId: number, templeName: string) => {
    if (templeIntel[templeId]) return;
    setIsIntelLoading(prev => ({ ...prev, [templeId]: true }));
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `Provide 3 tactical travel tips for visiting ${templeName} in Kanchipuram. 
      Focus on: Best time to visit to avoid crowds, dress code strictness, and nearby parking ease. 
      Keep it brief and professional. Mention if it's a Paadal Petra Sivalayam or Divyadesam.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt
      });
      
      setTempleIntel(prev => ({ ...prev, [templeId]: response.text || 'No tactical intel found.' }));
    } catch (e) {
      setTempleIntel(prev => ({ ...prev, [templeId]: 'Neural link timeout. Try again.' }));
    } finally {
      setIsIntelLoading(prev => ({ ...prev, [templeId]: false }));
    }
  };

  const handleLogoError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    if (target.src === settings.logoUrl) target.src = OFFICIAL_LOGO_URL;
    else if (target.src === OFFICIAL_LOGO_URL) target.src = FALLBACK_LOGO_URL;
    else setLogoFailed(true);
  };

  return (
    <div className={`min-h-screen w-full ${themeBg} backdrop-blur-md text-white font-sans p-4 md:p-12 pt-24 relative overflow-x-hidden transition-colors duration-700`}>
      <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
      
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-12 relative z-10">
        <header className="space-y-6 text-center flex flex-col items-center">
          <button onClick={onBack} className="text-[10px] font-black uppercase tracking-[4px] text-slate-500 hover:text-white transition-all block mx-auto mb-2">
            {isTamil ? '← முகப்பிற்கு' : '← BACK TO MISSION CONTROL'}
          </button>
          
          <img 
            src={settings.logoUrl || OFFICIAL_LOGO_URL} 
            onError={handleLogoError}
            className="h-20 md:h-28 w-auto mb-4 drop-shadow-2xl" 
            alt="Logo" 
          />
          
          <div className="flex justify-center gap-3">
            {(['VISHNU', 'SHIVA'] as TourType[]).map(type => (
              <button 
                key={type}
                onClick={() => setTourType(type)}
                className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-[2px] transition-all border-2 ${tourType === type ? 'bg-white text-black border-white' : 'bg-white/5 text-slate-500 border-white/5'}`}
              >
                {type === 'VISHNU' ? (isTamil ? 'திவ்ய தேசம்' : 'Divyadesam') : (isTamil ? 'சிவாலயங்கள்' : 'Sivalayangal')}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            <h1 className="text-4xl md:text-7xl font-black italic uppercase tracking-tighter leading-none">
              {isTamil ? (tourType === 'VISHNU' ? 'திவ்ய தேச' : 'புனிதப்') : 'SACRED'}<br/>
              <span style={{ color: accentColor }}>{isTamil ? 'ஆன்மீக உலா.' : 'TOURS.'}</span>
            </h1>
            <p className="text-slate-500 font-black text-[10px] uppercase tracking-[10px] mt-4">Registry of Sacred Kanchipuram Sites</p>
          </div>
        </header>

        {/* FULL MISSION CARD */}
        <section className="max-w-4xl mx-auto">
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            key={tourType}
            className="bg-white/5 border-2 border-dashed border-white/20 rounded-[50px] p-8 md:p-12 relative overflow-hidden group hover:border-white/40 transition-all"
          >
            <div className="absolute top-0 right-0 p-12 text-9xl font-black italic opacity-5 pointer-events-none group-hover:opacity-10 transition-opacity">
              {tourType === 'VISHNU' ? 'DIVYA' : 'SHIVA'}
            </div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
               <div className="text-center md:text-left space-y-4">
                  <div className="flex items-center justify-center md:justify-start gap-3">
                    <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                    <p className="text-[10px] font-black uppercase tracking-[5px] text-slate-400">Tactical Package Detected</p>
                  </div>
                  <h2 className="text-4xl md:text-5xl font-black italic uppercase tracking-tighter text-white leading-none">
                    {isTamil ? (tourType === 'VISHNU' ? 'முழு திவ்ய தேச தரிசனம்' : 'முழு சிவாலய தரிசனம்') : `FULL ${tourType} MISSION`}
                  </h2>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed max-w-md">
                    {isTamil 
                      ? 'அனைத்து ஆலயங்களையும் ஒரே பயணத்தில் தரிசிக்க உகந்த தொகுப்பு.' 
                      : `Comprehensive circuit covering all ${currentTemples.length} major sacred nodes in a single optimized deployment.`}
                  </p>
               </div>

               <div className="bg-black/40 backdrop-blur-3xl border border-white/10 p-8 rounded-[40px] flex flex-col items-center justify-center min-w-[240px] shadow-2xl">
                  <div className="grid grid-cols-2 gap-8 w-full mb-6">
                    <div className="text-center">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Range</p>
                       <p className="text-2xl font-black italic text-white leading-none">{fullTourData.distance}KM</p>
                    </div>
                    <div className="text-center">
                       <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-1">Yield</p>
                       <p className="text-2xl font-black italic style={{ color: accentColor }} leading-none" style={{ color: accentColor }}>₹{fullTourData.fare}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectTemple(fullTourKey)}
                    className="w-full py-5 rounded-[25px] font-black uppercase tracking-[6px] text-[11px] shadow-2xl active:translate-y-1 transition-all border-b-4"
                    style={{ backgroundColor: accentColor, color: 'black', borderColor: 'rgba(0,0,0,0.2)' }}
                  >
                    {isTamil ? 'முழு பயணத்தை தொடங்கு' : 'INITIATE FULL MISSION ➔'}
                  </button>
               </div>
            </div>
          </motion.div>
        </section>

        {/* Individual Temple List Section */}
        <div className="text-center pt-8">
           <p className="text-[8px] font-black text-slate-600 uppercase tracking-[10px]">Individual Node Selection</p>
        </div>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-24">
          {currentTemples.map((temple, idx) => (
            <motion.div 
              key={temple.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 border border-white/10 p-8 rounded-[40px] group hover:bg-white/10 transition-all flex flex-col backdrop-blur-sm relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex justify-between items-center mb-6">
                <span className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black italic text-lg" style={{ backgroundColor: accentColor }}>{idx + 1}</span>
                <span className="text-[7px] font-black text-slate-500 uppercase tracking-widest bg-black/40 px-3 py-1 rounded-full">{temple.location}</span>
              </div>
              
              <div className="space-y-4 flex-1">
                <h4 className="text-xl font-black italic uppercase text-white leading-tight group-hover:text-yellow-400 transition-colors">{temple.name}</h4>
                <p className="text-[8px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">{temple.significance}</p>
                
                {templeIntel[temple.id] ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-yellow-400/5 border border-yellow-400/20 rounded-2xl">
                    <p className="text-[8px] font-bold text-yellow-500 uppercase mb-2">Neural Insight:</p>
                    <p className="text-[9px] text-slate-400 leading-relaxed italic">{templeIntel[temple.id]}</p>
                  </motion.div>
                ) : (
                  <button 
                    onClick={() => fetchTempleInsight(temple.id, temple.name)}
                    className="text-[7px] font-black text-yellow-500 uppercase tracking-widest hover:underline"
                  >
                    {isIntelLoading[temple.id] ? 'LINKING...' : '⚡ FETCH NEURAL INSIGHT'}
                  </button>
                )}
              </div>

              <button 
                onClick={() => onSelectTemple(`${temple.name} Pilgrimage`)}
                className="w-full py-4 rounded-2xl border border-white/10 text-[8px] font-black uppercase tracking-[3px] mt-6 hover:bg-white hover:text-black transition-all"
              >
                SELECT DESTINATION
              </button>
            </motion.div>
          ))}
        </section>
      </motion.div>
    </div>
  );
};
