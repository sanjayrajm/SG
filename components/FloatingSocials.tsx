import React from 'react';
import { motion } from 'framer-motion';

const socialLinks = [
  { 
    id: 'whatsapp', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/2062095_application_chat_communication_logo_whatsapp_icon.svg/640px-2062095_application_chat_communication_logo_whatsapp_icon.svg.png', 
    color: '#25D366', 
    url: 'https://wa.me/918608000999', 
    label: 'COMMS' 
  },
  { 
    id: 'facebook', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg', 
    color: '#1877F2', 
    url: 'https://www.facebook.com/kpmsgcalltaxi/', 
    label: 'INTEL' 
  },
  { 
    id: 'x', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5a/X_icon_2.svg/640px-X_icon_2.svg.png', 
    color: '#ffffff', 
    url: 'https://x.com/sgcalltaxiseo', 
    label: 'SIGNAL' 
  },
  { 
    id: 'pinterest', 
    icon: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/Pinterest.svg/640px-Pinterest.svg.png', 
    color: '#E60023', 
    url: 'https://in.pinterest.com/sgcalltaxiseo/sg-call-taxi/', 
    label: 'CORE' 
  },
];

export const FloatingSocials: React.FC = () => {
  return (
    <div className="fixed right-6 top-1/2 -translate-y-1/2 z-[999] flex flex-col gap-5">
      {socialLinks.map((link, index) => (
        <motion.a
          key={link.id}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          initial={{ x: 100, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            y: [0, -12, 0] // Asynchronous floating idle animation
          }}
          transition={{ 
            x: { delay: 0.8 + index * 0.1, type: 'spring', stiffness: 100 },
            y: { 
              repeat: Infinity, 
              duration: 4 + index * 0.5, 
              ease: "easeInOut" 
            }
          }}
          whileHover={{ 
            scale: 1.15, 
            x: -8,
            boxShadow: `0 0 30px ${link.color}44`,
            borderColor: `${link.color}88`
          }}
          className="group relative w-14 h-14 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-2xl overflow-hidden"
          title={link.id.toUpperCase()}
        >
          {/* Neural Pulse Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          
          {/* Tactical Label Reveal on Hover */}
          <span className="absolute right-[130%] bg-yellow-400 text-black px-4 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[3px] opacity-0 group-hover:opacity-100 transition-all pointer-events-none whitespace-nowrap shadow-[0_10px_30px_rgba(0,0,0,0.5)] border border-white/20">
            {link.label}
          </span>
          
          <div className="w-7 h-7 relative z-10 flex items-center justify-center">
            <img 
              src={link.icon} 
              alt={link.id} 
              className={`w-full h-full object-contain transition-transform duration-500 group-hover:scale-110 ${link.id === 'x' ? 'invert' : ''}`}
            />
          </div>
          
          {/* Animated Scanning Ring */}
          <div className="absolute inset-0 rounded-2xl border-2 border-yellow-400/0 group-hover:border-yellow-400/30 transition-all duration-500" />
          <motion.div 
            animate={{ 
              opacity: [0, 0.5, 0],
              scale: [1, 1.2, 1]
            }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute inset-0 bg-white/5 rounded-2xl pointer-events-none" 
          />
        </motion.a>
      ))}
    </div>
  );
};