import React, { useRef, useEffect } from 'react';

interface BackgroundVideoProps {
  src: string;
  poster?: string;
  overlayOpacity?: string;
  blur?: string;
  gradientFrom?: string;
  gradientVia?: string;
  mobileOverlay?: string;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  src, 
  poster = "",
  overlayOpacity = "bg-slate-950/20",
  blur = "backdrop-blur-[0px]",
  gradientFrom = "from-slate-950/40",
  gradientVia = "via-slate-950/20",
  mobileOverlay = "bg-slate-950/40"
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      video.playsInline = true;
      
      const attemptPlay = () => {
        video.play().catch(error => {
          console.warn("SG Neural Core: Autoplay deferred.", error);
          document.addEventListener('click', () => video.play(), { once: true });
        });
      };
      
      attemptPlay();
    }
  }, [src]);

  return (
    <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      <video 
        ref={videoRef}
        autoPlay 
        muted 
        loop 
        playsInline 
        preload="auto"
        poster={poster}
        className="w-full h-full object-cover transition-opacity duration-1000 opacity-100"
      >
        <source src={src} type="video/mp4" />
      </video>
      
      {/* Tactical Overlays */}
      <div className={`absolute inset-0 ${overlayOpacity} ${blur}`} />
      <div className="absolute inset-0 neural-noise opacity-10" />
      <div className="absolute inset-0 scanline opacity-5" />
      
      {/* Gradients */}
      <div className={`absolute inset-0 bg-gradient-to-r ${gradientFrom} ${gradientVia} to-transparent lg:block hidden`} />
      <div className={`absolute inset-0 ${mobileOverlay} lg:hidden block`} />
      
      {/* Final Visual Polish */}
      <div className="absolute inset-0 tactical-grid opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-slate-950/30" />
    </div>
  );
};