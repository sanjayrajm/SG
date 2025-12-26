
class NotificationService {
  private audioCtx: AudioContext | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }

  private initAudio() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  private playTone(freq: number, start: number, duration: number, type: OscillatorType = 'sine', volume: number = 0.1) {
    const ctx = this.audioCtx!;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(start);
    osc.stop(start + duration);
  }

  playNewMissionSound() {
    this.initAudio();
    const now = this.audioCtx!.currentTime;
    this.playTone(880, now, 0.1, 'square', 0.2);
    this.playTone(880, now + 0.15, 0.1, 'square', 0.2);
    this.playTone(1760, now + 0.3, 0.4, 'square', 0.25);
  }

  playSmsSound() {
    this.initAudio();
    const now = this.audioCtx!.currentTime;
    this.playTone(1200, now, 0.05, 'sine', 0.2);
    this.playTone(1200, now + 0.1, 0.05, 'sine', 0.2);
  }

  sendNotification(title: string, body: string) {
    if (Notification.permission === 'granted') {
      const options = {
        body,
        icon: '/favicon.ico',
        tag: 'sg-mission',
        vibrate: [500, 110, 500, 110, 450],
        requireInteraction: true
      };
      new Notification(title, options);
    }
    this.playNewMissionSound();
  }
}

export const sgNotify = new NotificationService();
