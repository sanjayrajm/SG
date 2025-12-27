
import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  onBack?: () => void;
  supportPhone: string;
  asSection?: boolean;
  t: any;
  common: any;
}

export const ContactPage: React.FC<Props> = ({ onBack, supportPhone, asSection = false, t, common }) => {
  const boxContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const boxItem = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0, transition: { type: 'spring' as const } }
  };

  const mapAddress = "no18b-26b Ulagalanda mada st, near aruna mahal kanchipuram - 631502";
  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(mapAddress)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;

  return (
    <div className={`w-full ${asSection ? 'py-24' : 'min-h-screen pt-12'} bg-slate-950/20 text-white font-sans flex flex-col space-y-12 backdrop-blur-3xl relative`}>
      <main className="max-w-7xl mx-auto w-full flex-1 flex flex-col items-center justify-center text-center space-y-16 relative z-10 px-6">
         <motion.div 
           initial={{ opacity: 0, scale: 0.9 }} 
           whileInView={{ opacity: 1, scale: 1 }} 
           viewport={{ once: true }} 
           className="space-y-6"
         >
            <h2 className="text-6xl md:text-9xl font-black italic uppercase tracking-tighter leading-none whitespace-pre-line">{t.heading}</h2>
            <motion.p 
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-slate-400 max-w-2xl mx-auto font-bold uppercase text-[10px] tracking-[8px] leading-relaxed"
            >
              {t.subheading}
            </motion.p>
         </motion.div>

         <motion.div 
            variants={boxContainer}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 w-full"
         >
            {[
               { title: t.signalLine, val: supportPhone, icon: '📞', action: () => window.open(`tel:${supportPhone.replace(/\s/g, '')}`) },
               { title: t.tacticalChat, val: 'WHATSAPP SYNC', icon: '💬', action: () => window.open(`https://wa.me/918608000999`) },
               { title: t.headquarters, val: t.hqValue, icon: '🏢', action: () => {} },
            ].map((box, i) => (
              <motion.div 
                key={i} 
                variants={boxItem}
                whileHover={{ y: -15, borderColor: 'rgba(255, 193, 7, 0.5)', backgroundColor: 'rgba(0,0,0,0.6)' }}
                className="bg-black/40 border border-white/5 p-12 rounded-[60px] space-y-6 flex flex-col items-center group cursor-pointer shadow-4xl relative overflow-hidden"
                onClick={box.action}
              >
                 <div className="absolute inset-0 bg-yellow-400/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                 <motion.span 
                   animate={{ scale: [1, 1.1, 1] }}
                   transition={{ repeat: Infinity, duration: 3 }}
                   className="text-5xl group-hover:scale-125 transition-transform"
                 >
                   {box.icon}
                 </motion.span>
                 <div className="relative z-10">
                    <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1 group-hover:text-slate-400 transition-colors">{box.title}</p>
                    <p className="text-2xl font-black italic uppercase tracking-tighter group-hover:text-yellow-400 transition-colors">{box.val}</p>
                 </div>
              </motion.div>
            ))}
         </motion.div>

         {/* Tactical Map Integration */}
         <motion.section 
           initial={{ opacity: 0, y: 50 }}
           whileInView={{ opacity: 1, y: 0 }}
           viewport={{ once: true }}
           className="w-full space-y-8"
         >
            <div className="flex flex-col items-center gap-4">
               <span className="bg-yellow-400 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[5px]">Neural Geo-Location</span>
               <h3 className="text-3xl font-black italic uppercase tracking-tighter">Mission Headquarters</h3>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest max-w-lg">{mapAddress}</p>
            </div>

            <div className="bg-slate-900/60 border border-white/10 rounded-[60px] p-4 shadow-4xl relative overflow-hidden h-[450px] group">
               <div className="absolute inset-0 tactical-grid opacity-10 pointer-events-none" />
               <iframe 
                 src={mapEmbedUrl}
                 width="100%" 
                 height="100%" 
                 style={{ border: 0, filter: 'invert(90%) hue-rotate(180deg) brightness(0.9) contrast(1.2)' }} 
                 allowFullScreen={true} 
                 loading="lazy" 
                 referrerPolicy="no-referrer-when-downgrade"
                 className="rounded-[45px] grayscale opacity-80 group-hover:opacity-100 group-hover:grayscale-0 transition-all duration-700"
               />
               
               <div className="absolute bottom-10 left-10 right-10 bg-black/80 backdrop-blur-md border border-white/10 p-6 rounded-3xl pointer-events-none translate-y-20 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 text-left">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center text-black text-2xl font-black italic shadow-lg">SG</div>
                     <div>
                        <p className="text-[10px] font-black text-yellow-400 uppercase tracking-widest">SG Call Taxi HQ</p>
                        <p className="text-sm font-bold text-white uppercase italic tracking-tighter">Established Grid Node 01 • Kanchipuram</p>
                     </div>
                  </div>
               </div>
            </div>
         </motion.section>
      </main>

      {!asSection && (
        <footer className="text-center py-20 opacity-20 relative z-10">
           <p className="text-[10px] font-black uppercase tracking-[15px]">SG Neural Link Terminal</p>
        </footer>
      )}
    </div>
  );
};
