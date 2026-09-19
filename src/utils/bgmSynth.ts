// Procedural feel-good Web Audio background music engine for The Pub Quiz
// 100% self-contained, no external MP3 dependencies, smooth looped progressions with on-screen mute control

export type BGMTrackId = 'sunny_tavern' | 'cozy_lounge' | 'celtic_jig';

export interface BGMTrackInfo {
  id: BGMTrackId;
  name: string;
  emoji: string;
  genre: string;
  tempoBpm: number;
}

export const BGM_TRACKS: BGMTrackInfo[] = [
  {
    id: 'sunny_tavern',
    name: 'Sunny Tavern Lounge',
    emoji: '🍻',
    genre: 'Warm Acoustic & Rhodes Chords',
    tempoBpm: 104,
  },
  {
    id: 'cozy_lounge',
    name: 'Cozy Fireside Vibes',
    emoji: '☕',
    genre: 'Mellow Jazzy Lo-Fi Grooves',
    tempoBpm: 88,
  },
  {
    id: 'celtic_jig',
    name: 'Upbeat Pub Jig',
    emoji: '🍀',
    genre: 'Cheerful Irish Tavern Bounce',
    tempoBpm: 120,
  },
];

// Note frequencies
const F_MAP: Record<string, number> = {
  C2: 65.41, E2: 82.41, F2: 87.31, G2: 98.00, A2: 110.00, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77,
  // Flatted / Sharped notes for jazzy warmth
  Db3: 138.59, Eb3: 155.56, Ab3: 207.65, Bb3: 233.08,
  Db4: 277.18, Eb4: 311.13, Gb4: 369.99, Ab4: 415.30, Bb4: 466.16,
};

// Chord structure for loop steps
interface ChordStep {
  bass: number;
  chords: number[];
  arpeggio: number[];
}

// Track 1: Sunny Tavern (Cmaj7 -> Am7 -> Dm7 -> G7 -> Em7 -> A7 -> Dm7 -> G11)
const TRACK_SUNNY_CHORDS: ChordStep[] = [
  { bass: F_MAP.C3, chords: [F_MAP.E4, F_MAP.G4, F_MAP.B4], arpeggio: [F_MAP.C4, F_MAP.E4, F_MAP.G4, F_MAP.B4] },
  { bass: F_MAP.A2, chords: [F_MAP.C4, F_MAP.E4, F_MAP.G4], arpeggio: [F_MAP.A3, F_MAP.C4, F_MAP.E4, F_MAP.G4] },
  { bass: F_MAP.F2, chords: [F_MAP.A3, F_MAP.C4, F_MAP.E4], arpeggio: [F_MAP.F3, F_MAP.A3, F_MAP.C4, F_MAP.E4] },
  { bass: F_MAP.G2, chords: [F_MAP.B3, F_MAP.D4, F_MAP.F4], arpeggio: [F_MAP.G3, F_MAP.B3, F_MAP.D4, F_MAP.F4] },
  { bass: F_MAP.E2, chords: [F_MAP.G3, F_MAP.B3, F_MAP.D4], arpeggio: [F_MAP.E3, F_MAP.G3, F_MAP.B3, F_MAP.D4] },
  { bass: F_MAP.A2, chords: [F_MAP.G3, F_MAP.Db4, F_MAP.E4], arpeggio: [F_MAP.A3, F_MAP.Db4, F_MAP.E4, F_MAP.G4] },
  { bass: F_MAP.D3, chords: [F_MAP.F3, F_MAP.A3, F_MAP.C4], arpeggio: [F_MAP.D3, F_MAP.F3, F_MAP.A3, F_MAP.C4] },
  { bass: F_MAP.G2, chords: [F_MAP.F3, F_MAP.A3, F_MAP.D4], arpeggio: [F_MAP.G3, F_MAP.C4, F_MAP.D4, F_MAP.G4] },
];

