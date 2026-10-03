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

  // Short, restrained pub-style cues: glass, wood, door bell and a soft pour.
  private playPubTone(
    ctx: AudioContext,
    frequency: number,
    startTime: number,
    duration: number,
    volume = 0.07,
    waveform: OscillatorType = 'sine',
    endFrequency?: number,
  ) {
    const oscillator = ctx.createOscillator();
    const envelope = ctx.createGain();
    oscillator.type = waveform;
    oscillator.frequency.setValueAtTime(frequency, startTime);
    if (endFrequency && endFrequency > 0) {
      oscillator.frequency.exponentialRampToValueAtTime(endFrequency, startTime + duration);
    }
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.linearRampToValueAtTime(volume, startTime + Math.min(0.012, duration * 0.2));
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(envelope);
    envelope.connect(ctx.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.01);
  }

  private playGlassClink(ctx: AudioContext, startTime: number, pitch = 1, volume = 0.09) {
    // Inharmonic partials give the cue a light glass rim instead of an arcade chime.
    [[1120, 1], [1760, 0.48], [2480, 0.22]].forEach(([frequency, level]) => {
      this.playPubTone(ctx, frequency * pitch, startTime, 0.24, volume * level);
    });
  }

  private playWoodTap(ctx: AudioContext, startTime: number, volume = 0.08) {
    this.playPubTone(ctx, 175, startTime, 0.15, volume, 'sine', 92);
    this.playPubTone(ctx, 620, startTime, 0.035, volume * 0.22);
  }

  private playSoftPour(ctx: AudioContext, startTime: number) {
    const duration = 0.42;
    const frameCount = Math.ceil(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, frameCount, ctx.sampleRate);
    const samples = buffer.getChannelData(0);
    for (let index = 0; index < frameCount; index += 1) {
      samples[index] = (Math.random() * 2 - 1) * (1 - index / frameCount);
    }

    const source = ctx.createBufferSource();
    const filter = ctx.createBiquadFilter();
    const envelope = ctx.createGain();
    source.buffer = buffer;
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(780, startTime);
    filter.Q.setValueAtTime(0.7, startTime);
    envelope.gain.setValueAtTime(0.0001, startTime);
    envelope.gain.linearRampToValueAtTime(0.025, startTime + 0.05);
    envelope.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    source.connect(filter);
    filter.connect(envelope);
    envelope.connect(ctx.destination);
    source.start(startTime);
    source.stop(startTime + duration);
  }

  // Correct answer: a bright, ascending major-chord chime.
  playCorrectFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playPubTone(ctx, 523.25, now, 0.2, 0.075, 'sine');
      this.playPubTone(ctx, 659.25, now + 0.09, 0.22, 0.07, 'sine');
      this.playPubTone(ctx, 783.99, now + 0.18, 0.3, 0.065, 'sine');
    } catch {
      // Audio autoplay guard
    }
  }

  // Button press: a soft, cheerful two-note tone that rises in pitch.
  playCoinFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playPubTone(ctx, 523.25, now, 0.12, 0.075, 'sine', 587.33);
      this.playPubTone(ctx, 659.25, now + 0.075, 0.18, 0.065, 'sine', 783.99);
    } catch {
      // Audio autoplay guard
    }
  }

  // Life lost: a muted wooden thud with a low, soft descending tone.
  playLifeLostFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playWoodTap(ctx, now, 0.09);
      this.playPubTone(ctx, 190, now + 0.015, 0.28, 0.055, 'sine', 118);
    } catch {
      // Audio guard
    }
  }

  // Star earned: three light glass taps.
  playStarFx(index: number = 0) {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const pitch = [0.92, 1, 1.12][index % 3] || 1;
      this.playGlassClink(ctx, now, pitch, 0.075);
      this.playGlassClink(ctx, now + 0.12, pitch * 1.08, 0.065);
      this.playGlassClink(ctx, now + 0.24, pitch * 1.16, 0.055);
    } catch {
      // Audio guard
    }
  }

  // Purchase: a quiet till-like wooden click and two quick pint clinks.
  playPurchaseFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playWoodTap(ctx, now, 0.07);
      this.playGlassClink(ctx, now + 0.1, 0.94, 0.07);
      this.playGlassClink(ctx, now + 0.23, 1.08, 0.06);
    } catch {
      // Audio guard
    }
  }

  // Wrong answer: a short, low, descending "wah-wah" cue.
  playWrongFx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playPubTone(ctx, 392, now, 0.2, 0.075, 'triangle', 330);
      this.playPubTone(ctx, 311.13, now + 0.12, 0.26, 0.065, 'triangle', 261.63);
    } catch {
      // Audio autoplay guard
    }
  }

  // Level complete: a warm pub-style major arpeggio that climbs to a bright finish.
  playMilestoneFanfare() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      const risingNotes = [
        { frequency: 392, offset: 0, duration: 0.24 },
        { frequency: 523.25, offset: 0.14, duration: 0.26 },
        { frequency: 659.25, offset: 0.28, duration: 0.28 },
        { frequency: 783.99, offset: 0.42, duration: 0.3 },
        { frequency: 1046.5, offset: 0.56, duration: 0.46 },
      ];

      risingNotes.forEach(({ frequency, offset, duration }) => {
        this.playPubTone(ctx, frequency, now + offset, duration, 0.075, 'sine');
      });

      // A soft held G-major chord gives the final note a fuller, celebratory finish.
      [392, 493.88, 587.33].forEach((frequency) => {
        this.playPubTone(ctx, frequency, now + 0.62, 0.48, 0.025, 'triangle');
      });
      this.playGlassClink(ctx, now + 0.72, 1.08, 0.045);
    } catch {
      // Audio guard
    }
  }

  // Knockout: a quiet three-note last-orders bell.
  playKnockoutGong() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      [880, 740, 587].forEach((frequency, index) => {
        const at = now + index * 0.32;
        this.playPubTone(ctx, frequency, at, 0.48, 0.045);
        this.playPubTone(ctx, frequency * 2.01, at, 0.35, 0.018);
      });
    } catch {
      // Audio guard
    }
  }

  // Champion: warm pub-chord notes under a celebratory group clink.
  playChampionFanfare() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      [196, 247, 294, 392].forEach((frequency, index) => {
        this.playPubTone(ctx, frequency, now + index * 0.09, 0.68, 0.045);
      });
      [0.08, 0.22, 0.36].forEach((offset, index) => {
        this.playGlassClink(ctx, now + offset, 0.92 + index * 0.12, 0.075);
      });
    } catch {
      // Audio guard
    }
  }

  // Entering the map: a pub-door bell followed by a quiet pint clink.
  playFunnyEntranceSfx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playPubTone(ctx, 1046, now, 0.28, 0.045);
      this.playPubTone(ctx, 1318, now + 0.11, 0.34, 0.04);
      this.playGlassClink(ctx, now + 0.32, 0.96, 0.06);
    } catch {
      // Audio guard
    }
  }

  // Life restored: a soft pour and the sound of a glass being set down.
  playLifeRegenSfx() {
    try {
      const ctx = this.initCtx();
      const now = ctx.currentTime;
      this.playSoftPour(ctx, now);
      this.playWoodTap(ctx, now + 0.25, 0.035);
      this.playGlassClink(ctx, now + 0.34, 1.08, 0.07);
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
