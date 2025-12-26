
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';

// Tactical Audio Utilities
const encode = (bytes: Uint8Array) => {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
};

const decode = (base64: string) => {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
};

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const SmartAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [transcription, setTranscription] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const nextStartTimeRef = useRef<number>(0);

  const toggleConnection = async () => {
    if (isActive) {
      disconnect();
    } else {
      await connect();
    }
  };

  const disconnect = () => {
    if (sessionRef.current) {
      sessionRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    for (const source of sourcesRef.current.values()) {
      source.stop();
    }
    sourcesRef.current.clear();
    setIsActive(false);
    setTranscription('');
  };

  const connect = async () => {
    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (!audioContextRef.current) audioContextRef.current = new AudioContext({ sampleRate: 16000 });
      if (!outputAudioContextRef.current) outputAudioContextRef.current = new AudioContext({ sampleRate: 24000 });
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsActive(true);
            setIsConnecting(false);
            const source = audioContextRef.current!.createMediaStreamSource(stream);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(session => session.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscription(prev => prev + message.serverContent!.outputTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscription('');
            }
            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.onended = () => sourcesRef.current.delete(source);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
            }
            if (message.serverContent?.interrupted) {
              for (const s of sourcesRef.current) s.stop();
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => disconnect(),
          onerror: () => disconnect()
        },
        config: {
          responseModalities: [Modality.AUDIO],
          outputAudioTranscription: {},
          systemInstruction: 'You are the SG Call Taxi Neural Voice Link. Help users with taxi bookings, Kanchipuram temple info, and travel logistics in a tactical, efficient, and professional manner. You represent the elite SG brand.'
        }
      });
      sessionRef.current = sessionPromise;
    } catch (e) {
      console.error("Neural Link Failed", e);
      setIsConnecting(false);
    }
  };

  useEffect(() => {
    return () => disconnect();
  }, []);

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="w-[320px] md:w-[400px] bg-slate-900/95 backdrop-blur-3xl border-2 border-yellow-400/40 rounded-[40px] shadow-4xl mb-6 overflow-hidden flex flex-col"
          >
            <div className="p-6 bg-yellow-400 text-black flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-red-600 animate-ping' : 'bg-black opacity-20'}`} />
                  <span className="font-black text-[10px] uppercase tracking-[4px]">Neural Voice Link</span>
               </div>
               <button onClick={() => setIsOpen(false)} className="font-black text-xs">✕</button>
            </div>

            <div className="p-8 space-y-8 flex flex-col items-center min-h-[300px] justify-center text-center">
               <div className="relative">
                  <motion.div 
                    animate={isActive ? { scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] } : {}}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="absolute inset-0 bg-yellow-400 rounded-full blur-2xl"
                  />
                  <button 
                    onClick={toggleConnection}
                    disabled={isConnecting}
                    className={`relative w-24 h-24 rounded-full flex items-center justify-center text-3xl transition-all shadow-2xl ${
                      isActive ? 'bg-red-500 text-white animate-pulse shadow-red-500/50' : 'bg-yellow-400 text-black shadow-yellow-400/50'
                    }`}
                  >
                    {isConnecting ? '📡' : (isActive ? '⏹' : '🎙️')}
                  </button>
               </div>

               <div className="space-y-4">
                  <h4 className="text-xl font-black italic uppercase tracking-tighter">
                    {isConnecting ? 'INITIATING UPLINK...' : (isActive ? 'VOICE LINK ACTIVE' : 'ESTABLISH SIGNAL')}
                  </h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">
                    {isActive ? 'Speak now to interact with the Neural Core.' : 'Tap the node to commence a tactical voice session.'}
                  </p>
               </div>

               {isActive && transcription && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white/5 p-4 rounded-2xl border border-white/10 w-full max-h-24 overflow-y-auto no-scrollbar">
                    <p className="text-[10px] text-yellow-400 font-bold italic leading-tight uppercase">{transcription}</p>
                 </motion.div>
               )}
            </div>

            <div className="px-8 pb-8 flex flex-col items-center">
               <div className="w-full h-px bg-white/5 mb-6" />
               <p className="text-[8px] font-black text-slate-600 uppercase tracking-[4px]">Multimodal Encryption Engaged</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl shadow-yellow-tactical transition-all duration-500 ${
          isOpen ? 'bg-white text-black' : 'bg-yellow-400 text-black'
        }`}
      >
        {isOpen ? '✕' : '🦾'}
        {!isOpen && <div className="absolute inset-0 rounded-full border-4 border-yellow-400/20 animate-ping" />}
      </motion.button>
    </div>
  );
};