// Track 2: Cozy Lounge (Fmaj7 -> Em7 -> Dm7 -> Cmaj7)
const TRACK_COZY_CHORDS: ChordStep[] = [
  { bass: F_MAP.F2, chords: [F_MAP.A3, F_MAP.C4, F_MAP.E4], arpeggio: [F_MAP.C4, F_MAP.E4, F_MAP.G4, F_MAP.A4] },
  { bass: F_MAP.E2, chords: [F_MAP.G3, F_MAP.B3, F_MAP.D4], arpeggio: [F_MAP.B3, F_MAP.D4, F_MAP.G4, F_MAP.B4] },
  { bass: F_MAP.D2, chords: [F_MAP.F3, F_MAP.A3, F_MAP.C4], arpeggio: [F_MAP.A3, F_MAP.C4, F_MAP.E4, F_MAP.F4] },
  { bass: F_MAP.C2, chords: [F_MAP.E3, F_MAP.G3, F_MAP.B3], arpeggio: [F_MAP.G3, F_MAP.B3, F_MAP.D4, F_MAP.E4] },
];

// Track 3: Upbeat Celtic Jig (G -> D -> Em -> C)
const TRACK_CELTIC_CHORDS: ChordStep[] = [
  { bass: F_MAP.G2, chords: [F_MAP.G3, F_MAP.B3, F_MAP.D4], arpeggio: [F_MAP.D4, F_MAP.G4, F_MAP.B4, F_MAP.D5] },
  { bass: F_MAP.D2, chords: [F_MAP.F3, F_MAP.A3, F_MAP.D4], arpeggio: [F_MAP.D4, F_MAP.F4, F_MAP.A4, F_MAP.D5] },
  { bass: F_MAP.E2, chords: [F_MAP.G3, F_MAP.B3, F_MAP.E4], arpeggio: [F_MAP.E4, F_MAP.G4, F_MAP.B4, F_MAP.E5] },
  { bass: F_MAP.C2, chords: [F_MAP.E3, F_MAP.G3, F_MAP.C4], arpeggio: [F_MAP.C4, F_MAP.E4, F_MAP.G4, F_MAP.C5] },
];

type Listener = () => void;

class FeelGoodBGMManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filterNode: BiquadFilterNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.95; // boosted, rich audible volume
  private currentTrackId: BGMTrackId = 'sunny_tavern';
  private isPlaying: boolean = false;
  private loopTimer: number | null = null;
  private currentStepIndex: number = 0;
  private listeners: Set<Listener> = new Set();
  private userInteracted: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      try {
        const storedMuted = localStorage.getItem('pubquiz_bgm_muted');
        if (storedMuted !== null) {
          this.isMuted = storedMuted === 'true';
        }
        const storedVolume = localStorage.getItem('pubquiz_bgm_volume');
        if (storedVolume !== null) {
          const v = parseFloat(storedVolume);
          if (!isNaN(v) && v >= 0 && v <= 1) {
            this.volume = Math.max(0.8, v); // Ensure healthy default volume
          }
        }
        const storedTrack = localStorage.getItem('pubquiz_bgm_track');
        if (storedTrack && (storedTrack === 'sunny_tavern' || storedTrack === 'cozy_lounge' || storedTrack === 'celtic_jig')) {
          this.currentTrackId = storedTrack;
        }
      } catch {
        // LocalStorage guard
      }

      // Automatically start upon first user gesture if not muted
      const startOnInteraction = () => {
        if (!this.userInteracted) {
          this.userInteracted = true;
          if (!this.isMuted && !this.isPlaying) {
            this.start();
          }
        }
        window.removeEventListener('click', startOnInteraction);
        window.removeEventListener('keydown', startOnInteraction);
        window.removeEventListener('touchstart', startOnInteraction);
      };
      window.addEventListener('click', startOnInteraction, { once: true });
      window.addEventListener('keydown', startOnInteraction, { once: true });
      window.addEventListener('touchstart', startOnInteraction, { once: true });
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();

      // Master lowpass filter to keep synthesizer mellow and cozy
      this.filterNode = this.ctx.createBiquadFilter();
      this.filterNode.type = 'lowpass';
      this.filterNode.frequency.setValueAtTime(1600, this.ctx.currentTime);
      this.filterNode.Q.setValueAtTime(1.0, this.ctx.currentTime);

      this.masterGain = this.ctx.createGain();
      const effectiveVol = this.isMuted ? 0 : this.volume * 0.95; // increased, crystal clear volume
      this.masterGain.gain.setValueAtTime(effectiveVol, this.ctx.currentTime);

      this.filterNode.connect(this.masterGain);
      this.masterGain.connect(this.ctx.destination);
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public subscribe(listener: Listener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public getStatus() {
    return {
      isPlaying: this.isPlaying,
      isMuted: this.isMuted,
      volume: this.volume,
      currentTrackId: this.currentTrackId,
      currentTrack: BGM_TRACKS.find((t) => t.id === this.currentTrackId) || BGM_TRACKS[0],
    };
  }

  public start() {
    const ctx = this.initCtx();
    if (!ctx) return;

    if (this.isPlaying) return;
    this.isPlaying = true;
    this.applyVolume();

    // Start scheduling step loops
    this.currentStepIndex = 0;
    this.scheduleNextStep();
    this.notify();
  }

  public pause() {
    if (this.loopTimer !== null) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    this.isPlaying = false;
    this.notify();
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('pubquiz_bgm_muted', String(this.isMuted));
    } catch {
      // ignore
    }

    if (!this.isMuted) {
      if (!this.isPlaying) {
        this.start();
      } else {
        this.applyVolume();
      }
    } else {
      this.applyVolume();
    }
    this.notify();
  }

  public setVolume(v: number) {
    this.volume = Math.max(0, Math.min(1, v));
    try {
      localStorage.setItem('pubquiz_bgm_volume', String(this.volume));
    } catch {
      // ignore
    }
    this.applyVolume();
    this.notify();
  }

  public setTrack(trackId: BGMTrackId) {
    this.currentTrackId = trackId;
    this.currentStepIndex = 0;
    try {
      localStorage.setItem('pubquiz_bgm_track', trackId);
    } catch {
      // ignore
    }
    this.notify();
  }

  private applyVolume() {
    if (!this.masterGain || !this.ctx) return;
    const now = this.ctx.currentTime;
    const target = this.isMuted ? 0.0001 : this.volume * 0.95;
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.linearRampToValueAtTime(target, now + 0.15);
  }

  private getActiveChordSteps(): ChordStep[] {
    switch (this.currentTrackId) {
      case 'cozy_lounge':
        return TRACK_COZY_CHORDS;
      case 'celtic_jig':
        return TRACK_CELTIC_CHORDS;
      case 'sunny_tavern':
      default:
        return TRACK_SUNNY_CHORDS;
    }
  }

  private getTempoSeconds(): number {
    const track = BGM_TRACKS.find((t) => t.id === this.currentTrackId) || BGM_TRACKS[0];
    const beatSec = 60 / track.tempoBpm;
    return beatSec * 2; // Each chord lasts 2 beats
  }

  private playTone(freq: number, startTime: number, duration: number, gainLevel: number, type: OscillatorType = 'triangle') {
    if (!this.ctx || !this.filterNode) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, startTime);

      // Smooth attack & decay
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.linearRampToValueAtTime(gainLevel, startTime + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

      osc.connect(gain);
      gain.connect(this.filterNode);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.05);
    } catch {
      // Audio node cleanup
    }
  }

  private scheduleNextStep() {
    if (!this.isPlaying) return;

    const ctx = this.initCtx();
    if (!ctx) return;

    const steps = this.getActiveChordSteps();
    const chord = steps[this.currentStepIndex % steps.length];
    const stepDuration = this.getTempoSeconds();
    const now = ctx.currentTime;

    // 1. Play Warm Bass note
    this.playTone(chord.bass, now, stepDuration * 0.85, 0.45, 'sine');

    // 2. Play gentle warm chord pads
    chord.chords.forEach((freq) => {
      this.playTone(freq, now + 0.02, stepDuration * 0.8, 0.15, 'triangle');
    });

    // 3. Play cheerful playful arpeggio notes across the step
    const subStep = stepDuration / chord.arpeggio.length;
    chord.arpeggio.forEach((freq, idx) => {
      this.playTone(freq, now + idx * subStep, subStep * 0.7, 0.22, 'sine');
    });

    this.currentStepIndex++;

    // Schedule next cycle
    this.loopTimer = window.setTimeout(() => {
      this.scheduleNextStep();
    }, stepDuration * 1000);
  }
}

export const bgmEngine = new FeelGoodBGMManager();
