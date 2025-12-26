import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  onBack?: () => void;
  asSection?: boolean;
  t: any; // Translation object
  common: any; // Common translations
}

export const AboutPage: React.FC<Props> = ({ onBack, asSection = false, t, common }) => {
  return (
    <div className={`w-full ${asSection ? 'py-12' : 'min-h-screen'} bg-white text-slate-900 font-sans relative overflow-hidden`}>
      {/* Top Header / Breadcrumb (Standalone Only) */}
      {!asSection && (
        <div className="bg-slate-900 text-white py-12 px-6 md:px-20 relative">
          <div className="absolute inset-0 tactical-grid opacity-20" />
          <div className="max-w-7xl mx-auto flex flex-col items-center">
            <button 
              onClick={onBack}
              className="absolute left-6 md:left-20 top-1/2 -translate-y-1/2 text-yellow-400 font-black text-xs tracking-widest flex items-center gap-2 group"
            >
              <span className="group-hover:-translate-x-1 transition-transform">←</span> {common.back}
            </button>
            <h1 className="text-3xl md:text-5xl font-black uppercase italic tracking-tighter">{t.title}</h1>
            <p className="text-[10px] font-bold text-yellow-400 mt-2 uppercase tracking-[4px]">{t.breadcrumb}</p>
          </div>
        </div>
      )}

      {/* Main Section: Few Words About Us */}
      <section className="max-w-7xl mx-auto px-6 md:px-20 py-20">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-5xl font-black text-slate-950 uppercase italic tracking-tighter">{t.heading}</h2>
              <div className="w-20 h-1 bg-yellow-400" />
            </div>
            
            <p className="text-slate-600 leading-relaxed font-medium">
              {t.description}
            </p>

            <div className="grid grid-cols-2 gap-y-4">
              {t.features.map((label: string, idx: number) => (
                <div key={idx} className="flex items-center gap-3">
                  <span className="text-yellow-500 font-black text-lg">✓</span>
                  <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <img 
                src="https://raw.githubusercontent.com/sanjayrajm/taxi-video-website/main/about-car.png" 
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://sanjayrajm.github.io/ROADMAP/";
                }}
                className="w-full max-w-lg object-contain drop-shadow-2xl rotate-[-5deg]"
                alt="Taxi Visual"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="max-w-4xl mx-auto px-6 py-20 space-y-16 border-t border-slate-100">
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">{t.missionTitle}</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {t.missionText}
          </p>
        </div>

        <div className="space-y-6">
          <h3 className="text-2xl font-black text-slate-950 uppercase italic tracking-tighter">{t.visionTitle}</h3>
          <p className="text-slate-600 leading-relaxed font-medium">
            {t.visionText}
          </p>
        </div>
      </section>

      {/* Checkerboard Divider */}
      <div className="w-full h-8 bg-black flex items-center overflow-hidden">
        {[...Array(60)].map((_, i) => (
          <div key={i} className={`w-8 h-8 shrink-0 ${i % 2 === 0 ? 'bg-white' : 'bg-black'}`} />
        ))}
      </div>

      {/* Customer Reviews Section */}
      <section className="bg-slate-50 py-24 px-6 md:px-20 text-center">
        <div className="max-w-7xl mx-auto space-y-16">
          <header className="space-y-2">
            <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[6px]">{t.reviewsSub}</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-950 uppercase italic tracking-tighter">{t.reviewsHeading}</h2>
            <div className="w-24 h-1 bg-yellow-400 mx-auto mt-4" />
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {t.reviews.map((review: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-10 rounded-2xl shadow-xl border border-slate-100 flex flex-col justify-between h-full group hover:border-yellow-400 transition-all"
              >
                <div className="italic text-slate-500 font-medium leading-relaxed mb-8">
                  "{review.text}"
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm tracking-wide">{review.name}</h4>
                  <p className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest mt-1">{review.location}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center gap-2 pt-10">
            <div className="w-3 h-3 bg-yellow-400" />
            <div className="w-3 h-3 bg-slate-200" />
          </div>
        </div>
      </section>
    </div>
  );
};