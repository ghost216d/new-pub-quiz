// Interactive Web Audio synthesizer for pub quiz melodies and cartoon sound FX

interface Note {
  freq: number;
  duration: number; // in seconds
  pause?: number; // pause after in seconds
}

// Frequency notes map
const NOTES: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, 'F#4': 369.99, G4: 392.00, 'G#4': 415.30, A4: 440.00, 'A#4': 466.16, B4: 493.88,
  C5: 523.25, 'C#5': 554.37, D5: 587.33, 'D#5': 622.25, E5: 659.25, F5: 698.46, 'F#5': 739.99, G5: 783.99, 'G#5': 830.61, A5: 880.00, 'A#5': 932.33, B5: 987.77,
};

// Recognizable iconic song melodies represented as note arrays
export const PRESET_MELODIES: Record<string, { title: string; artist: string; notes: Note[] }> = {
  take_on_me: {
    title: 'Take On Me',
    artist: 'A-ha',
    notes: [
      { freq: NOTES['F#4'], duration: 0.16 },
      { freq: NOTES['F#4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.16 },
      { freq: NOTES['B3'], duration: 0.16 },
      { freq: NOTES['B3'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['G#4'], duration: 0.16 },
      { freq: NOTES['G#4'], duration: 0.16 },
      { freq: NOTES['A4'], duration: 0.16 },
      { freq: NOTES['B4'], duration: 0.16 },
      { freq: NOTES['A4'], duration: 0.16 },
      { freq: NOTES['A4'], duration: 0.16 },
      { freq: NOTES['A4'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.16 },
      { freq: NOTES['F#4'], duration: 0.16 },
      { freq: NOTES['F#4'], duration: 0.16 },
      { freq: NOTES['F#4'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['F#4'], duration: 0.16 },
      { freq: NOTES['E4'], duration: 0.32 },
    ],
  },
  never_gonna_give_you_up: {
    title: 'Never Gonna Give You Up',
    artist: 'Rick Astley',
    notes: [
      { freq: NOTES['C4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.16 },
      { freq: NOTES['F4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.16 },
      { freq: NOTES['A4'], duration: 0.35 },
      { freq: NOTES['A4'], duration: 0.35 },
      { freq: NOTES['G4'], duration: 0.5 },
      { freq: NOTES['C4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.16 },
      { freq: NOTES['F4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.16 },
      { freq: NOTES['G4'], duration: 0.35 },
      { freq: NOTES['G4'], duration: 0.35 },
      { freq: NOTES['F4'], duration: 0.35 },
      { freq: NOTES['E4'], duration: 0.16 },
      { freq: NOTES['D4'], duration: 0.35 },
    ],
  },
  stayin_alive: {
    title: "Stayin' Alive",
    artist: 'Bee Gees',
    notes: [
      { freq: NOTES['F4'], duration: 0.2 },
      { freq: NOTES['F4'], duration: 0.2 },
      { freq: NOTES['F4'], duration: 0.2 },
      { freq: NOTES['F4'], duration: 0.3 },
      { freq: NOTES['D#4'], duration: 0.2 },
      { freq: NOTES['F4'], duration: 0.3 },
      { freq: NOTES['F4'], duration: 0.2 },
      { freq: NOTES['D#4'], duration: 0.2 },
      { freq: NOTES['F4'], duration: 0.2 },
      { freq: NOTES['G#4'], duration: 0.35 },
      { freq: NOTES['G4'], duration: 0.2 },
      { freq: NOTES['F4'], duration: 0.4 },
    ],
  },
  smoke_on_the_water: {
    title: 'Smoke on the Water',
    artist: 'Deep Purple',
    notes: [
      { freq: NOTES['G3'], duration: 0.3 },
      { freq: NOTES['A#3'] || 233.08, duration: 0.3 },
      { freq: NOTES['C4'], duration: 0.45 },
      { freq: NOTES['G3'], duration: 0.3 },
      { freq: NOTES['A#3'] || 233.08, duration: 0.3 },
      { freq: NOTES['C#4'] || 277.18, duration: 0.2 },
      { freq: NOTES['C4'], duration: 0.5 },
      { freq: NOTES['G3'], duration: 0.3 },
      { freq: NOTES['A#3'] || 233.08, duration: 0.3 },
      { freq: NOTES['C4'], duration: 0.45 },
      { freq: NOTES['A#3'] || 233.08, duration: 0.3 },
      { freq: NOTES['G3'], duration: 0.6 },
    ],
  },
  bohemian_rhapsody: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    notes: [
      { freq: NOTES['A#4'], duration: 0.25 },
      { freq: NOTES['A4'], duration: 0.25 },
      { freq: NOTES['A#4'], duration: 0.25 },
      { freq: NOTES['A4'], duration: 0.25 },
      { freq: NOTES['A#4'], duration: 0.4 },
      { freq: NOTES['F4'], duration: 0.4 },
      { freq: NOTES['D4'], duration: 0.4 },
      { freq: NOTES['F4'], duration: 0.6 },
    ],
  },
  billie_jean: {
    title: 'Billie Jean',
    artist: 'Michael Jackson',
    notes: [
      { freq: NOTES['F#3'] || 185.0, duration: 0.2 },
      { freq: NOTES['C#4'], duration: 0.2 },
      { freq: NOTES['E4'], duration: 0.2 },
      { freq: NOTES['F#4'], duration: 0.2 },
      { freq: NOTES['E4'], duration: 0.2 },
      { freq: NOTES['C#4'], duration: 0.2 },
      { freq: NOTES['B3'], duration: 0.2 },
      { freq: NOTES['C#4'], duration: 0.2 },
    ],
  },
  dont_stop_believin: {
    title: "Don't Stop Believin'",
    artist: 'Journey',
    notes: [
      { freq: NOTES['E4'], duration: 0.2 },
      { freq: NOTES['B3'], duration: 0.2 },
      { freq: NOTES['E4'], duration: 0.2 },
      { freq: NOTES['G#4'], duration: 0.3 },
      { freq: NOTES['B4'], duration: 0.3 },
      { freq: NOTES['A4'], duration: 0.3 },
      { freq: NOTES['G#4'], duration: 0.3 },
      { freq: NOTES['F#4'], duration: 0.4 },
    ],
  },
  sweet_child_o_mine: {
    title: "Sweet Child O' Mine",
    artist: "Guns N' Roses",
    notes: [
      { freq: NOTES['D4'], duration: 0.15 },
      { freq: NOTES['D5'], duration: 0.15 },
      { freq: NOTES['A4'], duration: 0.15 },
      { freq: NOTES['G4'], duration: 0.15 },
      { freq: NOTES['G5'], duration: 0.15 },
      { freq: NOTES['A4'], duration: 0.15 },
      { freq: NOTES['F#5'], duration: 0.15 },
      { freq: NOTES['A4'], duration: 0.15 },
    ],
  },
  wannabe: {
    title: 'Wannabe',
    artist: 'Spice Girls',
    notes: [
      { freq: NOTES['B4'], duration: 0.2 },
      { freq: NOTES['B4'], duration: 0.2 },
      { freq: NOTES['A4'], duration: 0.2 },
      { freq: NOTES['B4'], duration: 0.3 },
      { freq: NOTES['E4'], duration: 0.4 },
      { freq: NOTES['B4'], duration: 0.2 },
      { freq: NOTES['A4'], duration: 0.2 },
      { freq: NOTES['F#4'], duration: 0.4 },
    ],
  },
};

class AudioSynthManager {
  private ctx: AudioContext | null = null;
  private currentOscillators: OscillatorNode[] = [];
  private isMelodyPlaying: boolean = false;
  private abortController: AbortController | null = null;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  // Play cartoon sound effect: Correct Answer
  playCorrectFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.exponentialRampToValueAtTime(1046.5, now + 0.3); // C6

      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Audio autoplay guard
    }
  }

  // Play cartoon sound effect: Coin Pickup / Reward
  playCoinFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(987.77, now); // B5
      osc.frequency.setValueAtTime(1318.51, now + 0.08); // E6

      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    } catch {
      // Audio guard
    }
  }

  // Play cartoon sound effect: Heart / Life Lost
  playLifeLostFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(329.63, now); // E4
      osc.frequency.linearRampToValueAtTime(220.0, now + 0.15); // A3
      osc.frequency.linearRampToValueAtTime(164.81, now + 0.35); // E3

      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio guard
    }
  }

  // Play cartoon sound effect: Star Earned
  playStarFx(index: number = 0) {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const baseFreq = [523.25, 659.25, 783.99][index % 3] || 783.99;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.18);

      gain.gain.setValueAtTime(0.95, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio guard
    }
  }

  // Play cartoon sound effect: Cash Register / Bundle Purchase
  playPurchaseFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const notes = [
        { f: 587.33, d: 0.08 }, // D5
        { f: 783.99, d: 0.08 }, // G5
        { f: 1174.66, d: 0.25 }, // D6 ring
      ];

      let t = now;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.95, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + n.d);
        t += n.d * 0.9;
      });
    } catch {
      // Audio guard
    }
  }

  // Play cartoon sound effect: Wrong Answer / Buzzer
  playWrongFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.linearRampToValueAtTime(110, now + 0.35);

      gain.gain.setValueAtTime(0.92, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.4);
    } catch {
      // Audio autoplay guard
    }
  }

  // Play cartoon Milestone Fanfare (every 10 questions)
  playMilestoneFanfare() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const notes = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 523.25, d: 0.12 }, // C5
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.25 }, // E5
        { f: 783.99, d: 0.2 },  // G5
        { f: 1046.5, d: 0.6 },  // C6
      ];

      let t = now;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + n.d);
        t += n.d + 0.04;
      });
    } catch {
      // Audio guard
    }
  }

  // Play dramatic Knockout / Sudden Death Gong
  playKnockoutGong() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // Low dramatic gong oscillator
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(110, now); // A2
      osc.frequency.exponentialRampToValueAtTime(55, now + 0.8); // Drop pitch

      gain.gain.setValueAtTime(0.85, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    } catch {
      // Audio guard
    }
  }

  // Play Grand Champion Sole Winner Fanfare
  playChampionFanfare() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      // Grand celebratory brass-style fanfare
      const notes = [
        { f: 523.25, d: 0.15 }, // C5
        { f: 659.25, d: 0.15 }, // E5
        { f: 783.99, d: 0.15 }, // G5
        { f: 1046.5, d: 0.3 },  // C6
        { f: 880.00, d: 0.2 },  // A5
        { f: 1046.5, d: 0.6 },  // C6 grand hold
      ];

      let t = now;
      notes.forEach((n) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, t);

        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(t);
        osc.stop(t + n.d);
        t += n.d + 0.05;
      });
    } catch {
      // Audio guard
    }
  }

  // Funny Cartoon Quest Map Entrance Sound (Boing + Slide + Clinking mugs!)
  playFunnyEntranceSfx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;

      // 1. Funny Boing / Spring bounce
      const boingOsc = ctx.createOscillator();
      const boingGain = ctx.createGain();
      boingOsc.type = 'sine';
      boingOsc.frequency.setValueAtTime(160, now);
      boingOsc.frequency.exponentialRampToValueAtTime(650, now + 0.18);
      boingOsc.frequency.exponentialRampToValueAtTime(320, now + 0.35);

      boingGain.gain.setValueAtTime(0.85, now);
      boingGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

      boingOsc.connect(boingGain);
      boingGain.connect(ctx.destination);
      boingOsc.start(now);
      boingOsc.stop(now + 0.38);

      // 2. Cartoon slide whistle whoosh
      const whooshOsc = ctx.createOscillator();
      const whooshGain = ctx.createGain();
      whooshOsc.type = 'triangle';
      whooshOsc.frequency.setValueAtTime(300, now + 0.2);
      whooshOsc.frequency.exponentialRampToValueAtTime(950, now + 0.55);

      whooshGain.gain.setValueAtTime(0.001, now + 0.2);
      whooshGain.gain.linearRampToValueAtTime(0.75, now + 0.35);
      whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      whooshOsc.connect(whooshGain);
      whooshGain.connect(ctx.destination);
      whooshOsc.start(now + 0.2);
      whooshOsc.stop(now + 0.6);

      // 3. Cheerful tavern chime chord (C - E - G - C)
      const chimes = [523.25, 659.25, 783.99, 1046.5];
      chimes.forEach((freq, idx) => {
        const cOsc = ctx.createOscillator();
        const cGain = ctx.createGain();
        const startTime = now + 0.45 + idx * 0.08;

        cOsc.type = 'triangle';
        cOsc.frequency.setValueAtTime(freq, startTime);

        cGain.gain.setValueAtTime(0.8, startTime);
        cGain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);

        cOsc.connect(cGain);
        cGain.connect(ctx.destination);
        cOsc.start(startTime);
        cOsc.stop(startTime + 0.4);
      });
    } catch {
      // Audio guard
    }
  }

  // Heart life restored sparkle
  playLifeRegenSfx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const notes = [392.0, 523.25, 659.25, 783.99]; // G4, C5, E5, G5
      notes.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const t = now + idx * 0.1;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.85, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(t);
        osc.stop(t + 0.3);
      });
    } catch {
      // Audio guard
    }
  }

  // Stop currently playing melody
  stopMelody() {
    if (this.abortController) {
      this.abortController.abort();
      this.abortController = null;
    }
    this.currentOscillators.forEach((osc) => {
      try {
        osc.stop();
        osc.disconnect();
      } catch {
        // Already stopped
      }
    });
    this.currentOscillators = [];
    this.isMelodyPlaying = false;
  }

  // Play iconic melody riff
  async playMelody(melodyKey: string, onEnded?: () => void): Promise<boolean> {
    this.stopMelody();

    const melody = PRESET_MELODIES[melodyKey];
    if (!melody) return false;

    try {
      const ctx = this.initCtx();
      this.isMelodyPlaying = true;
      this.abortController = new AbortController();
      const { signal } = this.abortController;

      for (const note of melody.notes) {
        if (signal.aborted) break;

        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'square'; // fun 8-bit / warm retro synth style
        osc.frequency.setValueAtTime(note.freq, now);

        gain.gain.setValueAtTime(0.85, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + note.duration);

        this.currentOscillators.push(osc);

        await new Promise((r) => setTimeout(r, (note.duration + (note.pause || 0.02)) * 1000));
      }

      this.isMelodyPlaying = false;
      if (onEnded && !signal.aborted) onEnded();
      return true;
    } catch {
      this.isMelodyPlaying = false;
      return false;
    }
  }

  isPlaying() {
    return this.isMelodyPlaying;
  }
}

export const audioSynth = new AudioSynthManager();
