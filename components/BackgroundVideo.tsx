
import React, { useRef, useEffect } from 'react';

interface BackgroundVideoProps {
  src: string;
  poster?: string;
  // Props kept for API compatibility but logic removed to satisfy "visible clear" request
  overlayOpacity?: string;
  blur?: string;
  gradientFrom?: string;
  gradientVia?: string;
  mobileOverlay?: string;
}

export const BackgroundVideo: React.FC<BackgroundVideoProps> = ({ 
  src, 
  poster = ""
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
      
      {/* 
          SCIENTIFIC REMOVAL: 
          All tactical overlays, noise, scanlines, and gradients removed 
          to ensure absolute clarity of the background asset.
      */}
    </div>
  );
};
